import React, { useState } from 'react';
import { weatherApi } from '../services/api';
import {
  BarChart3,
  ExternalLink,
  Download,
  AlertCircle,
  FileCode2,
  CheckCircle2,
  Info,
  Maximize2,
  Sparkles,
  HelpCircle,
  Layers,
  Settings
} from 'lucide-react';

export default function PowerBIDashboard() {
  const [exporting, setExporting] = useState(false);
  const [embedUrl, setEmbedUrl] = useState(import.meta.env.VITE_POWERBI_EMBED_URL || '');
  const [tempUrlInput, setTempUrlInput] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);

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

  // Required 9 Power BI Visual Components
  const powerBiRequiredVisuals = [
    { id: 1, title: 'Average Temperature KPI', type: 'Card Visual / KPI', field: 'AVG(temperature)' },
    { id: 2, title: 'Maximum Temperature KPI', type: 'Card Visual / KPI', field: 'MAX(max_temperature)' },
    { id: 3, title: 'Minimum Temperature KPI', type: 'Card Visual / KPI', field: 'MIN(min_temperature)' },
    { id: 4, title: 'Temperature Trend', type: 'Line & Area Chart', field: 'temperature over observation_time' },
    { id: 5, title: 'Humidity Trend', type: 'Line Chart', field: 'humidity over observation_time' },
    { id: 6, title: 'Wind Speed Trend', type: 'Clustered Column Chart', field: 'wind_speed over observation_time' },
    { id: 7, title: 'Pressure Trend', type: 'Line Chart', field: 'pressure over observation_time' },
    { id: 8, title: 'Weather Condition Distribution', type: 'Donut / Pie Chart', field: 'COUNT(id) by weather_condition' },
    { id: 9, title: 'Weather Observations Table', type: 'Matrix / Table Visual', field: 'Full chronological telemetry log' }
  ];

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
              Microsoft Power BI Intelligence Report
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise BI Visualizations, DAX Measures & Interactive Slice-and-Dice
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-850 hover:bg-navy-800 border border-navy-700 rounded-xl text-xs font-semibold text-slate-300 transition"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configure Embed URL</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-electric-500 hover:from-cyan-400 hover:to-electric-400 text-navy-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-bounce' : ''}`} />
            <span>{exporting ? 'Downloading...' : 'Export Power BI CSV'}</span>
          </button>
        </div>
      </div>

      {/* Embedded Iframe Container or Configuration Guidance */}
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
        /* Configuration & Setup State (Academic Presentation Mode) */
        <div className="space-y-6">
          {/* Status Alert Banner */}
          <div className="bg-navy-900/90 border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 shrink-0 mt-1">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Power BI Embedded Reporting Ready
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    The Surat Weather Intelligence system provides native Microsoft Power BI integration via secure iframe embedding.
                    Follow the verified workflow below to publish your report and embed it live into this dashboard.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-navy-800 border border-navy-700 text-slate-300 font-mono">
                      Target Config: VITE_POWERBI_EMBED_URL
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                      Export Format: RFC-4180 CSV
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowConfigModal(true)}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-95 shrink-0"
              >
                Connect Embed URL
              </button>
            </div>
          </div>

          {/* Mandatory 9 Visual Requirements Grid */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Mandatory Power BI Report Architecture (9 Requirements)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The Power BI report built for this college project implements these 9 analytical components
                </p>
              </div>
              <span className="text-xs font-bold text-cyan-400 px-2.5 py-1 bg-navy-850 rounded border border-navy-800">
                9/9 Components Mapped
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {powerBiRequiredVisuals.map((vis) => (
                <div
                  key={vis.id}
                  className="p-4 bg-navy-850 border border-navy-800 rounded-xl hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-cyan-400 font-bold">Visual #{vis.id}</span>
                    <span className="text-[11px] text-slate-400">{vis.type}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{vis.title}</h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-1 bg-navy-900 p-1.5 rounded border border-navy-800 truncate">
                    {vis.field}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Power BI Setup Card */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              Power BI Integration & Publishing Guide
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-navy-850 rounded-xl border border-navy-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center">1</span>
                <p className="font-bold text-white">Export Dataset</p>
                <p className="text-slate-400 leading-relaxed">
                  Click the "Export Power BI CSV" button above to obtain the latest historical observations directly from MySQL.
                </p>
              </div>

              <div className="p-4 bg-navy-850 rounded-xl border border-navy-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center">2</span>
                <p className="font-bold text-white">Import to Power BI</p>
                <p className="text-slate-400 leading-relaxed">
                  Open Power BI Desktop, select "Get Data" → "Text/CSV", select the exported dataset, and confirm date column types.
                </p>
              </div>

              <div className="p-4 bg-navy-850 rounded-xl border border-navy-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center">3</span>
                <p className="font-bold text-white">Build & Publish</p>
                <p className="text-slate-400 leading-relaxed">
                  Create the 9 required visuals using DAX measures (see powerbi/POWERBI_SETUP.md), then click "Publish" to Power BI Service.
                </p>
              </div>

              <div className="p-4 bg-navy-850 rounded-xl border border-navy-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center">4</span>
                <p className="font-bold text-white">Obtain Embed Link</p>
                <p className="text-slate-400 leading-relaxed">
                  In Power BI Service: File → Embed Report → Website or Portal (or Publish to Web), copy the iframe URL and paste it here.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-navy-850/80 rounded-xl border border-navy-800 text-xs text-slate-400 flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-slate-200">Academic & Licensing Note: </span>
                Power BI Service public embedding ("Publish to Web") requires appropriate Microsoft tenant permissions. For internal/academic evaluations, reports can also be demonstrated natively via Power BI Desktop using the pre-packaged dataset in <code className="text-cyan-400 font-mono">dataset/weather_records.csv</code>.
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
                  className="px-4 py-2 bg-navy-800 hover:bg-navy-750 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-xl text-xs"
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
