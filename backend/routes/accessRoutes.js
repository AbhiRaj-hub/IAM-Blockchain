const express = require('express');
const router = express.Router();
const {
  requestAccess,
  grantAccess,
  revokeAccess,
  getGrants,
  getMyGrants,
} = require('../controllers/accessController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/request', protect, requestAccess);
router.post('/grant', protect, authorizeRoles('ADMIN'), grantAccess);
router.post('/revoke', protect, authorizeRoles('ADMIN'), revokeAccess);
router.get('/', protect, getGrants);
router.get('/my', protect, getMyGrants);

module.exports = router;
