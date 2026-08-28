# 🌐 ShieldX (BEL TrustChain) — Frontend Web Application
### *Modern, Zero-Trust Glassmorphism Dashboard for Decentralized Identity, Multi-Level Access Control & Blockchain Asset Auditing*

---

## 🌟 Overview in Simple Language
The **Frontend Web Application** is the user-facing command center for the **ShieldX / BEL TrustChain** platform. It provides a visual interface for officers, system administrators, and security auditors.

Instead of typing complicated command-line codes or raw API calls, users can:
1. Register and log in securely using password hashing and JWT authentication.
2. View and manage their **W3C Decentralized Identity (DID)**.
3. Request clearance-based access to restricted military and enterprise assets.
4. Upload classified files, automatically anchor their **SHA-256 cryptographic fingerprints** to the blockchain, and verify file integrity in real-time.
5. Run a live **Tamper Simulation Demo** to visually prove how blockchain detects file modifications.
6. Explore mined blockchain blocks, transaction details, and system audit logs in real-time.

---

## 🏗️ 1. Architecture & Design Philosophy

### Why Vanilla JavaScript, HTML5 & Modern CSS?
* **Zero Build Step & Instant Load:** No heavy Webpack/Vite bundlers or complex React/Angular build chains required. The website opens and runs natively in any modern browser.
* **Sleek Glassmorphism & Cyber Defense Theme:** Built with dark-mode aesthetic, glowing neon accents, responsive grid cards, and smooth micro-animations tailored for a defense/enterprise command center.
* **Modular Client-Side Architecture:** Each page has its own dedicated HTML file and companion JavaScript controller module communicating through a central API service.

---

## 📂 2. Frontend File Structure & Pages

```
frontend/
├── index.html             # Landing page / portal gateway with platform overview & navigation
├── login.html             # Authentication portal (Register new user or Login with JWT)
├── dashboard.html         # Main overview dashboard showing identity cards, stats & quick actions
├── identity.html          # Decentralized Identity (DID) manager & revocation controller
├── access-control.html    # Policy evaluation console (Clearance Levels 1-5 vs Resource Access)
├── assets.html            # Digital asset vault, SHA-256 file uploader & tamper detection tool
├── audit.html             # Real-time Blockchain Block Explorer and cryptographic chain validator
├── css/
│   └── styles.css         # Master styling sheet (Glassmorphism, dark theme, typography, responsive grids)
├── js/
│   ├── api.js             # Centralized API service with automatic Bearer token injection and error handling
│   ├── auth.js            # Login, registration, token storage (localStorage), and session guards
│   ├── dashboard.js       # Live dashboard telemetry, metric counters, and status badges
│   ├── identity.js        # DID list renderer, credential viewer, and admin revocation trigger
│   ├── access.js          # Resource access request handler and permission table manager
│   ├── assets.js          # Drag-and-drop file upload, live SHA-256 verification & tamper demo logic
│   └── audit.js           # Blockchain block inspector and cryptographic integrity validator
└── README.md              # This documentation file
```

---

## 📄 3. Page-by-Page Walkthrough

### 1. 🚪 Portal Gateway (`index.html`)
* The main entry point. Explains the BEL TrustChain mission, architecture highlights, and provides direct links to the Login Portal, Command Dashboard, and Developer Guide.

### 2. 🔐 Authentication Portal (`login.html`)
* Allows users to register with their **Name**, **Email**, **Password**, **Role** (`USER`, `AUDITOR`, `ADMIN`), and **Security Clearance Level** (`Level 1` to `Level 5`).
* Handles login and stores the returned JWT token and user profile in browser `localStorage`.

### 3. 📊 Central Command Dashboard (`dashboard.html`)
* Displays active user credential card with the user's **Decentralized Identifier (`did:bel:...`)**, **Clearance Level badge (1–5)**, and **Role badge**.
* Shows system summary metrics: Total Assets Anchored, Active DIDs, Mined Blockchain Blocks, and Total Access Requests.

### 4. 🪪 Identity Management (`identity.html`)
* Lists all Decentralized Identities anchored on the blockchain.
* Displays cryptographic status (`ACTIVE` vs `REVOKED`), issuer signatures, and creation dates.
* Administrators can trigger on-chain revocation of compromised DIDs with a single click.

### 5. 🚪 Access Control Matrix (`access-control.html`)
* Allows users to test access against resources requiring different clearance levels:
  * *Level 1:* Public Guidelines
  * *Level 2:* Departmental Memo
  * *Level 3:* Tactical Squadron Logs
  * *Level 4:* Radar Telemetry Data
  * *Level 5:* Strategic Defense Blueprint
* Displays immediate color-coded results (`ALLOWED` in green, `DENIED` in red) along with the blockchain block index where the attempt was permanently recorded.

### 6. 📁 Asset Vault & Tamper Detection (`assets.html`)
* **Drag-and-Drop Uploader:** Uploads documents, blueprints, or binaries. The backend hashes them with SHA-256 and commits the fingerprint to a blockchain block.
* **Integrity Verifier:** Click **Verify** on any file to check if its live disk checksum matches the on-chain hash.
* **Tamper Simulation Button:** Allows admins/evaluators to intentionally corrupt a file on disk. When re-verified, the dashboard turns red and warns: **`TAMPERED / CORRUPTED`**, proving the blockchain security concept live.

### 7. 🔍 Blockchain Explorer & Audit Trail (`audit.html`)
* Shows the entire blockchain from Block #0 (Genesis Block) to the newest block.
* Visualizes block hashes, previous block hashes, nonces, timestamps, and transactions.
* Features a **Validate Blockchain Integrity** button that cryptographically checks every block linkage in real-time.

---

## ⚙️ 4. How the Frontend Communicates with the Backend

1. **Centralized API Helper (`js/api.js`):**
   * Every request goes through `api.js`.
   * It automatically reads the JWT token from `localStorage.getItem('token')` and appends `Authorization: Bearer <token>` to all HTTP requests.
   * If a `401 Unauthorized` response is received, it automatically redirects the user to `login.html`.
2. **Dynamic UI Rendering:**
   * Uses modern DOM manipulation (template literals, async/await fetch calls) to refresh tables, badges, and counters without reloading the entire web page.

---

## 🛠️ 5. Running the Frontend
The frontend files are automatically served by the Node.js backend on **`http://localhost:5000`**.

Simply start the backend:
```bash
cd backend
npm start
```
Then open your browser and navigate to:
* **Portal Gateway:** `http://localhost:5000`
* **Login Page:** `http://localhost:5000/login.html`
* **Developer Guide:** `http://localhost:5000/guide/index.html`
