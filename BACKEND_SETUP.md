# Backend Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Backend Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Verify Server is Running**
   - The server will start on `http://localhost:3000`
   - You should see: `🚀 Secure Medical Data Backend Server running on http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login/Register user
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users/:uniqueId` - Get user by unique ID

### Medical Records
- `GET /api/records/patient/:patientId` - Get patient's records
- `POST /api/records/text` - Add text-based medical record
- `POST /api/records/image` - Upload medical image

### Blockchain
- `GET /api/blockchain/patient/:patientId` - Get patient's blockchain
- `GET /api/blockchain` - Get full blockchain

### Permissions
- `POST /api/permissions/grant` - Grant access permission
- `GET /api/permissions/patient/:patientId` - Get patient's permissions
- `GET /api/permissions/provider/:providerId` - Get accessible patients

### Health Check
- `GET /api/health` - Server health status

## Data Storage

- **Users**: Stored in `data/users.json`
- **Blockchain**: Stored in `data/blockchain.json`
- **Permissions**: Stored in `data/permissions.json`
- **Uploaded Images**: Stored in `uploads/` directory

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- File upload validation
- CORS enabled for frontend

## Environment Variables

Create a `.env` file (optional) to customize:

```
PORT=3000
JWT_SECRET=your-secret-key-here
```

## Troubleshooting

1. **Port already in use**: Change PORT in `.env` or server.js
2. **CORS errors**: Ensure backend is running on port 3000
3. **File upload fails**: Check `uploads/` directory exists and has write permissions

