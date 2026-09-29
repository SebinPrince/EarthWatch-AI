import React from 'react';
import {
  X,
  ShieldAlert,
  Flame,
  Waves,
  Tornado,
  Mountain,
  SunMedium,
  Zap,
  Activity,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DisasterEvent, EventType, SeverityLevel } from '../../types';

interface DisasterListPanelProps {
  events: DisasterEvent[];
  selectedEvent: DisasterEvent | null;
  onSelectEvent: (event: DisasterEvent) => void;
  onClose: () => void;
}

export const DisasterListPanel: React.FC<DisasterListPanelProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onClose,
}) => {
  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'wildfire': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'flood': return <Waves className="w-4 h-4 text-cyan-400" />;
      case 'cyclone': return <Tornado className="w-4 h-4 text-indigo-400" />;
      case 'volcano': return <Flame className="w-4 h-4 text-rose-500" />;
      case 'heatwave': return <SunMedium className="w-4 h-4 text-amber-400" />;
      case 'earthquake': return <Mountain className="w-4 h-4 text-emerald-400" />;
      case 'storm': return <Zap className="w-4 h-4 text-yellow-400" />;
      default: return <Activity className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="absolute top-20 left-[304px] w-96 max-h-[calc(100vh-160px)] z-30 flex flex-col glass-panel rounded-2xl border border-rose-500/25 shadow-2xl text-slate-100 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-rose-500/20 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">
              Global Hazard Registry
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {events.length} Active Events Monitored
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {events.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No active hazards match the selected filters.
          </div>
        ) : (
          events.map((ev) => {
            const isSelected = selectedEvent?.id === ev.id;
            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`p-3 rounded-xl glass-card cursor-pointer flex items-center justify-between transition-all ${
                  isSelected ? 'border-rose-400/60 bg-rose-500/10' : ''
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 mt-0.5">
                    {getEventIcon(ev.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-white line-clamp-1">
                      {ev.title}
                    </h4>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                      <span className="uppercase">{ev.type}</span>
                      <span>•</span>
                      <span>{ev.source}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                    ev.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : ev.severity === 'high'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : ev.severity === 'moderate'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  }`}>
                    {ev.severity}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
