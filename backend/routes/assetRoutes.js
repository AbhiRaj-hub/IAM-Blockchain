const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  uploadAsset,
  getAssets,
  getAssetById,
  verifyAsset,
  tamperAssetDemo,
} = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { UPLOAD_DIR } = require('../services/assetService');

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max for prototype
});

router.post('/upload', protect, upload.single('file'), uploadAsset);
router.get('/', protect, getAssets);
router.get('/:id', protect, getAssetById);
router.post('/:id/verify', protect, verifyAsset);
router.post('/:id/tamper-demo', protect, authorizeRoles('ADMIN'), tamperAssetDemo);

module.exports = router;
