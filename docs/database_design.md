# Relational Database Design
## Surat Weather Intelligence System — MySQL 8.0+

```mermaid
erDiagram
    users {
        int id PK "AUTO_INCREMENT"
        varchar full_name "100 NOT NULL"
        varchar email "150 UNIQUE NOT NULL"
        varchar password_hash "255 NOT NULL"
        enum role "'admin', 'viewer' NOT NULL"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    weather_records {
        int id PK "AUTO_INCREMENT"
        varchar city "100 DEFAULT 'Surat'"
        varchar country "10 DEFAULT 'IN'"
        decimal latitude "9,6 NOT NULL"
        decimal longitude "9,6 NOT NULL"
        decimal temperature "6,2 NOT NULL"
        decimal feels_like "6,2 NOT NULL"
        decimal min_temperature "6,2 NOT NULL"
        decimal max_temperature "6,2 NOT NULL"
        int humidity "NOT NULL"
        int pressure "NOT NULL"
        decimal wind_speed "8,2 NOT NULL"
        int wind_direction "NOT NULL"
        int visibility "NOT NULL"
        int cloud_coverage "NOT NULL"
        varchar weather_condition "100 NOT NULL"
        varchar weather_description "255 NOT NULL"
        datetime sunrise_at "NULL"
        datetime sunset_at "NULL"
        datetime observation_time "NOT NULL UNIQUE COMBINED"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    system_logs {
        int id PK "AUTO_INCREMENT"
        int user_id FK "REFERENCES users(id) ON DELETE SET NULL"
        varchar action "100 NOT NULL"
        text description "NOT NULL"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    users ||--o{ system_logs : "initiates"
```

---

## Relational Constraints & Indexing Strategy

### 1. `users` Table
- **Primary Key**: `id`
- **Unique Key**: `email`
- **Indexes**: `idx_users_email` (Fast lookup on login), `idx_users_role` (Authorization filtering).

### 2. `weather_records` Table
- **Primary Key**: `id`
- **Composite Unique Key**: `uq_city_country_observation` on `(city, country, observation_time)`. Prevents duplicate observations when automated ingestion executes or when users refresh.
- **Indexes**:
  - `idx_observation_time`: High-speed time-series queries and date range filtering.
  - `idx_weather_condition`: Rapid categorical aggregations.
  - `idx_created_at`: Audit and telemetry ingestion tracking.

### 3. `system_logs` Table
- **Primary Key**: `id`
- **Foreign Key**: `fk_system_logs_user` pointing to `users(id)` with `ON DELETE SET NULL ON UPDATE CASCADE`. Ensures system audit history is preserved even if a user account is deleted by an administrator.
- **Indexes**: `idx_logs_action`, `idx_logs_created_at`.
