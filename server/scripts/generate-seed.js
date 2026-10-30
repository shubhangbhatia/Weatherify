const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const adminHash = bcrypt.hashSync('AdminPassword@2026', 10);
const viewerHash = bcrypt.hashSync('ViewerPassword@2026', 10);

const records = [];
const conditions = [
  { cond: 'Clear', desc: 'clear sky', cloud: 8, icon: '01d' },
  { cond: 'Clouds', desc: 'scattered clouds', cloud: 35, icon: '03d' },
  { cond: 'Haze', desc: 'haze', cloud: 20, icon: '50d' },
  { cond: 'Clouds', desc: 'broken clouds', cloud: 60, icon: '04d' },
  { cond: 'Clear', desc: 'few clouds', cloud: 15, icon: '02d' }
];

const now = new Date();
// Generate 7 days of historical observations every 3 hours (56 records)
for (let i = 56; i >= 0; i--) {
  const obsDate = new Date(now.getTime() - i * 3 * 3600 * 1000);
  const hour = obsDate.getHours();
  
  // Diurnal temperature curve in Surat: coolest around 5-6 AM (23-25C), warmest around 2-3 PM (33-35C)
  const diurnalCycle = Math.sin(((hour - 8) / 24) * 2 * Math.PI); // -1 to +1
  const baseTemp = 29.5 + diurnalCycle * 4.5 + (Math.random() * 1.2 - 0.6);
  const temp = parseFloat(baseTemp.toFixed(2));
  const minTemp = parseFloat((temp - 1.8 - Math.random() * 0.8).toFixed(2));
  const maxTemp = parseFloat((temp + 1.8 + Math.random() * 0.8).toFixed(2));
  
  // Humidity inversely correlated with temp: higher at dawn, lower at noon
  const humidity = Math.min(92, Math.max(38, Math.round(62 - diurnalCycle * 22 + (Math.random() * 6 - 3))));
  
  // Feels like calculation approximation
  const feelsLike = parseFloat((temp + (humidity > 60 ? (humidity - 55) * 0.12 : -0.5)).toFixed(2));
  
  // Pressure around 1011 hPa with slight tidal variation
  const pressure = Math.round(1011 + Math.cos((hour / 12) * Math.PI) * 2.5 + (Math.random() * 1.5 - 0.75));
  
  // Wind speed (m/s) higher in afternoon sea breeze
  const windSpeed = parseFloat((3.2 + (diurnalCycle > 0 ? diurnalCycle * 2.5 : 0.5) + (Math.random() * 1.2 - 0.6)).toFixed(2));
  const windDirection = Math.round(210 + Math.random() * 60); // SW sea breeze typical of Surat coast
  
  const visibility = humidity > 75 ? 6000 : (humidity > 60 ? 8000 : 10000);
  
  const condIdx = (Math.floor(i / 4) + (humidity > 70 ? 2 : 0)) % conditions.length;
  const condInfo = conditions[condIdx];
  const cloudCoverage = Math.min(100, Math.max(0, condInfo.cloud + Math.round(Math.random() * 16 - 8)));

  const sunrise = new Date(obsDate);
  sunrise.setHours(6, 38, 0, 0);
  const sunset = new Date(obsDate);
  sunset.setHours(18, 5, 0, 0);

  const formatSqlDate = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

  records.push({
    city: 'Surat',
    country: 'IN',
    latitude: 21.1702,
    longitude: 72.8311,
    temperature: temp,
    feels_like: feelsLike,
    min_temperature: minTemp,
    max_temperature: maxTemp,
    humidity,
    pressure,
    wind_speed: windSpeed,
    wind_direction: windDirection,
    visibility,
    cloud_coverage: cloudCoverage,
    weather_condition: condInfo.cond,
    weather_description: condInfo.desc,
    sunrise_at: formatSqlDate(sunrise),
    sunset_at: formatSqlDate(sunset),
    observation_time: formatSqlDate(obsDate)
  });
}

// 1. Generate SQL Seed
let sql = `-- =====================================================================
-- SURAT WEATHER INTELLIGENCE SYSTEM
-- Database Seed Data (Users, Historical Observations, System Logs)
-- =====================================================================

USE \`surat_weather_db\`;

-- Clear existing data
DELETE FROM \`system_logs\`;
DELETE FROM \`weather_records\`;
DELETE FROM \`users\`;

-- Seed Users
-- Admin: admin@suratweather.edu / AdminPassword@2026
-- Viewer: viewer@suratweather.edu / ViewerPassword@2026
INSERT INTO \`users\` (\`id\`, \`full_name\`, \`email\`, \`password_hash\`, \`role\`, \`created_at\`) VALUES
(1, 'Dr. Rajesh Patel', 'admin@suratweather.edu', '${adminHash}', 'admin', NOW()),
(2, 'Priya Sharma', 'viewer@suratweather.edu', '${viewerHash}', 'viewer', NOW());

-- Seed Initial System Logs
INSERT INTO \`system_logs\` (\`user_id\`, \`action\`, \`description\`, \`created_at\`) VALUES
(1, 'SYSTEM_INIT', 'Surat Weather Intelligence system initialized with baseline parameters', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(1, 'CRON_SCHEDULED', 'Automated 10-minute meteorological ingestion job started', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 'DATASET_EXPORT', 'Baseline weather records exported for academic analysis', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Seed Weather Observations for Surat
INSERT INTO \`weather_records\` 
(\`city\`, \`country\`, \`latitude\`, \`longitude\`, \`temperature\`, \`feels_like\`, \`min_temperature\`, \`max_temperature\`, \`humidity\`, \`pressure\`, \`wind_speed\`, \`wind_direction\`, \`visibility\`, \`cloud_coverage\`, \`weather_condition\`, \`weather_description\`, \`sunrise_at\`, \`sunset_at\`, \`observation_time\`)
VALUES
`;

const valuesList = records.map(r => 
  `('${r.city}', '${r.country}', ${r.latitude}, ${r.longitude}, ${r.temperature}, ${r.feels_like}, ${r.min_temperature}, ${r.max_temperature}, ${r.humidity}, ${r.pressure}, ${r.wind_speed}, ${r.wind_direction}, ${r.visibility}, ${r.cloud_coverage}, '${r.weather_condition}', '${r.weather_description}', '${r.sunrise_at}', '${r.sunset_at}', '${r.observation_time}')`
).join(',\n');

sql += valuesList + ';\n';

fs.writeFileSync(path.join(__dirname, '../../database/seed.sql'), sql, 'utf8');
console.log('Successfully wrote database/seed.sql with ' + records.length + ' records.');

// 2. Export dataset/weather_records.csv
const csvHeader = 'id,city,country,latitude,longitude,temperature,feels_like,min_temperature,max_temperature,humidity,pressure,wind_speed,wind_direction,visibility,cloud_coverage,weather_condition,weather_description,sunrise_at,sunset_at,observation_time\n';
const csvRows = records.map((r, idx) => 
  `${idx + 1},${r.city},${r.country},${r.latitude},${r.longitude},${r.temperature},${r.feels_like},${r.min_temperature},${r.max_temperature},${r.humidity},${r.pressure},${r.wind_speed},${r.wind_direction},${r.visibility},${r.cloud_coverage},"${r.weather_condition}","${r.weather_description}",${r.sunrise_at},${r.sunset_at},${r.observation_time}`
).join('\n');

fs.writeFileSync(path.join(__dirname, '../../dataset/weather_records.csv'), csvHeader + csvRows, 'utf8');
console.log('Successfully generated dataset/weather_records.csv');
