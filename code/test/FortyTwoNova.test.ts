import { expect } from "chai";
import { ethers } from "hardhat";


// Name/symbol/decimals are set correctly
describe("FortyTwoNova: Token Details", function () {
	it("sets the correct name, symbol and decimals", async function () {
		const Factory = await ethers.getContractFactory("FortyTwoNova");
		const token = await Factory.deploy(8, 42);
		await token.waitForDeployment();

		expect(await token.name()).to.equal("FT42Nova");
		expect(await token.symbol()).to.equal("42Nova");
		expect(await token.decimals()).to.equal(18);
	});
});

// Deployer gets the initial supply
describe("FortyTwoNova: Initial Supply", function () {
	it("assigns the initial supply to the deployer", async function () {
		const [deployer] = await ethers.getSigners();
		const Factory = await ethers.getContractFactory("FortyTwoNova");
		const token = await Factory.deploy(8, 42);
		await token.waitForDeployment();

		expect(await token.balanceOf(deployer.address)).to.equal(8);
		expect(await token.totalSupply()).to.equal(8);

	});
});

// Owner can mint (and it respects the cap)
describe("FortyTwoNova: Minting", function () {
	it("allows the owner to mint tokens up to the cap", async function () {
		const [deployer] = await ethers.getSigners();
		const Factory = await ethers.getContractFactory("FortyTwoNova");
		const token = await Factory.deploy(8, 42);
		await token.waitForDeployment();

		// total supply should now be 42 , 34 + 8 = 42
		await token.mint(deployer.address, 34);
		expect(await token.totalSupply()).to.equal(42);
		expect(await token.balanceOf(deployer.address)).to.equal(42);

		await expect(token.mint(deployer.address, 1)).to.be.revertedWith("42Nova: cap exceeded");
	});

	it("owner tries to mint past the cap", async function () {
		const [deployer] = await ethers.getSigners();
		const Factory = await ethers.getContractFactory("FortyTwoNova");
		const token = await Factory.deploy(8, 42);
		await token.waitForDeployment();

		await expect(token.mint(deployer.address, 35)).to.be.revertedWith("42Nova: cap exceeded");
	});

	it("allows owner to mint to another address", async function () {
		const [deployer, other] = await ethers.getSigners();
		const Factory = await ethers.getContractFactory("FortyTwoNova");
		const token = await Factory.deploy(8, 42);
		await token.waitForDeployment();

		// check event fired when calling mint
		await expect(token.mint(other.address, 34))
			.to.emit(token, "Minted")
			.withArgs(other.address, 34);
		expect(await token.totalSupply()).to.equal(42);
		expect(await token.balanceOf(other.address)).to.equal(34);
	});

});


// A non-owner cannot mint
// Normal transfers work
// Burning removes tokens from total supply