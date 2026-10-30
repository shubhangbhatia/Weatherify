-- =====================================================================
-- SURAT WEATHER INTELLIGENCE SYSTEM
-- Relational Database Schema (MySQL 8.0+)
-- Database: surat_weather_db
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `surat_weather_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `surat_weather_db`;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS `system_logs`;
DROP TABLE IF EXISTS `weather_records`;
DROP TABLE IF EXISTS `users`;

-- ---------------------------------------------------------------------
-- TABLE 1: users
-- Stores system authentication and role-based access information
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'viewer') NOT NULL DEFAULT 'viewer',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 2: weather_records
-- Stores meteorological observations captured from OpenWeatherMap API
-- ---------------------------------------------------------------------
CREATE TABLE `weather_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `city` VARCHAR(100) NOT NULL DEFAULT 'Surat',
    `country` VARCHAR(10) NOT NULL DEFAULT 'IN',
    `latitude` DECIMAL(9, 6) NOT NULL DEFAULT 21.1702,
    `longitude` DECIMAL(9, 6) NOT NULL DEFAULT 72.8311,
    `temperature` DECIMAL(6, 2) NOT NULL,
    `feels_like` DECIMAL(6, 2) NOT NULL,
    `min_temperature` DECIMAL(6, 2) NOT NULL,
    `max_temperature` DECIMAL(6, 2) NOT NULL,
    `humidity` INT NOT NULL,
    `pressure` INT NOT NULL,
    `wind_speed` DECIMAL(8, 2) NOT NULL,
    `wind_direction` INT NOT NULL,
    `visibility` INT NOT NULL,
    `cloud_coverage` INT NOT NULL,
    `weather_condition` VARCHAR(100) NOT NULL,
    `weather_description` VARCHAR(255) NOT NULL,
    `sunrise_at` DATETIME NULL,
    `sunset_at` DATETIME NULL,
    `observation_time` DATETIME NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `uq_city_country_observation` UNIQUE (`city`, `country`, `observation_time`),
    INDEX `idx_observation_time` (`observation_time`),
    INDEX `idx_weather_condition` (`weather_condition`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 3: system_logs
-- Stores audit trail for security and operational monitoring
-- ---------------------------------------------------------------------
CREATE TABLE `system_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `action` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_system_logs_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX `idx_logs_action` (`action`),
    INDEX `idx_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
