const CONTRACT_ADDRESS = "0x3442C76A937cB2228fFc9332C00469dCA4A96df4";

const CONTRACT_ABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "materialId",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentQuantity",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isImport",
                "type": "bool"
            },
            {
                "internalType": "string",
                "name": "details",
                "type": "string"
            }
        ],
        "name": "addTransaction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "materialId",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "previousQuantity",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newQuantity",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "isImport",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "details",
                "type": "string"
            }
        ],
        "name": "TransactionAdded",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "currentQuantities",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllTransactions",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "materialIds",
                "type": "string[]"
            },
            {
                "internalType": "uint256[]",
                "name": "quantities",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "previousQuantities",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "newQuantities",
                "type": "uint256[]"
            },
            {
                "internalType": "bool[]",
                "name": "isImports",
                "type": "bool[]"
            },
            {
                "internalType": "uint256[]",
                "name": "timestamps",
                "type": "uint256[]"
            },
            {
                "internalType": "string[]",
                "name": "detailsList",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "materialId",
                "type": "string"
            }
        ],
        "name": "getCurrentQuantity",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "materialId",
                "type": "string"
            }
        ],
        "name": "getMaterialTransactionCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "materialTransactions",
        "outputs": [
            {
                "internalType": "string",
                "name": "materialId",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "previousQuantity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "newQuantity",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isImport",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "details",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "transactions",
        "outputs": [
            {
                "internalType": "string",
                "name": "materialId",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "previousQuantity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "newQuantity",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isImport",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "details",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]; 