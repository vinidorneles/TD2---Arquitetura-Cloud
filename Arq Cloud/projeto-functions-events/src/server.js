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
      console.log(`💚 Health check: http:
      console.log(`\n📌 Available Functions (HTTP Triggers):`);
      console.log(`   POST http:
      console.log(`   POST http:
      console.log(`   GET  http:
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
