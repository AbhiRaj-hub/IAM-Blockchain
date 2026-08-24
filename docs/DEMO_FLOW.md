# ShieldX Demo Flow & Presentation Script

This document outlines the step-by-step presentation script for demonstrating the **ShieldX Platform**.

---

## 🎭 The 5-Minute Live Demo

### Part 1: Authentication & RBAC (1 min)
1. Navigate to `http://localhost:5000/login.html`.
2. Click the 1-Click persona **Admin (L5)** (`admin@shieldx.io` / `Admin@123`).
3. Point out the immediate redirection to `dashboard.html` and the dynamic top bar displaying role `ADMIN` and clearance `Level 5`.

### Part 2: Decentralized Identity (DID) Issuance (1.5 min)
1. Go to **Identity (DID)** (`identity.html`).
2. Select a user from the dropdown (or type in a new name e.g., "Vikram Singh").
3. Set role to `EMPLOYEE` and clearance level to `Level 2`.
4. Click **Issue Identity & Mine Block**.
5. Show the newly mined block index (e.g. `Block #1`) and the generated DID `did:sx:...`.

### Part 3: Clearance-Based Access Control (1 min)
1. Go to **Access Control** (`access-control.html`).
2. Test a resource:
   - Request **General Bulletin (Req Level 1)** with Clearance Level 2 ➔ **ALLOWED** (Green callout).
   - Request **Missile Guidance System (Req Level 5)** with Clearance Level 2 ➔ **DENIED** (Red callout).
3. Emphasize that both the allowed access and the denied access were permanently logged into the blockchain.

### Part 4: Digital Asset Integrity & Tokenization (1 min)
1. Go to **Asset Tokens** (`assets.html`).
2. Upload a test file (e.g., `schematic.txt`).
3. Click **Mint Token & Anchor SHA-256**.
4. Click **Verify Integrity** ➔ Shows green **100% Authentic**.

### Part 5: Immutable Audit Ledger & Chain Validation (0.5 min)
1. Go to **Audit Ledger** (`audit.html`).
2. Click **Validate Full Blockchain** ➔ Cryptographic SHA-256 proof-of-work chain is verified.
