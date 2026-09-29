import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Globe,
  MapPin,
  Satellite as SatelliteIcon,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import { DisasterEvent, Satellite, LocationItem } from '../../types';

interface GlobalSearchProps {
  events: DisasterEvent[];
  satellites: Satellite[];
  onSelectEvent: (event: DisasterEvent) => void;
  onSelectSatellite: (sat: Satellite) => void;
  onSelectLocation: (loc: LocationItem) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  events,
  satellites,
  onSelectEvent,
  onSelectSatellite,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [geoResults, setGeoResults] = useState<LocationItem[]>([]);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding search for external places
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setGeoResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingGeo(true);
      try {
        const results = await api.searchLocations(query);
        setGeoResults(results);
      } catch {
        setGeoResults([]);
      } finally {
        setIsSearchingGeo(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const qLower = query.toLowerCase().trim();

  // Filter matching events
  const matchingEvents = qLower
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(qLower) ||
          e.type.toLowerCase().includes(qLower) ||
          e.source.toLowerCase().includes(qLower) ||
          (e.description && e.description.toLowerCase().includes(qLower))
      )
    : [];

  // Filter matching satellites
  const matchingSatellites = qLower
    ? satellites.filter(
        (s) =>
          s.name.toLowerCase().includes(qLower) ||
          s.mission.toLowerCase().includes(qLower) ||
          (s.country && s.country.toLowerCase().includes(qLower)) ||
          (s.purpose && s.purpose.toLowerCase().includes(qLower))
      )
    : [];

  const hasResults =
    matchingEvents.length > 0 || matchingSatellites.length > 0 || geoResults.length > 0;

  return (
    <div ref={searchContainerRef} className="relative z-30 w-80 sm:w-96">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-slate-400">
          {isSearchingGeo ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          ) : (
            <Search className="w-4 h-4 text-sky-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search satellite, city, country, hazard..."
          className="w-full pl-10 pr-9 py-2 rounded-xl glass-panel text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400/60 shadow-lg"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 p-0.5 rounded text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto glass-panel rounded-xl border border-sky-500/25 shadow-2xl p-2 space-y-3 text-xs animate-in fade-in duration-150">
          {!hasResults && !isSearchingGeo && (
            <div className="p-3 text-center text-slate-400">
              No matching assets or locations found for &ldquo;{query}&rdquo;.
            </div>
          )}

          {/* Locations */}
          {geoResults.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                <span>LOCATIONS & REGIONS</span>
              </div>
              <div className="space-y-1">
                {geoResults.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      setIsOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">{loc.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {loc.country} {loc.region ? `• ${loc.region}` : ''}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">SELECT</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Hazards */}
          {matchingEvents.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3" />
                <span>DISASTER EVENTS</span>
              </div>
              <div className="space-y-1">
                {matchingEvents.slice(0, 4).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      onSelectEvent(ev);
                      setIsOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white line-clamp-1">{ev.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase">
                        {ev.type} • {ev.source}
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-rose-500/20 text-rose-300 font-bold">
                      {ev.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Satellites */}
          {matchingSatellites.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-sky-400 font-bold flex items-center gap-1.5">
                <SatelliteIcon className="w-3 h-3" />
                <span>SATELLITE PLATFORMS</span>
              </div>
              <div className="space-y-1">
                {matchingSatellites.slice(0, 4).map((sat) => (
                  <div
                    key={sat.id}
                    onClick={() => {
                      onSelectSatellite(sat);
                      setIsOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">🛰️ {sat.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {sat.mission} • {sat.country}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-sky-400">TRACK</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
