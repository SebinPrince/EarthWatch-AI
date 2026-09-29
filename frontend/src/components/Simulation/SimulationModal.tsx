import React, { useState } from 'react';
import {
  X,
  FlaskConical,
  Play,
  Trash2,
  AlertTriangle,
  Flame,
  Waves,
  Tornado,
  SunMedium,
  Mountain,
  Satellite as SatelliteIcon,
  Compass,
  Gauge,
  Users,
  MapPin
} from 'lucide-react';
import { api } from '../../services/api';
import { SimulationResult, SimulationRequestPayload } from '../../types';

interface SimulationModalProps {
  onClose: () => void;
  onSimulationApplied: (result: SimulationResult) => void;
  onClearSimulation: () => void;
  currentSimulation: SimulationResult | null;
  initialLocation?: { name: string; lat: number; lon: number } | null;
}

const PRESET_LOCATIONS = [
  { name: 'Bay of Bengal (Coastal)', lat: 18.5, lon: 88.2 },
  { name: 'Kerala Coast, India', lat: 10.85, lon: 76.27 },
  { name: 'Sierra Nevada, California', lat: 38.65, lon: -120.95 },
  { name: 'Tokyo Bay, Japan', lat: 35.5, lon: 139.8 },
  { name: 'Reykjanes, Iceland', lat: 63.88, lon: -22.42 },
  { name: 'Aegean Sea, Greece', lat: 38.0, lon: 24.5 },
];

export const SimulationModal: React.FC<SimulationModalProps> = ({
  onClose,
  onSimulationApplied,
  onClearSimulation,
  currentSimulation,
  initialLocation,
}) => {
  const availableLocations = initialLocation
    ? [initialLocation, ...PRESET_LOCATIONS.filter((l) => l.name !== initialLocation.name)]
    : PRESET_LOCATIONS;

  const [eventType, setEventType] = useState<string>('cyclone');
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || PRESET_LOCATIONS[0]
  );
  const [intensity, setIntensity] = useState<number>(4);
  const [radiusKm, setRadiusKm] = useState<number>(220);
  const [directionDeg, setDirectionDeg] = useState<number>(45);
  const [speedKmh, setSpeedKmh] = useState<number>(35);
  const [durationHours, setDurationHours] = useState<number>(48);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>(currentSimulation);

  const handleRun = async () => {
    setIsSimulating(true);
    try {
      const payload: SimulationRequestPayload = {
        event_type: eventType,
        starting_location_name: selectedLocation.name,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lon,
        intensity,
        radius_km: radiusKm,
        direction_deg: directionDeg,
        speed_kmh: speedKmh,
        duration_hours: durationHours,
      };

      const simResult = await api.runSimulation(payload);
      setResult(simResult);
      onSimulationApplied(simResult);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    onClearSimulation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col glass-panel rounded-2xl border border-amber-500/30 shadow-2xl text-slate-100 overflow-hidden">
        {/* Prominent Simulation Warning Banner */}
        <div className="bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-red-600/90 text-white px-4 py-2 flex items-center justify-between text-xs font-mono font-bold tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>DISASTER SIMULATION MODE — SYNTHETIC MODEL (NOT A REAL EVENT)</span>
          </div>
          <button onClick={onClose} className="p-0.5 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Disaster Type Selector */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
              Select Disaster Event Model:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'cyclone', label: 'Cyclone', icon: <Tornado className="w-4 h-4 text-indigo-400" /> },
                { id: 'wildfire', label: 'Wildfire', icon: <Flame className="w-4 h-4 text-orange-400" /> },
                { id: 'flood', label: 'Flood', icon: <Waves className="w-4 h-4 text-cyan-400" /> },
                { id: 'heatwave', label: 'Heatwave', icon: <SunMedium className="w-4 h-4 text-amber-400" /> },
                { id: 'volcano', label: 'Volcano', icon: <Mountain className="w-4 h-4 text-rose-500" /> },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setEventType(t.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    eventType === t.id
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t.icon}
                  <span className="text-xs mt-1.5">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location Selector */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
              Starting Ground Zero Location:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableLocations.map((loc, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedLocation(loc)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    selectedLocation.name === loc.name
                      ? 'bg-sky-500/20 border-sky-400/50 text-sky-200 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{loc.name}</span>
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            {/* Intensity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-mono uppercase">INTENSITY LEVEL</span>
                <span className="font-bold text-amber-400 font-mono">Category {intensity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>1 Minor</span>
                <span>3 Severe</span>
                <span>5 Catastrophic</span>
              </div>
            </div>

            {/* Impact Radius */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-mono uppercase">IMPACT RADIUS</span>
                <span className="font-bold text-sky-400 font-mono">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="30"
                max="800"
                step="10"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>30 km</span>
                <span>400 km</span>
                <span>800 km</span>
              </div>
            </div>

            {/* Direction */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-mono uppercase">PROPAGATION BEARING</span>
                <span className="font-bold text-emerald-400 font-mono">{directionDeg}° Compass</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={directionDeg}
                onChange={(e) => setDirectionDeg(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>0° N</span>
                <span>90° E</span>
                <span>180° S</span>
                <span>270° W</span>
              </div>
            </div>

            {/* Speed */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-mono uppercase">FORWARD PROPAGATION SPEED</span>
                <span className="font-bold text-purple-400 font-mono">{speedKmh} km/h</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={speedKmh}
                onChange={(e) => setSpeedKmh(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>5 km/h</span>
                <span>60 km/h</span>
                <span>120 km/h</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={isSimulating}
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-amber-500/25"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isSimulating ? 'COMPUTING PHYSICS MODEL...' : 'EXECUTE SIMULATION ON 3D GLOBE'}</span>
            </button>

            {result && (
              <button
                onClick={handleClear}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono uppercase transition-colors flex items-center gap-1.5"
                title="Clear simulation layer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Simulation Output Card */}
          {result && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                    MODEL OUTPUT: {result.notice}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    {result.title}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                  PROJECTED
                </span>
              </div>

              {/* Impact Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">MAX RADIUS</span>
                  <div className="font-bold text-white mt-0.5">{result.max_radius_km} km</div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">TOTAL AREA</span>
                  <div className="font-bold text-white mt-0.5">
                    {result.total_affected_area_km2.toLocaleString()} km²
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">EST. POPULATION</span>
                  <div className="font-bold text-rose-400 mt-0.5">
                    {result.estimated_population.toLocaleString()}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">MONITORING SATS</span>
                  <div className="font-bold text-sky-400 mt-0.5">
                    {result.nearby_monitoring_satellites.length} in range
                  </div>
                </div>
              </div>

              {/* AI Risk Assessment */}
              <div className="text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-slate-300 leading-relaxed font-mono">
                {result.ai_risk_assessment}
              </div>

              {/* Potential monitoring satellites */}
              <div>
                <span className="text-[10px] font-mono uppercase text-sky-400 block mb-1.5">
                  POTENTIAL MONITORING SATELLITES IN RANGE:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {result.nearby_monitoring_satellites.map((sat) => (
                    <div
                      key={sat.satellite_id}
                      className="p-2 rounded bg-slate-950/50 border border-slate-800/80 flex items-center justify-between"
                    >
                      <span className="font-semibold text-white">🛰️ {sat.satellite_name}</span>
                      <span className="text-[10px] font-mono text-emerald-400">{sat.relationship}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
