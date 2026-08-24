const axios = require('axios');

const BLOCKCHAIN_API_URL =
  process.env.BLOCKCHAIN_API_URL || 'http://localhost:5001';

/**
 * BlockchainService
 * Bridges the Node.js application layer to the Python Flask Blockchain microservice.
 * The blockchain is the cryptographic source of truth.
 */
class BlockchainService {
  constructor() {
    this.client = axios.create({
      baseURL: BLOCKCHAIN_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Check blockchain service health
   */
  async getHealth() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('[BlockchainService] Health check failed:', error.message);
      return { status: 'offline', error: error.message };
    }
  }

  /**
   * Issue a Decentralized Identity credential on blockchain
   */
  async issueIdentity(subjectName, role, clearanceLevel, issuer = 'BEL-Authority') {
    const response = await this.client.post('/identity/issue', {
      subject_name: subjectName,
      role: role,
      clearance_level: Number(clearanceLevel),
      issuer: issuer,
    });
    return response.data;
  }

  /**
   * Revoke an Identity on blockchain
   */
  async revokeIdentity(did, reason = 'Revoked by Administrator', issuer = 'BEL-Authority') {
    const response = await this.client.post('/identity/revoke', {
      did: did,
      reason: reason,
      issuer: issuer,
    });
    return response.data;
  }

  /**
   * Grant resource access on blockchain
   */
  async grantAccess(did, resource, requiredClearance, grantedBy = 'BEL-Authority') {
    const response = await this.client.post('/access/grant', {
      did: did,
      resource: resource,
      required_clearance: Number(requiredClearance),
      granted_by: grantedBy,
    });
    return response.data;
  }

  /**
   * Revoke resource access on blockchain
   */
  async revokeAccess(grantId, did, resource, revokedBy = 'BEL-Authority') {
    const response = await this.client.post('/access/revoke', {
      grant_id: grantId,
      did: did,
      resource: resource,
      revoked_by: revokedBy,
    });
    return response.data;
  }

  /**
   * Evaluate clearance policy and log access attempt to blockchain
   */
  async checkAccess(did, resource, clearanceLevel, requiredClearance) {
    const response = await this.client.post('/access/check', {
      did: did,
      resource: resource,
      clearance_level: Number(clearanceLevel),
      required_clearance: Number(requiredClearance),
    });
    return response.data;
  }

  /**
   * Anchor a digital asset (SHA-256 hash) to the blockchain
   */
  async anchorAsset(filename, ownerDid, contentBase64, version = 1) {
    const response = await this.client.post('/asset/anchor', {
      filename: filename,
      owner_did: ownerDid,
      content_base64: contentBase64,
      version: Number(version),
    });
    return response.data;
  }

  /**
   * Verify digital asset against on-chain hash
   */
  async verifyAsset(contentBase64, expectedHash) {
    const response = await this.client.post('/asset/verify', {
      content_base64: contentBase64,
      expected_hash: expectedHash,
    });
    return response.data;
  }

  /**
   * Retrieve all blockchain blocks
   */
  async getChain() {
    const response = await this.client.get('/chain');
    return response.data;
  }

  /**
   * Cryptographically validate entire blockchain integrity
   */
  async validateChain() {
    const response = await this.client.get('/chain/validate');
    return response.data;
  }

  /**
   * Get all transactions audit trail from chain
   */
  async getAuditTrail() {
    const response = await this.client.get('/chain/audit');
    return response.data;
  }
}

module.exports = new BlockchainService();
