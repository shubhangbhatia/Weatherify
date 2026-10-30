import React, { useState, useEffect } from 'react';
import { weatherApi } from '../services/api';
import {
  BarChart3,
  ExternalLink,
  Download,
  Settings,
  TrendingUp,
  Gauge,
  Thermometer,
  Droplets,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function PowerBIDashboard() {
  const [exporting, setExporting] = useState(false);
  const [embedUrl, setEmbedUrl] = useState(import.meta.env.VITE_POWERBI_EMBED_URL || '');
  const [tempUrlInput, setTempUrlInput] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await weatherApi.getStats({ days: 7 });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load Power BI visualization data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const res = await weatherApi.exportCsv();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `surat_weather_powerbi_dataset_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleSaveEmbedUrl = (e) => {
    e.preventDefault();
    if (tempUrlInput.trim()) {
      setEmbedUrl(tempUrlInput.trim());
      setShowConfigModal(false);
    }
  };

  const dailyData = (stats?.dailyTrends || []).map((item) => ({
    ...item,
    formattedDate: new Date(item.observation_date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    })
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Power BI Weather Intelligence Dashboard
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Executive Analytics & Synchronized Meteorological Modeling
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-850 hover:bg-navy-800 border border-navy-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configure Embed URL</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-electric-500 hover:from-cyan-400 hover:to-electric-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95 disabled:opacity-50 hover:text-white"
          >
            <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-bounce' : ''}`} />
            <span>{exporting ? 'Downloading...' : 'Export Power BI CSV'}</span>
          </button>
        </div>
      </div>

      {/* Embedded Iframe Container or The 2 Visualizations */}
      {embedUrl ? (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-3 bg-navy-850 border-b border-navy-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Live Power BI Service Frame</span>
            </div>
            <a
              href={embedUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Open in Power BI Service</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="relative w-full h-[750px] bg-navy-950">
            <iframe
              title="Surat Weather Intelligence Power BI Report"
              src={embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      ) : (
        /* The 2 Core Power BI Visualizations */
        <div className="space-y-6">
          {/* Top Quick KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-navy-900 border border-navy-800 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Temperature</span>
              <p className="text-2xl font-black text-cyan-300 mt-1">{stats?.kpis?.avg_temperature || '--'}°C</p>
              <span className="text-[10px] text-slate-400">Mean Recorded</span>
            </div>
            <div className="p-4 bg-navy-900 border border-navy-800 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Peak Max Temp</span>
              <p className="text-2xl font-black text-rose-400 mt-1">{stats?.kpis?.max_temperature || '--'}°C</p>
              <span className="text-[10px] text-rose-400/80">Diurnal High</span>
            </div>
            <div className="p-4 bg-navy-900 border border-navy-800 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mean Humidity</span>
              <p className="text-2xl font-black text-sky-400 mt-1">{stats?.kpis?.avg_humidity || '--'}%</p>
              <span className="text-[10px] text-slate-400">Coastal Moisture</span>
            </div>
            <div className="p-4 bg-navy-900 border border-navy-800 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mean Barometer</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{stats?.kpis?.avg_pressure || '--'} hPa</p>
              <span className="text-[10px] text-slate-400">Atmospheric Level</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VISUALIZATION 1: Temperature Trend & Extremes */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      Power BI Visual 1
                    </span>
                    <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                      <Thermometer className="w-4 h-4 text-cyan-400" />
                      Temperature Diurnal Trend & Variance
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400 px-2 py-1 bg-navy-850 rounded border border-navy-800">
                    AVG / MIN / MAX
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Daily aggregated average temperature with minimum dawn trough and maximum afternoon peak.
                </p>
              </div>

              <div className="h-72 w-full">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                      <defs>
                        <linearGradient id="pbiTempGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                      <XAxis dataKey="formattedDate" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} unit="°C" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Area type="monotone" dataKey="avg_temperature" name="Average Temp (°C)" stroke="#00F0FF" strokeWidth={2.5} fill="url(#pbiTempGrad)" />
                      <Line type="monotone" dataKey="max_temperature" name="Max Temp (°C)" stroke="#f43f5e" strokeWidth={1.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="min_temperature" name="Min Temp (°C)" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* VISUALIZATION 2: Humidity & Barometric Pressure Dynamics */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      Power BI Visual 2
                    </span>
                    <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                      <Droplets className="w-4 h-4 text-sky-400" />
                      Relative Humidity & Atmospheric Pressure
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400 px-2 py-1 bg-navy-850 rounded border border-navy-800">
                    Dual Metric Tracking
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Comparison between ambient moisture percentage and sea-level barometric pressure.
                </p>
              </div>

              <div className="h-72 w-full">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                      <XAxis dataKey="formattedDate" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" domain={[30, 100]} stroke="#38bdf8" tick={{ fontSize: 11 }} unit="%" />
                      <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} stroke="#10b981" tick={{ fontSize: 11 }} unit="hPa" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Line yAxisId="left" type="monotone" dataKey="avg_humidity" name="Relative Humidity (%)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line yAxisId="right" type="monotone" dataKey="avg_pressure" name="Pressure (hPa)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal to configure embed URL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Configure Power BI Report Embed URL</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter the Microsoft Power BI secure iframe embed link or public URL (starts with https://app.powerbi.com/...)
            </p>

            <form onSubmit={handleSaveEmbedUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Embed URL
                </label>
                <input
                  type="url"
                  value={tempUrlInput}
                  onChange={(e) => setTempUrlInput(e.target.value)}
                  placeholder="https://app.powerbi.com/reportEmbed?reportId=..."
                  className="w-full px-4 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-electric-500 hover:from-cyan-400 hover:to-electric-400 text-white font-bold rounded-xl text-xs hover:text-white"
                >
                  Save & Load Embed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
