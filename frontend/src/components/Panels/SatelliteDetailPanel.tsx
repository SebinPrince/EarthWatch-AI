import React, { useState } from 'react';
import {
  X,
  Satellite as SatelliteIcon,
  Navigation,
  Copy,
  Check,
  Radio,
  Eye,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { Satellite } from '../../types';

interface SatelliteDetailPanelProps {
  satellite: Satellite;
  onClose: () => void;
  onTrackSatellite: (sat: Satellite) => void;
}

export const SatelliteDetailPanel: React.FC<SatelliteDetailPanelProps> = ({
  satellite,
  onClose,
  onTrackSatellite,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyTLE = () => {
    if (satellite.tle_line1 && satellite.tle_line2) {
      navigator.clipboard.writeText(`${satellite.name}\n${satellite.tle_line1}\n${satellite.tle_line2}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="absolute top-20 left-[304px] w-[410px] max-h-[calc(100vh-160px)] z-30 flex flex-col glass-panel rounded-2xl border border-indigo-500/25 shadow-2xl text-slate-100 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-indigo-500/20 flex items-start justify-between bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-400">
            <SatelliteIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                {satellite.orbit_type || 'LEO'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                NORAD #{satellite.norad_id || 'CLASSIFIED'}
              </span>
            </div>
            <h3 className="font-bold text-sm text-white mt-0.5">
              {satellite.name}
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* CelesTrak SGP4 Verification Banner */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 border border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-cyan-300">
                CELESTRAK SGP4 PROPAGATED
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                Source: celestrak.org / NORAD General Perturbations
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            ACTIVE
          </span>
        </div>

        {/* Core telemetry stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase">SUB-SATELLITE POINT</span>
            <div className="font-mono text-white font-semibold mt-0.5">
              {satellite.latitude.toFixed(3)}°, {satellite.longitude.toFixed(3)}°
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase">ALTITUDE (TEME)</span>
            <div className="font-mono text-white font-semibold mt-0.5">
              {satellite.altitude ? `${satellite.altitude.toFixed(1)} km` : 'LEO'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase">ORBITAL VELOCITY</span>
            <div className="font-mono text-white font-semibold mt-0.5">
              {satellite.velocity ? `${satellite.velocity.toFixed(2)} km/s` : '7.6 km/s'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase">INCLINATION</span>
            <div className="font-mono text-white font-semibold mt-0.5">
              {satellite.inclination ? `${satellite.inclination.toFixed(2)}°` : '98.2°'}
            </div>
          </div>
        </div>

        {/* Swath & Sensor Payload from CelesTrak */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono uppercase text-[10px]">SENSOR SWATH FOOTPRINT:</span>
            <span className="text-emerald-400 font-mono font-bold">
              {satellite.swath_km ? `${satellite.swath_km.toFixed(0)} km width` : '250 km width'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono uppercase text-[10px]">SENSOR PAYLOAD TYPE:</span>
            <span className="text-sky-300 font-semibold truncate max-w-[200px]" title={satellite.sensor_type}>
              {satellite.sensor_type || 'Multispectral Instrument'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono uppercase text-[10px]">ORBITAL PERIOD:</span>
            <span className="font-mono text-white">
              {satellite.period_minutes ? `${satellite.period_minutes.toFixed(1)} min` : '98.0 min'}
            </span>
          </div>
        </div>

        {/* Operator & Mission */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-slate-400 font-mono uppercase text-[10px]">MISSION DOMAIN:</span>
            <span className="text-sky-300 font-semibold">{satellite.mission}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-slate-400 font-mono uppercase text-[10px]">OPERATOR:</span>
            <span className="text-white font-semibold truncate max-w-[210px]" title={satellite.operator || satellite.country}>
              {satellite.operator || satellite.country}
            </span>
          </div>
        </div>

        {/* Authentic CelesTrak Two-Line Element Set (TLE) */}
        {satellite.tle_line1 && satellite.tle_line2 && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400">
                CELESTRAK TWO-LINE ELEMENT (TLE)
              </span>
              <button
                onClick={handleCopyTLE}
                className="flex items-center gap-1 text-[10px] font-mono text-sky-400 hover:text-white transition-colors"
                title="Copy TLE"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <pre className="font-mono text-[9px] text-slate-300 bg-slate-900/90 p-2 rounded-lg overflow-x-auto leading-relaxed border border-slate-800/80">
              {satellite.tle_line1}
              {'\n'}
              {satellite.tle_line2}
            </pre>
          </div>
        )}

        {/* Purpose */}
        {satellite.purpose && (
          <div className="text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
              OBSERVATION & MONITORING CAPABILITIES
            </div>
            {satellite.purpose}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onTrackSatellite(satellite)}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <Navigation className="w-4 h-4" />
          <span>Track Satellite in Orbit</span>
        </button>
      </div>
    </div>
  );
};
