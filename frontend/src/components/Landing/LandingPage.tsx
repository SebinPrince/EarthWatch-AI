import React, { useEffect, useRef } from 'react';
import { Globe, ShieldAlert, Satellite as SatelliteIcon, Sparkles, ArrowRight, Activity, Radio, Cpu } from 'lucide-react';

interface LandingPageProps {
  onEnterExplore: () => void;
  onEnterDisasters: () => void;
  eventCount: number;
  satelliteCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterExplore,
  onEnterDisasters,
  eventCount,
  satelliteCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated starfield & planetary particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate stars
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.25 + 0.05,
    }));

    // Orbiting satellite dots
    const satellites = Array.from({ length: 8 }, (_, i) => ({
      angle: (i * Math.PI) / 4,
      radiusX: width * 0.32 + Math.random() * 60,
      radiusY: height * 0.22 + Math.random() * 40,
      speed: 0.002 + Math.random() * 0.002,
      color: i % 2 === 0 ? '#38bdf8' : '#10b981',
    }));

    const render = () => {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Draw faint central planetary glow
      const cx = width / 2;
      const cy = height / 2;
      const gradient = ctx.createRadialGradient(cx, cy, 50, cx, cy, width * 0.45);
      gradient.addColorStop(0, 'rgba(14, 165, 233, 0.14)');
      gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.05)');
      gradient.addColorStop(1, 'rgba(3, 7, 18, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw starry sky
      stars.forEach((star) => {
        star.y -= star.speed;
        if (star.y < 0) star.y = height;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw satellite orbital ellipse
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, width * 0.34, height * 0.24, Math.PI / 8, 0, Math.PI * 2);
      ctx.stroke();

      // Draw orbiting satellites
      satellites.forEach((sat) => {
        sat.angle += sat.speed;
        const sx = cx + Math.cos(sat.angle) * sat.radiusX;
        const sy = cy + Math.sin(sat.angle) * sat.radiusY;

        ctx.fillStyle = sat.color;
        ctx.shadowColor = sat.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden text-slate-100 select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Header bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-sky-500/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Globe className="w-6 h-6 text-slate-950 animate-spin-slow" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-sky-300 via-white to-cyan-300 bg-clip-text text-transparent">
              EARTHWATCH AI
            </div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-sky-400/80">
              Orbital Earth Intelligence
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">TELEMETRY SYNCHRONIZED</span>
          </div>
        </div>
      </header>

      {/* Hero Body */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-subtle text-xs font-mono text-sky-300 mb-8 border border-sky-400/20 shadow-lg">
          <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>GLOBAL MONITORING PLATFORM • ACTIVE ORBITAL GRID</span>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-4">
          <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            EARTHWATCH AI
          </span>
        </h1>

        <h2 className="text-xl sm:text-2xl font-medium text-sky-400/90 tracking-wide mb-6">
          Global Earth & Disaster Intelligence
        </h2>

        <p className="text-base sm:text-xl text-slate-300/80 max-w-2xl mb-10 font-light leading-relaxed">
          &ldquo;Explore our planet. Understand environmental events. Discover the satellites watching Earth.&rdquo;
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
          <button
            onClick={onEnterExplore}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all transform hover:scale-105 shadow-xl shadow-sky-500/25 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Globe className="w-5 h-5 text-slate-950" />
            <span>EXPLORE EARTH</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onEnterDisasters}
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel hover:bg-slate-800/80 text-sky-300 hover:text-white font-semibold text-sm tracking-wider uppercase transition-all transform hover:scale-105 border border-sky-400/30 flex items-center justify-center gap-3 cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>VIEW LIVE EVENTS</span>
          </button>
        </div>

        {/* Real-Time Telemetry Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full max-w-3xl">
          <div className="p-4 rounded-xl glass-panel text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1 font-mono">
              {satelliteCount}
            </div>
            <div className="text-xs uppercase font-mono text-sky-400 flex items-center justify-center gap-1.5">
              <SatelliteIcon className="w-3.5 h-3.5" />
              <span>SATELLITES</span>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 mb-1 font-mono">
              {eventCount}
            </div>
            <div className="text-xs uppercase font-mono text-rose-300 flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>ACTIVE HAZARDS</span>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mb-1 font-mono">
              &lt; 50ms
            </div>
            <div className="text-xs uppercase font-mono text-emerald-300 flex items-center justify-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>LATENCY</span>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 mb-1 font-mono">
              AI ENGINE
            </div>
            <div className="text-xs uppercase font-mono text-cyan-400 flex items-center justify-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>ANALYST ONLINE</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-5 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono">
        <div>EARTHWATCH AI • GLOBAL DISASTER INTELLIGENCE PLATFORM</div>
        <div className="mt-2 sm:mt-0 flex items-center gap-4">
          <span>DATA SOURCES: USGS • NASA EONET • COPERNICUS EMS • OPEN-METEO</span>
        </div>
      </footer>
    </div>
  );
};
