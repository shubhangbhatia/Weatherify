# Microsoft Power BI Integration Guide
## Surat Weather Intelligence — Data Modeling & Visualization Project

This document provides complete, step-by-step instructions for creating, configuring, and publishing the mandatory **Microsoft Power BI** analytical dashboard for the **Surat Weather Intelligence System**.

---

## 1. Overview of Required Visuals

The Power BI report must implement the **9 mandatory analytical components**:

| Visual # | Component Name | Recommended Power BI Visual Type | Underlying Data Field / DAX Measure |
|---|---|---|---|
| **1** | **Average Temperature KPI** | Card Visual / KPI | `[Average Temperature (°C)]` |
| **2** | **Maximum Temperature KPI** | Card Visual / KPI | `[Maximum Temperature (°C)]` |
| **3** | **Minimum Temperature KPI** | Card Visual / KPI | `[Minimum Temperature (°C)]` |
| **4** | **Temperature Trend** | Line and Clustered Column Chart | `temperature`, `feels_like` over `observation_time` |
| **5** | **Humidity Trend** | Line Chart | `humidity` over `observation_time` |
| **6** | **Wind Speed Trend** | Clustered Column Chart | `wind_speed` over `observation_time` |
| **7** | **Atmospheric Pressure Trend** | Line Chart | `pressure` over `observation_time` |
| **8** | **Weather Condition Distribution** | Donut / Pie Chart | `weather_condition` with Count of Records |
| **9** | **Weather Observations Table** | Table / Matrix Visual | `id`, `observation_time`, `temperature`, `humidity`, `pressure`, `wind_speed`, `weather_condition` |

---

## 2. Dataset Preparation & Ingestion

### Step 2.1: Export Dataset from the Web Application
1. Log in to the deployed application or local instance (`http://localhost:5173/powerbi`).
2. Navigate to the **Power BI Dashboard** or **Weather Records** tab.
3. Click the **Export Power BI CSV** or **Export Filtered Dataset** button.
4. The application exports `surat_weather_powerbi_dataset_YYYY-MM-DD.csv` containing all persisted meteorological records directly from MySQL.
5. Alternatively, use the baseline project dataset located at `dataset/weather_records.csv`.

### Step 2.2: Import Dataset into Power BI Desktop
1. Launch **Microsoft Power BI Desktop**.
2. Click **Get Data** on the Home ribbon and select **Text/CSV**.
3. Browse and select the exported `weather_records.csv`.
4. In the preview dialog:
   - **File Origin**: `65001: Unicode (UTF-8)`
   - **Delimiter**: `Comma`
   - **Data Type Detection**: `Based on first 200 rows`
5. Click **Transform Data** to open the **Power Query Editor**.

### Step 2.3: Power Query Data Types Verification
Verify and set the following data types in Power Query:
- `id` → Whole Number (`Int64.Type`)
- `city`, `country`, `weather_condition`, `weather_description` → Text (`type text`)
- `latitude`, `longitude` → Decimal Number (`type number`)
- `temperature`, `feels_like`, `min_temperature`, `max_temperature`, `wind_speed` → Decimal Number (`type number`)
- `humidity`, `pressure`, `wind_direction`, `visibility`, `cloud_coverage` → Whole Number (`Int64.Type`)
- `sunrise_at`, `sunset_at`, `observation_time`, `created_at` → Date/Time (`type datetime`)

Click **Close & Apply** to load the dataset into the Power BI data model.

---

## 3. Mandatory DAX Measures

In the **Modeling** tab, click **New Measure** and create the following standard analytical DAX formulas:

### Measure 1: Total Observations
```dax
Total Observations = COUNTROWS('weather_records')
```

### Measure 2: Average Temperature
```dax
Average Temperature (°C) = 
AVERAGE('weather_records'[temperature])
```

### Measure 3: Maximum Temperature Recorded
```dax
Maximum Temperature (°C) = 
MAX('weather_records'[max_temperature])
```

### Measure 4: Minimum Temperature Recorded
```dax
Minimum Temperature (°C) = 
MIN('weather_records'[min_temperature])
```

### Measure 5: Diurnal Temperature Range
```dax
Diurnal Temperature Range (°C) = 
[Maximum Temperature (°C)] - [Minimum Temperature (°C)]
```

### Measure 6: Average Relative Humidity
```dax
Average Humidity (%) = 
AVERAGE('weather_records'[humidity])
```

### Measure 7: Average Wind Speed
```dax
Average Wind Speed (m/s) = 
AVERAGE('weather_records'[wind_speed])
```

### Measure 8: Average Atmospheric Pressure
```dax
Average Atmospheric Pressure (hPa) = 
AVERAGE('weather_records'[pressure])
```

---

## 4. Visual Layout Configuration

### Page 1: "Surat Weather Intelligence Executive Dashboard"
1. **Report Canvas Theme**: Under View → Themes, select **Dark** or **High Contrast** to align with the SaaS dashboard aesthetic (Dark Navy: `#0B132B`, Cyan Accent: `#00F0FF`).
2. **Top KPI Cards (Visuals 1, 2, 3)**:
   - Add 3 **Card** visuals across the top header.
   - Assign `[Average Temperature (°C)]`, `[Maximum Temperature (°C)]`, and `[Minimum Temperature (°C)]`.
3. **Primary Time-Series (Visual 4)**:
   - Add a **Line Chart**.
   - **X-axis**: `observation_time` (formatted as Hour/Day).
   - **Y-axis**: `temperature` and `feels_like`.
4. **Hygrometric & Barometric Trends (Visuals 5 & 7)**:
   - Add two **Line Charts** displaying `humidity` and `pressure` across observation time.
5. **Wind Anemometer Vector (Visual 6)**:
   - Add a **Clustered Column Chart** showing `wind_speed` over time.
6. **Weather Condition Categorical Distribution (Visual 8)**:
   - Add a **Donut Chart**.
   - **Legend**: `weather_condition`.
   - **Values**: `Count of id`.
7. **Detailed Telemetry Grid (Visual 9)**:
   - Add a **Table** visual containing the chronological telemetry records.

---

## 5. Publishing to Power BI Service & Embedding

### Step 5.1: Publish the Report
1. In Power BI Desktop, click **File** → **Publish** → **Publish to Power BI**.
2. Sign in with your institutional or organizational Microsoft account.
3. Select your workspace (e.g., `My Workspace` or `Surat Weather Intelligence`).
4. Wait for publishing confirmation.

### Step 5.2: Generate the Embed URL
Depending on your Microsoft tenant permissions:

#### Option A: Secure Public Web Embed (Publish to Web)
1. Open the report in **Power BI Service** (`app.powerbi.com`).
2. Click **File** → **Embed report** → **Publish to web (public)**.
3. Review the dialog and click **Create embed code**.
4. Copy the URL provided in the `Link you can send in email` box, or copy the `src` attribute from the HTML iframe snippet.
   - Example: `https://app.powerbi.com/view?r=eyJrIjoi...`

#### Option B: Secure Organizational Portal Embed
1. Click **File** → **Embed report** → **Website or portal**.
2. Copy the secure embed URL provided.
   - Example: `https://app.powerbi.com/reportEmbed?reportId=...`

---

## 6. Integration into Surat Weather Intelligence Application

### Setting the Environment Variable:
1. Open `client/.env` (or configure in the Vercel Dashboard):
   ```env
   VITE_POWERBI_EMBED_URL=https://app.powerbi.com/view?r=YOUR_ACTUAL_REPORT_KEY
   ```
2. Alternatively, when viewing the application:
   - Navigate to **Power BI Dashboard** (`/powerbi`).
   - Click **Configure Embed URL** or **Connect Embed URL**.
   - Paste the URL directly into the dialog and click **Save & Load Embed**.
   - The React application immediately loads the live interactive Power BI iframe with full multi-touch slicing and filtering.

---

## 7. Important Academic & Operational Notes

- **CSV Refresh Requirement**: A Power BI report based on a static CSV export reflects observations up to the export timestamp. To incorporate new observations captured by the backend cron job, export an updated CSV and trigger a refresh in Power BI Desktop, or configure direct MySQL gateway connectivity.
- **Licensing & Tenant Permissions**: Public embedding ("Publish to Web") requires tenant administrator enablement in Microsoft 365 Admin Portal. For college evaluation sessions where tenant policies restrict public embedding, the pre-built `.pbix` file or Power BI Desktop demonstration can be presented natively using `dataset/weather_records.csv`.
- **Integrity**: The application clearly separates embedded Power BI analytics from internal Recharts components, fulfilling the academic requirement that simulated charts are never misrepresented as native Power BI frames.
