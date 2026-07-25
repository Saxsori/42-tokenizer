import { ethers } from "hardhat";

async function main() {
	const multiSigWalletAddress = process.env.MULTISIG_WALLET_ADDRESS;
	const tokenAddress = process.env.TOKEN_ADDRESS;

	if (!multiSigWalletAddress) {
		throw new Error("MULTISIG_WALLET_ADDRESS is not set in the environment variables.");
	}

	if (!tokenAddress) {
		throw new Error("TOKEN_ADDRESS is not set in the environment variables.");
	}

	// ***** //
	// Get the contract instance to interact with the MultiSigWallet contract that was deployed in the deploy.ts script
	const multiSigWallet = await ethers.getContractAt("MultiSigWallet", multiSigWalletAddress);

	// Read basic info (owners, required approvals) — proves the contract is alive and correctly configured
	const owner0 = await multiSigWallet.owners(0);
	const owner1 = await multiSigWallet.owners(1);
	const owner2 = await multiSigWallet.owners(2);
	const requiredApprovals = await multiSigWallet.required();

	console.log(`>> Testing: MultiSigWallet at address: ${multiSigWalletAddress}`);

	console.log(`MultiSigWallet Owners: ${owner0}, ${owner1}, ${owner2}`);
	console.log(`Required Approvals: ${requiredApprovals}`);

	// ***** //
	// Prove that the deployer can no longer mint directly, but can propose a mint transaction to the multisig wallet
	const token = await ethers.getContractAt("FortyTwoNova", tokenAddress);

	const [deployer, signer2, signer3] = await ethers.getSigners();

	console.log(`>> Testing: Attempting to mint directly from deployer (should fail)`);
	// Attempt to mint directly (should fail)
	try {
		const mintTx = await token.connect(deployer).mint(deployer.address, ethers.parseUnits("1000", 18));
		await mintTx.wait();
	} catch (error) {
		console.error(`Expected error when trying to mint directly: ${error}`);
	}

	//***** //
	// Propose a mint transaction to the multisig wallet
	const mintAmount = ethers.parseUnits("1000", 18);
	const mintData = token.interface.encodeFunctionData("mint", [deployer.address, mintAmount]);

	console.log(`>> Testing: Proposing a mint transaction to the MultiSigWallet...`);
	const proposeTx = await multiSigWallet.connect(deployer).submitTransaction(tokenAddress, mintData);
	const proposeReceipt = await proposeTx.wait();

	if (!proposeReceipt) {
		throw new Error("Failed to get transaction receipt from submission transaction.");
	}

	// Get the transaction ID from the event logs
	const submissionLog = proposeReceipt.logs
		.map((log) => {
			try {
				return multiSigWallet.interface.parseLog(log);
			} catch {
				return null;
			}
		})
		.find((log) => log?.name === "Submission");

	const txId = submissionLog?.args?.txId;

	if (txId === undefined) {
		console.error("Failed to retrieve transaction ID from the submission event.");
	}

	console.log(`Mint transaction proposed with ID: ${txId}`);

	// ***** //
	// Sign the transaction with the required number of owners
	console.log(`>> Testing: Signing the transaction with required approvals...`);
	const approveTx1 = await multiSigWallet.connect(signer2).approveTransaction(txId);
	await approveTx1.wait();

	const approveTx2 = await multiSigWallet.connect(signer3).approveTransaction(txId);
	await approveTx2.wait();


	// ***** //
	// Check if the transaction is approved and ready to be executed
	console.log(`>> Testing: Checking if the transaction is approved...`);
	const txDetails = await multiSigWallet.transactions(txId);
	console.log(`Approval Count: ${txDetails.approvalCount}, Executed: ${txDetails.executed}, Required Approvals: ${requiredApprovals}`);

	if (txDetails.approvalCount >= requiredApprovals && !txDetails.executed) {
		console.log(`Transaction ${txId} is approved and ready for execution.`);
	} else {
		console.error(`Transaction ${txId} is not approved or already executed.`);
	}

	// ***** //
	// Execute the transaction
	console.log(`>> Testing: Executing the transaction...`);
	await multiSigWallet.connect(deployer).executeTransaction(txId);

	// Verify that the minting was successful
	const newBalance = await token.balanceOf(deployer.address);
	console.log(`New balance of deployer after minting: ${ethers.formatUnits(newBalance, 18)} tokens`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});