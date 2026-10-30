const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  let dbStatus = 'healthy';
  let dbLatency = null;
  const start = Date.now();

  try {
    await pool.query('SELECT 1');
    dbLatency = `${Date.now() - start}ms`;
  } catch (err) {
    dbStatus = `unhealthy: ${err.message}`;
  }

  return res.json({
    status: dbStatus === 'healthy' ? 'ok' : 'degraded',
    service: 'Surat Weather Intelligence Backend API',
    city: 'Surat, Gujarat, India',
    coordinates: { latitude: 21.1702, longitude: 72.8311 },
    database: {
      status: dbStatus,
      latency: dbLatency
    },
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

