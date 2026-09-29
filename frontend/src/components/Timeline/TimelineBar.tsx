import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Calendar, Sparkles } from 'lucide-react';
import { DisasterEvent } from '../../types';

interface TimelineBarProps {
  events: DisasterEvent[];
  hoursAgo: number;
  onHoursAgoChange: (hours: number) => void;
  onSelectEvent: (event: DisasterEvent) => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  events,
  hoursAgo,
  onHoursAgoChange,
  onSelectEvent,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play timeline progression
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        if (hoursAgo <= 1) {
          setIsPlaying(false);
          onHoursAgoChange(0);
        } else {
          onHoursAgoChange(hoursAgo - 2);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, hoursAgo, onHoursAgoChange]);

  const getTimeLabel = (h: number) => {
    if (h === 0) return 'LIVE NOW';
    return `-${h}h AGO`;
  };

  return (
    <div className="absolute bottom-4 left-80 right-8 z-20 glass-panel rounded-xl px-4 py-2.5 border border-sky-500/20 shadow-2xl flex items-center gap-4 text-slate-200 select-none">
      {/* Play / Reset controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => {
            if (hoursAgo === 0) onHoursAgoChange(48);
            setIsPlaying(!isPlaying);
          }}
          className={`p-2 rounded-lg transition-all ${
            isPlaying ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-sky-400'
          }`}
          title={isPlaying ? 'Pause Timeline' : 'Play Timeline Progression'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-sky-400" />}
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            onHoursAgoChange(0);
          }}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Jump to Real-Time"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Current Scrubber Status */}
      <div className="flex items-center gap-2 shrink-0">
        <Clock className="w-3.5 h-3.5 text-sky-400" />
        <span className="font-mono text-xs font-bold text-sky-300">
          {getTimeLabel(hoursAgo)}
        </span>
      </div>

      {/* Main Slider Track */}
      <div className="flex-1 relative flex items-center">
        <input
          type="range"
          min="0"
          max="48"
          step="1"
          value={48 - hoursAgo}
          onChange={(e) => onHoursAgoChange(48 - Number(e.target.value))}
          className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
        />

        {/* Small event tick markers along timeline */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-1">
          {events.slice(0, 8).map((ev, i) => (
            <div
              key={ev.id}
              className="w-1.5 h-1.5 rounded-full bg-rose-500/80 shadow-sm"
              title={`${ev.title}`}
            />
          ))}
        </div>
      </div>

      {/* Timeline bounds labels */}
      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 shrink-0">
        <span>-48h</span>
        <span className="text-slate-600">———</span>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE NOW</span>
        </span>
      </div>
    </div>
  );
};
