import { expect } from "chai";
import { ethers } from "hardhat";


describe("MultiSigWallet: Constructor", function () {
	it("sets the correct owners and required approvals", async function () {
		const [owner1, owner2, owner3] = await ethers.getSigners();

		const Factory = await ethers.getContractFactory("MultiSigWallet");
		const multiSigWallet = await Factory.deploy(
			[owner1.address, owner2.address, owner3.address],
			2 // require 2 approvals
		);
		await multiSigWallet.waitForDeployment();

		expect(await multiSigWallet.required()).to.equal(2);
		expect(await multiSigWallet.isOwner(owner1.address)).to.equal(true);
		expect(await multiSigWallet.isOwner(owner2.address)).to.equal(true);
		expect(await multiSigWallet.isOwner(owner3.address)).to.equal(true);
	});
});

describe("MultiSigWallet: Transaction Submission", function () {
	it ("reverts if a non-owner tries to submit a transaction", async function () {
		const [owner1, owner2, nonOwner] = await ethers.getSigners();

		const Factory = await ethers.getContractFactory("MultiSigWallet");
		const multiSigWallet = await Factory.deploy(
			[owner1.address, owner2.address],
			2 
		);
		await multiSigWallet.waitForDeployment();

		await expect(multiSigWallet.connect(nonOwner).submitTransaction(owner1.address, "0x"))
			.to.be.revertedWith("not an owner");
	});

	it("allows an owner to submit a transaction", async function () {
		const [owner1, owner2, owner3, recipient] = await ethers.getSigners();

		const Factory = await ethers.getContractFactory("MultiSigWallet");
		const multiSigWallet = await Factory.deploy(
			[owner1.address, owner2.address, owner3.address],
			2 
		);
		await multiSigWallet.waitForDeployment();


		
		await expect(multiSigWallet.connect(owner1).submitTransaction(recipient.address, "0x"))
			.to.emit(multiSigWallet, "Submission")
			.withArgs(0); // txId should be 0 for the first transaction

		const tx = await multiSigWallet.transactions(0);
		expect(tx.target).to.equal(recipient.address);
		expect(tx.data).to.equal("0x");
		expect(tx.executed).to.equal(false);
		expect(tx.approvalCount).to.equal(0);
	});
});

describe("MultiSigWallet: Transaction Approval", function () {
	it("allows an owner to approve a transaction", async function () {
		const [owner1, owner2, owner3, recipient] = await ethers.getSigners();

		const Factory = await ethers.getContractFactory("MultiSigWallet");
		const multiSigWallet = await Factory.deploy(
			[owner1.address, owner2.address, owner3.address],
			2 
		);
		await multiSigWallet.waitForDeployment();

		await multiSigWallet.connect(owner1).submitTransaction(recipient.address, "0x");

		await expect(multiSigWallet.connect(owner1).approveTransaction(0))
			.to.emit(multiSigWallet, "Approval")
			.withArgs(0, owner1.address);

		const tx = await multiSigWallet.transactions(0);
		expect(tx.approvalCount).to.equal(1);
		expect(await multiSigWallet.approved(0, owner1.address)).to.equal(true);
	});

	it("reverts if a non-owner tries to approve a transaction", async function () {
		const [owner1, owner2, nonOwner] = await ethers.getSigners();

		const Factory = await ethers.getContractFactory("MultiSigWallet");
		const multiSigWallet = await Factory.deploy(
			[owner1.address, owner2.address],
			2 
		);
		await multiSigWallet.waitForDeployment();

		await multiSigWallet.connect(owner1).submitTransaction(owner2.address, "0x");

		await expect(multiSigWallet.connect(nonOwner).approveTransaction(0))
			.to.be.revertedWith("not an owner");
	});

	it("reverts if an owner tries to approve a transaction twice", async function () {
		const [owner1, owner2, owner3, recipient] = await ethers.getSigners();

		const Factory = await ethers.getContractFactory("MultiSigWallet");
		const multiSigWallet = await Factory.deploy(
			[owner1.address, owner2.address, owner3.address],
			2 
		);
		await multiSigWallet.waitForDeployment();

		await multiSigWallet.connect(owner1).submitTransaction(recipient.address, "0x");

		await multiSigWallet.connect(owner1).approveTransaction(0);
		await multiSigWallet.connect(owner3).approveTransaction(0);


		await expect(multiSigWallet.connect(owner1).approveTransaction(0))
			.to.be.revertedWith("already approved");
	});
});

describe("MultiSigWallet: Transaction Execution", function () {
	it("executes a transaction after required approvals", async function () {
		const [owner1, owner2, owner3, recipient] = await ethers.getSigners();

		const Factory = await ethers.getContractFactory("MultiSigWallet");
		const multiSigWallet = await Factory.deploy(
			[owner1.address, owner2.address, owner3.address],
			2 
		);
		await multiSigWallet.waitForDeployment();

		await multiSigWallet.connect(owner1).submitTransaction(recipient.address, "0x");

		await multiSigWallet.connect(owner1).approveTransaction(0);
		await multiSigWallet.connect(owner2).approveTransaction(0);

		await expect(multiSigWallet.connect(owner1).executeTransaction(0))
			.to.emit(multiSigWallet, "Execution")
			.withArgs(0);

		const tx = await multiSigWallet.transactions(0);
		expect(tx.executed).to.equal(true);
	});

	it("reverts if trying to execute a transaction without enough approvals", async function () {
		const [owner1, owner2, owner3, recipient] = await ethers.getSigners();

		const Factory = await ethers.getContractFactory("MultiSigWallet");
		const multiSigWallet = await Factory.deploy(
			[owner1.address, owner2.address, owner3.address],
			2 
		);
		await multiSigWallet.waitForDeployment();

		await multiSigWallet.connect(owner1).submitTransaction(recipient.address, "0x");

		await multiSigWallet.connect(owner1).approveTransaction(0);

		await expect(multiSigWallet.connect(owner1).executeTransaction(0))
			.to.be.revertedWith("not enough approvals");
	});

	it("reverts if trying to execute a transaction that has already been executed", async function () {
		const [owner1, owner2, owner3, recipient] = await ethers.getSigners();

		const Factory = await ethers.getContractFactory("MultiSigWallet");
		const multiSigWallet = await Factory.deploy(
			[owner1.address, owner2.address, owner3.address],
			2 
		);
		await multiSigWallet.waitForDeployment();

		await multiSigWallet.connect(owner1).submitTransaction(recipient.address, "0x");

		await multiSigWallet.connect(owner1).approveTransaction(0);
		await multiSigWallet.connect(owner2).approveTransaction(0);

		await multiSigWallet.connect(owner1).executeTransaction(0);

		await expect(multiSigWallet.connect(owner1).executeTransaction(0))
			.to.be.revertedWith("already executed");
	});
});
