import React, { useState } from 'react';
import {
  X,
  MapPin,
  ChevronRight,
  Search,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import { LocationItem } from '../../types';

interface LocationsListPanelProps {
  onSelectLocation: (loc: LocationItem) => void;
  onClose: () => void;
}

const DEFAULT_GLOBAL_LOCATIONS: LocationItem[] = [
  {
    id: 'loc-kerala',
    name: 'Kerala',
    country: 'India',
    region: 'South Asia',
    latitude: 10.8505,
    longitude: 76.2711,
    population: 34630000,
  },
  {
    id: 'loc-california',
    name: 'California',
    country: 'United States',
    region: 'North America',
    latitude: 36.7783,
    longitude: -119.4179,
    population: 39000000,
  },
  {
    id: 'loc-tokyo',
    name: 'Tokyo',
    country: 'Japan',
    region: 'East Asia',
    latitude: 35.6762,
    longitude: 139.6503,
    population: 37400000,
  },
  {
    id: 'loc-reykjavik',
    name: 'Reykjavik',
    country: 'Iceland',
    region: 'Northern Europe',
    latitude: 64.1466,
    longitude: -21.9426,
    population: 135000,
  },
  {
    id: 'loc-athens',
    name: 'Athens',
    country: 'Greece',
    region: 'Southern Europe',
    latitude: 37.9838,
    longitude: 23.7275,
    population: 3150000,
  },
  {
    id: 'loc-manila',
    name: 'Manila',
    country: 'Philippines',
    region: 'Southeast Asia',
    latitude: 14.5995,
    longitude: 120.9842,
    population: 14600000,
  },
];

export const LocationsListPanel: React.FC<LocationsListPanelProps> = ({
  onSelectLocation,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<LocationItem[]>(DEFAULT_GLOBAL_LOCATIONS);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setLocations(DEFAULT_GLOBAL_LOCATIONS);
      return;
    }

    if (val.length >= 2) {
      setIsSearching(true);
      try {
        const results = await api.searchLocations(val);
        setLocations(results.length > 0 ? results : DEFAULT_GLOBAL_LOCATIONS);
      } catch {
        setLocations(DEFAULT_GLOBAL_LOCATIONS);
      } finally {
        setIsSearching(false);
      }
    }
  };

  return (
    <div className="absolute top-20 left-[304px] w-96 max-h-[calc(100vh-160px)] z-30 flex flex-col glass-panel rounded-2xl border border-emerald-500/25 shadow-2xl text-slate-100 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-emerald-500/20 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">
              Location Intelligence Explorer
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Query any region on Earth
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search region (e.g., 'Kerala', 'Tokyo')..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
          {isSearching && (
            <Loader2 className="w-3.5 h-3.5 absolute right-3 animate-spin text-emerald-400" />
          )}
        </div>
      </div>

      {/* Locations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="text-[10px] font-mono uppercase text-slate-400 px-1">
          {query ? 'SEARCH RESULTS' : 'PRIORITY HIGH-HAZARD REGIONS'}
        </div>

        {locations.map((loc) => (
          <div
            key={loc.id}
            onClick={() => onSelectLocation(loc)}
            className="p-3 rounded-xl glass-card cursor-pointer hover:border-emerald-400/50 flex items-center justify-between transition-all"
          >
            <div className="flex items-start gap-2.5">
              <span className="text-xl">📍</span>
              <div>
                <h4 className="font-semibold text-xs text-white">
                  {loc.name}
                </h4>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {loc.country} {loc.region ? `• ${loc.region}` : ''}
                </div>
                <div className="text-[9px] text-emerald-400 font-mono mt-0.5">
                  {loc.latitude.toFixed(2)}° N, {loc.longitude.toFixed(2)}° E
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        ))}
      </div>
    </div>
  );
};
