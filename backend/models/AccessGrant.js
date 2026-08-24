const mongoose = require('mongoose');
const { createOfflineModel } = require('./localStore');
const { getIsConnected } = require('../config/db');

const accessGrantSchema = new mongoose.Schema(
  {
    grantId: {
      type: String,
      required: true,
      unique: true,
    },
    did: {
      type: String,
      required: true,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
    },
    requiredClearance: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    grantedBy: {
      type: String,
      default: 'BEL-Authority',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'REVOKED'],
      default: 'ACTIVE',
    },
    blockchainBlockIndex: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseAccessGrant = mongoose.models.AccessGrant || mongoose.model('AccessGrant', accessGrantSchema);
const OfflineAccessGrant = createOfflineModel('access_grants');

const AccessGrantProxy = new Proxy(MongooseAccessGrant, {
  get(target, prop) {
    if (getIsConnected()) {
      return target[prop];
    }
    if (typeof OfflineAccessGrant[prop] === 'function') {
      return OfflineAccessGrant[prop].bind(OfflineAccessGrant);
    }
    return target[prop];
  },
});

module.exports = AccessGrantProxy;
