// API Service for communicating with backend

const API_BASE_URL = 'http://localhost:3000/api';

class APIService {
    constructor() {
        this.token = localStorage.getItem('auth_token') || null;
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication
    async login(role, name, uniqueId, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ role, name, uniqueId, password })
        });
        
        if (data.token) {
            this.setToken(data.token);
        }
        
        return data;
    }

    async verifyToken() {
        try {
            return await this.request('/auth/verify');
        } catch (error) {
            this.setToken(null);
            throw error;
        }
    }

    // Users
    async getUser(uniqueId) {
        return await this.request(`/users/${uniqueId}`);
    }

    // Medical Records
    async getPatientRecords(patientId) {
        return await this.request(`/records/patient/${patientId}`);
    }

    async addTextRecord(recordType, title, content) {
        return await this.request('/records/text', {
            method: 'POST',
            body: JSON.stringify({ recordType, title, content })
        });
    }

    async addImageRecord(imageType, title, imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('imageType', imageType);
        formData.append('title', title);

        const url = `${API_BASE_URL}/records/image`;
        const headers = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return await response.json();
    }

    // Blockchain
    async getPatientBlockchain(patientId) {
        return await this.request(`/blockchain/patient/${patientId}`);
    }

    async getFullBlockchain() {
        return await this.request('/blockchain');
    }

    // Permissions
    async grantPermission(providerId, providerRole, accessLevel) {
        return await this.request('/permissions/grant', {
            method: 'POST',
            body: JSON.stringify({ providerId, providerRole, accessLevel })
        });
    }

    async getPatientPermissions(patientId) {
        return await this.request(`/permissions/patient/${patientId}`);
    }

    async getAccessiblePatients(providerId) {
        return await this.request(`/permissions/provider/${providerId}`);
    }

    // Health check
    async healthCheck() {
        return await this.request('/health');
    }
}

// Global API instance
const api = new APIService();

