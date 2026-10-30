import React, { useState, useEffect } from 'react';
import { weatherApi } from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Download,
  Calendar,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  TrendingUp,
  Filter,
  RefreshCw,
  PieChart as PieIcon,
  Table as TableIcon
} from 'lucide-react';

const CONDITION_COLORS = {
  Clear: '#00F0FF',
  Clouds: '#94a3b8',
  Haze: '#f59e0b',
  Rain: '#3b82f6',
  Drizzle: '#06b6d4',
  Thunderstorm: '#8b5cf6'
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState('7');
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await weatherApi.getStats({ days: daysFilter });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [daysFilter]);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const res = await weatherApi.exportCsv();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `surat_weather_analytics_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const kpis = stats?.kpis || {};
  const dailyTrends = (stats?.dailyTrends || []).map((item) => ({
    ...item,
    formattedDate: new Date(item.observation_date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    })
  }));

  const conditionData = (stats?.conditionDistribution || []).map((item) => ({
    name: item.weather_condition,
    value: item.count,
    color: CONDITION_COLORS[item.weather_condition] || '#3b82f6'
  }));

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Computing SQL Aggregations & Trends...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Surat Historical Weather Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Exploratory Data Analysis (EDA), Time-Series Modeling & Statistical Aggregations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Days Filter Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-900 border border-navy-800 rounded-xl text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Time Horizon:</span>
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(e.target.value)}
              className="bg-transparent text-cyan-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="7" className="bg-navy-900 text-white">Last 7 Days</option>
              <option value="14" className="bg-navy-900 text-white">Last 14 Days</option>
              <option value="30" className="bg-navy-900 text-white">Last 30 Days</option>
            </select>
          </div>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-bold transition shadow-sm shadow-cyan-500/10 active:scale-95 disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-bounce' : ''}`} />
            <span>{exporting ? 'Exporting...' : 'Export CSV Dataset'}</span>
          </button>
        </div>
      </div>

      {/* SQL AGGREGATION KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Records */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Observations</span>
          <p className="text-2xl font-black text-white mt-1">{kpis.total_records ?? 0}</p>
          <span className="text-[10px] text-cyan-400 mt-1 block">SQL COUNT(*)</span>
        </div>

        {/* Avg Temperature */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Temp</span>
          <p className="text-2xl font-black text-cyan-300 mt-1">{kpis.avg_temperature ?? '--'}°C</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Mean Diurnal</span>
        </div>

        {/* Max Temperature */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Max Peak</span>
          <p className="text-2xl font-black text-rose-400 mt-1">{kpis.max_temperature ?? '--'}°C</p>
          <span className="text-[10px] text-rose-400/80 mt-1 block">Diurnal High</span>
        </div>

        {/* Min Temperature */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Min Trough</span>
          <p className="text-2xl font-black text-blue-400 mt-1">{kpis.min_temperature ?? '--'}°C</p>
          <span className="text-[10px] text-blue-400/80 mt-1 block">Dawn Minimum</span>
        </div>

        {/* Avg Humidity */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Humidity</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{kpis.avg_humidity ?? '--'}%</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Hygrometric Avg</span>
        </div>

        {/* Avg Wind Speed */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Wind</span>
          <p className="text-2xl font-black text-electric-400 mt-1">{kpis.avg_wind_speed ?? '--'}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">m/s Sea Velocity</span>
        </div>
      </div>

      {/* CHART ROW 1: TEMPERATURE TREND & CONDITION DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Temperature Range Chart (8 cols) */}
        <div className="lg:col-span-8 bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                Daily Mean, Min & Max Temperature Trends
              </h3>
              <p className="text-xs text-slate-400">Diurnal variance aggregated per day</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                <XAxis dataKey="formattedDate" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} unit="°C" />
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="max_temperature" name="Daily Max" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="avg_temperature" name="Daily Average" stroke="#00F0FF" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="min_temperature" name="Daily Min" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Condition Distribution Pie Chart (4 cols) */}
        <div className="lg:col-span-4 bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-400" />
              Weather Condition Distribution
            </h3>
            <p className="text-xs text-slate-400">Relative meteorological frequency share</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conditionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHART ROW 2: HUMIDITY, WIND, PRESSURE MULTI-PARAMETER COMPARISON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Humidity vs Wind Speed */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-400" />
                Daily Mean Humidity (%)
              </h3>
              <p className="text-xs text-slate-400">Coastal relative humidity tracking</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                <XAxis dataKey="formattedDate" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="avg_humidity" name="Avg Humidity (%)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Atmospheric Barometric Pressure */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                Daily Barometric Pressure (hPa)
              </h3>
              <p className="text-xs text-slate-400">Atmospheric sea-level trends</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                <XAxis dataKey="formattedDate" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} unit="hPa" />
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="avg_pressure" name="Barometric Pressure" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DAILY STATISTICAL SUMMARY TABLE */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <TableIcon className="w-4 h-4 text-cyan-400" />
          Daily Aggregated Meteorological Telemetry Table (SQL GROUP BY)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-850 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Date</th>
                <th className="py-3 px-4">Avg Temp</th>
                <th className="py-3 px-4">Min Temp</th>
                <th className="py-3 px-4">Max Temp</th>
                <th className="py-3 px-4">Avg Humidity</th>
                <th className="py-3 px-4">Avg Wind Speed</th>
                <th className="py-3 px-4">Barometer</th>
                <th className="py-3 px-4 rounded-r-lg">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-slate-300">
              {dailyTrends.map((d, idx) => (
                <tr key={idx} className="hover:bg-navy-850/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-white font-mono">{d.observation_date}</td>
                  <td className="py-3 px-4 font-semibold text-cyan-400">{d.avg_temperature}°C</td>
                  <td className="py-3 px-4 text-blue-400">{d.min_temperature}°C</td>
                  <td className="py-3 px-4 text-rose-400">{d.max_temperature}°C</td>
                  <td className="py-3 px-4">{d.avg_humidity}%</td>
                  <td className="py-3 px-4">{d.avg_wind_speed} m/s</td>
                  <td className="py-3 px-4 font-mono">{d.avg_pressure} hPa</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{d.sample_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
