import { ethers } from "hardhat";


async function main() {
	const tokenAddress = process.env.TOKEN_ADDRESS;

	if (!tokenAddress) {
		throw new Error("TOKEN_ADDRESS is not set in the environment variables.");
	}

	// ***** //
	// Get the contract instance to interact with The FortyTwoNova contract that was deployed in the deploy.ts script
	const token = await ethers.getContractAt("FortyTwoNova", tokenAddress);

	// Read basic info (name, symbol, total supply) — proves the contract is alive and correctly configured
	const name = await token.name();
	const symbol = await token.symbol();
	const totalSupply = await token.totalSupply();

	console.log(`Token Name: ${name}`);
	console.log(`Token Symbol: ${symbol}`);
	// Display total supply in a human-readable format (assuming 18 decimals)
	console.log(`Total Supply: ${ethers.formatUnits(totalSupply, 18)}`);

	// ***** //
	const [deployer, other] = await ethers.getSigners();

	// Transfer some tokens to a second address — proves the core ERC20 mechanic works
	const transferAmount = ethers.parseUnits("100", 18);
	const transferTx = await token.transfer(other.address, transferAmount);
	await transferTx.wait();

	console.log(`Transferred ${ethers.formatUnits(transferAmount, 18)} tokens to ${other.address}`);

	// Check the balance of the second address
	const otherBalance = await token.balanceOf(other.address);
	console.log(`Balance of ${other.address}: ${ethers.formatUnits(otherBalance, 18)} tokens`);


	// ***** //
	// Mint more tokens (owner-only) — proves your privilege/ownership logic works
	const mintAmount = ethers.parseUnits("50", 18);
	const mintTx = await token.mint(deployer.address, mintAmount);
	await mintTx.wait();

	console.log(`Minted ${ethers.formatUnits(mintAmount, 18)} tokens to ${deployer.address}`);

	// Check the new total supply
	const newTotalSupply = await token.totalSupply();
	console.log(`New Total Supply: ${ethers.formatUnits(newTotalSupply, 18)}`);

	// others can't mint, so let's try to mint from the other address and catch the error
	try {
		const mintTxOther = await token.connect(other).mint(other.address, mintAmount);
		await mintTxOther.wait();
	} catch (error) {
		console.error(`Expected error when non-owner tries to mint: ${error}`);
	}

	// owner can mint to another address, so let's try to mint from the deployer address to the other address
	const mintTxToOther = await token.mint(other.address, mintAmount);
	await mintTxToOther.wait();
	console.log(`Minted ${ethers.formatUnits(mintAmount, 18)} tokens to ${other.address} from owner`);

	// Check the balance of the second address after minting
	const otherBalanceAfterMint = await token.balanceOf(other.address);
	console.log(`Balance of ${other.address} after minting: ${ethers.formatUnits(otherBalanceAfterMint, 18)} tokens`);

	// owner can check the total supply after minting to another address
	const finalTotalSupply = await token.totalSupply();
	console.log(`Final Total Supply: ${ethers.formatUnits(finalTotalSupply, 18)}`);

	
	// Burn some tokens — proves the burn mechanic works
	const burnAmount = ethers.parseUnits("20", 18);
	const burnTx = await token.burn(burnAmount);
	await burnTx.wait();
	
	console.log(`Burned ${ethers.formatUnits(burnAmount, 18)} tokens from ${deployer.address}`);

	// Check the new total supply after burning
	const totalSupplyAfterBurn = await token.totalSupply();
	console.log(`Total Supply after burn: ${ethers.formatUnits(totalSupplyAfterBurn, 18)}`);

	// Check the balance of the deployer after burning
	const deployerBalanceAfterBurn = await token.balanceOf(deployer.address);
	console.log(`Balance of ${deployer.address} after burn: ${ethers.formatUnits(deployerBalanceAfterBurn, 18)} tokens`);

	// owner can burn tokens from another address if they have allowance, so let's approve the deployer to burn tokens from the other address
	const approveAmount = ethers.parseUnits("10", 18);
	const approveTx = await token.connect(other).approve(deployer.address, approveAmount);
	await approveTx.wait();
	console.log(`Approved ${ethers.formatUnits(approveAmount, 18)} tokens for ${deployer.address} to burn from ${other.address}`);

	// Now the deployer can burn tokens from the other address
	const burnFromTx = await token.burnFrom(other.address, approveAmount);
	await burnFromTx.wait();
	console.log(`Burned ${ethers.formatUnits(approveAmount, 18)} tokens from ${other.address} by ${deployer.address}`);

	// Check the balance of the other address after burning
	const otherBalanceAfterBurn = await token.balanceOf(other.address);
	console.log(`Balance of ${other.address} after burn: ${ethers.formatUnits(otherBalanceAfterBurn, 18)} tokens`);

	// Check the new total supply after burning from another address
	const totalSupplyAfterBurnFrom = await token.totalSupply();
	console.log(`Total Supply after burn from another address: ${ethers.formatUnits(totalSupplyAfterBurnFrom, 18)}`);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});