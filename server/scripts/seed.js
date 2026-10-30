const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runSeed() {
  console.log('[Seed] Seeding database with evaluation users and Surat weather dataset...');
  const seedPath = path.join(__dirname, '../../database/seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  // Split by semicolon (ignoring comments)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (err) {
      console.warn('[Seed Warning]', err.message);
    }
  }

  const [users] = await pool.query('SELECT COUNT(*) AS total FROM users');
  const [records] = await pool.query('SELECT COUNT(*) AS total FROM weather_records');
  console.log(`[Seed Complete] Total Users: ${users[0].total}, Total Records: ${records[0].total}`);
  process.exit(0);
}

runSeed().catch(err => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});

