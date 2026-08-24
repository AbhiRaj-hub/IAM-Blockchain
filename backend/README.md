# SIH-2026 Node.js & Express Backend

The application layer of the Blockchain Identity, Access Control & Asset Management Platform.

## Architecture
- **Controllers** (`controllers/`): Business logic handlers for Auth, Identity, Access Control, Assets, and Audit.
- **Routes** (`routes/`): Clean REST API route definitions.
- **Models** (`models/`): Mongoose schemas mirroring on-chain state for instant query performance.
- **Middleware** (`middleware/`): JWT verification (`authMiddleware.js`) and role-based clearance guards (`roleMiddleware.js`).
- **Services** (`services/`):
  - `blockchainService.js`: Communicates with Python Flask Blockchain API on port 5001.
  - `assetService.js`: Computes SHA-256 hashes and manages local file storage.

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/sih2026?retryWrites=true&w=majority
JWT_SECRET=sih2026_super_secret_jwt_key_for_development
BLOCKCHAIN_API_URL=http://localhost:5001
```

3. Start the backend:
```bash
npm start
```

Runs on `http://localhost:5000`.
