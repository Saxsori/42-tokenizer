// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


// ERC20 for standatd ERC20 functionality, ERC20Burnable for burn() and burnFrom() functions, and Ownable for access control.
// burn means that the token can be destroyed, reducing the total supply. 
// Ownable means that there is an owner of the contract, which is usually the deployer, and only the owner can call certain functions (like minting new tokens).
// minting is the process of creating new tokens and adding them to the total supply. which is usually restricted to the owner of the contract.
// The contract is called FortyTwoNova, which is a play on the name of the ERC20 token and the number 42, which is a reference to "The Hitchhiker's Guide to the Galaxy" by Douglas Adams. In the book, 42 is the answer to the ultimate question of life, the universe, and everything.
// and the "Nova" part of the name is a reference to a supernova, which is a powerful and luminous stellar explosion. The name is meant to convey that this token is powerful and valuable, like a supernova.
//  
contract FortyTwoNova is ERC20, ERC20Burnable, Ownable {
    // Hard ceiling on total supply. `immutable` = set once at deploy,
    // stored directly in bytecode, cannot ever be changed afterward
    // not even by the owner.
	// This is a common pattern for ERC20 tokens that have a fixed supply cap. 
	// 	It ensures that the total supply of the token can never exceed a certain amount, which can help to maintain its value and prevent inflation.
    uint256 public immutable MAX_SUPPLY;

    event Minted(address indexed to, uint256 amount);

	// The constructor takes two parameters: the initial supply of tokens to mint, and the maximum supply of tokens that can ever exist.
	// The constructor calls the ERC20 constructor with the name and symbol of the token, and sets the owner of the contract to the deployer (msg.sender). 
	// It also checks that the initial supply does not exceed the maximum supply, and mints the initial supply of tokens to the deployer if it is greater than zero.
    constructor(
        uint256 initialSupply,
        uint256 maxSupply
    ) ERC20("FT42Nova", "42Nova") Ownable(msg.sender) {
        require(initialSupply <= maxSupply, "42Nova: initial supply exceeds cap");
        MAX_SUPPLY = maxSupply;
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    // Only the owner (the deployer, unless ownership is transferred)
    // can call this. Enforces the cap on-chain.
	// The mint function allows the owner of the contract to create new tokens and add them to the total supply.
	// It takes two parameters: the address to mint the tokens to, and the amount of tokens to mint.
	// It checks that the total supply after minting will not exceed the maximum supply, and then calls the internal _mint function to create the new tokens and add them to the total supply.
	// so what it does is that it allows the owner to create new tokens, but only up to a certain limit (the maximum supply). 
	// (to, amount) is the address to which the newly minted tokens will be sent, and the amount is the number of tokens to mint.
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "42Nova: cap exceeded");
        _mint(to, amount);
        emit Minted(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }
}