# System Architecture Specification

## Overview

The SIH-2026 platform implements a **Hybrid 3-Tier Security Architecture** designed for high-performance querying and cryptographic immutability.

```
                 +--------------------------------+
                 |    HTML5 / CSS3 / Vanilla JS   |
                 |     (No Heavy Frameworks)      |
                 +---------------+----------------+
                                 | REST API + Bearer JWT
                                 v
                 +--------------------------------+
                 |    NODE.JS + EXPRESS.JS (5000) |
                 | Controllers, Routes, Middleware|
                 +-------+----------------+-------+
                         |                |
      High-Speed Mirror  |                | Source of Truth
      B-Tree Indexing    |                | SHA-256 Proof-of-Work
                         v                v
          +--------------------+    +-----------------------------+
          |   MONGODB ATLAS    |    |  PYTHON BLOCKCHAIN (5001)   |
          | - Users & bcrypt   |    | - Proof-of-Work Mining      |
          | - Fast DID Search  |    | - Immutable DID Credentials |
          | - Queryable Logs   |    | - SHA-256 Asset Anchoring   |
          | - Access Grants    |    | - Full Ledger Audit Trail   |
          +--------------------+    +-----------------------------+
```

## Layer Responsibilities

### 1. Presentation Layer (Frontend)
- Built exclusively with **HTML5**, **CSS3**, and **Vanilla JavaScript**.
- Communicates with the backend using the standard `fetch()` API.
- Stores JWT tokens and user session data in `localStorage`.

### 2. Application Layer (Node.js & Express)
- Handles HTTP routing, input validation, and business logic.
- Manages authentication using `bcryptjs` and `jsonwebtoken`.
- Serves as the orchestrator between MongoDB Atlas and the Python Blockchain microservice.

### 3. Fast Indexing Layer (MongoDB Atlas)
- Stores mutable application data and fast searchable indexes.
- Caches blockchain block numbers and transaction hashes for sub-millisecond retrieval.

### 4. Cryptographic Ledger Layer (Python Blockchain)
- Acts as the immutable source of truth.
- Implements Proof-of-Work mining, SHA-256 hash chaining, and ledger validation.
- Files remain off-chain; only cryptographic digests are anchored on-chain.
