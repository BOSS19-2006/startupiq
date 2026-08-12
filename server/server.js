require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[StartupIQ API] listening on port ${PORT}`);
    if (!process.env.GEMINI_API_KEY) {
      console.warn('[StartupIQ API] GEMINI_API_KEY not set - analysis requests will run in DEMO MODE.');
    }
  });
}

start();
