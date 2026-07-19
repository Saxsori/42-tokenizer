# Deployment Guide - FT42Nova on Sepolia
This documents the exact process used to build, test, and deploy the FT42Nova token to Sepolia, using Docker only - no local Node.js or Hardhat installation required on the host machine.


## Prerequisites

- Docker installed
- Two MetaMask accounts dedicated to this project (test wallets only, never used with real funds):
	- Wallet 1 (deployer/owner) - deploys the contract, becomes the contract owner, mints, and burns its own tokens.
	- Wallet 2 ("other") - receives tokens in the demo, and is used to prove non-owner restrictions and the approve/burnFrom flow.
- An Alchemy account for a Sepolia RPC endpoint.
- An Etherscan account for an API key (used only for source verification).
- Sepolia test ETH in both wallets, from a faucet.


## 1. Wallet setup
Created two new accounts in MetaMask, kept separate from any wallet holding real funds:

- Account `42-test-wallet` (deployer / owner)
- A second account ("other") used only to receive tokens and test non-owner behaviour


Both accounts were switched to the Sepolia network in MetaMask.


## 2. Getting Sepolia ETH
Funded both wallet addresses using a Sepolia faucet (sepoliafaucet.com / Google Cloud Web3 faucet).

Wallet 1 needed enough ETH to cover every transaction it sends (deploy, verify, transfer, mint, burn). 

Wallet 2 only needed a small amount, since it only sends one transaction later (approve) in the interaction demo.


## 3. RPC provider
Created a free Alchemy account, made a new app scoped to Ethereum / Sepolia, and copied its HTTPS API URL. This became SEPOLIA_RPC_URL.

## 4. Etherscan API key
Created an Etherscan account, generated an API key under Account → API Keys. This became ETHERSCAN_API_KEY, used later for hardhat verify.

## 5. Environment variables
Created `code/.env` (never committed) with:

```md
SEPOLIA_RPC_URL=<alchemy sepolia https url>
PRIVATE_KEY_1=<deployer wallet private key, no 0x prefix>
PRIVATE_KEY_2=<second wallet private key, no 0x prefix>
ETHERSCAN_API_KEY=<etherscan api key>
```

hardhat.config.ts reads both keys into the sepolia network's accounts array, so `ethers.getSigners()` returns two usable signers when running against Sepolia:

```typescript
sepolia: {
  url: process.env.SEPOLIA_RPC_URL || "",
  accounts:
    process.env.PRIVATE_KEY_1 && process.env.PRIVATE_KEY_2
      ? [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2]
      : [],
},
```

## 6. Build the Docker image

```bash
docker run --rm -it -v "$PWD":/app -w /app node:20-bullseye npm install
```
Run from inside code/. This installs Hardhat, the toolbox, OpenZeppelincontracts, and TypeScript tooling into node_modules on the host via the volume mount.


## 7. Compile
```bash
docker run --rm -it -v "$PWD":/app -w /app node:20-bullseye npx hardhat compile
```
Output:
```bash
Compiled 8 Solidity files successfully (evm target: paris).
```

## 8. Run tests

```bash
docker run --rm -it -v "$PWD":/app -w /app node:20-bullseye npx hardhat test
```
All tests pass locally, against Hardhat's in-memory test network, before any real Sepolia gas is spent. Tests cover: name/symbol/decimals, initial supply assignment, owner minting within the cap, minting past the cap reverting, non-owner minting reverting, transfers, and burning (including insufficient-balance reverts).

## 9. Deploy to Sepolia
```bash
docker run --rm -it -v "$PWD":/app -w /app --env-file .env node:20-bullseye \
  npx hardhat run scripts/deploy.ts --network sepolia
```

`--env-file .env` passes `SEPOLIA_RPC_URL` / `PRIVATE_KEY_1` / `PRIVATE_KEY_2` into the container so dotenv can read them.

`scripts/deploy.ts` deploys `FortyTwoNova` with:

- `initialSupply = ethers.parseUnits("1000000", 18)`
- `maxSupply = ethers.parseUnits("42000000", 18)`
Result:
```bash
Deploying contracts with the account: 0xecBC78bDb203D1F168Ffc2701249f78664Fa7e19
FortyTwoNova deployed to: 0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423
```

## 10. Verify on Etherscan
```bash
docker run --rm -it -v "$PWD":/app -w /app --env-file .env node:20-bullseye \
  npx hardhat verify --network sepolia 0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423 \
  1000000000000000000000000 42000000000000000000000000
```

The two numeric arguments are the raw constructor values (initial supply and max supply, in wei-like units with all 18 decimal zeros) - they must match exactly what was used at deploy time, so Etherscan can re-derive matching bytecode.

Result:
```bash
Successfully verified contract FortyTwoNova on the block explorer.
https://sepolia.etherscan.io/address/0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423#code
```
Note: `etherscan.apiKey` in `hardhat.config.ts` had to be a single string (`ETHERSCAN_API_KEY`), not an object keyed by network name - the toolbox version installed here uses Etherscan's unified v2 API, which uses one key across all supported chains.

## 11. Run interact.ts to demonstrate the token
```bash
docker run --rm -it -v "$PWD":/app -w /app --env-file .env node:20-bullseye \
  npx hardhat run scripts/interact.ts --network sepolia
```
`scripts/interact.ts` connects to the already-deployed contract via `ethers.getContractAt("FortyTwoNova", tokenAddress)` and runs a full demo against live Sepolia:

- Reads name, symbol, total supply
- Transfers tokens from the owner to the second wallet
- Owner mints more tokens (respecting `MAX_SUPPLY`)
- Confirms a non-owner mint attempt reverts
- Owner mints to the second wallet
- Owner burns its own tokens
- Second wallet approves the owner to spend/burn on its behalf, then the owner calls `burnFrom` - demonstrating the ERC20 allowance flow


Every step above ran as a real transaction on Sepolia and is visible in the contract's transaction history.

## Result
- Network: Sepolia
- Contract address: 0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423
- Explorer (verified source): https://sepolia.etherscan.io/address/0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423#code
- Ticker: 42Nova

