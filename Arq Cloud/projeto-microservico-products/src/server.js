require('dotenv').config();
const app = require('./app');
const { getPool } = require('./config/database');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3002;

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database
    const pool = await getPool();
    console.log('✅ Connected to Azure SQL Database');

    // Initialize database schema (run init script)
    const initScript = fs.readFileSync(
      path.join(__dirname, 'config', 'initDatabase.sql'),
      'utf8'
    );

    // Execute each statement separately
    const statements = initScript.split('GO').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.request().query(statement);
      }
    }
    console.log('✅ Database schema initialized');

    // Start server
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
