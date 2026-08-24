const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const identityRoutes = require('./routes/identityRoutes');
const accessRoutes = require('./routes/accessRoutes');
const assetRoutes = require('./routes/assetRoutes');
const auditRoutes = require('./routes/auditRoutes');
const { getHealth, getBlockchainStatus } = require('./controllers/auditController');

// Initialize database connection
connectDB();

const app = express();

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files and developer guide
const frontendPath = path.join(__dirname, '..', 'frontend');
const developerGuidePath = path.join(__dirname, '..', 'developer-guide');

app.use(express.static(frontendPath));
app.use('/guide', express.static(developerGuidePath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/identity', identityRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/audit', auditRoutes);

// Direct top-level helper endpoints
app.get('/api/health', getHealth);
app.get('/api/blockchain/status', getBlockchainStatus);

// Root fallback to frontend index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Centralized 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error Handler]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🛡️  BEL TrustChain Backend running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend Portal:    http://localhost:${PORT}`);
  console.log(`📚 Developer Guide:    http://localhost:${PORT}/guide/index.html`);
  console.log(`🔗 Python Blockchain:  ${process.env.BLOCKCHAIN_API_URL || 'http://localhost:5001'}`);
  console.log('====================================================');
});
