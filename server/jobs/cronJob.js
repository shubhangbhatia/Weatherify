const cron = require('node-cron');
const { syncCurrentWeather } = require('../services/weatherService');
const { logAction } = require('../services/logService');

let weatherCronJob = null;

function startWeatherCron() {
  // Run every 10 minutes: '*/10 * * * *'
  console.log('[Cron] Initializing Surat weather ingestion schedule (every 10 minutes)...');

  weatherCronJob = cron.schedule('*/10 * * * *', async () => {
    console.log(`[Cron] [${new Date().toISOString()}] Executing scheduled 10-minute Surat weather capture...`);
    try {
      const result = await syncCurrentWeather();
      console.log(`[Cron] Weather sync successful: Temp: ${result.record?.temperature}°C, Cond: ${result.record?.weather_condition}`);
      await logAction(null, 'CRON_INGESTION', `Automatic 10-min observation recorded: ${result.record?.temperature}°C, ${result.record?.weather_condition}`);
    } catch (err) {
      console.error('[Cron] Weather ingestion job encountered error:', err.message);
    }
  });

  return weatherCronJob;
}

function stopWeatherCron() {
  if (weatherCronJob) {
    weatherCronJob.stop();
    console.log('[Cron] Surat weather ingestion schedule stopped.');
  }
}

module.exports = {
  startWeatherCron,
  stopWeatherCron
};
