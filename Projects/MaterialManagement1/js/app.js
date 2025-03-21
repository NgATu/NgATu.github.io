class WarehouseApp {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contract = null;
        this.pageSize = 10;
        this.currentPage = 1;
        this.allTransactions = [];
        this.filteredTransactions = [];
        this.init();
    }

    async init() {
        //Kiểm tra xem trình duyệt có hỗ trợ window.ethereum (MetaMask) không
        if (typeof window.ethereum !== 'undefined') {
            //Cấu hình Web3 để kết nối với Binance Smart Chain Testnet.
            const bscTestnet = {
                chainId: '0x61', // 97 in decimal
                chainName: 'BNB Chain Testnet',
                nativeCurrency: {
                    name: 'tBNB',
                    symbol: 'tBNB',
                    decimals: 18
                },
                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                blockExplorerUrls: ['https://testnet.bscscan.com/']
            };


            try {
                //Yêu cầu người dùng chuyển sang mạng BNB Chain Testnet
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [bscTestnet]
                });

                //Khởi tạo Web3 với Ethereum Provider
                this.web3 = new Web3(window.ethereum);

                //Yêu cầu người dùng kết nối ví
                //Gửi yêu cầu đến MetaMask để truy cập tài khoản.
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                //Lưu địa chỉ ví đầu tiên vào this.account.
                this.account = accounts[0];
                //Hiển thị địa chỉ ví trên giao diện
                document.getElementById('walletAddress').textContent = `Wallet: ${this.account.substring(0, 6)}...${this.account.substring(38)}`;

                await this.initContract();

                //Gọi phương thức loadMaterials() để lấy danh sách vật liệu từ API.
                this.loadMaterials();
                //Gọi phương thức loadTransactions() để lấy danh sách giao dịch từ hợp đồng thông minh.
                this.loadTransactions();
                this.setupEventListeners();
            } catch (error) {
                console.error("Error initializing:", error);
            }
        } else {
            console.log('Please install MetaMask!');
        }
    }

    //Phương thức initContract() để tải hợp đồng thông minh và chuẩn bị tương tác.
    async initContract() {
        this.contract = new this.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    }

    async loadMaterials() {
        try {
            const response = await fetch('api/get_materials.php'); //Lấy danh sách vật liệu
            const materials = await response.json();
            await this.updateMaterialsTable(materials); //cập nhật bảng vật liệu
            this.populateMaterialSelect(materials); //Đổ dữ liệu vào danh sách
        } catch (error) {
            console.error('Error loading materials:', error);
        }
    }

    async loadTransactions() {
        try {
            //Gọi hàm getTransactionCount() từ hợp đồng thông minh để lấy tổng số lượng giao dịch.
            const result = await this.contract.methods.getAllTransactions().call();

            this.allTransactions = [];

            for (let i = 0; i < result.materialIds.length; i++) {
                this.allTransactions.push({
                    materialId: result.materialIds[i],
                    quantity: result.quantities[i],
                    previousQuantity: result.previousQuantities[i],
                    newQuantity: result.newQuantities[i],
                    isImport: result.isImports[i],
                    timestamp: result.timestamps[i],
                    details: result.detailsList[i]
                });
            }

            //Sắp xếp danh sách giao dịch theo thời gian (mới nhất lên trên)
            this.allTransactions.sort((a, b) => {
                const timestampA = BigInt(a.timestamp);
                const timestampB = BigInt(b.timestamp);
                if (timestampB > timestampA) return 1;
                if (timestampB < timestampA) return -1;
                return 0;
            });

            this.filteredTransactions = [...this.allTransactions];
            this.updatePagination();
            this.updateTransactionsTable();
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }

    //Duyệt danh sách nguyên liệu và lấy số lượng tồn kho từ blockchain (getCurrentQuantity()).
    async updateMaterialsTable(materials) {
        const tbody = document.querySelector('#materialsTable tbody');
        tbody.innerHTML = '';

        for (const material of materials) {
            // lấy số lượng tồn kho cũ từ blockchain
            const currentQuantity = await this.contract.methods.getCurrentQuantity(material.id).call();

            const row = `
                <tr>
                    <td>${material.id}</td>
                    <td>${material.name}</td>
                    <td>${material.unit}</td>
                    <td>${Number(currentQuantity)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary btn-action" onclick="app.viewHistory('${material.id}')">History</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        }
    }

    //Hiển thị danh sách giao dịch theo trang (pageSize)
    updateTransactionsTable() {
        const tbody = document.querySelector('#transactionsTable tbody');
        tbody.innerHTML = '';

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageTransactions = this.filteredTransactions.slice(start, end);

        pageTransactions.forEach(tx => {
            const isImport = tx.transaction_type ? tx.transaction_type === 'IMPORT' : tx.isImport;
            const quantityDiff = isImport ? `+${Number(tx.quantity)}` : `-${Number(tx.quantity)}`;
            const diffClass = isImport ? 'diff-positive' : 'diff-negative';

            const row = `
                <tr>
                    <td>${new Date(Number(tx.timestamp) * 1000).toLocaleString()}</td>
                    <td>${tx.materialId || tx.material_id}</td>
                    <td class="transaction-${isImport ? 'import' : 'export'}">${isImport ? 'IMPORT' : 'EXPORT'}</td>
                    <td>
                        ${Number(tx.quantity)}
                        <span class="quantity-diff ${diffClass}">${quantityDiff}</span>
                    </td>
                    <td class="quantity-cell">
                        ${Number(tx.previousQuantity || tx.previous_quantity) || '---'}
                    </td>
                    <td class="quantity-cell">
                        ${Number(tx.newQuantity || tx.new_quantity) || '---'}
                        <div class="quantity-change">
                            <span class="quantity-arrow ${isImport ? 'quantity-increase' : 'quantity-decrease'}">
                                ${isImport ? '↑' : '↓'}
                            </span>
                        </div>
                    </td>
                    <td>
                        ${tx.details || ''}
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    setupEventListeners() {
        document.getElementById('transactionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitTransaction();
        });

        document.getElementById('exportReport').addEventListener('click', () => {
            this.exportReport();
        });

        document.getElementById('filterDate').addEventListener('click', () => {
            this.filterTransactions();
        });

        document.getElementById('resetFilter').addEventListener('click', () => {
            this.resetFilter();
        });

        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updatePagination();
                this.updateTransactionsTable();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const totalPages = Math.ceil(this.allTransactions.length / this.pageSize);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.updatePagination();
                this.updateTransactionsTable();
            }
        });
    }

    async submitTransaction() {
        const materialId = document.getElementById('materialSelect').value;
        const quantity = BigInt(document.getElementById('quantity').value);
        const type = document.getElementById('transactionType').value;
        const details = document.getElementById('details').value;

        try {
            if (!materialId) {
                throw new Error('Please select a material');
            }

            if (!quantity || quantity <= BigInt(0)) {
                throw new Error('Please enter a valid quantity');
            }

            // Show loading state
            const submitButton = document.querySelector('#transactionForm button[type="submit"]');
            submitButton.textContent = 'Processing...';
            submitButton.disabled = true;

            // Get current quantity from blockchain
            const currentQuantity = await this.contract.methods.getCurrentQuantity(materialId).call();

            // Send transaction to blockchain
            const result = await this.contract.methods.addTransaction(
                materialId,
                quantity.toString(),
                currentQuantity,
                type === 'IMPORT',
                details || ''
            ).send({
                from: this.account,
                //gas: 500000
            });

            // Update UI
            alert('Transaction submitted successfully!');
            this.loadMaterials();
            this.loadTransactions();
            document.getElementById('transactionForm').reset();

        } catch (error) {
            console.error('Error submitting transaction:', error);
            alert(error.message || 'Error submitting transaction');
        } finally {
            // Reset button state
            const submitButton = document.querySelector('#transactionForm button[type="submit"]');
            submitButton.textContent = 'Submit Transaction';
            submitButton.disabled = false;
        }
    }

    async exportReport() {
        try {
            // Use filtered transactions for report
            const transactions = this.filteredTransactions.map(tx => ({
                materialId: tx.materialId,
                quantity: Number(tx.quantity),
                previousQuantity: Number(tx.previousQuantity),
                newQuantity: Number(tx.newQuantity),
                isImport: tx.isImport,
                timestamp: Number(tx.timestamp),
                details: tx.details
            }));

            // Add date range to report data if filter is active
            const fromDate = document.getElementById('fromDate').value;
            const toDate = document.getElementById('toDate').value;
            const reportData = {
                transactions,
                dateRange: {
                    fromDate,
                    toDate
                }
            };

            // Create form data
            const formData = new FormData();
            formData.append('data', JSON.stringify(reportData));

            // Send to PHP endpoint
            const response = await fetch('api/export_report.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Create blob and download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'warehouse_report.doc';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                throw new Error('Failed to generate report');
            }
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('Error generating report');
        }
    }

    async viewHistory(materialId) {
        try {
            const count = await this.contract.methods.getMaterialTransactionCount(materialId).call();
            const transactions = [];

            for (let i = 0; i < count; i++) {
                const tx = await this.contract.methods.materialTransactions(materialId, i).call();
                transactions.push({
                    materialId: tx.materialId,
                    quantity: tx.quantity,
                    previousQuantity: tx.previousQuantity,
                    newQuantity: tx.newQuantity,
                    type: tx.isImport ? 'IMPORT' : 'EXPORT',
                    timestamp: new Date(tx.timestamp * 1000).toLocaleString(),
                    details: tx.details
                });
            }

            this.showHistoryModal(materialId, transactions);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    showHistoryModal(materialId, transactions) {
        const modalHtml = `
            <div class="modal fade" id="historyModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Transaction History for ${materialId}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Change</th>
                                        <th>Previous → New Quantity</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${transactions.map(tx => {
            const isImport = tx.type === 'IMPORT';
            const quantityDiff = isImport ? `+${Number(tx.quantity)}` : `-${Number(tx.quantity)}`;
            const diffClass = isImport ? 'diff-positive' : 'diff-negative';
            return `
                                            <tr>
                                                <td>${tx.timestamp}</td>
                                                <td class="transaction-${tx.type.toLowerCase()}">${tx.type}</td>
                                                <td>
                                                    <span class="quantity-diff ${diffClass}">${quantityDiff}</span>
                                                </td>
                                                <td class="quantity-cell">
                                                    ${Number(tx.previousQuantity)} → ${Number(tx.newQuantity)}
                                                    <span class="quantity-arrow ${isImport ? 'quantity-increase' : 'quantity-decrease'}">
                                                        ${isImport ? '↑' : '↓'}
                                                    </span>
                                                </td>
                                                <td>${tx.details}</td>
                                            </tr>
                                        `;
        }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('historyModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal to document
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('historyModal'));
        modal.show();
    }

    //Thêm các nguyên liệu vào danh sách chọn trong form nhập giao dịch.
    populateMaterialSelect(materials) {
        const select = document.getElementById('materialSelect');
        select.innerHTML = '<option value="">Select Material</option>';

        materials.forEach(material => {
            const option = document.createElement('option');
            option.value = material.id;
            option.textContent = `${material.name} (${material.unit})`;
            select.appendChild(option);
        });
    }

    //Cập nhật số lượng trang và trạng thái nút điều hướng (trang trước, trang sau).
    updatePagination() {
        const totalRecords = this.filteredTransactions.length;
        const totalPages = Math.ceil(totalRecords / this.pageSize);
        const startRecord = (this.currentPage - 1) * this.pageSize + 1;
        const endRecord = Math.min(this.currentPage * this.pageSize, totalRecords);

        document.getElementById('startRecord').textContent = totalRecords ? startRecord : 0;
        document.getElementById('endRecord').textContent = endRecord;
        document.getElementById('totalRecords').textContent = totalRecords;

        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');

        prevButton.disabled = this.currentPage === 1;
        nextButton.disabled = this.currentPage >= totalPages;
    }

    //Lọc danh sách giao dịch theo ngày.
    filterTransactions() {
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;

        if (!fromDate && !toDate) {
            return;
        }

        this.filteredTransactions = this.allTransactions.filter(tx => {
            const txDate = new Date(Number(tx.timestamp) * 1000).toISOString().split('T')[0];

            if (fromDate && toDate) {
                return txDate >= fromDate && txDate <= toDate;
            } else if (fromDate) {
                return txDate >= fromDate;
            } else {
                return txDate <= toDate;
            }
        });

        this.currentPage = 1;
        this.updatePagination();
        this.updateTransactionsTable();
    }

    //Xóa bộ lọc và hiển thị lại toàn bộ danh sách giao dịch.
    resetFilter() {
        document.getElementById('fromDate').value = '';
        document.getElementById('toDate').value = '';
        this.filteredTransactions = [...this.allTransactions];
        this.currentPage = 1;
        this.updatePagination();
        this.updateTransactionsTable();
    }
}

// Initialize the app
const app = new WarehouseApp(); 