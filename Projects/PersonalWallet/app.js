// Initialize wallet
const wallet = new SmartContractWallet(CONTRACT_ADDRESS, CONTRACT_ABI);

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletInfo = document.getElementById('walletInfo');
const walletAddress = document.getElementById('walletAddress');
const contractList = document.getElementById('contractList');
const createContractForm = document.getElementById('createContractForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.getElementById('notifications').appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Xử lý khi tài khoản thay đổi
wallet.onAccountChanged = async (address) => {
    if (address) {
        walletAddress.textContent = address;
        walletInfo.classList.remove('hidden');
        connectWalletBtn.classList.add('hidden');
        await loadContracts();
        showNotification('Wallet account updated');
    } else {
        walletInfo.classList.add('hidden');
        connectWalletBtn.classList.remove('hidden');
        contractList.innerHTML = '';
        showNotification('Wallet disconnected', 'error');
    }
};

// Connect wallet
connectWalletBtn.addEventListener('click', async () => {
    try {
        const address = await wallet.connect();
        walletAddress.textContent = address;
        walletInfo.classList.remove('hidden');
        connectWalletBtn.classList.add('hidden');
        await loadContracts();
        showNotification('Wallet connected successfully');
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Tab switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Create contract
createContractForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const formData = {
            counterParty: e.target.counterParty.value,
            contractType: e.target.contractType.value,
            terms: e.target.terms.value,
            value: parseFloat(e.target.value.value),
            startDate: e.target.startDate.value,
            endDate: e.target.endDate.value
        };

        await wallet.createContract(
            formData.counterParty,
            formData.contractType,
            formData.terms,
            formData.value,
            formData.startDate,
            formData.endDate
        );

        showNotification('Contract created successfully');
        e.target.reset();
        await loadContracts();

        // Switch to contracts tab
        document.querySelector('[data-tab="contracts"]').click();
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Load and display contracts
async function loadContracts() {
    try {
        const count = await wallet.getContractCount();
        const contracts = [];

        for (let i = 0; i < count; i++) {
            try {
                const contract = await wallet.getContract(i);
                contracts.push({ id: i, ...contract });
            } catch (error) {
                console.error(`Failed to load contract ${i}:`, error);
            }
        }

        displayContracts(contracts);
    } catch (error) {
        showNotification('Failed to load contracts', 'error');
    }
}

// Display contracts in the UI
function displayContracts(contracts) {
    contractList.innerHTML = contracts.map(contract => `
        <div class="contract-card">
            <h3>
                ${contract.contractType}
                <span class="badge ${contract.isActive ? 'active' : 'inactive'}">
                    ${contract.isActive ? 'Active' : 'Inactive'}
                </span>
            </h3>
            
            <div class="contract-info">
                <p><strong>Counter Party:</strong> ${contract.counterParty}</p>
                <p><strong>Value:</strong> ${contract.value} ETH</p>
                <p><strong>Start Date:</strong> ${contract.startDate.toLocaleDateString()}</p>
                <p><strong>End Date:</strong> ${contract.endDate.toLocaleDateString()}</p>
                <p><strong>Terms:</strong></p>
                <p>${contract.terms}</p>
            </div>

            ${contract.isActive ? `
                <div class="contract-actions">
                    <button class="btn primary" onclick="executeContract(${contract.id})">
                        Execute
                    </button>
                    <button class="btn danger" onclick="terminateContract(${contract.id})">
                        Terminate
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Contract actions
async function executeContract(contractId) {
    try {
        await wallet.executeContract(contractId);
        showNotification('Contract executed successfully');
        await loadContracts();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function terminateContract(contractId) {
    try {
        await wallet.terminateContract(contractId);
        showNotification('Contract terminated successfully');
        await loadContracts();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Handle account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => {
        location.reload();
    });

    window.ethereum.on('chainChanged', () => {
        location.reload();
    });
} 