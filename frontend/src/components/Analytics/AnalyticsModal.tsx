import React from 'react';
import {
  X,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  Globe,
  Satellite as SatelliteIcon,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';
import { AnalyticsResponse } from '../../types';

interface AnalyticsModalProps {
  analytics: AnalyticsResponse | null;
  onClose: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  wildfire: '#f97316',
  flood: '#06b6d4',
  cyclone: '#6366f1',
  earthquake: '#10b981',
  volcano: '#f43f5e',
  heatwave: '#eab308',
  storm: '#eab308',
  environmental_anomaly: '#a855f7',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  moderate: '#eab308',
  low: '#38bdf8',
};

const MISSION_COLORS = ['#38bdf8', '#10b981', '#f43f5e', '#a855f7', '#fbbf24', '#ec4899'];

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ analytics, onClose }) => {
  if (!analytics) return null;

  // Prepare data for Recharts
  const eventsByTypeData = Object.entries(analytics.events_by_type).map(([key, val]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    count: val,
    color: TYPE_COLORS[key] || '#38bdf8',
  }));

  const eventsBySeverityData = Object.entries(analytics.events_by_severity).map(([key, val]) => ({
    name: key.toUpperCase(),
    value: val,
    color: SEVERITY_COLORS[key] || '#94a3b8',
  }));

  const eventsByRegionData = Object.entries(analytics.events_by_region).map(([key, val]) => ({
    region: key,
    events: val,
  }));

  const satellitesByMissionData = Object.entries(analytics.satellites_by_mission).map(([key, val], idx) => ({
    name: key,
    value: val,
    color: MISSION_COLORS[idx % MISSION_COLORS.length],
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[85vh] flex flex-col glass-panel rounded-2xl border border-cyan-500/30 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Global Earth Analytics & Fleet Telemetry
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                  REAL-TIME AGGREGATION
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Historical Frequency • Regional Vulnerability • Orbital Sensor Distribution
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>TOTAL HAZARDS</span>
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {analytics.total_events}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <SatelliteIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>ORBITAL ASSETS</span>
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {analytics.total_satellites}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-500" />
                <span>CRITICAL SEVERITY</span>
              </span>
              <div className="text-2xl font-black font-mono text-rose-400 mt-1">
                {analytics.events_by_severity['critical'] || 0}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>GLOBAL COVERAGE</span>
              </span>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                99.8%
              </div>
            </div>
          </div>

          {/* Charts Row 1: Events by Type & Events by Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Events by Type Bar Chart */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-col">
              <h4 className="text-xs font-mono uppercase text-slate-300 font-bold mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <span>ACTIVE HAZARDS BY EVENT TYPE</span>
              </h4>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventsByTypeData} layout="vertical" margin={{ left: 15, right: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {eventsByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Events by Severity Pie Chart */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-col">
              <h4 className="text-xs font-mono uppercase text-slate-300 font-bold mb-3 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-rose-400" />
                <span>EVENTS CLASSIFICATION BY SEVERITY</span>
              </h4>
              <div className="w-full h-64 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventsBySeverityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {eventsBySeverityData.map((entry, index) => (
                        <Cell key={`sev-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: 6-Day Trend Area Chart & Satellite Fleet by Mission */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Timeline Multi-Hazard Trend Area Chart (2 cols) */}
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-col">
              <h4 className="text-xs font-mono uppercase text-slate-300 font-bold mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>GLOBAL DISASTER FREQUENCY & DETECTION TREND (LAST 6 DAYS)</span>
              </h4>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.timeline_trend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorWildfire" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="total" stroke="#38bdf8" fillOpacity={1} fill="url(#colorTotal)" name="Total Events" strokeWidth={2} />
                    <Area type="monotone" dataKey="earthquake" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Earthquake" />
                    <Area type="monotone" dataKey="wildfire" stroke="#f97316" fill="url(#colorWildfire)" fillOpacity={1} name="Wildfire" />
                    <Area type="monotone" dataKey="cyclone" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} name="Cyclone" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Satellite Count by Mission Type */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-col">
              <h4 className="text-xs font-mono uppercase text-slate-300 font-bold mb-3 flex items-center gap-1.5">
                <SatelliteIcon className="w-4 h-4 text-indigo-400" />
                <span>SATELLITE FLEET MISSIONS</span>
              </h4>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={satellitesByMissionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name.slice(0, 10)} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {satellitesByMissionData.map((entry, index) => (
                        <Cell key={`sat-miss-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
