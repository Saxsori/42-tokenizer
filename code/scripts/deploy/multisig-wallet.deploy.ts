import { ethers } from "hardhat";

async function main() {
	const [deployer, signer2, signer3] = await ethers.getSigners();
	
	console.log("Deploying contracts with the account:", deployer.address);

	const Factory = await ethers.getContractFactory("MultiSigWallet");
	const multiSigWallet = await Factory.deploy(
		[deployer.address, signer2.address, signer3.address],
		2 // require 2 approvals
	);

	await multiSigWallet.waitForDeployment();

	const address = await multiSigWallet.getAddress();

	console.log("MultiSigWallet deployed to:", address);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});