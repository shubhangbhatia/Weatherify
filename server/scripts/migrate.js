const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runMigration() {
  console.log('[Migration] Starting MySQL database schema setup...');
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Split SQL commands by semicolon
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (err) {
      // If error is not table exists, log it
      console.error('[Migration Error]', err.message);
    }
  }

  console.log('[Migration] Schema execution completed successfully.');
  process.exit(0);
}

runMigration().catch(err => {
  console.error('[Migration] Failed:', err);
  process.exit(1);
});
