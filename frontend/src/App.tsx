import React, { useState, useEffect, useMemo } from 'react';
import { GlobeViewer } from './components/Globe/GlobeViewer';
import { GlobeErrorBoundary } from './components/Globe/GlobeErrorBoundary';
import { LandingPage } from './components/Landing/LandingPage';
import { Sidebar, NavTab } from './components/Navigation/Sidebar';
import { GlobalSearch } from './components/Search/GlobalSearch';
import { TimelineBar } from './components/Timeline/TimelineBar';
import { EventDetailPanel } from './components/Panels/EventDetailPanel';
import { SatelliteDetailPanel } from './components/Panels/SatelliteDetailPanel';
import { LocationIntelligencePanel } from './components/Panels/LocationIntelligencePanel';
import { SpotInspectionPanel } from './components/Panels/SpotInspectionPanel';
import { DisasterListPanel } from './components/Panels/DisasterListPanel';
import { SatelliteListPanel } from './components/Panels/SatelliteListPanel';
import { LocationsListPanel } from './components/Panels/LocationsListPanel';
import { AIAnalystModal } from './components/AIAnalyst/AIAnalystModal';
import { SimulationModal } from './components/Simulation/SimulationModal';
import { AnalyticsModal } from './components/Analytics/AnalyticsModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { CelesTrakKnowledgeModal } from './components/CelesTrak/CelesTrakKnowledgeModal';

import { api } from './services/api';
import {
  DisasterEvent,
  Satellite,
  LocationItem,
  SimulationResult,
  AnalyticsResponse,
  FilterState,
  SpotInspectionData
} from './types';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & View State
  const [isLandingPage, setIsLandingPage] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('explore')) {
      return false;
    }
    return true;
  });
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');

  // Core Data
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  // Active Selections
  const [selectedEvent, setSelectedEvent] = useState<DisasterEvent | null>(null);
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  // Spot Inspection State
  const [inspectedSpot, setInspectedSpot] = useState<SpotInspectionData | null>(null);
  const [isLoadingSpot, setIsLoadingSpot] = useState<boolean>(false);
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lon: number; altitude?: number; id: number } | null>(null);
  const [simulationInitialLocation, setSimulationInitialLocation] = useState<{ name: string; lat: number; lon: number } | null>(null);
  const [analystInitialQuery, setAnalystInitialQuery] = useState<string | undefined>(undefined);

  // Modals & Panels
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global Filters
  const [filters, setFilters] = useState<FilterState>({
    eventType: 'all',
    severity: 'all',
    status: 'all',
    timelineHoursAgo: 0,
    showSatellites: true,
    showDisasters: true,
    showOrbits: true,
    showLabels: true,
    satelliteMission: 'all',
  });

  // Initial Data Fetching
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [evData, satData, anaData] = await Promise.all([
          api.getEvents(),
          api.getSatellites(),
          api.getAnalytics(),
        ]);
        setEvents(evData);
        setSatellites(satData);
        setAnalytics(anaData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    loadInitialData();
  }, []);

  // Periodic Satellite Position Refresh (Keeps orbits active in real-time)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updatedSats = await api.getSatellites();
        if (updatedSats && updatedSats.length > 0) {
          setSatellites(updatedSats);
        }
      } catch {
        // Ignore background polling glitches
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Events based on sidebar controls and bottom timeline scrubber
  const displayedEvents = useMemo(() => {
    return events.filter((ev) => {
      // Event Type filter
      if (filters.eventType !== 'all' && ev.type !== filters.eventType) {
        return false;
      }
      // Severity filter
      if (filters.severity !== 'all' && ev.severity !== filters.severity) {
        return false;
      }
      // Timeline scrubber filter: if scrubber is set to X hours ago, hide events detected more recently than scrubber
      if (filters.timelineHoursAgo > 0) {
        const eventTime = new Date(ev.detected_at).getTime();
        const cutoffTime = Date.now() - filters.timelineHoursAgo * 3600 * 1000;
        if (eventTime > cutoffTime) {
          return false;
        }
      }
      return true;
    });
  }, [events, filters]);

  // Handle Event Selection
  const handleSelectEvent = async (event: DisasterEvent | null) => {
    if (!event) {
      setSelectedEvent(null);
      return;
    }
    setSelectedSatellite(null);
    setSelectedLocation(null);
    setInspectedSpot(null);
    // Fetch enriched details with relevant satellites & weather
    const detail = await api.getEventById(event.id);
    setSelectedEvent(detail || event);
  };

  // Handle Satellite Selection
  const handleSelectSatellite = async (sat: Satellite | null) => {
    if (!sat) {
      setSelectedSatellite(null);
      return;
    }
    setSelectedEvent(null);
    setSelectedLocation(null);
    setInspectedSpot(null);
    const detail = await api.getSatelliteById(sat.id);
    setSelectedSatellite(detail || sat);
  };

  // Handle Satellite by ID Selection (from Event panel)
  const handleSelectSatelliteById = async (satId: string) => {
    const sat = satellites.find((s) => s.id === satId);
    if (sat) {
      handleSelectSatellite(sat);
    } else {
      const fetched = await api.getSatelliteById(satId);
      if (fetched) handleSelectSatellite(fetched);
    }
  };

  // Handle Location Selection
  const handleSelectLocation = async (loc: LocationItem) => {
    setSelectedEvent(null);
    setSelectedSatellite(null);
    setInspectedSpot(null);
    const detail = await api.getLocationById(loc.id);
    setSelectedLocation(detail || loc);
  };

  // Handle Arbitrary Spot Inspection on 3D Globe Surface
  const handleInspectSpot = async (lat: number, lon: number) => {
    // Focus viewport on the inspected spot
    setSelectedEvent(null);
    setSelectedSatellite(null);
    setSelectedLocation(null);
    setIsLoadingSpot(true);

    const latFixed = Number(lat.toFixed(4));
    const lonFixed = Number(lon.toFixed(4));
    const coordStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;

    // Immediate optimistic beacon feedback so user sees the targeting reticle instantly
    const placeholderSpot: SpotInspectionData = {
      latitude: latFixed,
      longitude: lonFixed,
      coordinate_label: coordStr,
      name: 'Acquiring Target...',
      display_name: 'Contacting Geospatial Satellites & Weather Radar...',
      country: 'Analyzing...',
      region: 'Surface Inspection',
      terrain_type: 'Analyzing elevation & land cover...',
      is_maritime: false,
      weather: null,
      nearby_events: [],
      next_overpass: null,
      risk_level: 'Calculating...',
    };
    setInspectedSpot(placeholderSpot);

    try {
      const result = await api.inspectSpot(latFixed, lonFixed);
      if (result) {
        setInspectedSpot(result);
      }
    } catch (err) {
      console.error('Failed to inspect spot:', err);
      setToastMessage('Geospatial surface inspection query timed out');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsLoadingSpot(false);
    }
  };

  // Fly Camera to Coordinate
  const handleFlyTo = (lat: number, lon: number, altitude: number = 350000) => {
    setFlyToTarget({ lat, lon, altitude, id: Date.now() });
  };

  // Simulate Hazard at Inspected Spot
  const handleSimulateAtSpot = (lat: number, lon: number, name: string) => {
    setSimulationInitialLocation({ name, lat, lon });
    setInspectedSpot(null);
    setCurrentTab('simulation');
  };

  // Ask AI Analyst about Inspected Spot
  const handleAskAIAboutSpot = (spotName: string, lat: number, lon: number) => {
    setAnalystInitialQuery(
      `Provide a comprehensive environmental threat assessment and satellite monitoring coverage analysis for ${spotName} at coordinates (${lat.toFixed(2)}, ${lon.toFixed(2)}).`
    );
    setInspectedSpot(null);
    setCurrentTab('analyst');
  };

  // Sync Live USGS Earthquake Feeds
  const handleSyncLive = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncLiveUSGS();
      const updatedEvents = await api.getEvents();
      setEvents(updatedEvents);
      const updatedAnalytics = await api.getAnalytics();
      setAnalytics(updatedAnalytics);

      setToastMessage(`Synced ${res.live_events_synced} live events from USGS! (${res.newly_added} new)`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      setToastMessage('Live USGS sync completed (using cache)');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Switch between tabs
  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    // Auto-open modal/drawers
    if (tab === 'overview') {
      setSelectedEvent(null);
      setSelectedSatellite(null);
      setSelectedLocation(null);
      setInspectedSpot(null);
    }
  };

  // Landing Page Entry points
  const handleEnterExplore = () => {
    setIsLandingPage(false);
    setCurrentTab('overview');
  };

  const handleEnterDisasters = () => {
    setIsLandingPage(false);
    setCurrentTab('disasters');
    if (events.length > 0) {
      handleSelectEvent(events[0]);
    }
  };

  if (isLandingPage) {
    return (
      <LandingPage
        onEnterExplore={handleEnterExplore}
        onEnterDisasters={handleEnterDisasters}
        eventCount={events.length}
        satelliteCount={satellites.length}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden flex bg-slate-950 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-50 px-4 py-2.5 rounded-xl glass-panel border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        filters={filters}
        onFilterChange={setFilters}
        disasterCount={events.length}
        satelliteCount={satellites.length}
        onSyncLive={handleSyncLive}
        isSyncing={isSyncing}
      />

      {/* Main 3D Globe Viewport */}
      <main className="relative flex-1 h-full overflow-hidden">
        {/* Top Floating Header & Global Omni-Search */}
        <div className="absolute top-4 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto">
            <GlobalSearch
              events={events}
              satellites={satellites}
              onSelectEvent={handleSelectEvent}
              onSelectSatellite={handleSelectSatellite}
              onSelectLocation={handleSelectLocation}
            />
          </div>

          {/* Active Mode Pill or Landing Back Button */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => setIsLandingPage(true)}
              className="px-3.5 py-1.5 rounded-xl glass-panel hover:bg-slate-800/80 text-slate-300 hover:text-white text-xs font-mono transition-all border border-slate-700/60"
            >
              LANDING
            </button>
            <button
              onClick={() => handleSelectTab('celestrak')}
              className="px-3.5 py-1.5 rounded-xl glass-panel hover:bg-slate-800/80 border border-sky-500/40 text-sky-300 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/10"
              title="Open CelesTrak Space Intelligence & TLE Deconstructor"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>LIVE CELESTRAK HUB</span>
            </button>
          </div>
        </div>

        {/* 3D Cesium Earth Canvas */}
        <GlobeErrorBoundary>
          <GlobeViewer
            events={displayedEvents}
            satellites={satellites}
            selectedEvent={selectedEvent}
            selectedSatellite={selectedSatellite}
            inspectedSpot={inspectedSpot}
            simulationResult={simulationResult}
            showSatellites={filters.showSatellites}
            showDisasters={filters.showDisasters}
            showOrbits={filters.showOrbits}
            showLabels={filters.showLabels}
            flyToTarget={flyToTarget}
            onSelectEvent={handleSelectEvent}
            onSelectSatellite={handleSelectSatellite}
            onInspectSpot={handleInspectSpot}
            onToggleLabels={() => setFilters((f) => ({ ...f, showLabels: !f.showLabels }))}
          />
        </GlobeErrorBoundary>

        {/* Spot Inspection Intelligence Panel */}
        {(inspectedSpot || isLoadingSpot) && (
          <SpotInspectionPanel
            data={inspectedSpot}
            isLoading={isLoadingSpot}
            onClose={() => setInspectedSpot(null)}
            onSimulateAtSpot={handleSimulateAtSpot}
            onAskAIAboutSpot={handleAskAIAboutSpot}
            onSelectEvent={(ev) => handleSelectEvent(ev)}
            onZoomIn={(lat, lon) => handleFlyTo(lat, lon, 350000)}
          />
        )}

        {/* Event Detail Panel */}
        {selectedEvent && (
          <EventDetailPanel
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onSelectSatelliteId={handleSelectSatelliteById}
          />
        )}

        {/* Satellite Detail Panel */}
        {selectedSatellite && (
          <SatelliteDetailPanel
            satellite={selectedSatellite}
            onClose={() => setSelectedSatellite(null)}
            onTrackSatellite={(sat) => handleSelectSatellite(sat)}
          />
        )}

        {/* Location Intelligence Panel */}
        {selectedLocation && (
          <LocationIntelligencePanel
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
            onSelectEvent={handleSelectEvent}
            onSelectSatellite={handleSelectSatellite}
          />
        )}

        {/* Disasters Drawer when on 'disasters' tab */}
        {currentTab === 'disasters' && !selectedEvent && !selectedSatellite && !selectedLocation && (
          <DisasterListPanel
            events={displayedEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={handleSelectEvent}
            onClose={() => setCurrentTab('overview')}
          />
        )}

        {/* Satellites Drawer when on 'satellites' tab */}
        {currentTab === 'satellites' && !selectedEvent && !selectedSatellite && !selectedLocation && (
          <SatelliteListPanel
            satellites={satellites}
            selectedSatellite={selectedSatellite}
            onSelectSatellite={handleSelectSatellite}
            onClose={() => setCurrentTab('overview')}
          />
        )}

        {/* Locations Drawer when on 'locations' tab */}
        {currentTab === 'locations' && !selectedEvent && !selectedSatellite && !selectedLocation && (
          <LocationsListPanel
            onSelectLocation={handleSelectLocation}
            onClose={() => setCurrentTab('overview')}
          />
        )}

        {/* Bottom Timeline Scrubber */}
        <TimelineBar
          events={events}
          hoursAgo={filters.timelineHoursAgo}
          onHoursAgoChange={(hours) => setFilters((f) => ({ ...f, timelineHoursAgo: hours }))}
          onSelectEvent={handleSelectEvent}
        />
      </main>

      {/* AI Analyst Modal */}
      {currentTab === 'analyst' && (
        <AIAnalystModal
          onClose={() => {
            setAnalystInitialQuery(undefined);
            setCurrentTab('overview');
          }}
          onSelectEvent={handleSelectEvent}
          onSelectSatellite={handleSelectSatellite}
          initialQuery={analystInitialQuery}
        />
      )}

      {/* Disaster Simulation Modal */}
      {currentTab === 'simulation' && (
        <SimulationModal
          onClose={() => {
            setSimulationInitialLocation(null);
            setCurrentTab('overview');
          }}
          onSimulationApplied={(res) => {
            setSimulationResult(res);
            setSimulationInitialLocation(null);
            setCurrentTab('overview');
          }}
          onClearSimulation={() => {
            setSimulationResult(null);
            setSimulationInitialLocation(null);
            setCurrentTab('overview');
          }}
          currentSimulation={simulationResult}
          initialLocation={simulationInitialLocation}
        />
      )}

      {/* Analytics Dashboard Modal */}
      {currentTab === 'analytics' && (
        <AnalyticsModal
          analytics={analytics}
          onClose={() => setCurrentTab('overview')}
        />
      )}

      {/* CelesTrak Space Intelligence & TLE Deconstructor Modal */}
      {currentTab === 'celestrak' && (
        <CelesTrakKnowledgeModal
          onClose={() => setCurrentTab('overview')}
          onSelectSatellite={handleSelectSatellite}
          onSelectEvent={handleSelectEvent}
          satellites={satellites}
          events={events}
        />
      )}

      {/* Settings Modal */}
      {currentTab === 'settings' && (
        <SettingsModal
          onClose={() => setCurrentTab('overview')}
          onSyncLive={handleSyncLive}
          isSyncing={isSyncing}
        />
      )}
    </div>
  );
};

export default App;
