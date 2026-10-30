-- =====================================================================
-- SURAT WEATHER INTELLIGENCE SYSTEM
-- Data Modeling and Analytical SQL Queries
-- Database: surat_weather_db
-- =====================================================================

USE `surat_weather_db`;

-- ---------------------------------------------------------------------
-- 1. Average Daily Temperature
-- Calculates the mean ambient and feels-like temperature per day in Surat
-- ---------------------------------------------------------------------
SELECT 
    DATE(observation_time) AS observation_date,
    ROUND(AVG(temperature), 2) AS avg_temperature_celsius,
    ROUND(AVG(feels_like), 2) AS avg_feels_like_celsius,
    COUNT(*) AS total_samples
FROM `weather_records`
GROUP BY DATE(observation_time)
ORDER BY observation_date DESC;

-- ---------------------------------------------------------------------
-- 2. Maximum and Minimum Temperatures (Diurnal Range)
-- Analyzes extreme temperature variations recorded per diurnal cycle
-- ---------------------------------------------------------------------
SELECT 
    DATE(observation_time) AS observation_date,
    MIN(min_temperature) AS min_temperature_celsius,
    MAX(max_temperature) AS max_temperature_celsius,
    ROUND(MAX(max_temperature) - MIN(min_temperature), 2) AS diurnal_range_celsius
FROM `weather_records`
GROUP BY DATE(observation_time)
ORDER BY observation_date DESC;

-- ---------------------------------------------------------------------
-- 3. Average Humidity
-- Evaluates ambient relative humidity levels across daily observation cycles
-- ---------------------------------------------------------------------
SELECT 
    DATE(observation_time) AS observation_date,
    ROUND(AVG(humidity), 2) AS avg_relative_humidity_percent,
    MIN(humidity) AS min_humidity,
    MAX(humidity) AS max_humidity
FROM `weather_records`
GROUP BY DATE(observation_time)
ORDER BY observation_date DESC;

-- ---------------------------------------------------------------------
-- 4. Average Wind Speed & Prevailing Direction
-- Analyzes coastal wind dynamics and anemometric velocity
-- ---------------------------------------------------------------------
SELECT 
    DATE(observation_time) AS observation_date,
    ROUND(AVG(wind_speed), 2) AS avg_wind_speed_mps,
    ROUND(MAX(wind_speed), 2) AS max_wind_gust_mps,
    ROUND(AVG(wind_direction), 0) AS avg_wind_direction_deg
FROM `weather_records`
GROUP BY DATE(observation_time)
ORDER BY observation_date DESC;

-- ---------------------------------------------------------------------
-- 5. Daily Pressure Trend
-- Tracks atmospheric barometric pressure variations (hPa)
-- ---------------------------------------------------------------------
SELECT 
    DATE(observation_time) AS observation_date,
    ROUND(AVG(pressure), 2) AS avg_pressure_hpa,
    MIN(pressure) AS min_pressure_hpa,
    MAX(pressure) AS max_pressure_hpa,
    ROUND(MAX(pressure) - MIN(pressure), 2) AS barometric_variance
FROM `weather_records`
GROUP BY DATE(observation_time)
ORDER BY observation_date DESC;

-- ---------------------------------------------------------------------
-- 6. Weather Condition Frequency
-- Categorical frequency distribution of meteorological states
-- ---------------------------------------------------------------------
SELECT 
    weather_condition,
    COUNT(*) AS frequency,
    ROUND((COUNT(*) * 100.0) / (SELECT COUNT(*) FROM `weather_records`), 2) AS percentage_share
FROM `weather_records`
GROUP BY weather_condition
ORDER BY frequency DESC;

-- ---------------------------------------------------------------------
-- 7. Total Observations by Day
-- Ingestion completeness verification for temporal telemetry tracking
-- ---------------------------------------------------------------------
SELECT 
    DATE(observation_time) AS observation_date,
    COUNT(*) AS observation_count,
    MIN(observation_time) AS first_observation_utc,
    MAX(observation_time) AS last_observation_utc
FROM `weather_records`
GROUP BY DATE(observation_time)
ORDER BY observation_date DESC;

-- ---------------------------------------------------------------------
-- 8. Comprehensive Summary Key Performance Indicators (KPIs)
-- Overall statistical aggregates for dashboard KPIs and Power BI cards
-- ---------------------------------------------------------------------
SELECT 
    COUNT(*) AS total_records,
    ROUND(AVG(temperature), 2) AS overall_avg_temp,
    MIN(temperature) AS overall_min_temp,
    MAX(temperature) AS overall_max_temp,
    ROUND(AVG(humidity), 2) AS overall_avg_humidity,
    ROUND(AVG(wind_speed), 2) AS overall_avg_wind_speed,
    ROUND(AVG(pressure), 2) AS overall_avg_pressure
FROM `weather_records`;
