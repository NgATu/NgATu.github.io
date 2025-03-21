class MaterialsManager {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.init();
        this.loadMaterials();
        this.setupEventListeners();
    }

    async init() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                this.web3 = new Web3(window.ethereum);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.account = accounts[0];
                document.getElementById('walletAddress').textContent = 
                    `Wallet: ${this.account.substring(0, 6)}...${this.account.substring(38)}`;
            } catch (error) {
                console.error("Error connecting to wallet:", error);
            }
        } else {
            console.log('Please install MetaMask!');
        }
    }

    setupEventListeners() {
        document.getElementById('materialForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMaterial();
        });

        document.getElementById('resetForm').addEventListener('click', () => {
            this.resetForm();
        });

        document.getElementById('searchButton').addEventListener('click', () => {
            this.searchMaterial();
        });

        document.getElementById('searchMaterialId').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchMaterial();
            }
        });
    }

    async loadMaterials() {
        try {
            const response = await fetch('api/get_materials.php');
            const materials = await response.json();
            this.updateMaterialsTable(materials);
        } catch (error) {
            console.error('Error loading materials:', error);
            alert('Error loading materials');
        }
    }

    updateMaterialsTable(materials) {
        const tbody = document.getElementById('materialsTableBody');
        tbody.innerHTML = '';

        materials.forEach(material => {
            const row = `
                <tr>
                    <td>${material.id}</td>
                    <td>${material.name}</td>
                    <td>${material.unit}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="materialsManager.editMaterial('${material.id}', '${material.name}', '${material.unit}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="materialsManager.deleteMaterial('${material.id}')">Delete</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    async saveMaterial() {
        const materialId = document.getElementById('materialId').value;
        const newMaterialId = document.getElementById('newMaterialId').value;
        const name = document.getElementById('materialName').value;
        const unit = document.getElementById('materialUnit').value;

        const formData = new FormData();
        formData.append('id', materialId || newMaterialId);
        formData.append('name', name);
        formData.append('unit', unit);

        try {
            const response = await fetch('api/save_material.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                alert('Material saved successfully');
                this.loadMaterials();
                this.resetForm();
            } else {
                throw new Error(result.error || 'Error saving material');
            }
        } catch (error) {
            console.error('Error saving material:', error);
            alert(error.message || 'Error saving material');
        }
    }

    editMaterial(id, name, unit) {
        document.getElementById('materialId').value = id;
        document.getElementById('newMaterialId').value = id;
        document.getElementById('newMaterialId').disabled = true;
        document.getElementById('materialName').value = name;
        document.getElementById('materialUnit').value = unit;
    }

    async deleteMaterial(id) {
        if (!confirm('Are you sure you want to delete this material?')) {
            return;
        }

        try {
            const response = await fetch('api/delete_material.php', {
                method: 'POST',
                body: JSON.stringify({ id }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            if (result.success) {
                alert('Material deleted successfully');
                this.loadMaterials();
            } else {
                throw new Error(result.error || 'Error deleting material');
            }
        } catch (error) {
            console.error('Error deleting material:', error);
            alert(error.message || 'Error deleting material');
        }
    }

    resetForm() {
        document.getElementById('materialForm').reset();
        document.getElementById('materialId').value = '';
        document.getElementById('newMaterialId').disabled = false;
    }

    async searchMaterial() {
        const searchId = document.getElementById('searchMaterialId').value.trim();
        if (!searchId) {
            this.loadMaterials();
            return;
        }

        try {
            const response = await fetch(`api/get_materials.php?id=${encodeURIComponent(searchId)}`);
            const materials = await response.json();
            
            if (Array.isArray(materials) && materials.length > 0) {
                this.updateMaterialsTable(materials);
            } else {
                const tbody = document.getElementById('materialsTableBody');
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">No material found with ID: ${searchId}</td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Error searching materials:', error);
            alert('Error searching materials');
        }
    }
}

const materialsManager = new MaterialsManager(); 