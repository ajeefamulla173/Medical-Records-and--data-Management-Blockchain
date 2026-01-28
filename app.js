// Main Application Logic

let currentUser = null;
let currentRole = null;
let selectedPatientId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    initializeLogin();
    initializeDashboards();
    await checkExistingSession();
});

// Check if user is already logged in
async function checkExistingSession() {
    try {
        const data = await api.verifyToken();
        currentUser = data.user;
        currentRole = data.user.role;
        showDashboard(currentRole);
    } catch (e) {
        // No valid session
        console.log('No existing session');
    }
}

// Login functionality
function initializeLogin() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const role = document.getElementById('role-select').value;
    const name = document.getElementById('name').value;
    const uniqueId = document.getElementById('unique-id').value;
    const password = document.getElementById('password').value;

    if (!role || !name || !uniqueId || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const data = await api.login(role, name, uniqueId, password);
        currentUser = data.user;
        currentRole = data.user.role;
        showDashboard(currentRole);
    } catch (error) {
        alert(error.message || 'Login failed. Please try again.');
    }
}

function showDashboard(role) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show appropriate dashboard
    if (role === 'patient') {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('patient-dashboard').classList.add('active');
        document.getElementById('patient-name-display').textContent = currentUser.name;
        loadPatientDashboard();
    } else if (role === 'doctor') {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('doctor-dashboard').classList.add('active');
        document.getElementById('doctor-name-display').textContent = currentUser.name;
        loadDoctorDashboard();
    } else {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('other-dashboard').classList.add('active');
        document.getElementById('other-name-display').textContent = currentUser.name;
        loadOtherDashboard();
    }
}

// Dashboard initialization
function initializeDashboards() {
    // Patient dashboard navigation
    const patientNavBtns = document.querySelectorAll('#patient-dashboard .nav-btn');
    patientNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            switchPatientSection(section);
        });
    });

    // Doctor dashboard navigation
    const doctorNavBtns = document.querySelectorAll('#doctor-dashboard .nav-btn');
    doctorNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            switchDoctorSection(section);
        });
    });

    // Other dashboard navigation
    const otherNavBtns = document.querySelectorAll('#other-dashboard .nav-btn');
    otherNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            switchOtherSection(section);
        });
    });

    // Logout buttons
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('doctor-logout-btn')?.addEventListener('click', logout);
    document.getElementById('other-logout-btn')?.addEventListener('click', logout);

    // Patient upload forms
    document.getElementById('text-upload-form')?.addEventListener('submit', handleTextUpload);
    document.getElementById('image-upload-form')?.addEventListener('submit', handleImageUpload);
    document.getElementById('consent-form')?.addEventListener('submit', handleConsentGrant);
}

function logout() {
    currentUser = null;
    currentRole = null;
    api.setToken(null);
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('login-screen').classList.add('active');
    
    // Reset forms
    document.getElementById('login-form').reset();
}

// Section switching
function switchPatientSection(section) {
    document.querySelectorAll('#patient-dashboard .content-section').forEach(s => {
        s.classList.remove('active');
    });
    document.querySelectorAll('#patient-dashboard .nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${section}-section`).classList.add('active');
    document.querySelector(`#patient-dashboard .nav-btn[data-section="${section}"]`).classList.add('active');

    if (section === 'records') {
        loadPatientRecords();
    } else if (section === 'blockchain') {
        loadBlockchainView('blockchain-view', currentUser.uniqueId);
    }
}

function switchDoctorSection(section) {
    document.querySelectorAll('#doctor-dashboard .content-section').forEach(s => {
        s.classList.remove('active');
    });
    document.querySelectorAll('#doctor-dashboard .nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (section === 'records-doc') {
        document.getElementById('records-doc-section').classList.add('active');
        if (selectedPatientId) {
            loadPatientRecordsForDoctor(selectedPatientId);
        }
    } else if (section === 'blockchain-doc') {
        document.getElementById('blockchain-doc-section').classList.add('active');
        if (selectedPatientId) {
            loadBlockchainView('blockchain-view-doc', selectedPatientId);
        }
    } else {
        document.getElementById(`${section}-section`).classList.add('active');
    }

    document.querySelector(`#doctor-dashboard .nav-btn[data-section="${section}"]`).classList.add('active');
}

function switchOtherSection(section) {
    document.querySelectorAll('#other-dashboard .content-section').forEach(s => {
        s.classList.remove('active');
    });
    document.querySelectorAll('#other-dashboard .nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${section}-section`).classList.add('active');
    document.querySelector(`#other-dashboard .nav-btn[data-section="${section}"]`).classList.add('active');

    if (section === 'blockchain-other') {
        loadBlockchainView('blockchain-view-other');
    }
}

// Patient dashboard functions
async function loadPatientDashboard() {
    await loadPatientRecords();
    await loadAccessList();
}

async function loadPatientRecords() {
    const recordsList = document.getElementById('records-list');
    if (!recordsList) return;

    try {
        const records = await api.getPatientRecords(currentUser.uniqueId);

        if (records.length === 0) {
            recordsList.innerHTML = `
                <div class="empty-state">
                    <p>No medical records yet. Upload your first record to get started.</p>
                </div>
            `;
            return;
        }

        recordsList.innerHTML = records.map(block => {
            const record = block.data;
            const date = new Date(block.timestamp).toLocaleDateString();
            const time = new Date(block.timestamp).toLocaleTimeString();
            
            let content = '';
            if (record.imageUrl) {
                content = `<img src="http://localhost:3000${record.imageUrl}" alt="${record.title}" class="record-image">`;
            } else if (record.imageData) {
                content = `<img src="${record.imageData}" alt="${record.title}" class="record-image">`;
            } else {
                content = `<div class="record-content">${escapeHtml(record.content || '')}</div>`;
            }

            return `
                <div class="record-card">
                    <div class="record-header">
                        <div>
                            <div class="record-title">${escapeHtml(record.title || 'Untitled')}</div>
                            <span class="record-type">${escapeHtml(record.recordType || record.imageType || 'Record')}</span>
                        </div>
                    </div>
                    ${content}
                    <div class="record-meta">
                        <span>📅 ${date}</span>
                        <span>🕐 ${time}</span>
                        <span>🔗 Block #${block.index}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        recordsList.innerHTML = `
            <div class="empty-state">
                <p>Error loading records: ${error.message}</p>
            </div>
        `;
    }
}

async function loadAccessList() {
    const accessList = document.getElementById('access-list');
    if (!accessList) return;

    try {
        const permissions = await api.getPatientPermissions(currentUser.uniqueId);

        if (permissions.length === 0) {
            accessList.innerHTML = `
                <div class="empty-state">
                    <p>No access permissions granted yet.</p>
                </div>
            `;
            return;
        }

        accessList.innerHTML = permissions.map(perm => {
            const date = new Date(perm.grantedAt).toLocaleDateString();
            return `
                <div class="access-item">
                    <div class="access-info">
                        <div class="access-role">${escapeHtml(perm.providerRole)}</div>
                        <div class="access-id">${escapeHtml(perm.providerId)}</div>
                        <div style="font-size: 11px; color: var(--text-light); margin-top: 4px;">Granted: ${date}</div>
                    </div>
                    <span class="access-level">${perm.accessLevel}</span>
                </div>
            `;
        }).join('');
    } catch (error) {
        accessList.innerHTML = `
            <div class="empty-state">
                <p>Error loading permissions: ${error.message}</p>
            </div>
        `;
    }
}

async function handleTextUpload(e) {
    e.preventDefault();
    
    const recordType = document.getElementById('record-type').value;
    const title = document.getElementById('record-title').value;
    const content = document.getElementById('record-content').value;

    try {
        await api.addTextRecord(recordType, title, content);
        document.getElementById('text-upload-form').reset();
        await loadPatientRecords();
        alert('Medical record added to blockchain successfully!');
    } catch (error) {
        alert('Error uploading record: ' + error.message);
    }
}

async function handleImageUpload(e) {
    e.preventDefault();
    
    const imageType = document.getElementById('image-type').value;
    const title = document.getElementById('image-title').value;
    const fileInput = document.getElementById('image-file');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image file');
        return;
    }

    try {
        await api.addImageRecord(imageType, title, file);
        document.getElementById('image-upload-form').reset();
        await loadPatientRecords();
        alert('Medical image added to blockchain successfully!');
    } catch (error) {
        alert('Error uploading image: ' + error.message);
    }
}

async function handleConsentGrant(e) {
    e.preventDefault();
    
    const grantTo = document.getElementById('grant-to').value;
    const providerId = document.getElementById('provider-id').value;
    const accessLevel = document.getElementById('access-level').value;

    try {
        await api.grantPermission(providerId, grantTo, accessLevel);
        document.getElementById('consent-form').reset();
        await loadAccessList();
        alert('Access permission granted successfully!');
    } catch (error) {
        alert('Error granting permission: ' + error.message);
    }
}

// Doctor dashboard functions
function loadDoctorDashboard() {
    loadPatientsList();
}

async function loadPatientsList() {
    const patientsList = document.getElementById('patients-list');
    if (!patientsList) return;

    try {
        const patients = await api.getAccessiblePatients(currentUser.uniqueId);

        if (patients.length === 0) {
            patientsList.innerHTML = `
                <div class="empty-state">
                    <p>No authorized patients yet. Patients must grant you access first.</p>
                </div>
            `;
            return;
        }

        patientsList.innerHTML = patients.map(patient => `
            <div class="patient-card" data-patient-id="${patient.uniqueId}">
                <div class="patient-name">${escapeHtml(patient.name)}</div>
                <div class="patient-id">ID: ${escapeHtml(patient.uniqueId)}</div>
            </div>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.patient-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.patient-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedPatientId = card.getAttribute('data-patient-id');
                loadPatientRecordsForDoctor(selectedPatientId);
                switchDoctorSection('records-doc');
            });
        });
    } catch (error) {
        patientsList.innerHTML = `
            <div class="empty-state">
                <p>Error loading patients: ${error.message}</p>
            </div>
        `;
    }
}

async function loadPatientRecordsForDoctor(patientId) {
    const recordsList = document.getElementById('patient-records-list');
    const patientInfo = document.getElementById('selected-patient-info');
    
    if (!recordsList || !patientInfo) return;

    try {
        const patient = await api.getUser(patientId);
        if (patient) {
            patientInfo.innerHTML = `
                <h4>Patient: ${escapeHtml(patient.name)}</h4>
                <p style="color: var(--text-secondary); margin-top: 8px;">ID: ${escapeHtml(patient.uniqueId)}</p>
            `;
        }

        const records = await api.getPatientRecords(patientId);

        if (records.length === 0) {
            recordsList.innerHTML = `
                <div class="empty-state">
                    <p>No medical records available for this patient.</p>
                </div>
            `;
            return;
        }

        recordsList.innerHTML = records.map(block => {
            const record = block.data;
            const date = new Date(block.timestamp).toLocaleDateString();
            const time = new Date(block.timestamp).toLocaleTimeString();
            
            let content = '';
            if (record.imageUrl) {
                content = `<img src="http://localhost:3000${record.imageUrl}" alt="${record.title}" class="record-image">`;
            } else if (record.imageData) {
                content = `<img src="${record.imageData}" alt="${record.title}" class="record-image">`;
            } else {
                content = `<div class="record-content">${escapeHtml(record.content || '')}</div>`;
            }

            return `
                <div class="record-card">
                    <div class="record-header">
                        <div>
                            <div class="record-title">${escapeHtml(record.title || 'Untitled')}</div>
                            <span class="record-type">${escapeHtml(record.recordType || record.imageType || 'Record')}</span>
                        </div>
                    </div>
                    ${content}
                    <div class="record-meta">
                        <span>📅 ${date}</span>
                        <span>🕐 ${time}</span>
                        <span>🔗 Block #${block.index}</span>
                        <span>👤 ${escapeHtml(record.uploadedBy || 'Unknown')}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        recordsList.innerHTML = `
            <div class="empty-state">
                <p>Error loading records: ${error.message}</p>
            </div>
        `;
    }
}

// Other role dashboard functions
function loadOtherDashboard() {
    loadViewOnlyRecords();
}

async function loadViewOnlyRecords() {
    const recordsList = document.getElementById('view-only-records');
    if (!recordsList) return;

    try {
        const patients = await api.getAccessiblePatients(currentUser.uniqueId);
        const accessiblePatientIds = patients.map(p => p.uniqueId);

        if (accessiblePatientIds.length === 0) {
            recordsList.innerHTML = `
                <div class="empty-state">
                    <p>No authorized records available. Patients must grant you access first.</p>
                </div>
            `;
            return;
        }

        // Get records for all accessible patients
        const allRecords = [];
        for (const patientId of accessiblePatientIds) {
            try {
                const records = await api.getPatientRecords(patientId);
                allRecords.push(...records);
            } catch (error) {
                console.error(`Error loading records for ${patientId}:`, error);
            }
        }

        if (allRecords.length === 0) {
            recordsList.innerHTML = `
                <div class="empty-state">
                    <p>No medical records available.</p>
                </div>
            `;
            return;
        }

        recordsList.innerHTML = allRecords.map(block => {
            const record = block.data;
            const date = new Date(block.timestamp).toLocaleDateString();
            const time = new Date(block.timestamp).toLocaleTimeString();
            
            let content = '';
            if (record.imageUrl) {
                content = `<img src="http://localhost:3000${record.imageUrl}" alt="${record.title}" class="record-image">`;
            } else if (record.imageData) {
                content = `<img src="${record.imageData}" alt="${record.title}" class="record-image">`;
            } else {
                content = `<div class="record-content">${escapeHtml(record.content || '')}</div>`;
            }

            return `
                <div class="record-card">
                    <div class="record-header">
                        <div>
                            <div class="record-title">${escapeHtml(record.title || 'Untitled')}</div>
                            <span class="record-type">${escapeHtml(record.recordType || record.imageType || 'Record')}</span>
                        </div>
                    </div>
                    ${content}
                    <div class="record-meta">
                        <span>📅 ${date}</span>
                        <span>🕐 ${time}</span>
                        <span>🔗 Block #${block.index}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        recordsList.innerHTML = `
            <div class="empty-state">
                <p>Error loading records: ${error.message}</p>
            </div>
        `;
    }
}

// Blockchain visualization
async function loadBlockchainView(containerId, patientId = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        let targetPatientId = patientId;
        
        if (!targetPatientId && currentRole === 'patient') {
            targetPatientId = currentUser.uniqueId;
        } else if (!targetPatientId && (currentRole === 'doctor' || currentRole === 'nurse' || currentRole === 'other')) {
            // For providers, show first accessible patient's blockchain
            const patients = await api.getAccessiblePatients(currentUser.uniqueId);
            if (patients.length > 0) {
                targetPatientId = patients[0].uniqueId;
            }
        }

        if (!targetPatientId) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No blockchain records to display.</p>
                </div>
            `;
            return;
        }

        const blocks = await api.getPatientBlockchain(targetPatientId);

        if (blocks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No blockchain records to display.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = blocks.map((block, index) => {
            const isGenesis = block.data.type === 'genesis';
            const date = new Date(block.timestamp).toLocaleDateString();
            const time = new Date(block.timestamp).toLocaleTimeString();
            
            let dataContent = '';
            if (isGenesis) {
                dataContent = `<div class="block-data-content">${escapeHtml(block.data.message)}</div>`;
            } else {
                const record = block.data;
                dataContent = `
                    <div class="block-data-title">${escapeHtml(record.title || 'Medical Record')}</div>
                    <div class="block-data-content">
                        Type: ${escapeHtml(record.recordType || record.imageType || 'Record')}<br>
                        ${record.content ? `Content: ${escapeHtml(record.content.substring(0, 100))}...` : ''}
                        ${record.imageUrl || record.imageData ? 'Image: [Uploaded File]' : ''}
                    </div>
                `;
            }

            return `
                ${index > 0 ? '<div class="chain-connector">⛓️</div>' : ''}
                <div class="block">
                    <div class="block-header">
                        <span class="block-number">Block #${block.index}</span>
                        <span class="block-timestamp">${date} ${time}</span>
                    </div>
                    <div class="block-data">
                        ${dataContent}
                    </div>
                    <div class="block-hash">
                        <div class="hash-label">Hash</div>
                        <div class="hash-value">${block.hash}</div>
                    </div>
                    ${block.previousHash !== '0' ? `
                        <div class="block-hash">
                            <div class="hash-label">Previous Hash</div>
                            <div class="hash-value">${block.previousHash}</div>
                        </div>
                    ` : ''}
                    <div class="block-immutable">
                        🔒 Immutable • Cannot be altered
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Error loading blockchain: ${error.message}</p>
            </div>
        `;
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

