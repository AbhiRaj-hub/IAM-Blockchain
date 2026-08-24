# ShieldX — Blockchain Platform for Identity, Access Control & Asset Management

**ShieldX** is a full-stack, tamper-proof decentralized framework combining self-sovereign **Decentralized Identifiers (DIDs)**, **Role & Clearance-Based Access Control (RBAC)**, and **Cryptographic Digital Asset Tokenization** with an immutable blockchain ledger.

---

## 🏗️ System Architecture

```
         USER PORTAL (HTML5 + CSS3 + Vanilla JavaScript)
                               |
                               | REST API + JWT Bearer
                               ↓
                      NODE.JS + EXPRESS.JS (5000)
                               |
        ┌──────────────────────┴──────────────────────┐
        ↓                                             ↓
 MONGODB ATLAS / LOCAL STORE              PYTHON BLOCKCHAIN SERVICE (5001)
  - Fast B-Tree Search Index                - Cryptographic Source of Truth
  - Offline JSON Resilient Engine           - SHA-256 Proof-of-Work Mining
  - User Profiles & Mongoose Schemas        - Immutable DID & Asset Anchors
```

---

## 🚀 Quick Start Guide (Zero-Setup Local Run)

### 1. Start Python Blockchain Service (Port 5001)
```bash
cd blockchain-service
pip install flask
python api.py
```

### 2. Start Node.js Backend Server (Port 5000)
```bash
cd backend
npm install
npm start
```
> **Note:** The backend contains a built-in **Local Offline Storage Engine** (`backend/data/db_store.json`), meaning you can run and demo the full system instantly even without a running MongoDB daemon!

### 3. Open Web Applications
- **User Portal & Demo:** [`http://localhost:5000`](http://localhost:5000)
- **Deep Developer Mini-Course:** [`http://localhost:5000/guide/index.html`](http://localhost:5000/guide/index.html)

---

## ⚡ 1-Click Demo Personas

On the login screen ([`http://localhost:5000/login.html`](http://localhost:5000/login.html)), use the pre-seeded accounts:
1. **Admin (Clearance Level 5):** `admin@shieldx.io` / `Admin@123`
2. **Manager (Clearance Level 4):** `manager@shieldx.io` / `Manager@123`
3. **Employee (Clearance Level 2):** `employee@shieldx.io` / `Employee@123`
4. **Auditor (Clearance Level 3):** `auditor@shieldx.io` / `Auditor@123`

---

## 📚 Technical Guides

- **[developer-guide/index.html](developer-guide/index.html):** 12-chapter developer course covering architecture, backend, blockchain, and troubleshooting.
- **[PROJECT_MAP.md](PROJECT_MAP.md):** Complete file-by-file communication map.
- **[TEAM_LEARNING_PATH.md](TEAM_LEARNING_PATH.md):** 7-Day study plan.
