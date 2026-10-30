const { pool } = require('../config/db');

async function logAction(userId, action, description) {
  try {
    await pool.query(
      `INSERT INTO system_logs (user_id, action, description, created_at) VALUES (?, ?, ?, NOW())`,
      [userId || null, action, description]
    );
  } catch (err) {
    console.error('[LogService] Failed to record system log:', err.message);
  }
}

module.exports = {
  logAction
};

