const AccessLog = require('../models/AccessLog');
const User = require('../models/User');
const Identity = require('../models/Identity');
const AccessGrant = require('../models/AccessGrant');
const Asset = require('../models/Asset');
const blockchainService = require('../services/blockchainService');

/**
 * @route   GET /api/audit
 * @desc    Get immutable audit logs and on-chain ledger events
 * @access  Private (Admin & Auditor)
 */
const getAuditLogs = async (req, res) => {
  try {
    const { did, decision, limit = 50 } = req.query;

    const filter = {};
    if (did) filter.did = did;
    if (decision) filter.decision = decision.toUpperCase();

    // Fetch indexed fast queries from MongoDB
    const logs = await AccessLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    // Also fetch direct on-chain audit transactions
    let blockchainAudit = [];
    try {
      const chainAudit = await blockchainService.getAuditTrail();
      blockchainAudit = chainAudit.transactions || [];
    } catch (e) {
      console.warn('[AuditController] Blockchain audit fetch failed:', e.message);
    }

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
      onChainTransactions: blockchainAudit,
    });
  } catch (error) {
    console.error('[AuditController.getAuditLogs] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching audit logs.',
    });
  }
};

/**
 * @route   GET /api/audit/:did
 * @desc    Get audit trail for a specific DID
 * @access  Private
 */
const getAuditByDid = async (req, res) => {
  try {
    const { did } = req.params;
    const logs = await AccessLog.find({ did }).sort({ timestamp: -1 });

    return res.status(200).json({
      success: true,
      did,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('[AuditController.getAuditByDid] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching audit logs for DID.',
    });
  }
};

/**
 * @route   GET /api/blockchain/status
 * @desc    Get full blockchain validation status, block height, and health
 * @access  Private
 */
const getBlockchainStatus = async (req, res) => {
  try {
    const [chainData, validation, health] = await Promise.all([
      blockchainService.getChain().catch(() => ({ length: 0, chain: [] })),
      blockchainService.validateChain().catch((e) => ({ valid: false, message: e.message })),
      blockchainService.getHealth().catch((e) => ({ status: 'offline', error: e.message })),
    ]);

    return res.status(200).json({
      success: true,
      service: health,
      validation: validation,
      blockHeight: chainData.length || (chainData.chain ? chainData.chain.length : 0),
      chain: chainData.chain || [],
    });
  } catch (error) {
    console.error('[AuditController.getBlockchainStatus] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching blockchain status.',
    });
  }
};

/**
 * @route   GET /api/audit/stats
 * @desc    Aggregated metrics for high-level dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeIdentities,
      activeGrants,
      totalAssets,
      totalAttempts,
      allowedAttempts,
      deniedAttempts,
      chainStatus,
    ] = await Promise.all([
      User.countDocuments().catch(() => 0),
      Identity.countDocuments({ status: 'ACTIVE' }).catch(() => 0),
      AccessGrant.countDocuments({ status: 'ACTIVE' }).catch(() => 0),
      Asset.countDocuments().catch(() => 0),
      AccessLog.countDocuments().catch(() => 0),
      AccessLog.countDocuments({ decision: 'ALLOWED' }).catch(() => 0),
      AccessLog.countDocuments({ decision: 'DENIED' }).catch(() => 0),
      blockchainService.validateChain().catch(() => ({ valid: false, message: 'Blockchain Offline' })),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeIdentities,
        activeGrants,
        totalAssets,
        totalAttempts,
        allowedAttempts,
        deniedAttempts,
        blockchain: {
          isValid: chainStatus.valid || false,
          validationMessage: chainStatus.message || '',
          blocksCount: chainStatus.blocks_count || 0,
        },
      },
    });
  } catch (error) {
    console.error('[AuditController.getDashboardStats] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error computing dashboard metrics.',
    });
  }
};

/**
 * @route   GET /api/health
 * @desc    System-wide health check
 * @access  Public
 */
const getHealth = async (req, res) => {
  const blockchainHealth = await blockchainService.getHealth();
  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    backend: 'healthy',
    blockchainService: blockchainHealth,
  });
};

module.exports = {
  getAuditLogs,
  getAuditByDid,
  getBlockchainStatus,
  getDashboardStats,
  getHealth,
};
