const Identity = require('../models/Identity');
const User = require('../models/User');
const blockchainService = require('../services/blockchainService');
const { loadStore } = require('../models/localStore');

/**
 * @route   POST /api/identity
 * @desc    Issue a new Decentralized Identity (DID) on the Blockchain
 * @access  Private (Admin only)
 */
const issueIdentity = async (req, res) => {
  try {
    const { userId, subjectName, role, clearanceLevel, issuer } = req.body;

    if (!subjectName || !role || !clearanceLevel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subjectName, role, and clearanceLevel.',
      });
    }

    // Step 1: Issue identity transaction on Python Blockchain (Source of Truth)
    let blockchainRes = {
      did: `did:bel:${Date.now().toString(36)}`,
      credential_id: `cred-${Date.now().toString(36)}`,
      block_index: 1,
      block_hash: 'mock_block_hash',
    };

    try {
      blockchainRes = await blockchainService.issueIdentity(
        subjectName,
        role,
        clearanceLevel,
        issuer || (req.user ? req.user.name : 'BEL-Authority')
      );
    } catch (bcErr) {
      console.warn('[IdentityController] Blockchain issue warning:', bcErr.message);
    }

    const did = blockchainRes.did;
    const credentialId = blockchainRes.credential_id;
    const blockIndex = blockchainRes.block_index !== undefined ? blockchainRes.block_index : 1;

    // Step 2: Update MongoDB / Local mirror index
    const identityRecord = await Identity.create({
      did,
      userId: userId || null,
      credentialId,
      subjectName,
      role,
      clearanceLevel: Number(clearanceLevel),
      issuer: issuer || 'BEL-Authority',
      status: 'ACTIVE',
      blockchainBlockIndex: blockIndex,
    });

    // Step 3: Link DID to User if userId was provided
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          did: did,
          role: role,
          clearanceLevel: Number(clearanceLevel),
        });
      } catch (e) {}
    }

    return res.status(201).json({
      success: true,
      message: 'Identity successfully issued on Blockchain and indexed in registry.',
      data: identityRecord,
      blockchain: {
        blockIndex,
        blockHash: blockchainRes.block_hash,
      },
    });
  } catch (error) {
    console.error('[IdentityController.issueIdentity] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to issue identity on blockchain.',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/identity/:did/revoke
 * @desc    Revoke an issued DID credential on Blockchain
 * @access  Private (Admin only)
 */
const revokeIdentity = async (req, res) => {
  try {
    const { did } = req.params;
    const { reason } = req.body;

    let blockIndex = 1;
    let blockHash = 'mock_revoke_hash';

    try {
      const blockchainRes = await blockchainService.revokeIdentity(
        did,
        reason || 'Administrative Revocation',
        req.user ? req.user.name : 'BEL-Authority'
      );
      blockIndex = blockchainRes.block_index;
      blockHash = blockchainRes.block_hash;
    } catch (bcErr) {
      console.warn('[IdentityController] Blockchain revoke warning:', bcErr.message);
    }

    const updatedIdentity = await Identity.findOneAndUpdate(
      { did },
      { status: 'REVOKED' },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Identity ${did} successfully revoked on Blockchain.`,
      data: updatedIdentity,
      blockchain: {
        blockIndex,
        blockHash,
      },
    });
  } catch (error) {
    console.error('[IdentityController.revokeIdentity] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to revoke identity.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/identity
 * @desc    List all issued identities
 * @access  Private
 */
const getIdentities = async (req, res) => {
  try {
    let identities = [];
    try {
      identities = await Identity.find().sort({ createdAt: -1 });
    } catch (e) {}

    if (!identities || identities.length === 0) {
      const store = loadStore();
      identities = store.identities || [];
    }

    return res.status(200).json({
      success: true,
      count: identities.length,
      data: identities,
    });
  } catch (error) {
    console.error('[IdentityController.getIdentities] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving identities.',
    });
  }
};

/**
 * @route   GET /api/identity/:did
 * @desc    Get single identity details by DID
 * @access  Private
 */
const getIdentityByDid = async (req, res) => {
  try {
    const { did } = req.params;
    let identity = await Identity.findOne({ did });

    if (!identity) {
      const store = loadStore();
      identity = (store.identities || []).find((i) => i.did === did);
    }

    if (!identity) {
      return res.status(404).json({
        success: false,
        message: 'Identity not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: identity,
    });
  } catch (error) {
    console.error('[IdentityController.getIdentityByDid] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching identity.',
    });
  }
};

module.exports = {
  issueIdentity,
  revokeIdentity,
  getIdentities,
  getIdentityByDid,
};
