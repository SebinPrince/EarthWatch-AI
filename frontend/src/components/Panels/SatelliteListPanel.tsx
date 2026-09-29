import React, { useState } from 'react';
import {
  X,
  Satellite as SatelliteIcon,
  ChevronRight,
  Filter,
  Radio,
  Eye
} from 'lucide-react';
import { Satellite } from '../../types';

interface SatelliteListPanelProps {
  satellites: Satellite[];
  selectedSatellite: Satellite | null;
  onSelectSatellite: (sat: Satellite) => void;
  onClose: () => void;
}

const MISSION_TABS = [
  'All',
  'Earth Observation',
  'Weather',
  'Disaster monitoring',
  'Scientific',
  'Navigation',
  'Communication'
];

export const SatelliteListPanel: React.FC<SatelliteListPanelProps> = ({
  satellites,
  selectedSatellite,
  onSelectSatellite,
  onClose,
}) => {
  const [activeMission, setActiveMission] = useState<string>('All');

  const filtered = activeMission === 'All'
    ? satellites
    : satellites.filter((s) => s.mission.toLowerCase() === activeMission.toLowerCase());

  return (
    <div className="absolute top-20 left-[304px] w-96 max-h-[calc(100vh-160px)] z-30 flex flex-col glass-panel rounded-2xl border border-indigo-500/25 shadow-2xl text-slate-100 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-indigo-500/20 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <SatelliteIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">
              Orbital Satellite Fleet
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {filtered.length} Platforms Active
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mission Filter Tabs */}
      <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-900/30 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
        {MISSION_TABS.map((m) => (
          <button
            key={m}
            onClick={() => setActiveMission(m)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
              activeMission === m
                ? 'bg-indigo-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Satellite List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((sat) => {
          const isSelected = selectedSatellite?.id === sat.id;
          return (
            <div
              key={sat.id}
              onClick={() => onSelectSatellite(sat)}
              className={`p-3 rounded-xl glass-card cursor-pointer flex items-center justify-between transition-all ${
                isSelected ? 'border-indigo-400/60 bg-indigo-500/10' : ''
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🛰️</span>
                <div>
                  <h4 className="font-semibold text-xs text-white">
                    {sat.name}
                  </h4>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {sat.mission} • {sat.country}
                  </div>
                  <div className="text-[9px] text-sky-400 font-mono mt-0.5">
                    Alt: {sat.altitude} km • {sat.latitude.toFixed(2)}°, {sat.longitude.toFixed(2)}°
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  {sat.orbit_type}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
