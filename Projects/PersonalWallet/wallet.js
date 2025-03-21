class SmartContractWallet {
    constructor(contractAddress, contractABI) {
        this.contractAddress = contractAddress;
        this.contractABI = contractABI;
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.onAccountChanged = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (typeof window.ethereum !== 'undefined') {
            // Lắng nghe sự kiện thay đổi tài khoản
            window.ethereum.on('accountsChanged', async (accounts) => {
                if (this.onAccountChanged) {
                    if (accounts.length === 0) {
                        this.provider = null;
                        this.signer = null;
                        this.contract = null;
                        this.onAccountChanged(null);
                    } else {
                        await this.connect();
                        this.onAccountChanged(accounts[0]);
                    }
                }
            });

            // Lắng nghe sự kiện thay đổi mạng
            window.ethereum.on('chainChanged', () => {
                // Reload trang khi đổi mạng vì điều này ảnh hưởng đến contract address
                window.location.reload();
            });
        }
    }

    async connect() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed');
        }

        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create provider and signer
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();

            // Create contract instance
            this.contract = new ethers.Contract(
                this.contractAddress,
                this.contractABI,
                this.signer
            );

            return await this.signer.getAddress();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    }

    async createContract(counterParty, contractType, terms, value, startDate, endDate) {
        if (!this.contract) throw new Error('Wallet not connected');

        try {
            const valueInWei = ethers.utils.parseEther(value.toString());
            const tx = await this.contract.createContract(
                counterParty,
                contractType,
                terms,
                valueInWei,
                Math.floor(new Date(startDate).getTime() / 1000),
                Math.floor(new Date(endDate).getTime() / 1000)
            );

            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'ContractCreated');

            if (!event) throw new Error('Contract creation event not found');
            return event.args.contractId.toNumber();
        } catch (error) {
            console.error('Failed to create contract:', error);
            throw error;
        }
    }

    async executeContract(contractId) {
        if (!this.contract) throw new Error('Wallet not connected');

        try {
            const tx = await this.contract.executeContract(contractId);
            await tx.wait();
        } catch (error) {
            console.error('Failed to execute contract:', error);
            throw error;
        }
    }

    async terminateContract(contractId) {
        if (!this.contract) throw new Error('Wallet not connected');

        try {
            const tx = await this.contract.terminateContract(contractId);
            await tx.wait();
        } catch (error) {
            console.error('Failed to terminate contract:', error);
            throw error;
        }
    }

    async getContract(contractId) {
        if (!this.contract) throw new Error('Wallet not connected');

        try {
            const result = await this.contract.getContract(contractId);
            return {
                owner: result[0],
                counterParty: result[1],
                contractType: result[2],
                terms: result[3],
                value: ethers.utils.formatEther(result[4]),
                isActive: result[5],
                startDate: new Date(result[6].toNumber() * 1000),
                endDate: new Date(result[7].toNumber() * 1000)
            };
        } catch (error) {
            console.error('Failed to get contract:', error);
            throw error;
        }
    }

    async getContractCount() {
        if (!this.contract) throw new Error('Wallet not connected');

        try {
            return (await this.contract.contractCount()).toNumber();
        } catch (error) {
            console.error('Failed to get contract count:', error);
            throw error;
        }
    }
} 