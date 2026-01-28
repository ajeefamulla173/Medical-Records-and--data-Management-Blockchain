// Simulated Blockchain Implementation for Medical Records

class MedicalBlockchain {
    constructor() {
        this.chain = [];
        this.pendingRecords = [];
        this.initializeGenesisBlock();
    }

    initializeGenesisBlock() {
        const genesisBlock = {
            index: 0,
            timestamp: new Date().toISOString(),
            data: {
                type: 'genesis',
                message: 'Medical Blockchain Initialized'
            },
            previousHash: '0',
            hash: this.calculateHash(0, new Date().toISOString(), { type: 'genesis' }, '0')
        };
        this.chain.push(genesisBlock);
    }

    calculateHash(index, timestamp, data, previousHash) {
        const dataString = JSON.stringify(data);
        const hashInput = index + timestamp + dataString + previousHash;
        
        // Simple hash function (in production, use SHA-256 or similar)
        let hash = 0;
        for (let i = 0; i < hashInput.length; i++) {
            const char = hashInput.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(16, '0');
    }

    createBlock(data) {
        const previousBlock = this.chain[this.chain.length - 1];
        const newIndex = previousBlock.index + 1;
        const newTimestamp = new Date().toISOString();
        const newHash = this.calculateHash(
            newIndex,
            newTimestamp,
            data,
            previousBlock.hash
        );

        const newBlock = {
            index: newIndex,
            timestamp: newTimestamp,
            data: data,
            previousHash: previousBlock.hash,
            hash: newHash
        };

        this.chain.push(newBlock);
        return newBlock;
    }

    addMedicalRecord(recordData) {
        const block = this.createBlock({
            type: 'medical_record',
            ...recordData
        });
        return block;
    }

    getChain() {
        return this.chain;
    }

    getMedicalRecords() {
        return this.chain.filter(block => block.data.type === 'medical_record');
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Verify current block hash
            const calculatedHash = this.calculateHash(
                currentBlock.index,
                currentBlock.timestamp,
                currentBlock.data,
                currentBlock.previousHash
            );

            if (currentBlock.hash !== calculatedHash) {
                return false;
            }

            // Verify previous hash link
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Global blockchain instance
let medicalBlockchain = new MedicalBlockchain();

// Storage management (using localStorage for persistence)
class MedicalDataStorage {
    constructor() {
        this.storageKey = 'secure_medical_data';
        this.loadFromStorage();
    }

    loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                // Reconstruct blockchain from stored data
                medicalBlockchain.chain = data.chain || medicalBlockchain.chain;
            } catch (e) {
                console.error('Error loading data from storage:', e);
            }
        }
    }

    saveToStorage() {
        try {
            const data = {
                chain: medicalBlockchain.chain,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving data to storage:', e);
        }
    }

    // User management
    saveUser(userData) {
        const users = this.getUsers();
        const existingUserIndex = users.findIndex(u => u.uniqueId === userData.uniqueId);
        
        if (existingUserIndex >= 0) {
            users[existingUserIndex] = userData;
        } else {
            users.push(userData);
        }
        
        localStorage.setItem('medical_users', JSON.stringify(users));
    }

    getUsers() {
        const stored = localStorage.getItem('medical_users');
        return stored ? JSON.parse(stored) : [];
    }

    getUser(uniqueId) {
        const users = this.getUsers();
        return users.find(u => u.uniqueId === uniqueId);
    }

    // Access permissions
    saveAccessPermission(patientId, providerId, providerRole, accessLevel) {
        const permissions = this.getAccessPermissions();
        const key = `${patientId}_${providerId}`;
        permissions[key] = {
            patientId,
            providerId,
            providerRole,
            accessLevel,
            grantedAt: new Date().toISOString()
        };
        localStorage.setItem('access_permissions', JSON.stringify(permissions));
    }

    getAccessPermissions() {
        const stored = localStorage.getItem('access_permissions');
        return stored ? JSON.parse(stored) : {};
    }

    getPatientPermissions(patientId) {
        const permissions = this.getAccessPermissions();
        return Object.values(permissions).filter(p => p.patientId === patientId);
    }

    hasAccess(patientId, providerId) {
        const permissions = this.getAccessPermissions();
        const key = `${patientId}_${providerId}`;
        return permissions[key] !== undefined;
    }

    getAccessiblePatients(providerId) {
        const permissions = this.getAccessPermissions();
        return Object.values(permissions)
            .filter(p => p.providerId === providerId)
            .map(p => p.patientId);
    }
}

const medicalStorage = new MedicalDataStorage();

