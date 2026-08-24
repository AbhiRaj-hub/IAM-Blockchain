const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Calculates SHA-256 checksum of a file buffer or stream.
 */
const calculateBufferHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Calculates SHA-256 checksum of a file stored on disk.
 */
const calculateFileHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return calculateBufferHash(fileBuffer);
};

module.exports = {
  UPLOAD_DIR,
  calculateBufferHash,
  calculateFileHash,
};
