const mongoose = require('mongoose');
const { createOfflineModel } = require('./localStore');
const { getIsConnected } = require('../config/db');

const identitySchema = new mongoose.Schema(
  {
    did: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    credentialId: {
      type: String,
      required: true,
      unique: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    clearanceLevel: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    issuer: {
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

const MongooseIdentity = mongoose.models.Identity || mongoose.model('Identity', identitySchema);
const OfflineIdentity = createOfflineModel('identities');

const IdentityProxy = new Proxy(MongooseIdentity, {
  get(target, prop) {
    if (getIsConnected()) {
      return target[prop];
    }
    if (typeof OfflineIdentity[prop] === 'function') {
      return OfflineIdentity[prop].bind(OfflineIdentity);
    }
    return target[prop];
  },
});

module.exports = IdentityProxy;
