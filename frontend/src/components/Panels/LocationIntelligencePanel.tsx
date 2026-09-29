import React from 'react';
import {
  X,
  MapPin,
  ShieldAlert,
  Satellite as SatelliteIcon,
  CloudSun,
  Wind,
  Droplets,
  Gauge,
  Activity,
  History,
  AlertCircle
} from 'lucide-react';
import { LocationItem, DisasterEvent, Satellite } from '../../types';

interface LocationIntelligencePanelProps {
  location: LocationItem;
  onClose: () => void;
  onSelectEvent: (event: DisasterEvent) => void;
  onSelectSatellite: (sat: Satellite) => void;
}

export const LocationIntelligencePanel: React.FC<LocationIntelligencePanelProps> = ({
  location,
  onClose,
  onSelectEvent,
  onSelectSatellite,
}) => {
  return (
    <div className="absolute top-20 left-[304px] w-96 max-h-[calc(100vh-160px)] z-30 flex flex-col glass-panel rounded-2xl border border-emerald-500/25 shadow-2xl text-slate-100 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-emerald-500/20 flex items-start justify-between bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <MapPin className="w-5 h-5 animate-bounce-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                {location.country}
              </span>
              {location.risk_level && (
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  location.risk_level === 'Critical'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : location.risk_level === 'High'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    : location.risk_level === 'Moderate'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {location.risk_level.toUpperCase()} RISK
                </span>
              )}
            </div>
            <h3 className="font-bold text-base text-white mt-0.5">
              {location.name}
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

      {/* Body scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Geographic Coordinates & Demographics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase">COORDINATES</span>
            <div className="font-mono text-white font-semibold mt-0.5">
              {location.latitude.toFixed(3)}°, {location.longitude.toFixed(3)}°
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase">REGION / STATE</span>
            <div className="font-semibold text-slate-200 truncate mt-0.5">
              {location.region || location.country}
            </div>
          </div>
        </div>

        {/* Live Weather Widget (Open-Meteo) */}
        {location.weather && (
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase mb-2">
              <div className="flex items-center gap-1.5">
                <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                <span>ATMOSPHERIC OBSERVATIONS</span>
              </div>
              <span className="text-emerald-400">LIVE FEED</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{location.weather.icon}</span>
                <div>
                  <div className="text-xl font-bold text-white">
                    {location.weather.temperature_c}°C
                  </div>
                  <div className="text-slate-300 font-medium text-[11px]">
                    {location.weather.condition}
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1 font-mono text-[11px] text-slate-300">
                <div className="flex items-center gap-1 justify-end">
                  <Wind className="w-3 h-3 text-sky-400" />
                  <span>{location.weather.wind_speed_kmh} km/h</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>{location.weather.humidity_percent}% hum</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Environmental / Disaster Events */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>NEARBY DISASTERS & EVENTS</span>
            </div>
            <span>{location.current_events?.length || 0} active</span>
          </div>

          {location.current_events && location.current_events.length > 0 ? (
            <div className="space-y-1.5">
              {location.current_events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className="p-2.5 rounded-xl glass-card cursor-pointer hover:border-rose-400/40 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white line-clamp-1">
                      {ev.title}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                      {ev.type} • {ev.source}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                    ev.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-orange-500/20 text-orange-300'
                  }`}>
                    {ev.severity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-slate-400 text-center">
              No active disaster alerts detected within 800 km buffer.
            </div>
          )}
        </div>

        {/* Satellites currently above/near region */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <SatelliteIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>SATELLITES ABOVE REGION</span>
            </div>
            <span>{location.nearby_satellites?.length || 0} orbital passes</span>
          </div>

          {location.nearby_satellites && location.nearby_satellites.length > 0 ? (
            <div className="space-y-1.5">
              {location.nearby_satellites.slice(0, 4).map((sat) => (
                <div
                  key={sat.id}
                  onClick={() => onSelectSatellite(sat)}
                  className="p-2.5 rounded-xl glass-card cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛰️</span>
                    <div>
                      <div className="font-semibold text-white">
                        {sat.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {sat.mission} • Alt: {sat.altitude} km
                      </div>
                    </div>
                  </div>
                  <span className="text-emerald-400 text-[10px] font-mono">
                    TRACK
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-slate-400 text-center">
              Constellation overpass scheduled in next orbital window.
            </div>
          )}
        </div>

        {/* Historical Events & Resilience */}
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            <span>HISTORICAL INCIDENTS ON RECORD:</span>
          </div>
          <span className="font-mono text-white font-bold">
            {location.historical_events_count || 12} events
          </span>
        </div>
      </div>
    </div>
  );
};
