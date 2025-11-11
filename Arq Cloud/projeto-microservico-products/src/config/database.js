const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

const getPool = async (retries = 5) => {
  if (!pool) {
    for (let i = 0; i < retries; i++) {
      try {
        // First connect to master to create database if it doesn't exist
        const masterConfig = { ...config, database: 'master' };
        const masterPool = await sql.connect(masterConfig);

        const dbName = config.database;
        const result = await masterPool.request()
          .query(`SELECT database_id FROM sys.databases WHERE name = '${dbName}'`);

        if (result.recordset.length === 0) {
          await masterPool.request().query(`CREATE DATABASE [${dbName}]`);
          console.log(`Database '${dbName}' created`);
        }

        await masterPool.close();

        // Now connect to the actual database
        pool = await sql.connect(config);
        console.log('Azure SQL Database Connected');
        break;
      } catch (error) {
        console.error(`Database connection attempt ${i + 1}/${retries} failed:`, error.message);
        if (i === retries - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  return pool;
};

module.exports = { getPool, sql };
