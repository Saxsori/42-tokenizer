import { ethers } from "hardhat";

async function main() {
	const [deployer] = await ethers.getSigners();

	console.log("Transferring ownership with the account:", deployer.address);

	// Transfer ownership of the FortyTwoNova token to a new owner (multisig wallet)
	const tokenAddress = "0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423";
	const token = await ethers.getContractAt("FortyTwoNova", tokenAddress);

	const multiSigWalletAddress = "0x504207973E4d2733c8244A71AAbe1585230E3737";

	const tx = await token.transferOwnership(multiSigWalletAddress);
	await tx.wait();

	const newOwnerAddress = await token.owner();
	console.log("Ownership transferred to:", newOwnerAddress);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});