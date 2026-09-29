import React from 'react';
import {
  X,
  Settings,
  Database,
  Globe2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onSyncLive: () => void;
  isSyncing: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onSyncLive,
  isSyncing,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl flex flex-col glass-panel rounded-2xl border border-sky-500/25 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-sky-500/15 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-sky-400" />
            <h3 className="font-extrabold text-base text-white">
              EarthWatch Platform Configuration
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* Real-time Telemetry Data Source Sync */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Live Environmental Telemetry Feeds</span>
              </div>
              <button
                onClick={onSyncLive}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-[11px] transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'FETCHING...' : 'SYNC LIVE USGS'}</span>
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              EarthWatch AI periodically synchronizes significant seismic events from the USGS Global Seismograph Network and atmospheric observations via Open-Meteo.
            </p>
          </div>

          {/* Database & Architecture Specs */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase text-slate-400">
              PLATFORM ARCHITECTURE & RUNTIME
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="text-slate-400">DATABASE BACKEND</div>
                <div className="font-mono text-white font-bold mt-0.5">SQLite 3 (PostgreSQL-Ready)</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="text-slate-400">3D GLOBE ENGINE</div>
                <div className="font-mono text-sky-400 font-bold mt-0.5">CesiumJS WGS84 Ellipsoid</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="text-slate-400">ORBIT PROPAGATOR</div>
                <div className="font-mono text-emerald-400 font-bold mt-0.5">SGP4 / Keplerian Kinematics</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="text-slate-400">AI INFERENCE</div>
                <div className="font-mono text-purple-400 font-bold mt-0.5">Scikit / Environmental Heuristics</div>
              </div>
            </div>
          </div>

          {/* Data Attribution & Sources */}
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Public Data Ingestion Pipeline:</span>
            </div>
            <div>• USGS Earthquake Hazards Program (Live GeoJSON)</div>
            <div>• NASA EONET & FIRMS Thermal Hotspots (VIIRS & MODIS)</div>
            <div>• Copernicus Emergency Management Service & ESA Sentinel</div>
            <div>• Open-Meteo High-Resolution Forecasting Model (No API Key Required)</div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
