# Database Architecture & Schemas

The database tier supports dual-mode operation:
- **Primary:** MongoDB Atlas (Mongoose ODM)
- **Zero-Setup Offline Engine:** Local JSON Store (`backend/data/db_store.json`)

---

## Collections

### 1. `users`
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId / String | Unique User Identifier |
| `name` | String | Full Name |
| `email` | String | Unique Email (Auth login) |
| `password` | String | Bcrypt hash (Salt rounds = 10) |
| `role` | String | Enum: `ADMIN`, `EMPLOYEE`, `AUDITOR`, `MANAGER` |
| `clearanceLevel`| Number | 1 to 5 |
| `did` | String | Bound Decentralized Identifier (`did:sx:...`) |
| `status` | String | Enum: `ACTIVE`, `SUSPENDED` |

### 2. `identities`
| Field | Type | Description |
|---|---|---|
| `did` | String | Decentralized Identifier (`did:sx:...`) |
| `credentialId` | String | Unique credential identifier |
| `subjectName` | String | Personnel / Entity Name |
| `role` | String | Role assigned |
| `clearanceLevel`| Number | Clearance Level |
| `issuer` | String | Issuing authority (`System-Authority`) |
| `status` | String | Enum: `ACTIVE`, `REVOKED` |
| `blockchainBlockIndex` | Number | Mined Block Height |

### 3. `access_grants`
| Field | Type | Description |
|---|---|---|
| `grantId` | String | Unique Grant Identifier |
| `did` | String | Subject DID |
| `resource` | String | Resource ID |
| `requiredClearance` | Number | Required clearance level |
| `grantedBy` | String | Granter name |
| `status` | String | Enum: `ACTIVE`, `REVOKED` |
| `blockchainBlockIndex` | Number | Mined Block Height |

### 4. `access_logs`
| Field | Type | Description |
|---|---|---|
| `did` | String | Subject DID |
| `resource` | String | Requested Resource ID |
| `decision` | String | Enum: `ALLOWED`, `DENIED` |
| `reason` | String | Policy evaluation reason |
| `blockchainBlockIndex` | Number | Mined Block Height |
| `timestamp` | Date | Timestamp of evaluation |

### 5. `assets`
| Field | Type | Description |
|---|---|---|
| `assetId` | String | Unique Asset Token ID |
| `filename` | String | Stored filename |
| `version` | Number | Version integer |
| `sha256` | String | Cryptographic file digest |
| `ownerDid` | String | Allocated Owner DID |
| `blockchainBlockIndex` | Number | Mined Block Height |
