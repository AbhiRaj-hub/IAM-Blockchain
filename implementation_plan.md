# Implementation Plan: SIH-2026 Blockchain-Based Platform for Identity, Access Control & Asset Management

A secure, beginner-explainable full-stack prototype engineered for the Smart India Hackathon (SIH-2026). The platform demonstrates decentralized identity management, clearance-based access control, digital asset integrity verification, and immutable on-chain audit logging using **Node.js/Express**, **MongoDB Atlas**, **Python Blockchain (Flask)**, and a **Vanilla HTML/CSS/JS Frontend**.

---

## User Review Required

> [!IMPORTANT]
> **Port Configuration:**
> - Backend (Node/Express): Defaults to `http://localhost:5000`
> - Blockchain Service (Python/Flask): Defaults to `http://localhost:5001` (to prevent port collision with backend)
> - Frontend / Developer Guide: Can be served via Express static hosting or simple HTTP server / Live Server.

> [!NOTE]
> **Database Fallback & Quick Demo:**
> The backend will connect to MongoDB via `MONGODB_URI` from `.env`. We will also include an optional in-memory / local fallback option or connection validation so the team can demonstrate or develop even without active internet/Atlas credentials if required, while keeping standard Mongoose schemas.

---

## Architecture & Data Flow Overview

```
                          ┌──────────────────────────┐
                          │   VANILLA WEB FRONTEND   │
                          │   HTML5 / CSS3 / JS ES6  │
                          └─────────────┬────────────┘
                                        │ REST API + JWT
                                        ▼
                          ┌──────────────────────────┐
                          │  NODE.JS + EXPRESS.JS    │
                          │  Controllers & Services  │
                          └──────┬────────────┬──────┘
                                 │            │
             Searchable Indexing │            │ Source of Truth (Cryptographic)
                                 ▼            ▼
             ┌──────────────────────┐      ┌─────────────────────────┐
             │    MONGODB ATLAS     │      │ PYTHON BLOCKCHAIN (5001)│
             │ Fast Query / Mirror  │      │ Proof-of-Work & Ledger  │
             │ Users, Grants, Logs  │      │ SHA-256 Anchors, DIDs   │
             └──────────────────────┘      └─────────────────────────┘
```

---

## Proposed Changes & File Structure

### 1. Blockchain Service (`blockchain-service/`)
- [blockchain.py](file:///d:/Web%20Development/ShieldX/SIH-2026/blockchain-service/blockchain.py): Fix loop indentation in `is_chain_valid()`, ensure robust transaction mining and querying.
- [models.py](file:///d:/Web%20Development/ShieldX/SIH-2026/blockchain-service/models.py): Verify helper payload creators for DID identity issuance, revocation, access grant/revocation, attempt logging, and asset hashing.
- [api.py](file:///d:/Web%20Development/ShieldX/SIH-2026/blockchain-service/api.py): Configure port (default 5001), add missing `/access/revoke` and `/audit/history` helper endpoints, CORS support, error handling.
- `blockchain-service/README.md`: Quick instructions for running the Python service with `pip install flask flask-cors` and `python api.py`.

---

### 2. Backend (`backend/`)
- **Package Configuration & Server**:
  - `backend/package.json`: Node dependencies (`express`, `mongoose`, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken`, `axios`, `multer`).
  - `backend/.env.example`: Template for environment variables.
  - `backend/config/db.js`: Clean MongoDB connection handler with clear logging.
  - `backend/server.js`: Main Express entrypoint registering routes, static middleware, CORS, and centralized error handler.

- **Models (`backend/models/`)**:
  - `User.js`: User credentials, password hash (bcrypt), role (`ADMIN`, `EMPLOYEE`, `AUDITOR`), `clearanceLevel` (1-5), `did`, `status`.
  - `Identity.js`: Decentralized Identity mirror (`did`, `userId`, `credentialId`, `subjectName`, `role`, `clearanceLevel`, `issuer`, `blockchainBlockIndex`).
  - `AccessGrant.js`: Resource access permissions (`grantId`, `did`, `resource`, `requiredClearance`, `grantedBy`, `blockchainBlockIndex`).
  - `AccessLog.js`: Access attempts audit trail (`did`, `resource`, `decision`, `reason`, `blockchainBlockIndex`, `timestamp`).
  - `Asset.js`: Digital document metadata (`assetId`, `filename`, `version`, `sha256`, `ownerDid`, `storagePath`, `blockchainBlockIndex`).

- **Middleware (`backend/middleware/`)**:
  - `authMiddleware.js`: JWT token verification and user extraction.
  - `roleMiddleware.js`: RBAC guard (`ADMIN`, `EMPLOYEE`, `AUDITOR`).

- **Services (`backend/services/`)**:
  - `blockchainService.js`: Clean HTTP client interfacing with Python blockchain API (issue/revoke identity, grant/revoke access, check access, anchor asset, verify chain, query audit trail).
  - `assetService.js`: File SHA-256 calculation and local disk/upload storage management.

- **Controllers & Routes**:
  - `backend/controllers/authController.js` & `backend/routes/authRoutes.js`: Register, Login, `/api/auth/me`.
  - `backend/controllers/identityController.js` & `backend/routes/identityRoutes.js`: Issue DID, Revoke DID, List/Get identities.
  - `backend/controllers/accessController.js` & `backend/routes/accessRoutes.js`: Request access, Grant, Revoke, List all / My grants, Check clearance.
  - `backend/controllers/assetController.js` & `backend/routes/assetRoutes.js`: Upload asset with Multer, Compute SHA-256, Anchor to Blockchain, Verify integrity (detect tampering).
  - `backend/controllers/auditController.js` & `backend/routes/auditRoutes.js`: Aggregated audit logs from MongoDB + direct on-chain verification, blockchain status check (`/api/blockchain/status`, `/api/health`).

---

### 3. Frontend (`frontend/`)
Clean, modern, aesthetic, dark-mode/slate design without heavy frameworks:
- `frontend/index.html`: Landing / overview page with quick entry points and architecture showcase.
- `frontend/login.html`: Unified login & demo account switcher (Admin / Employee / Auditor).
- `frontend/dashboard.html`: Main admin/user metrics (Total Users, Active Identities, Active Grants, Total Assets, Chain Height & Status).
- `frontend/identity.html`: DID issuance form, active/revoked identity table with block indices and DID badge lookup.
- `frontend/access-control.html`: Clearance-based access management, resource request sandbox (test clearance 1-5 with live ALLOWED/DENIED feedback).
- `frontend/assets.html`: Asset upload, SHA-256 hashing viewer, on-chain anchor badge, live tamper-detection verification tool.
- `frontend/audit.html`: Immutable audit ledger viewer with filters (DID, decision, type) and chain validation button.
- `frontend/css/style.css` & `frontend/css/dashboard.css`: Premium responsive design with CSS variables, cards, badges, and clean tables.
- `frontend/js/`:
  - `api.js`: Centralized `fetch` wrapper with JWT headers and error handlers.
  - `auth.js`: Auth state management, login/logout, route protection.
  - `dashboard.js`, `identity.js`, `access.js`, `assets.js`, `audit.js`: Modular logic for each screen.

---

### 4. Developer Guide Website (`developer-guide/`)
An interactive static website explaining the entire project conceptually and technically:
- `index.html`: Introduction & Mini-Course Guide.
- `architecture.html`: Deep-dive into 3-tier hybrid blockchain-database model.
- `setup.html`: Step-by-step setup from fresh laptop to running demo.
- `backend.html`: Express routes, controllers, middleware explained simply.
- `frontend.html`: Vanilla JS, DOM manipulation, JWT in `localStorage`.
- `mongodb.html`: MongoDB vs Blockchain, collections & Mongoose schemas.
- `blockchain.html`: Blocks, hashing, Proof-of-Work, why documents stay off-chain.
- `api.html`: Complete API reference with request/response examples.
- `authentication.html`: Bcrypt + JWT end-to-end walkthrough.
- `access-control.html`: Clearance levels & RBAC visual guide.
- `assets.html`: SHA-256 anchoring & tamper detection explained.
- `troubleshooting.html`: 10+ common errors & one-click fixes.
- `css/guide.css`: Beautiful documentation layout with sidebar navigation, code highlighting styling, callout badges, and diagrams.

---

### 5. Documentation & Learning Artifacts (`docs/` & Root)
- `README.md`: Master project guide with quickstart, credentials, architecture diagrams.
- `PROJECT_MAP.md`: Every file, its purpose, who should understand it, and what it communicates with.
- `TEAM_LEARNING_PATH.md`: Day 1 through Day 7 study plan for teammates.
- `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DATABASE.md`, `docs/BLOCKCHAIN.md`, `docs/SECURITY.md`, `docs/SETUP.md`, `docs/DEMO_FLOW.md`.
- `.gitignore`: Ignoring `node_modules/`, `.env`, `uploads/`, `__pycache__/`, `*.json` runtime chain data.

---

## Verification Plan

### Automated & Manual Verification Steps
1. **Python Blockchain Service Test**:
   - Run `python api.py` on port 5001.
   - Verify `/chain`, `/chain/validate`, `/identity/issue`, `/access/grant`, `/access/check`, `/asset/anchor`.
2. **Backend API Verification**:
   - Register Admin, Employee, Auditor users.
   - Login & obtain JWT tokens.
   - Issue DID via API -> verify on-chain block mined & MongoDB mirror updated.
   - Test clearance access check:
     - Clearance Level 3 requesting Level 2 resource -> `ALLOWED` (logged on chain).
     - Clearance Level 1 requesting Level 4 resource -> `DENIED` (logged on chain).
   - Test asset upload: upload a sample text/pdf file, compute SHA-256, anchor to chain, verify untouched file (`VALID`), edit 1 byte of file and re-verify (`TAMPERED / MISMATCH`).
3. **Frontend UI Walkthrough**:
   - Open frontend pages in browser.
   - Test login, dashboard metric cards, DID issuance, access request sandbox, file upload and integrity verification, and audit logs.
4. **Developer Guide Verification**:
   - Navigate through all 12 guide chapters in `developer-guide/index.html` ensuring responsive UI, clean navigation, code snippets, and complete coverage.
