# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

```shell
docker run --rm -it -v "$PWD":/app -w /app node:20-bullseye npm install
docker run --rm -it -v "$PWD":/app -w /app node:20-bullseye npx hardhat compile
docker run --rm -it -v "$PWD":/app -w /app node:20-bullseye npx hardhat test
docker run --rm -it -v "$PWD":/app -w /app --env-file .env node:20-bullseye npx hardhat run scripts/deploy.ts --network sepolia
docker run --rm -it -v "$PWD":/app -w /app --env-file .env node:20-bullseye   npx hardhat verify --network sepolia 0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423   1000000000000000000000000 42000000000000000000000000
```
