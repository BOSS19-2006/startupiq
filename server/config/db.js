const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI is not set. Set it in your .env file.');
    process.exit(1);
  }
  try {
    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false); // fail fast instead of hanging when DB is down
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`[DB] Connected to MongoDB: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('[DB] MongoDB connection failed:', err.message);
    console.error('[DB] The server will keep running, but any database operation will fail until MongoDB is reachable.');
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected.');
  });
  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB error:', err.message);
  });
}

module.exports = connectDB;
