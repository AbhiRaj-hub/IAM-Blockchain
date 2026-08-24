const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  getAuditByDid,
  getBlockchainStatus,
  getDashboardStats,
  getHealth,
} = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/health', getHealth);
router.get('/stats', protect, getDashboardStats);
router.get('/status', protect, getBlockchainStatus);
router.get('/', protect, authorizeRoles('ADMIN', 'AUDITOR'), getAuditLogs);
router.get('/:did', protect, getAuditByDid);

module.exports = router;
