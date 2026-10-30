import React, { useState, useEffect } from 'react';
import { weatherApi } from '../services/api';
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Cloud,
  Sunrise,
  Sunset,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Clock,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export default function Overview() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('temp'); // 'temp', 'humidity', 'wind', 'pressure'

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [currRes, statsRes] = await Promise.all([
        weatherApi.getCurrent(),
        weatherApi.getStats({ days: 7 })
      ]);
      setCurrentWeather(currRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load overview data:', err);
      setError('Unable to load meteorological data. Verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to global sync events from header
    const handleRefreshed = () => fetchData();
    window.addEventListener('weather-refreshed', handleRefreshed);
    return () => window.removeEventListener('weather-refreshed', handleRefreshed);
  }, []);

  const data = currentWeather?.data;
  const isLive = currentWeather?.isLive;
  const warning = currentWeather?.warning;
  const source = currentWeather?.source;

  // Chart data formatting: convert UTC timestamp to IST time string
  const chartData = (stats?.recentObservations || []).map((obs) => {
    const d = new Date(obs.observation_time);
    const timeStr = d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return {
      time: timeStr,
      fullDate: d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' }),
      temperature: obs.temperature,
      feels_like: obs.feels_like,
      humidity: obs.humidity,
      wind_speed: obs.wind_speed,
      pressure: obs.pressure,
      condition: obs.weather_condition
    };
  });

  if (loading && !currentWeather) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Connecting to Surat Meteorological Feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Surat Weather Intelligence Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, meteorological parameters, and recent diurnal variations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-800 flex items-center gap-2 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-slate-300 font-medium">{isLive ? 'Live Sensor Data' : 'Cached Observation'}</span>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-navy-850 rounded border border-navy-800 text-cyan-400">
            {source || 'OpenWeatherMap'}
          </span>
        </div>
      </div>

      {/* Warning banner if fallback active */}
      {warning && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-300">Station Notice</p>
            <p className="text-amber-200/90 mt-0.5">{warning}</p>
          </div>
        </div>
      )}

      {/* PRIMARY TOP ROW: HERO CARD + KEY METRIC CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Temperature Hero Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-navy-900 via-navy-850 to-navy-900 border border-cyan-500/25 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Surat Central Station
            </span>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {data?.observation_time ? new Date(data.observation_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'} IST
            </span>
          </div>

          <div className="mt-5 flex items-baseline justify-between">
            <div>
              <div className="flex items-start">
                <span className="text-6xl sm:text-7xl font-black text-white tracking-tight">
                  {data?.temperature ?? '--'}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-cyan-400 ml-1">°C</span>
              </div>
              <p className="text-base font-semibold text-slate-200 capitalize mt-1">
                {data?.weather_description || data?.weather_condition || 'Clear Sky'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Feels Like</span>
              <p className="text-2xl font-bold text-cyan-300">{data?.feels_like ?? '--'}°C</p>
            </div>
          </div>

          {/* Min / Max Temperature Banner */}
          <div className="mt-6 pt-4 border-t border-navy-800 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-950/60 border border-blue-800/50 rounded-lg text-blue-400">
                <ArrowDown className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Min Temp</p>
                <p className="text-sm font-bold text-white">{data?.min_temperature ?? '--'}°C</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-950/60 border border-rose-800/50 rounded-lg text-rose-400">
                <ArrowUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Max Temp</p>
                <p className="text-sm font-bold text-white">{data?.max_temperature ?? '--'}°C</p>
              </div>
            </div>
          </div>

          {/* Sunrise / Sunset mini footer */}
          <div className="mt-4 pt-3 border-t border-navy-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sunrise className="w-3.5 h-3.5 text-amber-400" />
              <span>{data?.sunrise_at ? new Date(data.sunrise_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) : '06:38 AM'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Sunset className="w-3.5 h-3.5 text-orange-400" />
              <span>{data?.sunset_at ? new Date(data.sunset_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) : '06:05 PM'}</span>
            </span>
          </div>
        </div>

        {/* 5 Complementary Metric Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {/* Humidity */}
          <div className="bg-navy-900/90 border border-navy-800 hover:border-cyan-500/30 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Humidity</span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-white">{data?.humidity ?? '--'}</span>
              <span className="text-sm text-cyan-400 font-bold">%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {data?.humidity > 70 ? 'High Coastal Moisture' : data?.humidity < 45 ? 'Dry Ambient Air' : 'Optimal Comfort'}
            </p>
          </div>

          {/* Wind Speed */}
          <div className="bg-navy-900/90 border border-navy-800 hover:border-cyan-500/30 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Wind Velocity</span>
              <Wind className="w-4 h-4 text-electric-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-white">{data?.wind_speed ?? '--'}</span>
              <span className="text-xs text-electric-400 font-bold">m/s</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Dir: {data?.wind_direction ?? 0}° SW Sea Breeze
            </p>
          </div>

          {/* Atmospheric Pressure */}
          <div className="bg-navy-900/90 border border-navy-800 hover:border-cyan-500/30 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Barometric</span>
              <Gauge className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-white">{data?.pressure ?? '--'}</span>
              <span className="text-xs text-emerald-400 font-bold">hPa</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {data?.pressure >= 1013 ? 'Standard Sea Level' : 'Slight Low Pressure'}
            </p>
          </div>

          {/* Visibility */}
          <div className="bg-navy-900/90 border border-navy-800 hover:border-cyan-500/30 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Visibility</span>
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {data?.visibility ? (data.visibility / 1000).toFixed(1) : '--'}
              </span>
              <span className="text-xs text-purple-400 font-bold">km</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {data?.visibility >= 9000 ? 'Clear Optical Range' : 'Moderate Atmospheric Haze'}
            </p>
          </div>

          {/* Cloud Coverage */}
          <div className="bg-navy-900/90 border border-navy-800 hover:border-cyan-500/30 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Cloud Cover</span>
              <Cloud className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-white">{data?.cloud_coverage ?? '--'}</span>
              <span className="text-xs text-slate-400 font-bold">%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Sky Coverage Density
            </p>
          </div>

          {/* Overall Samples KPI */}
          <div className="bg-navy-900/90 border border-navy-800 hover:border-cyan-500/30 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Telemetry DB</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-white">{stats?.kpis?.total_records || '--'}</span>
              <span className="text-xs text-cyan-400 font-bold">records</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Avg: {stats?.kpis?.avg_temperature || '--'}°C
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE TIME-SERIES CHARTS SECTION */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Surat Diurnal Telemetry Trends (Recent Observations)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous parameter tracking stored in MySQL database
            </p>
          </div>

          {/* Chart parameter selector buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-navy-850 rounded-xl border border-navy-800">
            <button
              onClick={() => setActiveChart('temp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeChart === 'temp'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-navy-800'
              }`}
            >
              Temperature (°C)
            </button>
            <button
              onClick={() => setActiveChart('humidity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeChart === 'humidity'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-navy-800'
              }`}
            >
              Humidity (%)
            </button>
            <button
              onClick={() => setActiveChart('wind')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeChart === 'wind'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-navy-800'
              }`}
            >
              Wind (m/s)
            </button>
            <button
              onClick={() => setActiveChart('pressure')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeChart === 'pressure'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-navy-800'
              }`}
            >
              Pressure (hPa)
            </button>
          </div>
        </div>

        {/* Dynamic Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === 'temp' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="feelsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} unit="°C" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="temperature" name="Ambient Temp" stroke="#00F0FF" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGradient)" />
                <Area type="monotone" dataKey="feels_like" name="Feels Like" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#feelsGradient)" />
              </AreaChart>
            ) : activeChart === 'humidity' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[20, 100]} stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="humidity" name="Relative Humidity" stroke="#38bdf8" strokeWidth={2.5} fill="url(#humGradient)" />
              </AreaChart>
            ) : activeChart === 'wind' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="m/s" />
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="wind_speed" name="Wind Speed (m/s)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
              </LineChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} unit="hPa" />
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="pressure" name="Barometric Pressure" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3, fill: '#a855f7' }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* WEATHER OBSERVATIONS TABLE */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Weather Telemetry Log</h3>
            <p className="text-xs text-slate-400">Latest sensor captures persisted to MySQL</p>
          </div>
          <span className="text-xs text-cyan-400 font-mono">
            Showing last {Math.min(chartData.length, 10)} captures
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-850 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Time (IST)</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Temp</th>
                <th className="py-3 px-4">Feels Like</th>
                <th className="py-3 px-4">Humidity</th>
                <th className="py-3 px-4">Wind Speed</th>
                <th className="py-3 px-4 rounded-r-lg">Pressure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-slate-300">
              {(chartData.slice(-10).reverse()).map((row, idx) => (
                <tr key={idx} className="hover:bg-navy-800/80 hover:text-white transition-colors">
                  <td className="py-3 px-4 font-mono text-cyan-400 hover:text-cyan-300 font-medium">
                    {row.time} <span className="text-slate-500 font-normal">({row.fullDate})</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-navy-800 border border-navy-700 text-slate-200">
                      {row.condition}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{row.temperature}°C</td>
                  <td className="py-3 px-4">{row.feels_like}°C</td>
                  <td className="py-3 px-4">{row.humidity}%</td>
                  <td className="py-3 px-4">{row.wind_speed} m/s</td>
                  <td className="py-3 px-4 font-mono">{row.pressure} hPa</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

