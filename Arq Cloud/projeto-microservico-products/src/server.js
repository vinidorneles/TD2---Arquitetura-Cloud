require('dotenv').config();
const app = require('./app');
const { getPool } = require('./config/database');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    const pool = await getPool();
    console.log('✅ Connected to Azure SQL Database');

    const initScript = fs.readFileSync(
      path.join(__dirname, 'config', 'initDatabase.sql'),
      'utf8'
    );

    const statements = initScript.split('GO').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.request().query(statement);
      }
    }
    console.log('✅ Database schema initialized');

    app.listen(PORT, () => {
      console.log(`🚀 VIBRA Events Service running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
