require('dotenv').config();
const app = require('./app');
const { getPool } = require('./config/database');

const PORT = process.env.PORT || 3003;

const startServer = async () => {
  try {
    await getPool();
    console.log('✅ Connected to Azure SQL Database');

    app.listen(PORT, () => {
      console.log(`🚀 VIBRA Functions Service running on port ${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log(`\n📌 Available Functions (HTTP Triggers):`);
      console.log(`   POST http://localhost:${PORT}/api/ReviewEvent`);
      console.log(`   POST http://localhost:${PORT}/api/EventCreated`);
      console.log(`   GET  http://localhost:${PORT}/api/GetEventReviews/:eventId`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
