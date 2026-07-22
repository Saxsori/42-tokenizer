import { expect } from "chai";
import { ethers } from "hardhat";


describe("MultiSigWallet", function () {
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