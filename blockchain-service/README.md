# ⛓️ ShieldX (BEL TrustChain) — Python Blockchain Microservice
### *Standalone Cryptographic Proof-of-Work Blockchain Engine for Identity Registry, Dynamic Smart Policies & Immutable Audit Trails*

---

## 🌟 Overview in Simple Language
The **Python Blockchain Service** is the cryptographic heart and ultimate source of truth for **ShieldX / BEL TrustChain**.

While normal websites store their data in editable database tables, ShieldX anchors all critical defense credentials, access logs, and document fingerprints into an **immutable mathematical blockchain ledger**.

Even if a rogue database administrator, hacker, or server operator modifies the database, they **cannot alter past blockchain blocks** because every block is mathematically locked using **SHA-256 cryptographic hashing** and **Proof-of-Work nonces**.

---

## 🏗️ 1. Core Blockchain Concepts Explained Simply

### 1. What is a "Block"?
A block is like an unalterable digital page in a ledger book. Each block in our system contains:
* **`index`**: Block number (e.g., Block #0, Block #1, Block #2).
* **`timestamp`**: The exact second the block was created.
* **`transactions`**: The list of actions performed (DID issued, resource access allowed/denied, file anchored).
* **`previous_hash`**: The digital fingerprint of the block that came before it. This links all blocks into an unbroken **chain**.
* **`nonce`**: A number found through computational mining that satisfies the Proof-of-Work difficulty.
* **`hash`**: The SHA-256 fingerprint of the entire block header.

---

### 2. How Does Proof-of-Work (PoW) Mining Work?
When a new action occurs (e.g., a file is uploaded or access is requested):
1. The engine packages the transactions into a candidate block.
2. The engine looks for a **nonce** such that the block's SHA-256 hash starts with a specific number of leading zeros (e.g., `"00..."` at `DIFFICULTY = 2`).
3. The engine loops:
   * Try `nonce = 0` $\rightarrow$ Hash: `8f3a...` (Invalid, doesn't start with `00`)
   * Try `nonce = 1` $\rightarrow$ Hash: `c14b...` (Invalid)
   * ...
   * Try `nonce = 482` $\rightarrow$ Hash: `00a9f2...` (Valid! Block mined and added to the chain).
4. **Why this matters:** Once a block is mined and followed by newer blocks, an attacker cannot change past transactions without re-mining every subsequent block, which is mathematically impossible.

---

### 3. What Transactions Are Stored on the Chain?
Our blockchain microservice manages four specific types of defense transactions:
1. **`IDENTITY_ISSUANCE`**: Registers a new user's DID, role, and clearance level.
2. **`IDENTITY_REVOCATION`**: Permanently revokes a compromised credential.
3. **`ACCESS_ATTEMPT`**: Records every clearance evaluation (`ALLOWED` or `DENIED`), user DID, resource name, and timestamp.
4. **`ASSET_ANCHOR`**: Records the SHA-256 fingerprint of an uploaded file, the owner's DID, and document version.

---

## 📂 2. Folder Structure

```
blockchain-service/
├── api.py             # Flask REST API microservice running on port 5001
├── blockchain.py      # Core Blockchain class (Block creation, SHA-256 hashing, PoW mining, persistence)
├── models.py          # Dataclasses and schemas for Transactions, DIDs, Access Grants, and Assets
├── demo.py            # Standalone interactive CLI demonstration script for judges and evaluators
├── chain_data.json    # Persistent JSON file storing the live blockchain blocks on disk
├── demo_chain.json    # Isolated chain data file used during CLI demo runs
├── requirements.txt   # Python dependencies (Flask, Flask-CORS, requests)
└── README.md          # This documentation file
```

---

## 📡 3. REST API Endpoints (Port 5001)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check returning blockchain status and total blocks mined |
| `POST`| `/identity/issue` | Mins a new block registering a Decentralized Identity (`did:bel:...`) |
| `POST`| `/identity/revoke` | Mins a block revoking an existing DID credential |
| `POST`| `/access/check` | Evaluates user clearance against resource requirements and mines an access log block |
| `POST`| `/access/grant` | Mins a block granting an explicit resource permission |
| `POST`| `/access/revoke` | Mins a block revoking an explicit resource permission |
| `POST`| `/asset/anchor` | Computes/receives SHA-256 asset hash and anchors it into a new block |
| `POST`| `/asset/verify` | Compares live base64 file hash against an expected on-chain hash |
| `GET` | `/chain` | Returns the entire list of mined blocks in JSON format |
| `GET` | `/chain/validate` | Cryptographically validates the entire chain from Genesis to tip |
| `GET` | `/chain/audit` | Returns a consolidated audit trail of all transactions on the chain |

---

## 🧪 4. Standalone CLI Demo Tool (`demo.py`)

For hackathon presentations and instant command-line verification, we built a standalone demo script:
```bash
python demo.py
```

### What `demo.py` demonstrates live:
1. **Genesis Block Initialization:** Creates Block #0 with cryptographic anchor.
2. **DID Issuance:** Issues DIDs for a Defense Admin, an Engineer (Clearance 3), and a Contractor (Clearance 1).
3. **Multi-Level Access Verification:**
   * Tests Level 3 Engineer accessing Level 3 Radar Data $\rightarrow$ **ALLOWED**.
   * Tests Level 1 Contractor accessing Level 4 Missile Schematics $\rightarrow$ **DENIED & LOGGED**.
4. **Asset Anchoring & Tamper Detection:**
   * Anchors `fighter_jet_telemetry.bin` with SHA-256 fingerprint.
   * Modifies 1 single byte of the file and runs verification $\rightarrow$ Detects corruption and raises tamper alert!
5. **Chain Integrity Audit:** Mathematically verifies all block hashes and confirms 100% chain validity.

---

## 🛠️ 5. Setup & Running Instructions

### Prerequisites
* **Python**: 3.9 or higher installed

### 1. Install Dependencies
```bash
cd blockchain-service
pip install flask flask-cors requests
```

### 2. Start the Blockchain Microservice
```bash
python api.py
```
The microservice will start on **`http://localhost:5001`**:
```
====================================================
⛓️  BEL TrustChain Python Blockchain Microservice
🌐 Running on: http://localhost:5001
📦 Chain storage: chain_data.json
====================================================
```
