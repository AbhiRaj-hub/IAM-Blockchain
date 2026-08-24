const mongoose = require('mongoose');
const { createOfflineModel } = require('./localStore');
const { getIsConnected } = require('../config/db');

const accessLogSchema = new mongoose.Schema(
  {
    did: {
      type: String,
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
    decision: {
      type: String,
      enum: ['ALLOWED', 'DENIED'],
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    blockchainBlockIndex: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseAccessLog = mongoose.models.AccessLog || mongoose.model('AccessLog', accessLogSchema);
const OfflineAccessLog = createOfflineModel('access_logs');

const AccessLogProxy = new Proxy(MongooseAccessLog, {
  get(target, prop) {
    if (getIsConnected()) {
      return target[prop];
    }
    if (typeof OfflineAccessLog[prop] === 'function') {
      return OfflineAccessLog[prop].bind(OfflineAccessLog);
    }
    return target[prop];
  },
});

module.exports = AccessLogProxy;
