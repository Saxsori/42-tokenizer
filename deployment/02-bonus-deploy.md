# Deployment Guide (continued) - Multisig Bonus on Sepolia

This continues from `01-mandatory-deploy.md`, which covers deploying and verifying the base `FortyTwoNova` token. This document covers everything done afterward to add the multisig bonus: a third wallet, deploying `MultiSigWallet`, transferring token ownership to it, and demonstrating minting through the multisig on live Sepolia.

## 1. Third wallet setup

The bonus requires a `2-of-3 multisig`, so a third MetaMask account was created in addition to the two used for the mandatory part:

1. Wallet 1 (deployer/owner) - same as before
2. Wallet 2 ("other") - same as before
3. Wallet 3 (new) - third independent multisig signer

Wallet 3 was funded with a small amount of Sepolia ETH from the same faucet used earlier, since it needs to send its own transactions (approvals) later.

## 2. Environment variables updated

`code/.env` gained a third key, and the naming convention for the existing two was aligned to match:

```
SEPOLIA_RPC_URL=<alchemy sepolia https url>
PRIVATE_KEY_1=<deployer wallet private key, no 0x prefix>
PRIVATE_KEY_2=<second wallet private key, no 0x prefix>
PRIVATE_KEY_3=<third wallet private key, no 0x prefix>
ETHERSCAN_API_KEY=<etherscan api key>
```

`hardhat.config.ts`'s `sepolia` network was updated so `getSigners()` returns all three signers:

``` typescript
sepolia: {
  url: process.env.SEPOLIA_RPC_URL || "",
  accounts:
    process.env.PRIVATE_KEY_1 && process.env.PRIVATE_KEY_2 && process.env.PRIVATE_KEY_3
      ? [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2, process.env.PRIVATE_KEY_3]
      : [],
},
```

## 3. MultiSigWallet contract
Added `contracts/MultiSigWallet.sol` - a generic multisig contract with:

- A fixed list of owner addresses set at deploy time
- A required approval count
- `submitTransaction(target, data)` - propose an arbitrary call
- `approveTransaction(txId)` - an owner approves a pending proposal
- `executeTransaction(txId)` - once approvals reach the threshold, performs the actual call to target

## 4. Local testing (before touching Sepolia)
```bash
docker run --rm -it -v "$PWD":/app -w /app node:20-bullseye npx hardhat compile
docker run --rm -it -v "$PWD":/app -w /app node:20-bullseye npx hardhat test
```
Tests added, all run against Hardhat's free local network first:

- **Constructor**: owners and required approvals set correctly
- **Submission**: only an owner can submit; event emitted correctly
- **Approval**: only an owner can approve; can't approve twice
- **Execution**: reverts below threshold, reverts if already executed, succeeds and emits `Execution` once threshold is met
- **Integration test** (`test/Integration.test.ts`): deploys the token and the multisig together, transfers the token's ownership to the multisig, confirms the original deployer can no longer mint directly (`OwnableUnauthorizedAccount`), then walks a mint proposal through **submit → approve → approve → execute** and confirms the recipient's balance increased.

All tests passed locally before any Sepolia gas was spent.

## 5. Deploy MultiSigWallet to Sepolia

```bash
docker run --rm -it -v "$PWD":/app -w /app --env-file .env node:20-bullseye npx hardhat run scripts/multiSigWallet.deploy.ts --network sepolia
```
Deployed with all 3 wallets as owners, requiring 2 approvals:

```
Deploying contracts with the account: 0xecBC78bDb203D1F168Ffc2701249f78664Fa7e19
MultiSigWallet deployed to: 0x504207973E4d2733c8244A71AAbe1585230E3737
```

## 6. Verify MultiSigWallet on Etherscan

Since the constructor takes an `address[]` array plus a `uint256` (rather than two plain numbers like the token), verification was done via a small script using Hardhat's programmatic verify API instead of the CLI, to avoid manually escaping an array on the command line:

```bash
docker run --rm -it -v "$PWD":/app -w /app --env-file .env node:20-bullseye npx hardhat run scripts/verify/multiSigWallet.verify.ts --network sepolia
```
Result:
```
Successfully verified contract MultiSigWallet on the block explorer.
https://sepolia.etherscan.io/address/0x504207973E4d2733c8244A71AAbe1585230E3737#code
```

## 7. Transfer token ownership to the multisig

This is the point-of-no-return step: from this moment on, the original deployer wallet can no longer call `mint()` directly. Only done after all local tests (including the integration test simulating this exact scenario) passed.

```bash
docker run --rm -it -v "$PWD":/app -w /app --env-file .env node:20-bullseye npx hardhat run scripts/transferOwnership.ts --network sepolia
```

Result:

```
Transferring ownership with the account: 0xecBC78bDb203D1F168Ffc2701249f78664Fa7e19
Ownership transferred to: 0x504207973E4d2733c8244A71AAbe1585230E3737
```

`token.owner()` now returns the multisig's address instead of the deployer's. As a direct consequence, the original `scripts/interact.ts` from the mandatory part will now fail on its `mint()` calls if re-run - this is expected, and is itself evidence the ownership transfer took effect.

## 8. Demonstrate multisig-gated minting on Sepolia

```bash
docker run --rm -it -v "$PWD":/app -w /app --env-file .env node:20-bullseye npx hardhat run scripts/interact/multisig-wallet.interact.ts --network sepolia
```
`scripts/interact/multisig-wallet.interact.ts` runs the full flow against the live contracts:

1. Reads the multisig's owners and required approval count
2. Attempts a direct `mint()` call from the original deployer wallet - confirms it reverts (`OwnableUnauthorizedAccount`)
3. Encodes a `mint(to, amount)` call via `token.interface.encodeFunctionData(...)`
4. Submits it to the multisig via `submitTransaction`, and reads the assigned txId from the emitted `Submission` event
5. Approves the proposal with two of the three signers (`approveTransaction`), waiting for each transaction to be mined
6. Confirms the approval count has reached the required threshold
7. Executes the proposal via `executeTransaction`
8. Confirms the recipient's token balance increased, proving the mint only succeeded through the multisig path

Every step above ran as a real transaction on Sepolia.

## Result
- **Network**: Sepolia
- **Token contract**: `0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423`
- **MultiSigWallet contract**: `0x504207973E4d2733c8244A71AAbe1585230E3737`
- **Multisig owners**: 3 (deployer + 2 additional signer wallets)
- **Required approvals**: 2
- **Token owner (post-transfer)**: the MultiSigWallet contract
- **Explorer (token)**: https://sepolia.etherscan.io/address/0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423#code
- **Explorer (multisig)**: https://sepolia.etherscan.io/address/0x504207973E4d2733c8244A71AAbe1585230E3737#code


