# Complete Setup & Installation Guide

## System Requirements
- Node.js >= 18
- Python >= 3.9
- MongoDB (Atlas account or local MongoDB)

---

## 1. Start Python Blockchain Service

```bash
cd blockchain-service
pip install flask
python api.py
```
> Running on: `http://localhost:5001`

---

## 2. Start Backend Server

```bash
cd backend
npm install
```

Configure `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sih2026?retryWrites=true&w=majority
JWT_SECRET=sih2026_super_secret_jwt_key_for_development
BLOCKCHAIN_API_URL=http://localhost:5001
```

Start server:
```bash
npm start
```
> Running on: `http://localhost:5000`

---

## 3. Launch Frontend & Developer Guide

Open your browser at:
- Frontend Portal: `http://localhost:5000`
- Developer Mini-Course: `http://localhost:5000/guide/index.html`
