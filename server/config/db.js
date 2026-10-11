const mongoose = require('mongoose');
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const { autoSeedIfEmpty } = require('./seedHelper');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_app';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.error('\n============================================================');
    console.error('❌ MONGODB CONNECTION ERROR:');
    console.error(`   ${error.message}`);
    console.error('------------------------------------------------------------');
    console.error('💡 HOW TO FIX THIS IN 1 STEP:');
    if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      console.error(' 1. Option A: Start local MongoDB service / mongod on port 27017.');
      console.error(' 2. Option B (Recommended): Paste your MongoDB Atlas cloud URI in `server/.env`:');
      console.error('    MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/restaurant_app');
    } else {
      console.error(' 1. Check your Atlas username and password in server/.env');
      console.error(' 2. Ensure your current IP is allowed in Atlas Network Access');
    }
    console.error('============================================================\n');
    process.exit(1);
  }
};

module.exports = connectDB;
