const mongoose = require('mongoose');

// Disable buffering so queries fail immediately to fallback rather than hanging 10 seconds
mongoose.set('bufferCommands', false);

let isConnected = false;

/**
 * Connects to MongoDB (Atlas or Local instance).
 * If MongoDB is not running, the application uses local JSON fallback automatically.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.includes('<username>')) {
    console.log('[Database] No MongoDB Atlas URI provided in .env.');
    console.log('[Database] ⚡ Active Mode: Local Offline Storage Engine (Zero Setup / Instant Demo).');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.log(`[Database] MongoDB connection notice: ${error.message}`);
    console.log('[Database] ⚡ Active Mode: Local Offline Storage Engine (Zero Setup / Instant Demo).');
    return false;
  }
};

const getIsConnected = () => isConnected && mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.getIsConnected = getIsConnected;
