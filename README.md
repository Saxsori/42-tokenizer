# 42 Tokenizer

A custom ERC-20 token developed as part of the 42 Web3 curriculum. This project explores the fundamentals of blockchain development by implementing a fungible token using the Ethereum token standard.

> 🚧 Project Status: This project is currently under active development. Features, documentation, and deployment details will be updated as development progresses.

## Overview
Tokenizer is an educational blockchain project focused on designing and implementing an ERC-20 compliant token. The goal is to gain hands-on experience with smart contract development, token standards, deployment workflows, and blockchain best practices.

The project is being developed following the requirements of the 42 Tokenizer subject while adhering to industry standards for smart contract development.

## Planned Features
- ERC-20 compliant token
- Secure ownership management
- Token transfers
- Allowance and approval mechanism
- Minting and burning functionality (if implemented)
- Event logging for transparency
- Deployment to a public Ethereum-compatible test network

## Technology Stack
- Solidity
- ERC-20 Token Standard
- Hardhat
- OpenZeppelin Contracts
- Ethers.js
- MetaMask
- Ethereum Testnet


## Current Status
- [x] ✅ Project planning completed
- [x] ✅ Smart contract development in progress
- [x] ✅ Testing in progress
- [ ] 🚧 Documentation in progress
- [x] ✅ Deployment to Ethereum testnet pending

## Project Structure

```
  .
  ├── README.md
  ├── code/ # Smart contract source code
  ├── deployment/ # Deployment scripts and configuration
  └── documentation/ # Project documentation
```

## Design Choices

### Why Sepolia?

The FT42Nova token was deployed on the Ethereum Sepolia test network. Sepolia is Ethereum's official testnet, providing the same Ethereum Virtual Machine (EVM) behavior, smart contract execution, and ERC-20 mechanics as the Ethereum mainnet, but without requiring real cryptocurrency. Test ETH can be obtained freely from public faucets, allowing contracts to be deployed and tested without financial risk.


Sepolia was selected because it:

- Closely replicates Ethereum mainnet behavior and EVM semantics.
- Uses ETH as its native gas currency, making testing representative of production deployments.
- Is the recommended Ethereum test network for new development.
- Has mature infrastructure support through providers such as Alchemy and Infura.
- Provides contract visibility through Sepolia Etherscan, enabling verification and inspection of deployed contracts.

### Why ERC-20?
The ERC-20 standard was selected because it is the most widely adopted fungible token standard within the Ethereum ecosystem. It defines a common interface for token functionality, ensuring interoperability with wallets, decentralized applications (dApps), exchanges, and blockchain explorers.

Using a standardized interface also improves compatibility with existing Ethereum tooling while reducing integration complexity.

### Why Hardhat and Typescript?
Hardhat was chosen as the smart contract development framework because it provides a complete development environment for Solidity projects. It supports contract compilation, deployment, automated testing, debugging, and local blockchain simulation.

TypeScript was used for deployment scripts and testing because its static type checking helps detect programming errors before deployment.


### Contract design

#### OpenZeppelin Libraries
This ensures that administrative operations, such as minting new tokens, can only be performed by the contract owner, while regular users are limited to standard ERC-20 operations such as transferring, approving, and burning their own tokens.

#### Ownership and Access Control
The contract follows an owner-based access control model using OpenZeppelin's Ownable contract.
During deployment, Ownable(msg.sender) assigns the deploying address as the initial contract owner. 

Privileged functions are protected using the onlyOwner modifier, which automatically rejects any transaction initiated by an unauthorized account

This ensures that administrative operations, such as minting new tokens, can only be performed by the contract owner, while regular users are limited to standard ERC-20 operations such as transferring, approving, and burning their own tokens.

#### Supply Cap
The token implements a maximum supply cap, preventing the total token supply from exceeding a predefined limit.

The maximum supply is declared as immutable, meaning it is assigned once during contract deployment and cannot be modified afterward.


#### Burnable Tokens
The contract inherits from ERC20Burnable, allowing token holders to permanently destroy (burn) tokens that they own.

Burning removes tokens from circulation by reducing the total token supply. This feature provides flexibility for future tokenomics, allows users to voluntarily remove tokens without requiring administrative intervention.


### Docker
The entire development workflow was containerized using Docker to provide a consistent and reproducible development environment.


## Token info
- Name: FT42Nova
- Symbol: 42Nova
- Network: Sepolia
- Contract address: 0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423
- Explorer link: https://sepolia.etherscan.io/address/0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423#code

https://sepolia.etherscan.io/address/0x504207973E4d2733c8244A71AAbe1585230E3737

## How to run this project

## Documentation

Additional documentation explaining the smart contract architecture, deployment process, and usage will be available in the documentation directory once development is complete.

