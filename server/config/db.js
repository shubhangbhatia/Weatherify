const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'surat_weather_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  timezone: '+00:00',
  dateStrings: true
};

if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
  dbConfig.ssl = {
    rejectUnauthorized: false
  };
}

let pool;
if (process.env.DATABASE_URL) {
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  pool = mysql.createPool(dbConfig);
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] MySQL connected successfully to '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
