# FT42Nova — Documentation

## 1. What is this token?
FT42Nova is an educational ERC20 token developed as a blockchain learning project. The purpose of this token is to demonstrate the implementation and management of a fungible token on the Ethereum blockchain, including token creation, transfers, supply management, and access control mechanisms.

This project is **not a real cryptocurrency, investment product, or commercial token**. It was developed for learning purposes to understand:

- ERC20 token standards
- Smart contract development using Solidity
- Token supply management
- Access control mechanisms
- Token burning functionality
- Interaction with Ethereum test networks

The token contract is named **FortyTwoNova**.
The name is inspired by two concepts:

- **42** — a reference to *The Hitchhiker's Guide to the Galaxy* by Douglas Adams, where 42 represents "the answer to the ultimate question of life, the universe, and everything."
- **Nova** — referring to a supernova, representing the creation of a new digital asset through blockchain technology.


## 2. Token specification
| Property | Value |
|---|---|
| Name | FT42Nova |
| Symbol | 42Nova |
| Decimals | 18 |
| Standard | ERC20 |
| Initial supply | 1,000,000 |
| Max supply | 42,000,000 |
| Network | Ethereum Sepolia Testnet |
| Contract address | `0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423` |

## 3. How it works
FT42Nova follows the ERC20 token standard, which defines common functions for creating and managing fungible tokens on Ethereum and extends OpenZeppelin contracts to provide additional functionality:

- **ERC20**: Provides standard token operations such as transfers, balances, and allowances.
- **ERC20Burnable**: Allows tokens to be permanently destroyed using `burn()` and `burnFrom()`.
- **Ownable**: Provides ownership-based access control for restricted operations.

### Transfer

Users can transfer FT42Nova tokens between Ethereum addresses.

Example:

- User A owns 100 42Nova tokens.
- User A transfers 20 tokens to User B.
- User A balance becomes 80 tokens
- User B receives 20 tokens.

### Mint

Minting creates new FT42Nova tokens and increases the total supply.

Only the contract owner has permission to mint new tokens.

The mint operation is restricted by the maximum supply limit:

```
Maximum supply = 42,000,000 42Nova
```

The owner cannot create tokens beyond this limit.

```solidity
current total supply + minted amount <= MAX_SUPPLY
```

### Burn

Burning permanently removes tokens from circulation by destroying them.

Users can burn their own tokens, reducing their balance and decreasing the total supply.

FT42Nova inherits the `ERC20Burnable` functionality, allowing users to burn their own tokens using:
```solidity
burn(uint256 amount)
```

Example:

- User owns 500 tokens.
- User burns 100 tokens.
- User balance becomes 400 tokens.
- Total supply decreases by 100 tokens.

### Burn From

`burnFrom` allows an approved address to burn tokens on behalf of another user.

This follows the ERC20 allowance mechanism:

1. User approves another address to spend a specific amount. `The token owner calls approve().`
2. The approved address can burn tokens up to that allowance. `The approved address calls burnFrom().`

This is useful for implementing controlled token management systems.

Example:

- User approves another address to spend 100 42Nova.
- The approved address can burn up to 100 42Nova from the user's balance.

## 4. Access control / security
### Ownership model

FT42Nova uses OpenZeppelin's `Ownable` contract for access control.

During deployment, the deployer address becomes the contract owner:
```solidity
Ownable(msg.sender)
```

The owner has permission to execute restricted functions, including:

- `mint()`

Normal users cannot create new tokens.

Ownership can be transferred using the built-in ownership management functions.

This means the owner is not permanent by default — using `transferOwnership()`, 
the current owner can hand control to a different address, or using 
`renounceOwnership()`, give up ownership entirely. Once ownership is renounced, 
no address can call `mint()` again, and the total supply can only ever decrease 
from that point on (via burning).

### Maximum supply cap

FT42Nova has a maximum supply limit:

```
42,000,000 42Nova
```

The cap is stored using:

```solidity
uint256 public immutable MAX_SUPPLY;
```

The immutable keyword means:

- The value is assigned only once during deployment.
- It cannot be modified after deployment.
- Even the contract owner cannot change it.

This prevents unlimited token creation and guarantees that the total supply will never exceed the defined maximum.

### Supply management

The constructor receives two values during deployment:

- Initial supply
- Maximum supply

The contract verifies:
```solidity
initialSupply <= maxSupply
```

If valid, the initial supply is minted to the deployer's address.

Additional tokens can only be created by the owner through mint(), and only if the maximum supply cap is not exceeded.


## 5. How to interact with it

The main interaction reference is:

scripts/interact.ts

This script demonstrates how to interact with the deployed FT42Nova smart contract.

### Available functions

| Function | Description|
|---|---|
|transfer()	| Transfer tokens between addresses|
|approve()	| Allow another address to spend tokens on behalf of the owner |
|transferFrom()	| Transfer approved tokens from another address |
|mint()	| Create new tokens (owner only, limited by MAX_SUPPLY) |
|burn()	| Permanently destroy tokens from the caller's balance |
|burnFrom() |	Permanently destroy tokens from an approved balance |
|balanceOf() |	Check the token balance of an address|
|totalSupply()  |	Check the current token supply|

Note: `scripts/interact.ts` demonstrates `transfer()`, `mint()`, `burn()`, 
`approve()`, `burnFrom()`, `balanceOf()`, and `totalSupply()` against the live 
Sepolia deployment. `transferFrom()` is not separately exercised in the demo 
script, since `burnFrom()` covers the same underlying allowance mechanism — 
an approved address spending someone else's approved balance.