// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MultiSigWallet {
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public required;

    struct Transaction {
        address target;
        bytes data;
        bool executed;
        uint256 approvalCount;
    }

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public approved;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not an owner");
        _;
    }

	event Submission(uint256 indexed txId);
	event Approval(uint256 indexed txId, address indexed owner);
	event Execution(uint256 indexed txId);

    constructor(address[] memory _owners, uint256 _required) {
        // TODO: validate inputs (non-empty owners, required <= owners.length, required > 0)
		require(_owners.length > 0, "owners cannot be empty");
		require(_required > 0, "required cannot be zero");
		require(_required <= _owners.length, "required cannot exceed owner count");
        // TODO: populate `owners` and `isOwner`
		for (uint256 i = 0; i < _owners.length; i++) {
			address owner = _owners[i];
			// Validate that the owner address is not zero and is unique
			require(owner != address(0), "invalid owner");
			require(!isOwner[owner], "owner not unique");
			isOwner[owner] = true;
			owners.push(owner);
		}
        // TODO: set `required`
		required = _required;
    }

    function submitTransaction(address _target, bytes memory _data) external onlyOwner returns (uint256 txId) {
		// Create a new transaction and add it to the transactions array
		// The transaction is initialized with the target address, data, executed status as false, and approval count as 0
		// The function returns the index of the newly created transaction in the transactions array
		// This allows owners to submit transactions that require approval from other owners before execution
		// The txId returned can be used to reference this transaction in future calls to approve or execute it
		// The function is restricted to only be called by owners of the wallet, ensuring that only authorized individuals can submit transactions
		// The use of a struct for Transaction allows for easy management of transaction data, including the target address, data payload, execution status, and approval count
		// The mapping approved keeps track of which owners have approved each transaction, preventing double approvals and ensuring that the required number of approvals is met before execution
		// Overall, this function is a key part of the multisig wallet's functionality, enabling collaborative decision-making and secure execution of transactions
        // TODO: push a new Transaction into `transactions`, return its index
        transactions.push(Transaction({
            target: _target,
            data: _data,
            executed: false,
            approvalCount: 0
        }));
		emit Submission(transactions.length - 1);
        return transactions.length - 1;
    }

    function approveTransaction(uint256 _txId) external onlyOwner {
		// The approveTransaction function allows an owner of the multisig wallet to approve a specific transaction that has been submitted.
		// It takes the transaction ID (_txId) as a parameter, which corresponds to the index of the transaction in the transactions array.
		// The function first checks that the transaction has not already been executed, ensuring that approvals can only be given to pending transactions.
		// It then checks that the owner has not already approved this transaction, preventing double approvals from the same owner
		// If both checks pass, the function marks the owner as having approved the transaction and increments the approval count for that transaction.
		// This mechanism ensures that a transaction can only be executed once it has received the required number of approvals from the owners, enhancing the security and integrity of the multisig wallet's operations.
		// The function is restricted to only be called by owners of the wallet, ensuring that only authorized individuals can approve transactions.
		// Overall, this function is a key part of the multisig wallet's approval process, enabling collaborative decision-making and secure execution of transactions while maintaining transparency and accountability among the wallet's owners.
        // TODO: require not already approved by msg.sender
		require(!approved[_txId][msg.sender], "already approved");
        // TODO: mark approved[_txId][msg.sender] = true
		approved[_txId][msg.sender] = true;
        // TODO: increment transactions[_txId].approvalCount
        transactions[_txId].approvalCount++;
		emit Approval(_txId, msg.sender);
    }

    function executeTransaction(uint256 _txId) external {
		// The executeTransaction function allows an owner of the multisig wallet to execute a specific transaction that has been submitted and approved by the required number of owners.
		// It takes the transaction ID (_txId) as a parameter, which corresponds to the index of the transaction in the transactions array.
		// The function first checks that the transaction has not already been executed, ensuring that it can only be executed once.
		// It then checks that the approval count for the transaction meets or exceeds the required number of approvals, ensuring that the transaction has received sufficient support from the owners before execution.
		// If both checks pass, the function marks the transaction as executed and performs the external call to the target address with the provided data.
		// The function checks the success of the external call and reverts if the call fails, ensuring that the transaction is only considered executed if the external operation is successful.
		// This mechanism ensures that transactions can only be executed once they have received the necessary approvals, enhancing the security and integrity of the multisig wallet's operations.
		// The function is restricted to only be called by owners of the wallet, ensuring that only authorized individuals can execute transactions.
		// Overall, this function is a key part of the multisig wallet's execution process, enabling collaborative decision-making and secure execution of transactions while maintaining transparency and accountability among the wallet's owners.
        // TODO: require not already executed
		require(!transactions[_txId].executed, "already executed");
        // TODO: require approvalCount >= required
		require(transactions[_txId].approvalCount >= required, "not enough approvals");
        // TODO: mark executed = true (BEFORE the external call — think about why order matters here)
        transactions[_txId].executed = true;
        // TODO: call transactions[_txId].target with transactions[_txId].data, check it succeeded
		(bool success, ) = transactions[_txId].target.call(transactions[_txId].data);
		require(success, "transaction failed");
		emit Execution(_txId);
    }
}