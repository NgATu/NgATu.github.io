let contract;
let signer;
let contractAddress = "0xf72cD1303691037E7077c922EABc5D7e48D1757A";
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            }
        ],
        "name": "addCandidate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "endVoting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "startVoting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "candidateId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            }
        ],
        "name": "CandidateAdded",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_candidateId",
                "type": "uint256"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "voter",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "candidateId",
                "type": "uint256"
            }
        ],
        "name": "VoteCast",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bool",
                "name": "isOpen",
                "type": "bool"
            }
        ],
        "name": "votingStatusChanged",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "candidates",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "voteCount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_candidateId",
                "type": "uint256"
            }
        ],
        "name": "getCandidate",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "voteCount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCandidateCount",
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
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "voters",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "votingOpen",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

document.getElementById('connectWallet').addEventListener('click', connectWallet);
document.getElementById('addCandidate').addEventListener('click', addCandidate);
document.getElementById('startVoting').addEventListener('click', startVoting);
document.getElementById('endVoting').addEventListener('click', endVoting);
document.getElementById('voteButton').addEventListener('click', handleVote);

// Check if MetaMask is installed
window.addEventListener('load', () => {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
    } else {
        alert('Please install MetaMask to use this dApp!');
    }
});

// Thêm hàm kiểm tra trạng thái vote
async function checkVoteStatus() {
    try {
        const address = await signer.getAddress();
        const hasVoted = await contract.voters(address);
        const votingControls = document.getElementById('votingControls');
        const votedSection = document.getElementById('votedSection');

        if (hasVoted) {
            // Nếu đã vote thì ẩn phần voting controls và hiện thông báo
            votingControls.style.display = 'none';
            votedSection.style.display = 'block';
        } else {
            // Nếu chưa vote thì hiện phần voting controls và ẩn thông báo
            votingControls.style.display = 'block';
            votedSection.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking vote status:', error);
    }
}

// Cập nhật hàm connectWallet để check vote status
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            contract = new ethers.Contract(contractAddress, contractABI, signer);

            const address = await signer.getAddress();
            document.getElementById('walletAddress').textContent =
                `${address.substring(0, 6)}...${address.substring(38)}`;

            document.getElementById('walletAddress1').textContent = address;

            // Check if connected account is owner
            const owner = await contract.owner();
            if (owner.toLowerCase() === address.toLowerCase()) {
                document.getElementById('adminPanel').classList.remove('hidden');
            }

            await loadCandidates();
            await checkVoteStatus(); // Thêm kiểm tra trạng thái vote
        } catch (error) {
            console.error('Error connecting wallet:', error);
        }
    } else {
        alert('Please install MetaMask!');
    }
}

async function updateStatistics() {
    try {
        // Get total candidates using existing getCandidateCount function
        const count = await contract.getCandidateCount();
        document.getElementById('totalCandidates').textContent = count.toString();

        // Calculate total votes by summing up all candidate votes
        let totalVotes = 0;
        for (let i = 0; i < count; i++) {
            const candidate = await contract.getCandidate(i);
            totalVotes += parseInt(candidate.voteCount);
        }
        document.getElementById('totalVotes').textContent = totalVotes.toString();

        // Get voting status using existing votingOpen variable
        const votingOpen = await contract.votingOpen();
        const statusElement = document.getElementById('votingStatus');
        if (votingOpen) {
            statusElement.textContent = 'ACTIVE';
            statusElement.className = 'status-active';
        } else {
            statusElement.textContent = 'INACTIVE';
            statusElement.className = 'status-inactive';
        }
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

async function loadCandidates() {
    const candidatesList = document.getElementById('candidatesList');
    const candidateSelect = document.getElementById('candidateSelect');

    // Clear existing content
    candidatesList.innerHTML = '';
    // Reset select options to only the default option
    candidateSelect.innerHTML = '<option value="">-- Select a candidate to vote --</option>';

    try {
        const count = await contract.getCandidateCount();

        for (let i = 0; i < count; i++) {
            const candidate = await contract.getCandidate(i);

            // Add row to table
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${candidate.id}</td>
                <td>${candidate.name}</td>
                <td>${candidate.voteCount}</td>
            `;
            candidatesList.appendChild(row);

            // Add option to select dropdown
            const option = document.createElement('option');
            option.value = candidate.id;
            option.textContent = candidate.name;
            candidateSelect.appendChild(option);
        }

        // Update statistics after loading candidates
        await updateStatistics();
    } catch (error) {
        console.error('Error loading candidates:', error);

    }
}

async function addCandidate() {
    const name = document.getElementById('candidateName').value;
    if (!name) {
        alert('Please enter a candidate name');
        return;
    };

    try {
        const tx = await contract.addCandidate(name);

        // Wait for the transaction to be mined
        await tx.wait();

        // Reload the candidates list
        loadCandidates();

        // Clear the input field
        document.getElementById('candidateName').value = '';
    } catch (error) {
        console.error('Error adding candidate:', error);
        alert('Error adding candidate. Please try again.');
    }
}

async function startVoting() {
    try {
        const tx = await contract.startVoting();
        await tx.wait();
        alert('Voting has started!');
        await updateStatistics();
    } catch (error) {
        console.error('Error starting voting:', error);
        alert('Error starting voting. Please try again.');
    }
}

async function endVoting() {
    try {
        const tx = await contract.endVoting();
        await tx.wait();
        alert('Voting has ended!');
        await updateStatistics();
    } catch (error) {
        console.error('Error ending voting:', error);
        alert('Error ending voting. Please try again.');
    }
}

// Cập nhật hàm handleVote
async function handleVote() {
    const selectedValue = document.getElementById('candidateSelect').value;
    if (!selectedValue) {
        alert('Please select a candidate first');
        return;
    }

    try {
        const tx = await contract.vote(selectedValue);
        await tx.wait();
        alert('Vote cast successfully!');
        await loadCandidates();
        await checkVoteStatus(); // Thêm kiểm tra trạng thái vote sau khi vote
    } catch (error) {
        console.error('Error voting:', error);
        alert('Error: ' + error.message);
    }
}

// Thêm event listener cho thay đổi tài khoản
if (window.ethereum) {
    window.ethereum.on('accountsChanged', async () => {
        await connectWallet();
    });
}

