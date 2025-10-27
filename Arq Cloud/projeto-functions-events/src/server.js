require('dotenv').config();
const app = require('./app');
const { getPool } = require('./config/database');

const PORT = process.env.PORT || 3003;

const startServer = async () => {
  try {
    // Connect to database
    await getPool();
    console.log('✅ Connected to Azure SQL Database');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 VIBRA Functions Service running on port ${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log(`\n📌 Available Functions (HTTP Triggers):`);
      console.log(`   POST http://localhost:${PORT}/api/functions/review-event`);
      console.log(`   POST http://localhost:${PORT}/api/functions/notification`);
      console.log(`   GET  http://localhost:${PORT}/api/functions/notifications/:userId`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
