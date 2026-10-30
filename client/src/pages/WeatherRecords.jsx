import React, { useState, useEffect } from 'react';
import { weatherApi } from '../services/api';
import {
  Database,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Calendar,
  Layers
} from 'lucide-react';

export default function WeatherRecords() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalRecords: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchRecords = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        condition: condition !== 'all' ? condition : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search.trim() || undefined
      };
      const res = await weatherApi.getHistory(params);
      setRecords(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(1);
  }, [condition, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords(1);
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const res = await weatherApi.exportCsv({
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `surat_weather_records_${new Date().toISOString().slice(0, 10)}.csv`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Surat Weather Database Records
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Searchable, paginated relational table directly connected to MySQL
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-200 border border-cyan-500/30 rounded-xl text-xs font-bold transition shadow-sm shadow-cyan-500/10 active:scale-95 disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-bounce' : ''}`} />
          <span>{exporting ? 'Generating CSV...' : 'Export Filtered Dataset'}</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description (e.g. clear, haze, rain)..."
            className="w-full pl-10 pr-20 py-2 bg-navy-850 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 hover:text-cyan-200 rounded-lg text-xs font-semibold"
          >
            Filter
          </button>
        </form>

        {/* Condition Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Condition:</span>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="px-3 py-1.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-cyan-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Conditions</option>
              <option value="Clear">Clear</option>
              <option value="Clouds">Clouds</option>
              <option value="Haze">Haze</option>
              <option value="Rain">Rain</option>
            </select>
          </div>

          {/* Date range pickers */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-navy-850 border-b border-navy-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Table: <code className="font-mono text-cyan-400">weather_records</code></span>
          </div>
          <span className="text-slate-400 font-mono">
            {pagination.totalRecords} total entries found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-navy-800">
              <tr>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Observation Time (IST)</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Feels Like</th>
                <th className="py-3 px-4">Humidity</th>
                <th className="py-3 px-4">Pressure</th>
                <th className="py-3 px-4">Wind Speed</th>
                <th className="py-3 px-4">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
                    <span>Loading database records...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    No records matched the filter criteria.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const d = new Date(r.observation_time);
                  const istTime = d.toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  });

                  return (
                    <tr key={r.id} className="hover:bg-navy-800/80 hover:text-white transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 font-medium">#{r.id}</td>
                      <td className="py-3 px-4 font-mono text-cyan-400 font-semibold">{istTime}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-navy-800 border border-navy-700 text-slate-200">
                          {r.weather_condition}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1.5 capitalize">
                          ({r.weather_description})
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{r.temperature}°C</td>
                      <td className="py-3 px-4 text-slate-400">{r.feels_like}°C</td>
                      <td className="py-3 px-4 font-semibold text-sky-400">{r.humidity}%</td>
                      <td className="py-3 px-4 font-mono">{r.pressure} hPa</td>
                      <td className="py-3 px-4">{r.wind_speed} m/s ({r.wind_direction}°)</td>
                      <td className="py-3 px-4">{(r.visibility / 1000).toFixed(1)} km</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-navy-850 border-t border-navy-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Page <span className="text-white font-bold">{pagination.page}</span> of{' '}
            <span className="text-white font-bold">{pagination.totalPages}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRecords(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchRecords(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

