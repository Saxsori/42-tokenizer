import { expect } from "chai";
import { ethers } from "hardhat";

describe("Integration: MultiSig-controlled minting", function () {
  it("mints tokens only after multisig approval, and blocks the old owner", async function () {
    const [deployer, signer2, signer3, recipient] = await ethers.getSigners();

	// Deploy the token and the multisig wallet
    const TokenFactory = await ethers.getContractFactory("FortyTwoNova");

	const initialSupply = ethers.parseUnits("1000000", 18);
	const maxSupply = ethers.parseUnits("42000000", 18);

    const token = await TokenFactory.deploy(initialSupply, maxSupply);
    await token.waitForDeployment();

	// Deploy the multisig wallet with 3 owners and a requirement of 2 approvals
    const MultiSigFactory = await ethers.getContractFactory("MultiSigWallet");
    const multisig = await MultiSigFactory.deploy(
      [deployer.address, signer2.address, signer3.address],
      2
    );
    await multisig.waitForDeployment();

    const multisigAddress = await multisig.getAddress();

	// Transfer ownership of the token to the multisig wallet
	// Initially, the deployer is the owner of the token. 
	// After transferring ownership to the multisig wallet, 
	// the deployer should no longer be able to mint tokens.
	// The multisig wallet will control the minting process.
    await token.transferOwnership(multisigAddress);
    expect(await token.owner()).to.equal(multisigAddress);

	// Attempting to mint tokens directly from the deployer should fail
    await expect(
      token.connect(deployer).mint(recipient.address, ethers.parseUnits("1000", 18))
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");

	// Encode the mint function call data for the multisig wallet to execute
    const mintAmount = ethers.parseUnits("1000", 18);
    const mintData = token.interface.encodeFunctionData("mint", [recipient.address, mintAmount]);

	// Submit the mint transaction to the multisig wallet
    await multisig.connect(deployer).submitTransaction(token, mintData);

    await multisig.connect(deployer).approveTransaction(0);
    await multisig.connect(signer2).approveTransaction(0);

    await multisig.executeTransaction(0);

    expect(await token.balanceOf(recipient.address)).to.equal(mintAmount);
  });
});