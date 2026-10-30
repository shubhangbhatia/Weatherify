# System Architecture
## Surat Weather Intelligence System

```mermaid
flowchart TD
    subgraph ExternalSources["External Meteorological Sources"]
        OWM["OpenWeatherMap Current API\n(Surat 21.1702 N, 72.8311 E)"]
        METEO["Surat Meteorological Fallback\n(Open-Meteo High-Resolution Station)"]
    end

    subgraph BackendSystem["Node.js / Express Backend Engine (Render)"]
        CRON["node-cron Ingestion Scheduler\n(Every 10 Minutes)"]
        RATELIMIT["express-rate-limit\n(Auth & Weather Refresh Protection)"]
        AUTH_MW["JWT Authentication & RBAC Middleware\n(Admin & Viewer Guard)"]
        WEATHER_SVC["Weather Telemetry Ingestion Service\n(Idempotent MySQL Sync)"]
        LOG_SVC["Audit Logging Service\n(system_logs)"]

        subgraph Routes["REST API Endpoints"]
            R_AUTH["/api/auth (Login, Register, Me)"]
            R_WEATHER["/api/weather (Current, Refresh, Stats, History, Export)"]
            R_ADMIN["/api/admin (Users, Records, Logs, Metrics)"]
            R_HEALTH["/api/health (System Diagnostics)"]
        end
    end

    subgraph DatabaseLayer["Relational Storage Layer (MySQL 8.0+)"]
        T_USERS[("users Table\n(id, full_name, email, password_hash, role)")]
        T_WEATHER[("weather_records Table\n(id, temp, humidity, pressure, wind, observation_time)\n[UNIQUE (city, country, observation_time)]")]
        T_LOGS[("system_logs Table\n(id, user_id, action, description, created_at)")]
    end

    subgraph ClientLayer["Frontend Application (React + Vite on Vercel)"]
        UI_AUTH["Auth Views\n(Login & Registration Portal)"]
        UI_OVERVIEW["Overview Dashboard\n(Hero Temperature, KPI Cards, Recharts Diurnal Trends)"]
        UI_LIVE["Live Meteorological Monitor\n(Anemometer Compass, Barometric Gauge, Ephemeris)"]
        UI_ANALYTICS["Historical Analytics\n(SQL Aggregations, Temperature Ranges, Condition Share)"]
        UI_RECORDS["Weather Records\n(Searchable, Filterable, Paginated Data Table)"]
        UI_POWERBI["Power BI Embedded Console\n(9 Mandatory Analytics Components)"]
        UI_ADMIN["Admin Control Panel\n(User Governance, Audit Logs, Record Deletion)"]
    end

    subgraph BusinessIntelligence["Microsoft Power BI Service"]
        PBI_DESKTOP["Power BI Desktop (.pbix)\nDAX Measures & 9 Required Visuals"]
        PBI_SERVICE["Power BI Service Report\n(Public / Secure Portal Embed)"]
    end

    %% Data flow links
    OWM -->|HTTPS JSON| WEATHER_SVC
    METEO -.->|Fallback Feed| WEATHER_SVC
    CRON --> WEATHER_SVC
    WEATHER_SVC -->|Idempotent INSERT| T_WEATHER
    WEATHER_SVC --> LOG_SVC
    LOG_SVC --> T_LOGS

    R_AUTH --> T_USERS
    R_WEATHER --> T_WEATHER
    R_ADMIN --> T_USERS
    R_ADMIN --> T_WEATHER
    R_ADMIN --> T_LOGS

    ClientLayer <-->|HTTPS REST JSON & JWT Bearer| BackendSystem
    T_WEATHER -->|CSV Stream Export| PBI_DESKTOP
    PBI_DESKTOP -->|Publish| PBI_SERVICE
    PBI_SERVICE -->|Iframe Embed| UI_POWERBI
```

---

## Architecture Principles
1. **Separation of Concerns**: Strict boundary between stateless REST API, relational persistence layer, and React presentation client.
2. **Deterministic Fallbacks**: If the primary OpenWeatherMap API returns an error or is unconfigured, the system automatically falls back to live scientific telemetry or cached MySQL records with clear station notifications.
3. **Role-Based Security**: All endpoints enforce JWT authentication and backend role validation (`admin` vs `viewer`).
4. **Idempotent Ingestion**: Unique constraint `uq_city_country_observation` on `(city, country, observation_time)` guarantees zero duplicates during scheduled cron runs.
