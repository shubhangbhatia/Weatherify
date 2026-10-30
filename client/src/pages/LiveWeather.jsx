import React, { useState, useEffect } from 'react';
import { weatherApi } from '../services/api';
import {
  CloudSun,
  Compass,
  Wind,
  Gauge,
  Droplets,
  Eye,
  Sun,
  Sunrise,
  Sunset,
  RefreshCw,
  Activity,
  Layers,
  ThermometerSnowflake,
  Flame,
  Radio
} from 'lucide-react';

export default function LiveWeather() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());

  const fetchLive = async () => {
    try {
      setRefreshing(true);
      const res = await weatherApi.getCurrent();
      setData(res.data);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Failed to load live weather:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLive();
  }, []);

  const record = data?.data;
  const isLive = data?.isLive;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Querying Surat Meteorological Station...</p>
      </div>
    );
  }

  // Calculate compass direction from degrees
  const getCardinalDirection = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round((deg % 360) / 22.5);
    return directions[idx % 16];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Surat Live Meteorological Station
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sensor Coordinates: 21.1702° N, 72.8311° E | Elevation: ~13m ASL | Tapi River Basin
          </p>
        </div>

        <button
          onClick={fetchLive}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-electric-500 hover:from-cyan-400 hover:to-electric-400 text-navy-950 rounded-xl font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Polling Sensors...' : 'Immediate Sync'}</span>
        </button>
      </div>

      {/* Main Meteorological Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Thermometric Column */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Thermal Telemetry</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-6 text-center">
              <span className="text-7xl font-black text-white">{record?.temperature ?? '--'}</span>
              <span className="text-3xl font-bold text-cyan-400">°C</span>
              <p className="text-sm font-semibold text-slate-300 mt-2 capitalize">
                {record?.weather_description || 'Clear Sky'}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3 pt-4 border-t border-navy-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Apparent Feels Like
              </span>
              <span className="font-bold text-white">{record?.feels_like ?? '--'}°C</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-400" />
                Station Min / Max
              </span>
              <span className="font-bold text-white">
                {record?.min_temperature}°C / {record?.max_temperature}°C
              </span>
            </div>
          </div>
        </div>

        {/* Anemometric Wind Compass */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Anemometer & Vector</span>
              <Compass className="w-4 h-4 text-electric-400" />
            </div>

            {/* Simulated Anemometer dial */}
            <div className="mt-4 flex flex-col items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-navy-700 bg-navy-850 flex items-center justify-center relative shadow-inner">
                {/* Needle rotated to wind degree */}
                <div
                  className="w-1 h-20 bg-gradient-to-t from-cyan-400 to-transparent absolute rounded-full transition-transform duration-700"
                  style={{ transform: `rotate(${record?.wind_direction || 0}deg)` }}
                ></div>
                <div className="w-14 h-14 rounded-full bg-navy-900 border border-navy-700 flex flex-col items-center justify-center z-10">
                  <span className="text-xs font-extrabold text-cyan-400">
                    {getCardinalDirection(record?.wind_direction || 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {record?.wind_direction ?? 0}°
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-navy-800 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-black text-white">{record?.wind_speed ?? '--'}</span>
              <span className="text-sm font-bold text-electric-400">m/s</span>
              <span className="text-xs text-slate-500 ml-1">
                ({record?.wind_speed ? (record.wind_speed * 3.6).toFixed(1) : '--'} km/h)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Arabian Sea Coastal Wind Stream
            </p>
          </div>
        </div>

        {/* Barometer & Moisture */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Atmospheric & Hygrometric</span>
              <Gauge className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Relative Humidity</span>
                  <span className="font-bold text-cyan-400">{record?.humidity ?? '--'}%</span>
                </div>
                <div className="w-full bg-navy-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-electric-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${record?.humidity || 50}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Cloud Density</span>
                  <span className="font-bold text-slate-200">{record?.cloud_coverage ?? '--'}%</span>
                </div>
                <div className="w-full bg-navy-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-slate-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${record?.cloud_coverage || 20}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs text-slate-400">Barometric Pressure</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-white">{record?.pressure ?? '--'}</span>
                  <span className="text-xs font-bold text-emerald-400">hPa</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400">
            <span>Visibility: {(record?.visibility / 1000).toFixed(1)} km</span>
            <span>Condition: {record?.weather_condition}</span>
          </div>
        </div>
      </div>

      {/* Raw Astronomical & Telemetry Card */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Astronomical Ephemeris & Ingestion Integrity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-navy-850 rounded-xl border border-navy-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sunrise className="w-3.5 h-3.5 text-amber-400" />
              Surat Sunrise (IST)
            </span>
            <p className="text-sm font-bold text-white mt-1">
              {record?.sunrise_at ? new Date(record.sunrise_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : '06:38 AM'}
            </p>
          </div>

          <div className="p-3 bg-navy-850 rounded-xl border border-navy-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sunset className="w-3.5 h-3.5 text-orange-400" />
              Surat Sunset (IST)
            </span>
            <p className="text-sm font-bold text-white mt-1">
              {record?.sunset_at ? new Date(record.sunset_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : '06:05 PM'}
            </p>
          </div>

          <div className="p-3 bg-navy-850 rounded-xl border border-navy-800">
            <span className="text-slate-400">Telemetry Ingestion</span>
            <p className="text-sm font-bold text-white mt-1">
              {isLive ? 'Real-Time Telemetry' : 'Database Record'}
            </p>
          </div>

          <div className="p-3 bg-navy-850 rounded-xl border border-navy-800">
            <span className="text-slate-400">Observation Timestamp (UTC)</span>
            <p className="text-sm font-mono text-cyan-400 mt-1 truncate">
              {record?.observation_time || 'Pending'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
