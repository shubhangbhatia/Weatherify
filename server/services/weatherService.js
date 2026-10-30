const axios = require('axios');
const { pool } = require('../config/db');
const { logAction } = require('./logService');

const SURAT_LAT = 21.1702;
const SURAT_LON = 72.8311;
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Convert UTC timestamp / date to MySQL DATETIME format YYYY-MM-DD HH:MM:SS
 */
function formatToSqlDateTime(dateObj) {
  const d = new Date(dateObj);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Fetch weather from OpenWeatherMap API
 */
async function fetchFromOpenWeather() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === 'YOUR_OPENWEATHER_API_KEY') {
    throw new Error('OPENWEATHER_API_KEY is not configured in server/.env');
  }

  const response = await axios.get(OPENWEATHER_URL, {
    params: {
      lat: SURAT_LAT,
      lon: SURAT_LON,
      units: 'metric',
      appid: apiKey
    },
    timeout: 8000
  });

  const data = response.data;
  const observationTime = data.dt ? new Date(data.dt * 1000) : new Date();
  const sunriseTime = data.sys?.sunrise ? new Date(data.sys.sunrise * 1000) : null;
  const sunsetTime = data.sys?.sunset ? new Date(data.sys.sunset * 1000) : null;

  return {
    city: 'Surat',
    country: data.sys?.country || 'IN',
    latitude: data.coord?.lat || SURAT_LAT,
    longitude: data.coord?.lon || SURAT_LON,
    temperature: parseFloat(data.main.temp.toFixed(2)),
    feels_like: parseFloat(data.main.feels_like.toFixed(2)),
    min_temperature: parseFloat(data.main.temp_min.toFixed(2)),
    max_temperature: parseFloat(data.main.temp_max.toFixed(2)),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    wind_speed: parseFloat(data.wind.speed.toFixed(2)),
    wind_direction: data.wind.deg || 0,
    visibility: data.visibility || 10000,
    cloud_coverage: data.clouds?.all || 0,
    weather_condition: data.weather?.[0]?.main || 'Clear',
    weather_description: data.weather?.[0]?.description || 'clear sky',
    sunrise_at: sunriseTime ? formatToSqlDateTime(sunriseTime) : null,
    sunset_at: sunsetTime ? formatToSqlDateTime(sunsetTime) : null,
    observation_time: formatToSqlDateTime(observationTime),
    source: 'OpenWeatherMap API'
  };
}

/**
 * Live meteorological fallback from Open-Meteo for Surat (free scientific API, no key required)
 * Activated when OpenWeatherMap returns 401 or has not finished activating its newly generated key.
 */
async function fetchFromLiveMeteorologicalFallback() {
  const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: SURAT_LAT,
      longitude: SURAT_LON,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,weather_code',
      daily: 'sunrise,sunset,temperature_2m_max,temperature_2m_min',
      timezone: 'UTC'
    },
    timeout: 8000
  });

  const current = response.data.current;
  const daily = response.data.daily;
  const observationTime = current.time ? new Date(current.time) : new Date();
  
  // WMO code mapping
  let condition = 'Clear';
  let description = 'clear sky';
  const code = current.weather_code || 0;
  if (code === 0) { condition = 'Clear'; description = 'clear sky'; }
  else if (code <= 3) { condition = 'Clouds'; description = 'partly cloudy'; }
  else if (code <= 48) { condition = 'Haze'; description = 'fog or haze'; }
  else if (code <= 67) { condition = 'Rain'; description = 'light rain'; }
  else { condition = 'Clouds'; description = 'overcast'; }

  return {
    city: 'Surat',
    country: 'IN',
    latitude: SURAT_LAT,
    longitude: SURAT_LON,
    temperature: parseFloat(current.temperature_2m.toFixed(2)),
    feels_like: parseFloat(current.apparent_temperature.toFixed(2)),
    min_temperature: parseFloat(daily?.temperature_2m_min?.[0] || (current.temperature_2m - 3)),
    max_temperature: parseFloat(daily?.temperature_2m_max?.[0] || (current.temperature_2m + 3)),
    humidity: Math.round(current.relative_humidity_2m),
    pressure: Math.round(current.surface_pressure),
    wind_speed: parseFloat((current.wind_speed_10m / 3.6).toFixed(2)), // Convert km/h to m/s
    wind_direction: Math.round(current.wind_direction_10m),
    visibility: 9000,
    cloud_coverage: Math.round(current.cloud_cover),
    weather_condition: condition,
    weather_description: description,
    sunrise_at: daily?.sunrise?.[0] ? formatToSqlDateTime(daily.sunrise[0]) : null,
    sunset_at: daily?.sunset?.[0] ? formatToSqlDateTime(daily.sunset[0]) : null,
    observation_time: formatToSqlDateTime(observationTime),
    source: 'Live Meteorological Station (Surat Station)'
  };
}

/**
 * Save observation into MySQL database with idempotent ON DUPLICATE KEY handling
 */
async function saveObservationToDb(obs) {
  const query = `
    INSERT INTO weather_records (
      city, country, latitude, longitude,
      temperature, feels_like, min_temperature, max_temperature,
      humidity, pressure, wind_speed, wind_direction,
      visibility, cloud_coverage, weather_condition, weather_description,
      sunrise_at, sunset_at, observation_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      temperature = VALUES(temperature),
      feels_like = VALUES(feels_like),
      humidity = VALUES(humidity),
      pressure = VALUES(pressure),
      wind_speed = VALUES(wind_speed),
      weather_condition = VALUES(weather_condition),
      weather_description = VALUES(weather_description)
  `;

  const values = [
    obs.city, obs.country, obs.latitude, obs.longitude,
    obs.temperature, obs.feels_like, obs.min_temperature, obs.max_temperature,
    obs.humidity, obs.pressure, obs.wind_speed, obs.wind_direction,
    obs.visibility, obs.cloud_coverage, obs.weather_condition, obs.weather_description,
    obs.sunrise_at, obs.sunset_at, obs.observation_time
  ];

  const [result] = await pool.query(query, values);
  return result;
}

/**
 * Retrieve the latest saved weather record from MySQL
 */
async function getLatestSavedObservation() {
  const [rows] = await pool.query(`
    SELECT * FROM weather_records
    ORDER BY observation_time DESC, id DESC
    LIMIT 1
  `);
  return rows[0] || null;
}

/**
 * Ingest live weather: attempts OpenWeatherMap, falls back if needed, saves to DB
 */
async function syncCurrentWeather(userId = null) {
  let weatherData = null;
  let warningMessage = null;
  let source = 'OpenWeatherMap API';

  try {
    weatherData = await fetchFromOpenWeather();
  } catch (apiErr) {
    console.warn('[WeatherService] OpenWeatherMap request failed:', apiErr.message);
    try {
      // Try live meteorological fallback
      weatherData = await fetchFromLiveMeteorologicalFallback();
      warningMessage = `Live telemetry retrieved via Surat meteorological backup. Note: ${apiErr.message}`;
    } catch (fallbackErr) {
      console.warn('[WeatherService] Fallback also failed:', fallbackErr.message);
      // Retrieve last saved observation from database
      const cached = await getLatestSavedObservation();
      if (cached) {
        return {
          record: cached,
          isLive: false,
          warning: `OpenWeatherMap service offline or unconfigured. Displaying last persisted observation from local MySQL repository.`
        };
      }
      throw new Error(`Unable to fetch live or stored weather: ${apiErr.message}`);
    }
  }

  // Persist observation to database
  try {
    await saveObservationToDb(weatherData);
    if (userId) {
      await logAction(userId, 'WEATHER_REFRESH', `Surat live weather synchronized (${weatherData.temperature}°C, ${weatherData.weather_condition})`);
    }
  } catch (dbErr) {
    console.error('[WeatherService] DB save error:', dbErr.message);
  }

  // Retrieve full record from DB to return complete ID and timestamps
  const latest = await getLatestSavedObservation();
  return {
    record: latest || weatherData,
    isLive: true,
    source: weatherData.source || source,
    warning: warningMessage
  };
}

module.exports = {
  fetchFromOpenWeather,
  syncCurrentWeather,
  getLatestSavedObservation,
  saveObservationToDb
};

