# Blockchain Microservice Specification

The Python Blockchain service serves as the **cryptographic source of truth**.

---

## Block Structure
```json
{
  "index": 1,
  "timestamp": 1724500000.123,
  "transactions": [
    {
      "type": "IDENTITY_ISSUE",
      "timestamp": 1724500000.0,
      "payload": {
        "credential_id": "cred-a1b2c3d4",
        "did": "did:sx:6b39d1...",
        "subject_name": "Vikram Singh",
        "role": "EMPLOYEE",
        "clearance_level": 2,
        "issuer": "System-Authority",
        "status": "ACTIVE"
      }
    }
  ],
  "previous_hash": "0000abc123...",
  "nonce": 45192,
  "hash": "0000def456..."
}
```

---

## Transaction Types

| Transaction Type | Description |
|---|---|
| `IDENTITY_ISSUE` | Mints and anchors a new Decentralized Identifier (DID) |
| `IDENTITY_REVOKE` | Marks a DID as revoked on the immutable chain |
| `ACCESS_GRANT` | Anchors an explicit resource permission grant |
| `ACCESS_REVOKE` | Revokes an existing permission grant |
| `ACCESS_ATTEMPT` | Records every clearance evaluation (ALLOWED & DENIED) |
| `ASSET_ANCHOR` | Mints a digital asset token binding SHA-256 to owner DID |
