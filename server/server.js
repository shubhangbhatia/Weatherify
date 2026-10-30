const app = require('./app');
const { testConnection, pool } = require('./config/db');
const { startWeatherCron } = require('./jobs/cronJob');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  console.log('----------------------------------------------------');
  console.log(' SURAT WEATHER INTELLIGENCE SYSTEM — BACKEND ENGINE ');
  console.log('----------------------------------------------------');

  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('[Warning] MySQL connection could not be established immediately. Verify your DB credentials.');
  } else {
    // Ensure default evaluation admin exists if table is empty
    try {
      const [adminRows] = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      if (adminRows.length === 0) {
        console.log('[Bootstrap] No admin account detected. Provisioning evaluation admin account...');
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@suratweather.edu';
        const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword@2026';
        const hash = await bcrypt.hash(adminPassword, 10);
        await pool.query(
          "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
          ['Dr. Rajesh Patel (Lead Administrator)', adminEmail, hash]
        );
        console.log(`[Bootstrap] Evaluation admin account created: ${adminEmail}`);
      }
    } catch (err) {
      console.warn('[Bootstrap] Auto-seed check warning:', err.message);
    }
  }

  // Start automated 10-minute weather collection cron
  startWeatherCron();

  const server = app.listen(PORT, () => {
    console.log(`[Server] Surat Weather Intelligence API listening on http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Server] Target Station: Surat, Gujarat (21.1702 N, 72.8311 E)`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n[Server] Graceful shutdown initiated...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      pool.end().then(() => {
        console.log('[Database] Connection pool closed.');
        process.exit(0);
      });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();

