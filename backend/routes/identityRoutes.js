const express = require('express');
const router = express.Router();
const {
  issueIdentity,
  revokeIdentity,
  getIdentities,
  getIdentityByDid,
} = require('../controllers/identityController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, getIdentities);
router.post('/', protect, authorizeRoles('ADMIN'), issueIdentity);
router.get('/:did', protect, getIdentityByDid);
router.post('/:did/revoke', protect, authorizeRoles('ADMIN'), revokeIdentity);

module.exports = router;
