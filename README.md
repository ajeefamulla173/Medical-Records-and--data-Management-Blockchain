# Secure Medical Data - Blockchain Healthcare System

A clean, modern, and professional healthcare web application focused on secure medical data management using blockchain principles.

## Features

### 🔐 Secure Authentication
- Role-based login system (Patient, Doctor, Nurse, Other)
- User identification with "Who are you?" prompt
- Secure credential management

### 👤 Role-Based Dashboards

#### Patient Dashboard
- View personal medical records
- Upload text-based medical information (diagnosis, reports, prescriptions)
- Upload medical images (scans, test reports)
- Manage access permissions and consent
- Visualize blockchain records

#### Doctor Dashboard
- Access authorized patient data
- View and review medical records
- Visualize patient blockchain records
- Patient selection interface

#### Other Roles (Nurse, Other)
- View-only access to authorized records
- Blockchain visualization for accessible data

### ⛓️ Blockchain Features
- Immutable medical record storage
- Visual blockchain representation with:
  - Hash values for each block
  - Timestamps
  - Previous block references
  - Clear indication of immutability
- Chain validation
- Patient-controlled access permissions

## Getting Started

### Prerequisites
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- A modern web browser (Chrome, Firefox, Edge, Safari)

### Backend Setup (Required)

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Start the Backend Server**
   ```bash
   npm start
   ```
   
   The server will run on `http://localhost:3000`
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Open the project folder in Visual Studio Code or any code editor
2. **Start a local web server** for the frontend:
   
   **Option 1: Using Python**
   ```bash
   python -m http.server 8000
   ```
   
   **Option 2: Using VS Code Live Server Extension**
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"
   
   **Option 3: Using Node.js http-server**
   ```bash
   npx http-server -p 8000
   ```

3. Open `http://localhost:8000` in your browser

### Using a Local Server (Recommended)

For the best experience, especially with file uploads, use a local server:

#### Option 1: Using Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open `http://localhost:8000` in your browser.

#### Option 2: Using Node.js (http-server)
```bash
npx http-server -p 8000
```

#### Option 3: Using VS Code Live Server Extension
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Usage

### First Time Login

1. Select your role (Patient, Doctor, Nurse, or Other)
2. Enter your full name
3. Enter a unique ID or email
4. Enter a password
5. Click "Secure Login"

### As a Patient

1. **View Records**: Navigate to "My Records" to see all your medical records
2. **Upload Data**: 
   - Go to "Upload Data"
   - Upload text-based medical information or images
   - Records are immediately added to the blockchain
3. **Manage Access**: 
   - Go to "Access Control"
   - Grant access to healthcare providers
   - View current access permissions
4. **Blockchain View**: 
   - Navigate to "Blockchain View"
   - See your records as immutable blockchain blocks
   - View hashes, timestamps, and chain connections

### As a Doctor

1. **View Patients**: See list of patients who have granted you access
2. **View Records**: Select a patient to view their medical records
3. **Blockchain View**: Visualize the patient's blockchain records

### As Other Roles

1. **View Records**: Access authorized patient records (view-only)
2. **Blockchain View**: Visualize accessible blockchain records

## Technical Details

### Blockchain Implementation
- Simulated blockchain using JavaScript
- Each medical record is stored as an immutable block
- Blocks contain:
  - Index
  - Timestamp
  - Medical data
  - Previous block hash
  - Current block hash
- Chain validation ensures data integrity

### Data Storage
- **Backend**: JSON files stored in `data/` directory
  - `users.json` - User accounts
  - `blockchain.json` - Blockchain data
  - `permissions.json` - Access permissions
- **File Uploads**: Medical images stored in `uploads/` directory
- Data persists on the server between sessions

### Security Features
- Immutable record storage (blockchain)
- Patient-controlled access permissions
- Role-based access control
- Visual security indicators

## Design Philosophy

- **Calm Healthcare Colors**: Soft blues and teals for a professional, calming atmosphere
- **Minimal Layout**: Clean, uncluttered interface
- **Readable Typography**: Clear, accessible fonts
- **Intuitive Navigation**: Easy-to-use sidebar navigation
- **Trustworthy Design**: Professional appearance suitable for academic projects

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Edge
- Safari

## Architecture

### Backend (Node.js/Express)
- RESTful API with Express.js
- JWT-based authentication
- Password hashing with bcrypt
- File upload handling with Multer
- JSON file-based storage (can be migrated to database)
- SHA-256 hashing for blockchain

### Frontend (HTML/CSS/JavaScript)
- Modern, responsive UI
- API integration with backend
- Real-time blockchain visualization
- Role-based access control

## Notes

- **Backend Required**: The application now requires the backend server to be running
- **Blockchain**: Simulated blockchain using SHA-256 hashing
- **Authentication**: JWT tokens for secure session management
- **File Storage**: Medical images are stored on the server
- For production deployment, consider:
  - Real blockchain network (e.g., Ethereum, Hyperledger)
  - Database (PostgreSQL, MongoDB)
  - Cloud storage for files
  - HTTPS/SSL certificates
  - Enhanced encryption

## License

This project is created for academic and demonstration purposes.

