const { pool } = require('../config/db');
const { syncCurrentWeather, getLatestSavedObservation } = require('../services/weatherService');
const { logAction } = require('../services/logService');

// GET /api/weather/current
async function getCurrent(req, res) {
  try {
    const result = await syncCurrentWeather(req.user?.id);
    return res.json({
      success: true,
      data: result.record,
      isLive: result.isLive,
      source: result.source,
      warning: result.warning || null
    });
  } catch (error) {
    console.error('[WeatherController.getCurrent] Error:', error.message);
    const cached = await getLatestSavedObservation();
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        isLive: false,
        source: 'MySQL Local Repository',
        warning: 'Live meteorological link unavailable. Showing last persisted observation.'
      });
    }
    return res.status(503).json({
      success: false,
      message: 'Weather service unavailable and no cached observation found.'
    });
  }
}

// POST /api/weather/refresh
async function refreshCurrent(req, res) {
  try {
    const result = await syncCurrentWeather(req.user?.id);
    return res.json({
      success: true,
      message: 'Weather observation refreshed successfully.',
      data: result.record,
      isLive: result.isLive,
      source: result.source,
      warning: result.warning || null
    });
  } catch (error) {
    console.error('[WeatherController.refreshCurrent] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh current weather observation.'
    });
  }
}

// GET /api/weather/history
async function getHistory(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(200, Math.max(5, parseInt(req.query.limit || '20', 10)));
    const offset = (page - 1) * limit;

    const { startDate, endDate, condition, search } = req.query;

    let whereClauses = [];
    let queryParams = [];

    if (startDate) {
      whereClauses.push('observation_time >= ?');
      queryParams.push(startDate + ' 00:00:00');
    }

    if (endDate) {
      whereClauses.push('observation_time <= ?');
      queryParams.push(endDate + ' 23:59:59');
    }

    if (condition && condition !== 'all') {
      whereClauses.push('weather_condition = ?');
      queryParams.push(condition);
    }

    if (search) {
      whereClauses.push('(weather_description LIKE ? OR weather_condition LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Count total matching records
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM weather_records ${whereSQL}`,
      queryParams
    );
    const totalRecords = countResult[0].total;

    // Fetch paginated records
    const [records] = await pool.query(
      `SELECT * FROM weather_records ${whereSQL} ORDER BY observation_time DESC, id DESC LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    return res.json({
      success: true,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit) || 1
      },
      data: records
    });
  } catch (error) {
    console.error('[WeatherController.getHistory] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve weather history.'
    });
  }
}

// GET /api/weather/stats
async function getStats(req, res) {
  try {
    const { days = 7 } = req.query;
    const numDays = Math.min(30, Math.max(1, parseInt(days, 10)));

    // Overall summary KPIs
    const [kpiRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_records,
        ROUND(AVG(temperature), 2) AS avg_temperature,
        MIN(min_temperature) AS min_temperature,
        MAX(max_temperature) AS max_temperature,
        ROUND(AVG(humidity), 2) AS avg_humidity,
        ROUND(AVG(wind_speed), 2) AS avg_wind_speed,
        ROUND(AVG(pressure), 2) AS avg_pressure
      FROM weather_records
    `);

    // Daily time-series trends (last N days)
    const [dailyTrends] = await pool.query(`
      SELECT 
        DATE(observation_time) AS observation_date,
        ROUND(AVG(temperature), 2) AS avg_temperature,
        MIN(min_temperature) AS min_temperature,
        MAX(max_temperature) AS max_temperature,
        ROUND(AVG(humidity), 2) AS avg_humidity,
        ROUND(AVG(wind_speed), 2) AS avg_wind_speed,
        ROUND(AVG(pressure), 2) AS avg_pressure,
        COUNT(*) AS sample_count
      FROM weather_records
      WHERE observation_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(observation_time)
      ORDER BY observation_date ASC
    `, [numDays]);

    // Hourly / recent time-series observations for high-res dashboard chart
    const [recentObservations] = await pool.query(`
      SELECT 
        id,
        observation_time,
        temperature,
        feels_like,
        humidity,
        pressure,
        wind_speed,
        weather_condition
      FROM weather_records
      ORDER BY observation_time DESC
      LIMIT 24
    `);

    // Weather condition distribution
    const [conditionDist] = await pool.query(`
      SELECT 
        weather_condition,
        COUNT(*) AS count
      FROM weather_records
      GROUP BY weather_condition
      ORDER BY count DESC
    `);

    return res.json({
      success: true,
      kpis: kpiRows[0] || {},
      dailyTrends,
      recentObservations: recentObservations.reverse(), // ascending chronological order for charts
      conditionDistribution: conditionDist
    });
  } catch (error) {
    console.error('[WeatherController.getStats] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute weather analytics statistics.'
    });
  }
}

// GET /api/weather/export
async function exportCsv(req, res) {
  try {
    const { startDate, endDate } = req.query;
    let whereClauses = [];
    let queryParams = [];

    if (startDate) {
      whereClauses.push('observation_time >= ?');
      queryParams.push(startDate + ' 00:00:00');
    }
    if (endDate) {
      whereClauses.push('observation_time <= ?');
      queryParams.push(endDate + ' 23:59:59');
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const [rows] = await pool.query(
      `SELECT * FROM weather_records ${whereSQL} ORDER BY observation_time DESC`,
      queryParams
    );

    // Build CSV
    const headers = [
      'id', 'city', 'country', 'latitude', 'longitude',
      'temperature', 'feels_like', 'min_temperature', 'max_temperature',
      'humidity', 'pressure', 'wind_speed', 'wind_direction',
      'visibility', 'cloud_coverage', 'weather_condition', 'weather_description',
      'sunrise_at', 'sunset_at', 'observation_time', 'created_at'
    ];

    let csvContent = headers.join(',') + '\n';

    for (const r of rows) {
      const line = [
        r.id,
        `"${r.city}"`,
        `"${r.country}"`,
        r.latitude,
        r.longitude,
        r.temperature,
        r.feels_like,
        r.min_temperature,
        r.max_temperature,
        r.humidity,
        r.pressure,
        r.wind_speed,
        r.wind_direction,
        r.visibility,
        r.cloud_coverage,
        `"${r.weather_condition}"`,
        `"${(r.weather_description || '').replace(/"/g, '""')}"`,
        r.sunrise_at || '',
        r.sunset_at || '',
        r.observation_time,
        r.created_at
      ].join(',');
      csvContent += line + '\n';
    }

    if (req.user?.id) {
      await logAction(req.user.id, 'DATASET_EXPORT', `Exported ${rows.length} weather observations as CSV`);
    }

    const filename = `surat_weather_dataset_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('[WeatherController.exportCsv] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export weather dataset.'
    });
  }
}

module.exports = {
  getCurrent,
  refreshCurrent,
  getHistory,
  getStats,
  exportCsv
};
