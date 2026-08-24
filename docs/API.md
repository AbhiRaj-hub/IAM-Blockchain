# API Reference — Node.js Backend & Blockchain Endpoints

All backend routes are prefixed with `/api`.

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
**Body:**
```json
{
  "name": "Alex Morgan",
  "email": "employee@shieldx.io",
  "password": "Password@123",
  "role": "EMPLOYEE"
}
```

### `POST /api/auth/login`
**Body:**
```json
{
  "email": "admin@shieldx.io",
  "password": "Admin@123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "_id": "user_admin_001",
      "name": "Chief Administrator",
      "email": "admin@shieldx.io",
      "role": "ADMIN",
      "clearanceLevel": 5,
      "did": "did:sx:admin001"
    }
  }
}
```

---

## 2. Decentralized Identity (`/api/identity`)

### `POST /api/identity` (Admin Only)
**Body:**
```json
{
  "userId": "user_emp_003",
  "subjectName": "Alex Morgan",
  "role": "EMPLOYEE",
  "clearanceLevel": 2,
  "issuer": "System-Authority"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "did": "did:sx:6b39d1...",
    "credentialId": "cred-e1f2a3",
    "subjectName": "Alex Morgan",
    "role": "EMPLOYEE",
    "clearanceLevel": 2,
    "issuer": "System-Authority",
    "blockchainBlockIndex": 1
  }
}
```
