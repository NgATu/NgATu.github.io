// Địa chỉ smart contract sau khi deploy
const CONTRACT_ADDRESS = "0xcF4D93d70EB2A7f4d8D017df96b83e64D2d4c3C3";

// ABI của smart contract
const CONTRACT_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_counterParty",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_contractType",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_terms",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_startDate",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_endDate",
                "type": "uint256"
            }
        ],
        "name": "createContract",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_contractId",
                "type": "uint256"
            }
        ],
        "name": "executeContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_contractId",
                "type": "uint256"
            }
        ],
        "name": "terminateContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_contractId",
                "type": "uint256"
            }
        ],
        "name": "getContract",
        "outputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "counterParty",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "contractType",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "terms",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "startDate",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "endDate",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "contractCount",
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
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "contractId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "counterParty",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "contractType",
                "type": "string"
            }
        ],
        "name": "ContractCreated",
        "type": "event"
    }
]; 