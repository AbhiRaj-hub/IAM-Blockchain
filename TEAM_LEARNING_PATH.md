# 7-Day Team Learning Path for SIH-2026

A step-by-step onboarding plan for any CSE student joining this project.

---

## 📅 Day 1: System Architecture & Topology
- **Goal:** Understand why we combine MongoDB and Blockchain.
- **Reading:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [developer-guide/architecture.html](developer-guide/architecture.html).
- **Task:** Draw the 3-tier architecture diagram on paper without looking.

---

## 📅 Day 2: Express Backend & Route Flow
- **Goal:** Understand how HTTP requests move from routes to controllers.
- **Reading:** [developer-guide/backend.html](developer-guide/backend.html) and [backend/server.js](backend/server.js).
- **Task:** Trace the lifecycle of `POST /api/identity` from `server.js` ➔ `identityRoutes.js` ➔ `identityController.js`.

---

## 📅 Day 3: MongoDB Atlas & Mongoose Models
- **Goal:** Understand data schemas and indexing.
- **Reading:** [docs/DATABASE.md](docs/DATABASE.md) and [developer-guide/mongodb.html](developer-guide/mongodb.html).
- **Task:** Inspect `backend/models/User.js` and explain why passwords use salted bcrypt hashing.

---

## 📅 Day 4: Authentication & Role-Based Clearance
- **Goal:** Master JWT tokens and Clearance rules.
- **Reading:** [developer-guide/authentication.html](developer-guide/authentication.html) and [developer-guide/access-control.html](developer-guide/access-control.html).
- **Task:** Explain why `user.clearanceLevel >= resource.requiredClearance` allows or denies access.

---

## 📅 Day 5: Python Blockchain & SHA-256 Anchoring
- **Goal:** Understand Blocks, Proof-of-Work, and cryptographic hashes.
- **Reading:** [docs/BLOCKCHAIN.md](docs/BLOCKCHAIN.md) and [developer-guide/blockchain.html](developer-guide/blockchain.html).
- **Task:** Open `blockchain-service/blockchain.py` and explain how `is_chain_valid()` detects if a past block was tampered with.

---

## 📅 Day 6: Vanilla JS Frontend & API Calls
- **Goal:** Understand DOM manipulation and `fetch()` with JWT headers.
- **Reading:** [developer-guide/frontend.html](developer-guide/frontend.html) and `frontend/js/api.js`.
- **Task:** Explain how `localStorage.getItem('sih_token')` attaches the Bearer token to API requests.

---

## 📅 Day 7: Execute & Present Live Demo to Judges
- **Goal:** Deliver a flawless 5-minute presentation.
- **Reading:** [docs/DEMO_FLOW.md](docs/DEMO_FLOW.md).
- **Task:** Run through the 5-step demo flow:
  1. Login with Admin persona.
  2. Issue a DID credential on-chain.
  3. Test Clearance Sandbox with an Employee persona.
  4. Upload an asset and demonstrate live tamper detection.
  5. Validate full blockchain cryptographic integrity.
