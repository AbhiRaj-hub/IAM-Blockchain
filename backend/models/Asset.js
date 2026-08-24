const mongoose = require('mongoose');
const { createOfflineModel } = require('./localStore');
const { getIsConnected } = require('../config/db');

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: true,
      unique: true,
    },
    filename: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    sha256: {
      type: String,
      required: true,
    },
    ownerDid: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
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

const MongooseAsset = mongoose.models.Asset || mongoose.model('Asset', assetSchema);
const OfflineAsset = createOfflineModel('assets');

const AssetProxy = new Proxy(MongooseAsset, {
  get(target, prop) {
    if (getIsConnected()) {
      return target[prop];
    }
    if (typeof OfflineAsset[prop] === 'function') {
      return OfflineAsset[prop].bind(OfflineAsset);
    }
    return target[prop];
  },
});

module.exports = AssetProxy;
