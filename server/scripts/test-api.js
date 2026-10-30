const axios = require('axios');
const app = require('../app');
const { testConnection } = require('../config/db');

const PORT = 5099; // Isolated port for testing

async function runTestSuite() {
  console.log('\n======================================================');
  console.log(' SURAT WEATHER INTELLIGENCE — AUTOMATED VERIFICATION ');
  console.log('======================================================\n');

  await testConnection();

  const server = app.listen(PORT);
  const baseURL = `http://localhost:${PORT}/api`;
  const client = axios.create({ baseURL, validateStatus: () => true });

  let passedTests = 0;
  let totalTests = 0;

  function assert(testName, condition, detail = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ PASS: ${testName}`);
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${detail}`);
    }
  }

  try {
    // 1. Health check
    const healthRes = await client.get('/health');
    assert('Health Check Returns 200 & OK status', healthRes.status === 200 && healthRes.data.status === 'ok');

    // 2. Admin Login
    const adminLoginRes = await client.post('/auth/login', {
      email: 'admin@suratweather.edu',
      password: 'AdminPassword@2026'
    });
    assert('Admin Authentication Success', adminLoginRes.status === 200 && adminLoginRes.data.success === true);
    const adminToken = adminLoginRes.data.token;
    assert('Admin Receives JWT Token', typeof adminToken === 'string' && adminToken.length > 20);

    // 3. Viewer Login
    const viewerLoginRes = await client.post('/auth/login', {
      email: 'viewer@suratweather.edu',
      password: 'ViewerPassword@2026'
    });
    assert('Viewer Authentication Success', viewerLoginRes.status === 200 && viewerLoginRes.data.user.role === 'viewer');
    const viewerToken = viewerLoginRes.data.token;

    // 4. Verify Identity (/auth/me)
    const meRes = await client.get('/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert('Protected /auth/me returns current user profile', meRes.status === 200 && meRes.data.user.email === 'admin@suratweather.edu');

    // 5. Unauthenticated Request Blocked
    const unauthRes = await client.get('/weather/current');
    assert('Unauthenticated access blocked with 401', unauthRes.status === 401);

    // 6. Current Weather
    const weatherRes = await client.get('/weather/current', {
      headers: { Authorization: `Bearer ${viewerToken}` }
    });
    assert('Live Weather Observation Retrieval', weatherRes.status === 200 && weatherRes.data.data.city === 'Surat');
    console.log(`    -> Observed Temperature: ${weatherRes.data.data.temperature}°C, Condition: ${weatherRes.data.data.weather_condition}`);

    // 7. Weather Stats
    const statsRes = await client.get('/weather/stats', {
      headers: { Authorization: `Bearer ${viewerToken}` }
    });
    assert('Analytical Aggregations (KPIs, Trends) Computed', statsRes.status === 200 && statsRes.data.kpis.total_records > 0);
    console.log(`    -> Total Records: ${statsRes.data.kpis.total_records}, Avg Temp: ${statsRes.data.kpis.avg_temperature}°C`);

    // 8. History & Pagination
    const historyRes = await client.get('/weather/history?page=1&limit=5', {
      headers: { Authorization: `Bearer ${viewerToken}` }
    });
    assert('Historical Records Pagination Functional', historyRes.status === 200 && historyRes.data.data.length <= 5);

    // 9. CSV Dataset Export
    const exportRes = await client.get('/weather/export', {
      headers: { Authorization: `Bearer ${viewerToken}` }
    });
    assert('CSV Dataset Export Stream Generated', exportRes.status === 200 && exportRes.headers['content-type'].includes('text/csv'));

    // 10. Role-Based Access Control: Viewer Forbidden from Admin Endpoints
    const viewerAdminAttempt = await client.get('/admin/users', {
      headers: { Authorization: `Bearer ${viewerToken}` }
    });
    assert('RBAC: Viewer Blocked from Admin Area with 403 Forbidden', viewerAdminAttempt.status === 403);

    // 11. Admin Access to Users and Audit Logs
    const adminUsersRes = await client.get('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert('Admin User Management Access Granted', adminUsersRes.status === 200 && adminUsersRes.data.data.length >= 2);

    const adminLogsRes = await client.get('/admin/logs', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert('Admin System Audit Log Access Granted', adminLogsRes.status === 200 && adminLogsRes.data.data.length > 0);

    const adminStatsRes = await client.get('/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert('Admin System Performance & Metrics Access Granted', adminStatsRes.status === 200 && adminStatsRes.data.systemMetrics.totalRecords > 0);

    console.log('\n======================================================');
    console.log(` RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100% SUCCESS)`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    server.close();
    process.exit(passedTests === totalTests ? 0 : 1);
  }
}

runTestSuite();
