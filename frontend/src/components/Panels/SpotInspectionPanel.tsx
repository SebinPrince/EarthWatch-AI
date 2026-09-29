import React, { useState } from 'react';
import {
  X,
  MapPin,
  Crosshair,
  Compass,
  CloudSun,
  Wind,
  Droplets,
  Gauge,
  Radio,
  Satellite as SatelliteIcon,
  ShieldAlert,
  AlertTriangle,
  FlaskConical,
  Bot,
  Copy,
  Check,
  ZoomIn,
  Flame,
  Waves,
  Mountain,
  Tornado,
  Zap,
  Activity,
  Globe
} from 'lucide-react';
import { SpotInspectionData, DisasterEvent } from '../../types';

interface SpotInspectionPanelProps {
  data: SpotInspectionData | null;
  isLoading: boolean;
  onClose: () => void;
  onSimulateAtSpot: (lat: number, lon: number, name: string) => void;
  onAskAIAboutSpot: (spotName: string, lat: number, lon: number) => void;
  onSelectEvent: (ev: DisasterEvent) => void;
  onZoomIn: (lat: number, lon: number) => void;
}

export const SpotInspectionPanel: React.FC<SpotInspectionPanelProps> = ({
  data,
  isLoading,
  onClose,
  onSimulateAtSpot,
  onAskAIAboutSpot,
  onSelectEvent,
  onZoomIn,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!data && !isLoading) return null;

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(`${data.latitude}, ${data.longitude}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHazardIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'wildfire':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'flood':
        return <Waves className="w-3.5 h-3.5 text-cyan-400" />;
      case 'cyclone':
        return <Tornado className="w-3.5 h-3.5 text-indigo-400" />;
      case 'earthquake':
        return <Mountain className="w-3.5 h-3.5 text-emerald-400" />;
      case 'storm':
        return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="absolute top-20 right-6 z-30 w-96 max-h-[85vh] flex flex-col rounded-2xl glass-panel border border-sky-500/30 text-slate-100 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-4 duration-300 overflow-hidden bg-slate-950/90 select-none">
      
      {/* Top Header Bar */}
      <div className="p-4 border-b border-sky-500/20 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md shadow-sky-500/20">
            <Crosshair className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
                Spot Intelligence
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide truncate max-w-[200px]">
              {isLoading ? 'Targeting Surface...' : data?.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {data && (
            <button
              onClick={() => onZoomIn(data.latitude, data.longitude)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
              title="Fly Camera to Spot"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="p-6 space-y-4 font-mono text-xs text-sky-300 animate-pulse">
          <div className="h-4 bg-slate-800/80 rounded w-3/4" />
          <div className="h-16 bg-slate-800/60 rounded-xl" />
          <div className="h-20 bg-slate-800/60 rounded-xl" />
          <div className="h-10 bg-slate-800/40 rounded-lg" />
          <div className="text-center text-[11px] text-slate-400">
            Querying reverse geocode, meteorological radar & CelesTrak ephemeris...
          </div>
        </div>
      ) : data ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Coordinates & Location Banner */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-cyan-400" />
                <span>Target Position</span>
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] font-mono text-sky-400 hover:text-white transition-colors"
                title="Copy Lat, Lon"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            
            <div className="text-xs font-mono font-bold text-sky-300 tracking-wider">
              {data.coordinate_label}
            </div>

            <div className="text-xs text-slate-300 flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate" title={data.display_name}>
                {data.display_name}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
              <span>Territory: <strong className="text-slate-200">{data.country}</strong></span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                data.is_maritime ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {data.terrain_type}
              </span>
            </div>
          </div>

          {/* Risk Level Badge */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Environmental Risk</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                data.risk_level.includes('Critical') ? 'bg-rose-500 animate-ping' :
                data.risk_level.includes('High') ? 'bg-orange-500' :
                data.risk_level.includes('Moderate') ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <span className={`text-xs font-mono font-bold uppercase ${
                data.risk_level.includes('Critical') ? 'text-rose-400' :
                data.risk_level.includes('High') ? 'text-orange-400' :
                data.risk_level.includes('Moderate') ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {data.risk_level}
              </span>
            </div>
          </div>

          {/* Live Meteorology Card */}
          {data.weather && (
            <div className="p-3.5 rounded-xl bg-gradient-to-tr from-slate-900/80 to-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Atmospheric Conditions</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">● LIVE</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white font-mono">
                    {data.weather.temperature_c}°C
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    (feels {data.weather.apparent_temperature_c}°C)
                  </span>
                </div>
                <div className="text-xs font-semibold text-sky-300">
                  {data.weather.condition}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-sky-400" />
                  <span>{data.weather.wind_speed_kmh} km/h</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>{data.weather.humidity_percent}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-indigo-400" />
                  <span>{data.weather.pressure_hpa} hPa</span>
                </div>
              </div>
            </div>
          )}

          {/* CelesTrak Overhead Satellite Flyover Prediction */}
          {data.next_overpass && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900 border border-sky-500/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-sky-300 font-bold flex items-center gap-1.5">
                  <SatelliteIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Next Overhead Satellite Pass</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono">
                  SGP4
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{data.next_overpass.satellite_name}</span>
                    <span className="text-[10px] text-slate-400">({data.next_overpass.operator})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Payload: <span className="text-cyan-300">{data.next_overpass.sensor_type}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-cyan-300">
                    {data.next_overpass.minutes_until_pass < 60
                      ? `In ${data.next_overpass.minutes_until_pass}m`
                      : `In ${Math.floor(data.next_overpass.minutes_until_pass / 60)}h ${data.next_overpass.minutes_until_pass % 60}m`}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">
                    Pass: {new Date(data.next_overpass.predicted_pass_time).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] font-mono">
                <span className="text-slate-400">Closest Approach: <strong className="text-slate-200">{data.next_overpass.closest_approach_km} km</strong></span>
                {data.next_overpass.is_within_swath ? (
                  <span className="text-emerald-400 font-bold">✓ IN DIRECT SWATH</span>
                ) : (
                  <span className="text-slate-500">Off-Nadir</span>
                )}
              </div>
            </div>
          )}

          {/* Active Hazards within Proximity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Regional Hazard Footprint</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {data.nearby_events.length} in range
              </span>
            </div>

            {data.nearby_events.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-400 font-mono">
                No active severe disaster zones within 2,500 km.
              </div>
            ) : (
              <div className="space-y-1.5">
                {data.nearby_events.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent(ev as any)}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getHazardIcon(ev.type)}
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {ev.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 capitalize">
                          {ev.type} • {ev.severity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-sky-400">
                        {Math.round(ev.distance_km)} km
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">Distance</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              onClick={() => onSimulateAtSpot(data.latitude, data.longitude, data.name)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-mono text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Simulate Hazard Incident Here</span>
            </button>

            <button
              onClick={() => onAskAIAboutSpot(data.name, data.latitude, data.longitude)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 font-mono text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI Analyst About Region</span>
            </button>
          </div>

        </div>
      ) : null}

    </div>
  );
};
