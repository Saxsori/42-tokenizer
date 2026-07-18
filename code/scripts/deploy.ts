import { ethers } from "hardhat";

async  function main() {
	const [deployer] = await ethers.getSigners();

	console.log("Deploying contracts with the account:", deployer.address);

	const initialSupply = ethers.parseUnits("1000000", 18);
	const maxSupply = ethers.parseUnits("42000000", 18); 
	
	const Factory = await ethers.getContractFactory("FortyTwoNova");
	const token = await Factory.deploy(initialSupply, maxSupply);

	await token.waitForDeployment();

	const address = await token.getAddress();
	
	console.log("FortyTwoNova deployed to:", address);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
