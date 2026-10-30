const { pool } = require('../config/db');
const { logAction } = require('../services/logService');

// GET /api/admin/users
async function getUsers(req, res) {
  try {
    const [users] = await pool.query(
      'SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('[AdminController.getUsers] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve system users.'
    });
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res) {
  try {
    const targetUserId = parseInt(req.params.id, 10);

    if (req.user.id === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot delete their own active account.'
      });
    }

    const [target] = await pool.query('SELECT email FROM users WHERE id = ?', [targetUserId]);
    if (target.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [targetUserId]);
    await logAction(req.user.id, 'DELETE_USER', `Admin deleted user account: ${target[0].email} (ID: ${targetUserId})`);

    return res.json({
      success: true,
      message: `User account '${target[0].email}' successfully removed.`
    });
  } catch (error) {
    console.error('[AdminController.deleteUser] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user account.'
    });
  }
}

// GET /api/admin/logs
async function getLogs(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit || '50', 10)));
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM system_logs');
    const totalLogs = countRows[0].total;

    const [logs] = await pool.query(`
      SELECT 
        l.id,
        l.user_id,
        l.action,
        l.description,
        l.created_at,
        u.email AS user_email,
        u.full_name AS user_name,
        u.role AS user_role
      FROM system_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    return res.json({
      success: true,
      pagination: {
        page,
        limit,
        totalLogs,
        totalPages: Math.ceil(totalLogs / limit) || 1
      },
      data: logs
    });
  } catch (error) {
    console.error('[AdminController.getLogs] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve system audit logs.'
    });
  }
}

// DELETE /api/admin/weather/:id
async function deleteWeatherRecord(req, res) {
  try {
    const recordId = parseInt(req.params.id, 10);
    const [existing] = await pool.query('SELECT observation_time, temperature FROM weather_records WHERE id = ?', [recordId]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Weather observation record not found.'
      });
    }

    await pool.query('DELETE FROM weather_records WHERE id = ?', [recordId]);
    await logAction(
      req.user.id,
      'DELETE_WEATHER_RECORD',
      `Admin deleted weather record ID: ${recordId} (Observed: ${existing[0].observation_time}, Temp: ${existing[0].temperature}°C)`
    );

    return res.json({
      success: true,
      message: `Weather record ID ${recordId} successfully removed.`
    });
  } catch (error) {
    console.error('[AdminController.deleteWeatherRecord] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete weather record.'
    });
  }
}

// GET /api/admin/stats
async function getAdminStats(req, res) {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) AS total FROM users');
    const [recordCount] = await pool.query('SELECT COUNT(*) AS total FROM weather_records');
    const [lastCollection] = await pool.query('SELECT observation_time, created_at, temperature, weather_condition FROM weather_records ORDER BY created_at DESC LIMIT 1');
    const [recentErrors] = await pool.query("SELECT COUNT(*) AS error_count FROM system_logs WHERE action LIKE '%ERROR%' OR action LIKE '%FAIL%'");

    return res.json({
      success: true,
      systemMetrics: {
        totalUsers: userCount[0].total,
        totalRecords: recordCount[0].total,
        lastCollectionTime: lastCollection[0]?.created_at || null,
        lastObservationTime: lastCollection[0]?.observation_time || null,
        lastObservationTemp: lastCollection[0]?.temperature || null,
        lastObservationCondition: lastCollection[0]?.weather_condition || null,
        systemErrorCount: recentErrors[0].error_count,
        serverUptimeSeconds: Math.floor(process.uptime()),
        nodeEnvironment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('[AdminController.getAdminStats] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrative system metrics.'
    });
  }
}

module.exports = {
  getUsers,
  deleteUser,
  getLogs,
  deleteWeatherRecord,
  getAdminStats
};
