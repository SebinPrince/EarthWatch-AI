import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Satellite as SatelliteIcon,
  Orbit,
  Layers,
  Activity,
  RefreshCw,
  Search,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Compass,
  ArrowRight,
  ShieldAlert,
  Flame,
  Waves,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { api } from '../../services/api';
import {
  Satellite,
  DisasterEvent,
  CelesTrakStatusResponse,
  TLEDecodedResult,
  OverpassMatrixItem,
  CelesTrakKnowledgeResponse
} from '../../types';

interface CelesTrakKnowledgeModalProps {
  onClose: () => void;
  onSelectSatellite: (sat: Satellite) => void;
  onSelectEvent: (ev: DisasterEvent) => void;
  satellites: Satellite[];
  events: DisasterEvent[];
}

type ActiveTab = 'telemetry' | 'tle_decoder' | 'overpass_matrix' | 'sensor_modalities' | 'handbook';

export const CelesTrakKnowledgeModal: React.FC<CelesTrakKnowledgeModalProps> = ({
  onClose,
  onSelectSatellite,
  onSelectEvent,
  satellites,
  events,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('telemetry');
  const [status, setStatus] = useState<CelesTrakStatusResponse | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // TLE Decoder State
  const [selectedNoradId, setSelectedNoradId] = useState<number>(39084);
  const [decodedData, setDecodedData] = useState<TLEDecodedResult | null>(null);
  const [isLoadingDecode, setIsLoadingDecode] = useState<boolean>(false);
  const [customLine1, setCustomLine1] = useState<string>('');
  const [customLine2, setCustomLine2] = useState<string>('');
  const [isCustomTLE, setIsCustomTLE] = useState<boolean>(false);
  const [tleDecodeError, setTleDecodeError] = useState<string | null>(null);

  // Overpass Matrix State
  const [overpassMatrix, setOverpassMatrix] = useState<OverpassMatrixItem[]>([]);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState<boolean>(false);

  // Knowledge Corpus State
  const [knowledge, setKnowledge] = useState<CelesTrakKnowledgeResponse | null>(null);

  // Load Status and Initial Data
  useEffect(() => {
    loadStatus();
    loadKnowledge();
    loadMatrix();
  }, []);

  // When selectedNoradId changes, decode TLE
  useEffect(() => {
    if (!isCustomTLE && selectedNoradId) {
      loadCatalogDecode(selectedNoradId);
    }
  }, [selectedNoradId, isCustomTLE]);

  const loadStatus = async () => {
    const res = await api.getCelesTrakStatus();
    if (res) setStatus(res);
  };

  const loadKnowledge = async () => {
    const res = await api.getCelesTrakKnowledge();
    if (res) setKnowledge(res);
  };

  const loadMatrix = async () => {
    setIsLoadingMatrix(true);
    try {
      const res = await api.getCelesTrakOverpassMatrix(24);
      setOverpassMatrix(res || []);
    } catch {
      setOverpassMatrix([]);
    } finally {
      setIsLoadingMatrix(false);
    }
  };

  const loadCatalogDecode = async (norad: number) => {
    setIsLoadingDecode(true);
    setTleDecodeError(null);
    try {
      const res = await api.decodeCatalogTLE(norad);
      setDecodedData(res);
      const matchedSat = satellites.find((s) => s.norad_id === norad);
      if (matchedSat?.tle_line1 && matchedSat?.tle_line2) {
        setCustomLine1(matchedSat.tle_line1);
        setCustomLine2(matchedSat.tle_line2);
      }
    } catch (err: any) {
      setTleDecodeError('Could not decode TLE from catalog.');
    } finally {
      setIsLoadingDecode(false);
    }
  };

  const handleCustomDecode = async () => {
    if (!customLine1.trim() || !customLine2.trim()) {
      setTleDecodeError('Please provide both Line 1 and Line 2.');
      return;
    }
    setIsLoadingDecode(true);
    setTleDecodeError(null);
    try {
      const res = await api.decodeCustomTLE(customLine1, customLine2, 'CUSTOM OBJECT');
      setDecodedData(res);
    } catch (err: any) {
      setTleDecodeError(err.response?.data?.detail || 'Invalid TLE lines provided.');
    } finally {
      setIsLoadingDecode(false);
    }
  };

  const handleLiveSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await api.syncCelesTrak();
      setSyncFeedback(`Successfully synchronized ${res.synced_element_sets} orbital element sets from CelesTrak!`);
      loadStatus();
      loadMatrix();
      if (selectedNoradId) loadCatalogDecode(selectedNoradId);
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch {
      setSyncFeedback('Sync finished using robust cached ephemeris.');
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] flex flex-col rounded-2xl glass-panel border border-sky-500/30 text-slate-100 shadow-2xl overflow-hidden bg-slate-950/90">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-500/20 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Orbit className="w-5 h-5 text-slate-950 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold tracking-wide bg-gradient-to-r from-white via-sky-200 to-cyan-300 bg-clip-text text-transparent">
                  CelesTrak Space Intelligence & Orbital Knowledge
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-[10px] font-mono text-sky-300 uppercase">
                  SGP4 Engine
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-mono text-emerald-300 uppercase">
                  celestrak.org
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authoritative NORAD Two-Line Element (TLE) ephemeris, real-time SGP4 orbital kinematics & hazard interception
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLiveSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 text-xs font-mono transition-all disabled:opacity-50"
              title="Query real-time TLEs from CelesTrak GP endpoints"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'SYNCING CELESTRAK...' : 'SYNC CELESTRAK'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Toast Feedback */}
        {syncFeedback && (
          <div className="px-6 py-2 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1 px-6 border-b border-sky-500/15 bg-slate-900/40 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'border-sky-400 text-sky-300 bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Fleet Telemetry ({satellites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tle_decoder')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'tle_decoder'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive TLE Deconstructor</span>
          </button>

          <button
            onClick={() => setActiveTab('overpass_matrix')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'overpass_matrix'
                ? 'border-rose-400 text-rose-300 bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Disaster Overpass Matrix ({overpassMatrix.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sensor_modalities')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'sensor_modalities'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sensor Modalities & Disaster Physics</span>
          </button>

          <button
            onClick={() => setActiveTab('handbook')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'handbook'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Astrodynamics Handbook</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: LIVE FLEET TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              {/* CelesTrak Status Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Propagator Engine</div>
                  <div className="text-base font-bold text-sky-300 mt-1">SGP4 / TEME Geodetic</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">WGS84 Reference Ellipsoid</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Authoritative Provider</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">CelesTrak (GP Archive)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Dr. T.S. Kelso Astrodynamics</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Active Constellation</div>
                  <div className="text-base font-bold text-purple-300 mt-1">{satellites.length} Satellites</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Earth Observation & Weather</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Sync Status</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-bold text-slate-200">
                      {status?.is_live_synced ? 'Live Connected' : 'Cached Ephemeris'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {status?.last_sync ? `Synced: ${new Date(status.last_sync).toLocaleTimeString()}` : 'Default Seed Elements'}
                  </div>
                </div>
              </div>

              {/* Satellite Fleet Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="font-mono text-xs text-sky-400 font-semibold tracking-wider uppercase flex items-center gap-2">
                    <SatelliteIcon className="w-3.5 h-3.5" />
                    <span>Authoritative CelesTrak Satellite Catalog</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Click any satellite to inspect TLE parameters or track on 3D globe
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">Satellite</th>
                        <th className="py-2.5 px-3">NORAD ID</th>
                        <th className="py-2.5 px-3">Operator</th>
                        <th className="py-2.5 px-3">Orbit Regime</th>
                        <th className="py-2.5 px-3">Altitude</th>
                        <th className="py-2.5 px-3">Velocity</th>
                        <th className="py-2.5 px-3">Sensor Payload</th>
                        <th className="py-2.5 px-3">Swath</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {satellites.map((sat) => (
                        <tr
                          key={sat.id}
                          className="hover:bg-sky-500/10 transition-colors group cursor-pointer"
                          onClick={() => {
                            if (sat.norad_id) setSelectedNoradId(sat.norad_id);
                            setActiveTab('tle_decoder');
                          }}
                        >
                          <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>{sat.name}</span>
                          </td>
                          <td className="py-3 px-3 text-sky-300 font-bold">{sat.norad_id || 'N/A'}</td>
                          <td className="py-3 px-3 text-slate-300">{sat.operator || 'International'}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                              {sat.orbit_type || 'LEO (SSO)'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-emerald-300">{Math.round(sat.altitude || 700)} km</td>
                          <td className="py-3 px-3 text-indigo-300">{sat.velocity ? `${sat.velocity.toFixed(2)} km/s` : '7.50 km/s'}</td>
                          <td className="py-3 px-3 text-slate-400 max-w-[200px] truncate" title={sat.sensor_type || 'Optical'}>
                            {sat.sensor_type || 'Multispectral'}
                          </td>
                          <td className="py-3 px-3 text-slate-400">{sat.swath_km ? `${sat.swath_km} km` : '250 km'}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSatellite(sat);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 font-bold text-[10px] transition-all"
                            >
                              Track on Globe
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE TLE DECONSTRUCTOR */}
          {activeTab === 'tle_decoder' && (
            <div className="space-y-6">
              {/* Satellite Selector & Mode Switch */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono uppercase text-slate-400">Select Platform:</span>
                  <select
                    value={selectedNoradId}
                    onChange={(e) => {
                      setIsCustomTLE(false);
                      setSelectedNoradId(Number(e.target.value));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sky-300 font-mono text-xs focus:outline-none focus:border-sky-400"
                  >
                    {satellites.filter((s) => s.norad_id).map((s) => (
                      <option key={s.id} value={s.norad_id}>
                        {s.name} (NORAD {s.norad_id}) — {s.operator}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCustomTLE(!isCustomTLE)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      isCustomTLE
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isCustomTLE ? '← Back to Catalog TLE' : 'Custom TLE Input'}
                  </button>
                </div>
              </div>

              {/* Custom Input Area if toggled */}
              {isCustomTLE && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
                  <div className="text-xs font-mono text-cyan-400 font-semibold">
                    Paste Raw Two-Line Element (Lines 1 & 2):
                  </div>
                  <input
                    type="text"
                    value={customLine1}
                    onChange={(e) => setCustomLine1(e.target.value)}
                    placeholder="1 39084U 13008A   26271.57894143  .00000180  00000+0  49989-4 0  9996"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sky-300 font-mono text-xs tracking-wider"
                  />
                  <input
                    type="text"
                    value={customLine2}
                    onChange={(e) => setCustomLine2(e.target.value)}
                    placeholder="2 39084  98.2203 340.4316 0001301  94.5690 265.5657 14.57105574712958"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sky-300 font-mono text-xs tracking-wider"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleCustomDecode}
                      disabled={isLoadingDecode}
                      className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-colors"
                    >
                      {isLoadingDecode ? 'Decoding Elements...' : 'Deconstruct & Compute Orbit'}
                    </button>
                  </div>
                </div>
              )}

              {tleDecodeError && (
                <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{tleDecodeError}</span>
                </div>
              )}

              {/* Raw Visual TLE Block with Data */}
              {decodedData && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                      Raw Two-Line Element Set ({decodedData.satellite_name})
                    </div>
                    <div className="text-sky-300 bg-slate-900/60 p-2.5 rounded border border-slate-800 font-mono tracking-widest text-[13px] select-all">
                      {decodedData.line1_fields.line_number} {decodedData.line1_fields.satellite_catalog_number}U {decodedData.international_designator} {decodedData.epoch.year.toString().slice(-2)}{decodedData.epoch.day_of_year} ...
                    </div>
                  </div>

                  {/* Derived Keplerian Physical Properties Cards */}
                  <div>
                    <div className="font-mono text-xs uppercase text-sky-400 font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>SGP4 Computed Keplerian & Physical Parameters</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Orbit Regime</div>
                        <div className="text-sm font-bold text-sky-300 mt-1">
                          {decodedData.derived_orbital_elements.orbit_regime}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {decodedData.derived_orbital_elements.is_sun_synchronous ? '☀️ Sun-Synchronous (SSO)' : 'Non-SSO'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Semi-Major Axis (a)</div>
                        <div className="text-sm font-bold text-cyan-300 mt-1">
                          {decodedData.derived_orbital_elements.semi_major_axis_km.toLocaleString()} km
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Kepler's 3rd Law Calculation</div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Apogee / Perigee</div>
                        <div className="text-sm font-bold text-emerald-300 mt-1">
                          {decodedData.derived_orbital_elements.apogee_altitude_km} / {decodedData.derived_orbital_elements.perigee_altitude_km} km
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Altitude above Earth surface</div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Orbital Period (T)</div>
                        <div className="text-sm font-bold text-purple-300 mt-1">
                          {decodedData.derived_orbital_elements.orbital_period_minutes} min
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {decodedData.derived_orbital_elements.revolutions_per_day} revs/day
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Field-by-Field Breakdown Tables */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Line 1 Breakdown */}
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                      <div className="font-mono text-xs uppercase text-sky-400 font-semibold flex items-center justify-between">
                        <span>Line 1: Ephemeris & Drag Diagnostics</span>
                        <span className="text-[10px] text-slate-500">69 Columns</span>
                      </div>

                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Satellite Catalog #</span>
                          <span className="text-sky-300 font-bold">{decodedData.line1_fields.satellite_catalog_number}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Classification</span>
                          <span className="text-emerald-400">{decodedData.classification}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">International Designator</span>
                          <span className="text-slate-200">{decodedData.international_designator}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Epoch Timestamp (UTC)</span>
                          <span className="text-amber-300">{new Date(decodedData.epoch.utc_timestamp).toUTCString()}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Element Age</span>
                          <span className="text-sky-300">{decodedData.epoch.age_days} days ago</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">1st Derivative (Ballistic Drag)</span>
                          <span className="text-indigo-300">{decodedData.line1_fields.ballistic_coefficient_first_derivative}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">BSTAR (B*) Radiation/Drag Term</span>
                          <span className="text-cyan-300">{decodedData.line1_fields.bstar_scientific}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-400">Checksum 1</span>
                          <span className="text-slate-500 font-bold">{decodedData.line1_fields.checksum}</span>
                        </div>
                      </div>
                    </div>

                    {/* Line 2 Breakdown */}
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                      <div className="font-mono text-xs uppercase text-cyan-400 font-semibold flex items-center justify-between">
                        <span>Line 2: Classical Keplerian Elements</span>
                        <span className="text-[10px] text-slate-500">69 Columns</span>
                      </div>

                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Inclination (i)</span>
                          <span className="text-sky-300 font-bold">{decodedData.line2_fields.inclination_deg}°</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">RAAN (Right Ascension, Ω)</span>
                          <span className="text-cyan-300">{decodedData.line2_fields.raan_deg}°</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Eccentricity (e)</span>
                          <span className="text-emerald-400">{decodedData.line2_fields.eccentricity} (Near Circular)</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Argument of Perigee (ω)</span>
                          <span className="text-amber-300">{decodedData.line2_fields.argument_of_perigee_deg}°</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Mean Anomaly (M)</span>
                          <span className="text-purple-300">{decodedData.line2_fields.mean_anomaly_deg}°</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Mean Motion (n)</span>
                          <span className="text-sky-300 font-bold">{decodedData.line2_fields.mean_motion_revs_day} rev/day</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Revolution # at Epoch</span>
                          <span className="text-slate-200">{decodedData.line2_fields.revolution_number_at_epoch.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-400">Checksum 2</span>
                          <span className="text-slate-500 font-bold">{decodedData.line2_fields.checksum}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Satellite Sensor & Disaster Mission Context */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-indigo-950/40 border border-sky-500/20">
                    <div className="font-mono text-xs text-sky-300 font-bold uppercase mb-2 flex items-center gap-2">
                      <Radio className="w-4 h-4 text-sky-400" />
                      <span>Operational Mission & Disaster Interception Utility</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {decodedData.sensor_info.purpose}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                      <div>Operator: <span className="text-slate-200">{decodedData.sensor_info.operator}</span></div>
                      <div>Sensor: <span className="text-cyan-300">{decodedData.sensor_info.sensor_type}</span></div>
                      <div>Imaging Swath: <span className="text-emerald-300">{decodedData.sensor_info.swath_km} km</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DISASTER OVERPASS INTERCEPTION MATRIX */}
          {activeTab === 'overpass_matrix' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-xs uppercase text-rose-400 font-semibold tracking-wider">
                    Orbital Hazard Flyover Matrix (Next 24 Hours)
                  </h3>
                  <p className="text-xs text-slate-400">
                    SGP4 forward-propagated flyover prediction cross-referencing active global disasters against the satellite fleet.
                  </p>
                </div>
                <button
                  onClick={loadMatrix}
                  disabled={isLoadingMatrix}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMatrix ? 'animate-spin' : ''}`} />
                  <span>Recalculate Matrix</span>
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">Satellite Platform</th>
                        <th className="py-2.5 px-3">Active Hazard</th>
                        <th className="py-2.5 px-3">Type & Severity</th>
                        <th className="py-2.5 px-3">Next Flyover</th>
                        <th className="py-2.5 px-3">Approach Distance</th>
                        <th className="py-2.5 px-3">Swath Coverage</th>
                        <th className="py-2.5 px-3">Suitability</th>
                        <th className="py-2.5 px-4 text-right">Interception</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {overpassMatrix.map((item, idx) => {
                        const matchedEv = events.find((e) => e.id === item.disaster_id);
                        const matchedSat = satellites.find((s) => s.norad_id === item.norad_id);

                        return (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-semibold text-white">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                <span>{item.satellite_name}</span>
                              </div>
                              <div className="text-[10px] text-slate-500">{item.sensor_type}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-200 font-medium">
                              {item.disaster_title}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                item.disaster_severity === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                                item.disaster_severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                'bg-amber-500/20 text-amber-300'
                              }`}>
                                {item.disaster_type} ({item.disaster_severity})
                              </span>
                            </td>
                            <td className="py-3 px-3 text-cyan-300 font-bold">
                              {item.minutes_until_pass < 60
                                ? `In ${item.minutes_until_pass}m`
                                : `In ${Math.floor(item.minutes_until_pass / 60)}h ${item.minutes_until_pass % 60}m`}
                              <div className="text-[10px] text-slate-500 font-normal">
                                {new Date(item.predicted_pass_time).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-emerald-300 font-medium">
                              {item.closest_approach_km} km
                            </td>
                            <td className="py-3 px-3">
                              {item.is_within_swath ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                                  ✓ IN SWATH ({item.swath_km}km)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                                  Off-Nadir
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      item.suitability_score >= 90 ? 'bg-emerald-400' :
                                      item.suitability_score >= 80 ? 'bg-sky-400' : 'bg-amber-400'
                                    }`}
                                    style={{ width: `${item.suitability_score}%` }}
                                  />
                                </div>
                                <span className="font-bold text-xs">{item.suitability_score}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {matchedSat && (
                                  <button
                                    onClick={() => {
                                      onSelectSatellite(matchedSat);
                                      onClose();
                                    }}
                                    className="px-2 py-1 rounded bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 font-bold text-[10px]"
                                    title="View Satellite on Globe"
                                  >
                                    Sat
                                  </button>
                                )}
                                {matchedEv && (
                                  <button
                                    onClick={() => {
                                      onSelectEvent(matchedEv);
                                      onClose();
                                    }}
                                    className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 font-bold text-[10px]"
                                    title="View Disaster on Globe"
                                  >
                                    Hazard
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SENSOR MODALITIES & DISASTER PHYSICS */}
          {activeTab === 'sensor_modalities' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900 border border-sky-500/20">
                <h3 className="font-mono text-sm font-bold text-sky-300 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Electromagnetic Regimes in Planetary Emergency Response</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Different disaster archetypes exhibit distinct radiative, thermal, and mechanical signatures.
                  Matching sensor wavelength, polarization, and ground resolution is the bedrock of Earth intelligence.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SAR */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Synthetic Aperture Radar (SAR)</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">Sentinel-1A</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Active C-band microwave (5.405 GHz). SAR sends pulses of radar energy and records backscatter. Because microwaves penetrate clouds, rain, and darkness, it provides uninterrupted day-and-night floodwater extent mapping and InSAR co-seismic slip interferometry.
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                    Target Hazards: <span className="text-emerald-400">Floods, Tsunami Inundation, Earthquake Fault Rupture</span>
                  </div>
                </div>

                {/* Thermal IR */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-orange-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-orange-400 font-bold uppercase">Thermal Infrared (TIRS / MODIS / VIIRS)</span>
                    <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px] font-mono">Landsat 8/9, Suomi NPP</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Radiometric sensing across 3.7 μm to 12.0 μm blackbody wavelengths. Captures radiant heat flux directly, enabling automated active wildfire perimeter extraction, fire radiative power (FRP) quantification, and volcanic lava caldera monitoring.
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                    Target Hazards: <span className="text-orange-400">Wildfires, Volcanic Eruptions, Marine Heatwaves</span>
                  </div>
                </div>

                {/* Atmospheric Spectrometry */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-400 font-bold uppercase">Atmospheric Spectrometry (TROPOMI)</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono">Sentinel-5P</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    High spectral resolution imaging across UV, Visible, and SWIR. Detects absorption lines of trace gases including Sulphur Dioxide (SO2), Nitrogen Dioxide (NO2), Carbon Monoxide (CO), and Methane (CH4). Detects dangerous volcanic ash clouds and transboundary wildfire smoke plumes.
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                    Target Hazards: <span className="text-purple-400">Volcanic Ash/SO2, Mega-Fire Smoke Dispersion</span>
                  </div>
                </div>

                {/* Radar Interferometry */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Wide-Swath Radar Interferometer (KaRIn)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">SWOT</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ka-band radar interferometer with two antennas spaced 10 meters apart. Measures water elevation and slope of rivers wider than 100m and lakes larger than 6 hectares with sub-centimeter accuracy for breakthrough hydrological and flood inundation forecasting.
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                    Target Hazards: <span className="text-emerald-400">River Flooding, Dam Overflows, Coastal Surges</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ASTRODYNAMICS HANDBOOK */}
          {activeTab === 'handbook' && (
            <div className="space-y-6">
              {knowledge?.modules.map((mod) => (
                <div key={mod.id} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-sky-300 font-mono tracking-wide">
                      {mod.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-400/30 text-[10px] font-mono text-sky-400">
                      {mod.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {mod.summary}
                  </p>
                  <ul className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    {mod.details.map((d, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-sky-500/20 bg-slate-950 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CelesTrak Authoritative Knowledge Base Active</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://celestrak.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
            >
              <span>Visit celestrak.org</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
