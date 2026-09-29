import React from 'react';
import {
  Globe,
  ShieldAlert,
  Satellite as SatelliteIcon,
  MapPin,
  BarChart3,
  Bot,
  FlaskConical,
  Settings,
  Filter,
  Flame,
  Waves,
  Tornado,
  Mountain,
  SunMedium,
  Zap,
  Activity,
  CheckCircle2,
  RefreshCw,
  Orbit
} from 'lucide-react';
import { FilterState, EventType, SeverityLevel } from '../../types';

export type NavTab =
  | 'overview'
  | 'disasters'
  | 'satellites'
  | 'celestrak'
  | 'locations'
  | 'analytics'
  | 'analyst'
  | 'simulation'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  disasterCount: number;
  satelliteCount: number;
  onSyncLive: () => void;
  isSyncing: boolean;
}

const EVENT_TYPE_OPTIONS: { id: EventType | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Hazards', icon: <Activity className="w-3.5 h-3.5 text-sky-400" /> },
  { id: 'wildfire', label: 'Wildfire', icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
  { id: 'flood', label: 'Flood', icon: <Waves className="w-3.5 h-3.5 text-cyan-400" /> },
  { id: 'cyclone', label: 'Cyclone', icon: <Tornado className="w-3.5 h-3.5 text-indigo-400" /> },
  { id: 'earthquake', label: 'Earthquake', icon: <Mountain className="w-3.5 h-3.5 text-emerald-400" /> },
  { id: 'volcano', label: 'Volcano', icon: <Flame className="w-3.5 h-3.5 text-rose-500" /> },
  { id: 'heatwave', label: 'Heatwave', icon: <SunMedium className="w-3.5 h-3.5 text-amber-400" /> },
  { id: 'storm', label: 'Storm', icon: <Zap className="w-3.5 h-3.5 text-yellow-400" /> },
  { id: 'environmental_anomaly', label: 'Anomaly', icon: <Activity className="w-3.5 h-3.5 text-purple-400" /> },
];

const SEVERITY_OPTIONS: { id: SeverityLevel | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: 'bg-slate-500' },
  { id: 'critical', label: 'Critical', color: 'bg-rose-500' },
  { id: 'high', label: 'High', color: 'bg-orange-500' },
  { id: 'moderate', label: 'Moderate', color: 'bg-amber-500' },
  { id: 'low', label: 'Low', color: 'bg-sky-500' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  filters,
  onFilterChange,
  disasterCount,
  satelliteCount,
  onSyncLive,
  isSyncing,
}) => {
  return (
    <aside className="w-72 h-screen z-30 flex flex-col justify-between glass-panel border-r border-sky-500/15 text-slate-200 select-none">
      {/* Top Logo & System Indicator */}
      <div className="p-4 border-b border-sky-500/15">
        <div className="flex items-center gap-3 mb-2 cursor-pointer" onClick={() => onSelectTab('overview')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Globe className="w-5 h-5 text-slate-950 animate-spin-slow" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-sky-200 to-cyan-300 bg-clip-text text-transparent">
              EARTHWATCH AI
            </div>
            <div className="text-[9px] uppercase font-mono tracking-widest text-sky-400/90">
              Disaster Intelligence
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">MISSION CONTROL</span>
          </div>
          <button
            onClick={onSyncLive}
            disabled={isSyncing}
            className="flex items-center gap-1 text-sky-400 hover:text-white transition-colors"
            title="Sync Live USGS Feeds"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1">
          Operations
        </div>

        <button
          onClick={() => onSelectTab('overview')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'overview'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>Global Overview</span>
          </div>
        </button>

        <button
          onClick={() => onSelectTab('disasters')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'disasters'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40 shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Disaster Monitor</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono">
            {disasterCount}
          </span>
        </button>

        <button
          onClick={() => onSelectTab('satellites')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'satellites'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <SatelliteIcon className="w-4 h-4 text-indigo-400" />
            <span>Satellites Fleet</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
            {satelliteCount}
          </span>
        </button>

        <button
          onClick={() => onSelectTab('celestrak')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'celestrak'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Orbit className="w-4 h-4 text-cyan-400" />
            <span>CelesTrak Space Hub</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono uppercase">
            TLE/SGP4
          </span>
        </button>

        <button
          onClick={() => onSelectTab('locations')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'locations'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Location Intelligence</span>
          </div>
        </button>

        <button
          onClick={() => onSelectTab('analytics')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'analytics'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Analytics Dashboard</span>
          </div>
        </button>

        <button
          onClick={() => onSelectTab('analyst')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'analyst'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Bot className="w-4 h-4 text-purple-400" />
            <span>AI Earth Analyst</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        </button>

        <button
          onClick={() => onSelectTab('simulation')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'simulation'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FlaskConical className="w-4 h-4 text-amber-400" />
            <span>Simulation Mode</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono uppercase">
            SIM
          </span>
        </button>

        {/* Global Filters Section */}
        <div className="pt-4 pb-2">
          <div className="flex items-center justify-between px-3 py-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <Filter className="w-3 h-3" />
              <span>Hazard Filter</span>
            </div>
            {filters.eventType !== 'all' && (
              <button
                onClick={() => onFilterChange({ ...filters, eventType: 'all' })}
                className="text-[10px] text-sky-400 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 px-1 mt-1">
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onFilterChange({ ...filters, eventType: opt.id })}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] font-medium transition-all text-left ${
                  filters.eventType === opt.id
                    ? 'bg-sky-500/30 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                {opt.icon}
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Severity Filter */}
        <div className="pt-2 pb-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1">
            Severity Filter
          </div>
          <div className="flex items-center gap-1 px-2 mt-1">
            {SEVERITY_OPTIONS.map((sev) => (
              <button
                key={sev.id}
                onClick={() => onFilterChange({ ...filters, severity: sev.id })}
                className={`flex-1 py-1 text-center rounded text-[10px] font-mono uppercase transition-all ${
                  filters.severity === sev.id
                    ? 'bg-slate-200 text-slate-950 font-bold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {sev.label}
              </button>
            ))}
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="pt-2 pb-3 px-2 border-t border-slate-800/60">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 py-1">
            Map Layers
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <label className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-800/40 cursor-pointer">
              <span>Disasters Layer</span>
              <input
                type="checkbox"
                checked={filters.showDisasters}
                onChange={(e) => onFilterChange({ ...filters, showDisasters: e.target.checked })}
                className="rounded accent-sky-500 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-800/40 cursor-pointer">
              <span>Satellites Layer</span>
              <input
                type="checkbox"
                checked={filters.showSatellites}
                onChange={(e) => onFilterChange({ ...filters, showSatellites: e.target.checked })}
                className="rounded accent-sky-500 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-800/40 cursor-pointer">
              <span>Orbit Tracks</span>
              <input
                type="checkbox"
                checked={filters.showOrbits}
                onChange={(e) => onFilterChange({ ...filters, showOrbits: e.target.checked })}
                className="rounded accent-sky-500 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-800/40 cursor-pointer">
              <span>Country & Place Labels</span>
              <input
                type="checkbox"
                checked={filters.showLabels}
                onChange={(e) => onFilterChange({ ...filters, showLabels: e.target.checked })}
                className="rounded accent-sky-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Settings Bottom Button */}
      <div className="p-3 border-t border-sky-500/15">
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System Settings</span>
        </button>
      </div>
    </aside>
  );
};
