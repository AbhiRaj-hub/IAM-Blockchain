# ShieldX Architecture Map

This reference map explains every key file in the codebase, its purpose, who on the team should understand it, and what it communicates with.

---

## 1. Blockchain Service (`blockchain-service/`)

| File | Purpose | Who Should Understand | Communicates With |
|---|---|---|---|
| `blockchain.py` | Implements Block data structure, SHA-256 Proof-of-Work, mining, and chain validation | Core Dev / Blockchain Lead | File system (`chain_data.json`), `models.py` |
| `models.py` | Factory functions for transactions (`IDENTITY_ISSUE`, `ACCESS_GRANT`, `ACCESS_ATTEMPT`, `ASSET_ANCHOR`) | Backend Dev / Blockchain Lead | `blockchain.py` |
| `api.py` | Flask REST API microservice running on port 5001 | Backend Dev / Integration Lead | Node.js Backend (`blockchainService.js`) |

---

## 2. Backend Application Layer (`backend/`)

| File | Purpose | Who Should Understand | Communicates With |
|---|---|---|---|
| `server.js` | Express server entrypoint, middleware, and route mounting | Entire Team | Routes, Frontend static server |
| `config/db.js` | Connects to MongoDB Atlas / Local MongoDB instance | Database Lead | MongoDB Atlas / Mongoose |
| `models/User.js` | Mongoose schema with bcrypt password hashing | Backend Dev / Auth Lead | MongoDB `users` collection |
| `models/Identity.js` | Searchable MongoDB index of on-chain DID credentials | Backend Dev | MongoDB `identities` collection |
| `models/AccessGrant.js` | Searchable MongoDB index of resource permissions | Backend Dev | MongoDB `access_grants` collection |
| `models/AccessLog.js` | Searchable MongoDB index of clearance access attempts | Backend Dev / Auditor | MongoDB `access_logs` collection |
| `models/Asset.js` | Searchable MongoDB metadata of anchored documents | Backend Dev | MongoDB `assets` collection |
| `middleware/authMiddleware.js`| JWT Bearer token validator | Backend Dev / Auth Lead | Express request pipeline |
| `middleware/roleMiddleware.js`| Role-Based Access Control (RBAC) guard | Backend Dev | Express request pipeline |
| `services/blockchainService.js`| Axios client connecting Node.js to Python Blockchain API | Integration Lead / Backend Dev | Python Flask API (`http://localhost:5001`) |
| `services/assetService.js` | Computes SHA-256 checksums and manages local uploads | Backend Dev | Local file system (`uploads/`) |
| `controllers/authController.js`| User registration, login, and profile fetching | Backend Dev | `User` Model, JWT |
| `controllers/identityController.js`| DID issuance & revocation logic | Backend Dev | `blockchainService`, `Identity` Model |
| `controllers/accessController.js`| Clearance evaluation & attempt logging | Backend Dev | `blockchainService`, `AccessLog` Model |
| `controllers/assetController.js`| Asset upload, SHA-256 anchoring & verification | Backend Dev | `assetService`, `blockchainService`, `Asset` Model |
| `controllers/auditController.js`| Telemetry metrics, chain validation, and audit queries | Backend Dev | All Models, `blockchainService` |

---

## 3. Frontend Web Client (`frontend/`)

| File | Purpose | Who Should Understand | Communicates With |
|---|---|---|---|
| `index.html` | Project landing page & architecture overview | Entire Team / Presenter | Web Browser |
| `login.html` | User sign-in, registration, and 1-click demo personas | Entire Team / Presenter | `js/auth.js`, `POST /api/auth/*` |
| `dashboard.html` | High-level metrics, blockchain status, and recent activity | Entire Team / Presenter | `js/dashboard.js`, `GET /api/audit/stats` |
| `identity.html` | Issue and revoke on-chain DID credentials | Presenter / Identity Lead | `js/identity.js`, `/api/identity/*` |
| `access-control.html`| Clearance testing sandbox & RBAC grants | Presenter / Security Lead | `js/access.js`, `/api/access/*` |
| `assets.html` | File upload, SHA-256 calculation & live tamper demo | Presenter / Asset Lead | `js/assets.js`, `/api/assets/*` |
| `audit.html` | Immutable audit log explorer & blockchain validator | Presenter / Auditor | `js/audit.js`, `/api/audit/*` |
| `js/api.js` | Universal `fetch()` helper with automatic JWT injection | Frontend Dev | Backend REST API |
| `js/auth.js` | Session state, `localStorage`, and role navbar updater | Frontend Dev | Browser `localStorage` |

---

## 4. Developer Mini-Course (`developer-guide/`)

| File | Purpose | Who Should Understand |
|---|---|---|
| `index.html` | Chapter 1: Overview & Project Goals | All Teammates |
| `architecture.html`| Chapter 2: 3-Tier Security Architecture | All Teammates |
| `setup.html` | Chapter 3: Zero-to-One Setup Guide | All Teammates |
| `backend.html` | Chapter 4: Node.js & Express Deep Dive | Backend Developers |
| `frontend.html`| Chapter 5: Vanilla JS & DOM Manipulation | Frontend Developers |
| `mongodb.html` | Chapter 6: MongoDB Collections & Indexing | Database Team |
| `blockchain.html`| Chapter 7: Proof-of-Work & Ledger Concepts | Blockchain Team |
| `api.html` | Chapter 8: REST API Contracts | Full Stack Developers |
| `authentication.html`| Chapter 9: Bcrypt & JWT Walkthrough | Security Team |
| `access-control.html`| Chapter 10: Clearance (1–5) & RBAC Rules | Security Team |
| `assets.html` | Chapter 11: SHA-256 Integrity & Anchoring | All Teammates |
| `troubleshooting.html`| Chapter 12: 10 Common Errors & Solutions | All Teammates |
