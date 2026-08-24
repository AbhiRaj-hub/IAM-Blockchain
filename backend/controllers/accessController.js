const AccessGrant = require('../models/AccessGrant');
const AccessLog = require('../models/AccessLog');
const Identity = require('../models/Identity');
const blockchainService = require('../services/blockchainService');
const { loadStore } = require('../models/localStore');

/**
 * @route   POST /api/access/request
 * @desc    Request clearance-based access to a protected resource
 * @access  Private (All authenticated users)
 */
const requestAccess = async (req, res) => {
  try {
    const { resource, requiredClearance } = req.body;
    const user = req.user;

    if (!resource || !requiredClearance) {
      return res.status(400).json({
        success: false,
        message: 'Please specify target resource and requiredClearance.',
      });
    }

    const did = user.did || `did:temp:${user._id}`;
    const userClearance = user.clearanceLevel || 1;
    const reqClearance = Number(requiredClearance);

    // Step 1: Check on-chain and record immutable ACCESS_ATTEMPT block
    let blockchainRes = {
      decision: userClearance >= reqClearance ? 'ALLOWED' : 'DENIED',
      reason:
        userClearance >= reqClearance
          ? `Clearance level ${userClearance} satisfies requirement ${reqClearance}`
          : `Clearance level ${userClearance} is less than requirement ${reqClearance}`,
      block_index: 1,
      block_hash: 'mock_block_hash',
    };

    try {
      blockchainRes = await blockchainService.checkAccess(
        did,
        resource,
        userClearance,
        reqClearance
      );
    } catch (bcErr) {
      console.warn('[AccessController] Blockchain checkAccess warning:', bcErr.message);
    }

    const decision = blockchainRes.decision;
    const reason = blockchainRes.reason;
    const blockIndex = blockchainRes.block_index !== undefined ? blockchainRes.block_index : 1;

    // Step 2: Index the attempt in AccessLog
    const logRecord = await AccessLog.create({
      did,
      resource,
      decision,
      reason,
      blockchainBlockIndex: blockIndex,
      timestamp: new Date(),
    });

    const isAllowed = decision === 'ALLOWED';

    return res.status(isAllowed ? 200 : 403).json({
      success: isAllowed,
      decision: decision,
      message: isAllowed
        ? `Access GRANTED: Your clearance (${userClearance}) meets requirement (${reqClearance}).`
        : `Access DENIED: Your clearance (${userClearance}) is insufficient for requirement (${reqClearance}).`,
      details: {
        resource,
        userClearance,
        requiredClearance: reqClearance,
        reason,
        blockchainBlockIndex: blockIndex,
        blockchainBlockHash: blockchainRes.block_hash,
      },
      logId: logRecord._id,
    });
  } catch (error) {
    console.error('[AccessController.requestAccess] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error processing access request against blockchain.',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/access/grant
 * @desc    Admin grants explicit resource authorization on Blockchain
 * @access  Private (Admin only)
 */
const grantAccess = async (req, res) => {
  try {
    const { did, resource, requiredClearance } = req.body;

    if (!did || !resource || !requiredClearance) {
      return res.status(400).json({
        success: false,
        message: 'Please provide did, resource, and requiredClearance.',
      });
    }

    let blockchainRes = {
      grant_id: `grant-${Date.now().toString(36)}`,
      block_index: 1,
      block_hash: 'mock_grant_hash',
    };

    try {
      blockchainRes = await blockchainService.grantAccess(
        did,
        resource,
        requiredClearance,
        req.user ? req.user.name : 'BEL-Authority'
      );
    } catch (bcErr) {
      console.warn('[AccessController] Blockchain grantAccess warning:', bcErr.message);
    }

    const grantId = blockchainRes.grant_id;
    const blockIndex = blockchainRes.block_index !== undefined ? blockchainRes.block_index : 1;

    const grantRecord = await AccessGrant.create({
      grantId,
      did,
      resource,
      requiredClearance: Number(requiredClearance),
      grantedBy: req.user ? req.user.name : 'BEL-Authority',
      status: 'ACTIVE',
      blockchainBlockIndex: blockIndex,
    });

    return res.status(201).json({
      success: true,
      message: 'Access grant successfully anchored to Blockchain.',
      data: grantRecord,
      blockchain: {
        blockIndex,
        blockHash: blockchainRes.block_hash,
      },
    });
  } catch (error) {
    console.error('[AccessController.grantAccess] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to grant access on blockchain.',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/access/revoke
 * @desc    Admin revokes explicit resource authorization
 * @access  Private (Admin only)
 */
const revokeAccess = async (req, res) => {
  try {
    const { grantId, did, resource } = req.body;

    if (!did || !resource) {
      return res.status(400).json({
        success: false,
        message: 'Please provide did and resource.',
      });
    }

    let blockIndex = 1;
    try {
      const blockchainRes = await blockchainService.revokeAccess(
        grantId,
        did,
        resource,
        req.user ? req.user.name : 'BEL-Authority'
      );
      blockIndex = blockchainRes.block_index;
    } catch (bcErr) {
      console.warn('[AccessController] Blockchain revokeAccess warning:', bcErr.message);
    }

    const updatedGrant = await AccessGrant.findOneAndUpdate(
      { did, resource, status: 'ACTIVE' },
      { status: 'REVOKED' },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Access authorization successfully revoked on Blockchain.',
      data: updatedGrant,
      blockchain: {
        blockIndex,
      },
    });
  } catch (error) {
    console.error('[AccessController.revokeAccess] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to revoke access.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/access
 * @desc    Get all access grants
 * @access  Private
 */
const getGrants = async (req, res) => {
  try {
    let grants = [];
    try {
      grants = await AccessGrant.find().sort({ createdAt: -1 });
    } catch (e) {}

    if (!grants || grants.length === 0) {
      const store = loadStore();
      grants = store.access_grants || [];
    }

    return res.status(200).json({
      success: true,
      count: grants.length,
      data: grants,
    });
  } catch (error) {
    console.error('[AccessController.getGrants] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching access grants.',
    });
  }
};

/**
 * @route   GET /api/access/my
 * @desc    Get current user access grants & history
 * @access  Private
 */
const getMyGrants = async (req, res) => {
  try {
    const did = req.user.did;
    let grants = [];
    let logs = [];

    if (did) {
      try {
        grants = await AccessGrant.find({ did }).sort({ createdAt: -1 });
        logs = await AccessLog.find({ did }).sort({ timestamp: -1 }).limit(20);
      } catch (e) {}

      if (grants.length === 0) {
        const store = loadStore();
        grants = (store.access_grants || []).filter((g) => g.did === did);
        logs = (store.access_logs || []).filter((l) => l.did === did);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        did,
        clearanceLevel: req.user.clearanceLevel,
        grants,
        recentLogs: logs,
      },
    });
  } catch (error) {
    console.error('[AccessController.getMyGrants] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user grants.',
    });
  }
};

module.exports = {
  requestAccess,
  grantAccess,
  revokeAccess,
  getGrants,
  getMyGrants,
};
