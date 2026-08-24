# Python Blockchain Service (SIH-2026)

This service implements a lightweight, explainable blockchain for identity issuance, role/clearance access control, digital asset hashing, and audit logging.

## Core Files
- `blockchain.py`: Core Blockchain data structure (Block, Proof-of-Work mining, SHA-256 validation, chain integrity checks).
- `models.py`: Transaction factory functions (`IDENTITY_ISSUE`, `IDENTITY_REVOKE`, `ACCESS_GRANT`, `ACCESS_REVOKE`, `ACCESS_ATTEMPT`, `ASSET_ANCHOR`).
- `api.py`: Flask REST API exposing endpoints to the Node.js backend.
- `chain_data.json`: File-based persistence of the ledger.

## Quick Start

1. Install dependencies:
```bash
pip install flask
```

2. Run the service:
```bash
python api.py
```
Default running on: `http://localhost:5001`

## Key REST Endpoints
- `GET  /health` - Check blockchain status & block count
- `GET  /chain` - View raw ledger blocks
- `GET  /chain/validate` - Cryptographically verify chain integrity
- `GET  /chain/audit` - Chronological audit trail across all mined blocks
- `POST /identity/issue` - Issue DID credential transaction and mine block
- `POST /identity/revoke` - Revoke DID credential
- `POST /access/grant` - Grant access to a resource
- `POST /access/check` - Clearance-based policy check & log on-chain
- `POST /asset/anchor` - Anchor SHA-256 hash of digital asset
- `POST /asset/verify` - Verify digital asset integrity against expected hash
