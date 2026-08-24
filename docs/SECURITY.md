# Security Architecture & Threat Model

## 1. Password Security
- Passwords are never stored in plaintext.
- Salted hashes are computed using `bcryptjs` with 10 salt rounds.

## 2. Stateless JWT Authorization
- API endpoints are protected using HMAC SHA-256 signed JSON Web Tokens.
- Bearer tokens encapsulate user role and clearance level.

## 3. Off-Chain File Storage Security
- Sensitive documents are never stored directly in public blockchain ledgers.
- Only the 32-byte cryptographic SHA-256 fingerprint is recorded on-chain.
- Physical files remain in controlled local/cloud storage.

## 4. Multi-Level Clearance RBAC
- Clearance Level 1 to 5 enforcement prevents horizontal and vertical privilege escalation.
- Both allowed and unauthorized access attempts are permanently audited on the blockchain.

## 5. Hackathon Prototype vs. Production Architecture
| Feature | SIH-2026 Prototype | Enterprise Production |
|---|---|---|
| Consensus | Local Proof-of-Work (Python) | Hyperledger Fabric / Raft PBFT |
| File Storage | Local disk (`uploads/`) | Encrypted AWS S3 / IPFS with AES-256 |
| Key Management | Server-side signing | Hardware Security Modules (HSM) / KMS |
| Database | MongoDB Atlas | MongoDB Sharded Cluster + Read Replicas |
