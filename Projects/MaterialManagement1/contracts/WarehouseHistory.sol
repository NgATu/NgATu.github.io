// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WarehouseHistory {
    struct Transaction {
        string materialId;
        uint256 quantity;
        uint256 previousQuantity;
        uint256 newQuantity;
        bool isImport;
        uint256 timestamp;
        string details;
    }
    
    Transaction[] public transactions;
    mapping(string => Transaction[]) public materialTransactions;
    mapping(string => uint256) public currentQuantities;
    
    event TransactionAdded(
        string materialId,
        uint256 quantity,
        uint256 previousQuantity,
        uint256 newQuantity,
        bool isImport,
        uint256 timestamp,
        string details
    );
    
    function addTransaction(
        string memory materialId,
        uint256 quantity,
        uint256 currentQuantity,
        bool isImport,
        string memory details
    ) public {
        require(bytes(materialId).length > 0, "Material ID cannot be empty");
        require(quantity > 0, "Quantity must be greater than 0");
        
        // Get the current quantity from storage or use provided currentQuantity if first transaction
        uint256 previousQuantity = currentQuantities[materialId];
        if (previousQuantity == 0) {
            previousQuantity = currentQuantity;
            currentQuantities[materialId] = currentQuantity;
        }
        
        uint256 newQuantity;
        if (isImport) {
            newQuantity = currentQuantities[materialId] + quantity;
        } else {
            require(currentQuantities[materialId] >= quantity, "Insufficient quantity for export");
            newQuantity = currentQuantities[materialId] - quantity;
        }
        
        Transaction memory newTransaction = Transaction({
            materialId: materialId,
            quantity: quantity,
            previousQuantity: currentQuantities[materialId], // Use current quantity as previous
            newQuantity: newQuantity,
            isImport: isImport,
            timestamp: block.timestamp,
            details: details
        });
        
        transactions.push(newTransaction);
        materialTransactions[materialId].push(newTransaction);
        currentQuantities[materialId] = newQuantity;
        
        emit TransactionAdded(
            materialId,
            quantity,
            currentQuantities[materialId],
            newQuantity,
            isImport,
            block.timestamp,
            details
        );
    }
    
    function getAllTransactions() public view returns (
        string[] memory materialIds,
        uint256[] memory quantities,
        uint256[] memory previousQuantities,
        uint256[] memory newQuantities,
        bool[] memory isImports,
        uint256[] memory timestamps,
        string[] memory detailsList
    ) {
        uint256 length = transactions.length;
        materialIds = new string[](length);
        quantities = new uint256[](length);
        previousQuantities = new uint256[](length);
        newQuantities = new uint256[](length);
        isImports = new bool[](length);
        timestamps = new uint256[](length);
        detailsList = new string[](length);
        
        for (uint256 i = 0; i < length; i++) {
            Transaction memory tx = transactions[i];
            materialIds[i] = tx.materialId;
            quantities[i] = tx.quantity;
            previousQuantities[i] = tx.previousQuantity;
            newQuantities[i] = tx.newQuantity;
            isImports[i] = tx.isImport;
            timestamps[i] = tx.timestamp;
            detailsList[i] = tx.details;
        }
        
        return (materialIds, quantities, previousQuantities, newQuantities, isImports, timestamps, detailsList);
    }
    
    function getMaterialTransactionCount(string memory materialId) public view returns (uint256) {
        return materialTransactions[materialId].length;
    }
    
    function getCurrentQuantity(string memory materialId) public view returns (uint256) {
        return currentQuantities[materialId];
    }
} 