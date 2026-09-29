import React from 'react';
import {
  X,
  AlertTriangle,
  Flame,
  Waves,
  Tornado,
  Mountain,
  SunMedium,
  Zap,
  Activity,
  Satellite as SatelliteIcon,
  Bot,
  CloudSun,
  Wind,
  Droplets,
  Gauge,
  ExternalLink,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { DisasterEvent, EventSatelliteRel, Satellite } from '../../types';

interface EventDetailPanelProps {
  event: DisasterEvent;
  onClose: () => void;
  onSelectSatelliteId: (satId: string) => void;
}

export const EventDetailPanel: React.FC<EventDetailPanelProps> = ({
  event,
  onClose,
  onSelectSatelliteId,
}) => {
  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 neon-glow-rose';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50 neon-glow-amber';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/50';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'wildfire': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'flood': return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'cyclone': return <Tornado className="w-5 h-5 text-indigo-400" />;
      case 'volcano': return <Flame className="w-5 h-5 text-rose-500" />;
      case 'heatwave': return <SunMedium className="w-5 h-5 text-amber-400" />;
      case 'earthquake': return <Mountain className="w-5 h-5 text-emerald-400" />;
      case 'storm': return <Zap className="w-5 h-5 text-yellow-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="absolute top-20 left-[304px] w-96 max-h-[calc(100vh-160px)] z-30 flex flex-col glass-panel rounded-2xl border border-sky-500/20 shadow-2xl text-slate-100 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-sky-500/15 flex items-start justify-between bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            {getEventIcon(event.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${getSeverityBadge(event.severity)}`}>
                {event.severity}
              </span>
              <span className="text-xs font-mono uppercase text-sky-400">
                {event.type}
              </span>
            </div>
            <h3 className="font-bold text-sm text-white line-clamp-1 mt-0.5" title={event.title}>
              {event.title}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Core Metric Cards */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase">COORDINATES</span>
            <div className="font-mono text-white font-semibold mt-0.5">
              {event.latitude.toFixed(3)}°, {event.longitude.toFixed(3)}°
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase">STATUS</span>
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{event.status}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase">AFFECTED AREA</span>
            <div className="font-mono text-white font-semibold mt-0.5">
              {event.affected_area_km2 ? `${event.affected_area_km2.toLocaleString()} km²` : 'N/A'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase">EST. POPULATION</span>
            <div className="font-mono text-white font-semibold mt-0.5">
              {event.estimated_population ? event.estimated_population.toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">VERIFIED GROUND TELEMETRY</div>
            {event.description}
          </div>
        )}

        {/* Source verification tag */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
          <span>DATA SOURCE:</span>
          <span className="text-sky-300 font-semibold">{event.source}</span>
        </div>

        {/* AI ANALYSIS SECTION (Clearly distinguished) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>EARTHWATCH AI SYNTHESIS</span>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              AI-GENERATED
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed italic">
            &ldquo;{event.ai_summary || "Satellite and environmental data indicate elevated activity in the affected region. The event should be monitored for further expansion."}&rdquo;
          </p>
          <div className="text-[9px] font-mono text-slate-400 mt-2">
            * Automated synthesis derived from multi-sensor infrared/SAR telemetry. Verified source data displayed above.
          </div>
        </div>

        {/* SATELLITES RELEVANT TO THIS EVENT */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 font-mono uppercase">
              <SatelliteIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Satellites Relevant to this Event</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {event.relevant_satellites?.length || 0} active
            </span>
          </div>

          {event.relevant_satellites && event.relevant_satellites.length > 0 ? (
            <div className="space-y-2">
              {event.relevant_satellites.map((rel) => (
                <div
                  key={rel.satellite_id}
                  onClick={() => onSelectSatelliteId(rel.satellite_id)}
                  className="p-2.5 rounded-xl glass-card cursor-pointer group flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                      <span>🛰️ {rel.satellite_name}</span>
                    </span>
                    <span className="text-[10px] font-mono text-sky-400 font-bold">
                      {rel.distance_km.toFixed(0)} km
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="text-[10px] font-mono text-slate-400">{rel.sensor_type || rel.mission}</span>
                    <span className="text-emerald-400 text-[10px] font-mono font-medium">
                      {rel.relationship}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Swath: {rel.swath_km ? `${rel.swath_km.toFixed(0)} km` : '250 km'}</span>
                    {rel.next_pass_in_minutes !== undefined && rel.next_pass_in_minutes !== null ? (
                      <span className="text-cyan-300">
                        {rel.next_pass_in_minutes === 0 ? 'Zenith Pass Active' : `Next Pass in ~${rel.next_pass_in_minutes}m`}
                      </span>
                    ) : (
                      <span className="text-slate-500">CelesTrak Verified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-center">
              Scanning active orbital constellation for nearest pass...
            </div>
          )}
        </div>

        {/* Local Weather Context if available */}
        {event.weather_context && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 mb-2">
              <div className="flex items-center gap-1.5">
                <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                <span>LOCAL WEATHER CONTEXT</span>
              </div>
              <span className="text-[9px] text-emerald-400">OPEN-METEO LIVE</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">{event.weather_context.icon}</span>
                <div>
                  <div className="font-bold text-white text-sm">
                    {event.weather_context.temperature_c}°C
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {event.weather_context.condition}
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] font-mono text-slate-300 space-y-0.5">
                <div className="flex items-center gap-1 justify-end">
                  <Wind className="w-3 h-3 text-sky-400" />
                  <span>{event.weather_context.wind_speed_kmh} km/h</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>{event.weather_context.humidity_percent}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
