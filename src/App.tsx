/**
 * Copernicus Explorer - Main Application
 * Unified Earth Observation Platform for Copernicus Services & Missions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BoundingBox,
  GeoPoint,
  GeoObservation,
  TimeSeriesPoint,
  ClimateClimatologyData,
  MissionType,
} from './types/copernicus';
import { CopernicusApiClient } from './services/apiClient';
import { UnifiedDashboard } from './components/dashboard/UnifiedDashboard';
import { ObservationList } from './components/sentinel/ObservationList';
import { ClimateAnalysisView } from './components/climate/ClimateAnalysisView';
import { AtmosphereView } from './components/atmosphere/AtmosphereView';
import { MarineView } from './components/marine/MarineView';
import { SourcesDocsView } from './components/common/SourcesDocsView';
import { TimelineBar } from './components/timeline/TimelineBar';
import { AIAnalystModal } from './components/ai/AIAnalystModal';
import { ProvenanceModal } from './components/common/ProvenanceModal';
import { ExportModal } from './components/common/ExportModal';
import { PWAInstallButton, OfflineIndicator } from './components/pwa/PWAInstallButton';
import {
  Satellite,
  Search,
  Sparkles,
  Download,
  Info,
  Layers,
  Thermometer,
  Wind,
  Droplet,
  Compass,
  BookOpen,
  LayoutDashboard,
} from 'lucide-react';

export default function App() {
  // Region & Map State
  const [bbox, setBbox] = useState<BoundingBox>({
    west: 3.37,
    south: 43.10,
    east: 4.37,
    north: 44.10,
  });
  const [point, setPoint] = useState<GeoPoint>({ lat: 43.60, lng: 3.87 });
  const [locationName, setLocationName] = useState('Sud de la France / Occitanie');
  const [searchQuery, setSearchQuery] = useState('');

  // Temporal & Mission Filters
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [selectedMission, setSelectedMission] = useState<MissionType>('SENTINEL-2');
  const [cloudCoverMax, setCloudCoverMax] = useState(30);

  // Data State
  const [observations, setObservations] = useState<GeoObservation[]>([]);
  const [selectedObservation, setSelectedObservation] = useState<GeoObservation | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [climatology, setClimatology] = useState<ClimateClimatologyData | null>(null);
  const [isLoadingObs, setIsLoadingObs] = useState(false);
  const [dataSourceMode, setDataSourceMode] = useState<'LIVE' | 'DEMO'>('DEMO');

  // Navigation
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'observations' | 'climate' | 'atmosphere' | 'marine' | 'sources'
  >('dashboard');

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [provenanceObs, setProvenanceObs] = useState<GeoObservation | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Fetch observations & time series
  const fetchData = useCallback(async () => {
    setIsLoadingObs(true);

    const filters = {
      mission: selectedMission,
      startDate,
      endDate,
      bbox,
      point,
      maxCloudCover: cloudCoverMax,
    };

    try {
      // 1. Observations
      const obsRes = await CopernicusApiClient.search(filters);
      setObservations(obsRes.results);
      if (obsRes.results.length > 0) {
        setSelectedObservation(obsRes.results[0]);
      }
      setDataSourceMode(obsRes.source.includes('LIVE') ? 'LIVE' : 'DEMO');

      // 2. Time series
      const ts = await CopernicusApiClient.getTimeSeries(filters);
      setTimeSeries(ts);

      // 3. Climatology
      const clim = await CopernicusApiClient.getClimatology(point.lat, point.lng, locationName);
      setClimatology(clim);
    } catch (err) {
      console.warn('Data fetching error, using graceful fallback', err);
    } finally {
      setIsLoadingObs(false);
    }
  }, [selectedMission, startDate, endDate, bbox, point, cloudCoverMax, locationName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Location Search
  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Direct Lat, Lng parsing e.g. "43.6, 3.8"
    const coordMatch = searchQuery.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const delta = 0.4;
        setPoint({ lat, lng });
        setBbox({
          west: Number((lng - delta).toFixed(4)),
          south: Number((lat - delta).toFixed(4)),
          east: Number((lng + delta).toFixed(4)),
          north: Number((lat + delta).toFixed(4)),
        });
        setLocationName(`Coordonnées (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`);
        setSearchQuery('');
        return;
      }
    }

    // Geocoding lookup via OSM Nominatim with instant fallback
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const delta = 0.45;
          setPoint({ lat, lng });
          setBbox({
            west: Number((lng - delta).toFixed(4)),
            south: Number((lat - delta).toFixed(4)),
            east: Number((lng + delta).toFixed(4)),
            north: Number((lat + delta).toFixed(4)),
          });
          setLocationName(data[0].display_name.split(',')[0]);
          setSearchQuery('');
          return;
        }
      }
    } catch (err) {
      console.warn('Geocoding search failed', err);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <header className="flex-shrink-0 bg-slate-900/90 border-b border-slate-800/80 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 shadow-md z-30">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <img src="/icon.svg" alt="Copernicus Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">
                Copernicus Explorer
              </h1>
              <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                PWA v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Observation de la Terre • Sentinel 1-6 • ERA5 • CAMS • Marine
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleLocationSearch} className="flex-1 max-w-sm mx-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une ville ou lat, lng (ex: Montpellier)..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 placeholder-slate-500 transition font-mono"
            />
          </div>
        </form>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* AI Trigger */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            title="Ouvrir l'analyste environnemental IA Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden md:inline">Analyste IA</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition active:scale-95"
            title="Exporter les données (GeoJSON, CSV, JSON, Rapport PDF)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Exporter</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </header>

      {/* Navigation Tab Bar */}
      <nav className="flex-shrink-0 bg-slate-950/90 border-b border-slate-800/80 px-3 sm:px-4 py-1 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar z-20 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'dashboard'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard Unifié</span>
          </button>

          <button
            onClick={() => setActiveTab('observations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'observations'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Missions Sentinel</span>
          </button>

          <button
            onClick={() => setActiveTab('climate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'climate'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Climat & Météo (ERA5)</span>
          </button>

          <button
            onClick={() => setActiveTab('atmosphere')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'atmosphere'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Atmosphère (CAMS)</span>
          </button>

          <button
            onClick={() => setActiveTab('marine')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'marine'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Océans & Altimétrie</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'sources'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sources & APIs</span>
          </button>
        </div>

        {/* Data Source Mode Indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">
            Mode Copernicus : {dataSourceMode === 'LIVE' ? 'CDSE Live' : 'Simulation Scientifique Réaliste'}
          </span>
        </div>
      </nav>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'dashboard' && (
          <UnifiedDashboard
            bbox={bbox}
            point={point}
            locationName={locationName}
            selectedObservation={selectedObservation}
            observations={observations}
            timeSeries={timeSeries}
            onBboxChange={setBbox}
            onPointChange={(p, name) => {
              setPoint(p);
              if (name) setLocationName(name);
            }}
            onSelectObservation={setSelectedObservation}
            onOpenProvenance={setProvenanceObs}
            onOpenAI={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === 'observations' && (
          <div className="flex-1 p-3 sm:p-4 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-3 overflow-y-auto">
            <div className="md:col-span-5 h-[540px]">
              <ObservationList
                observations={observations}
                selectedObservation={selectedObservation}
                onSelectObservation={setSelectedObservation}
                onOpenProvenance={setProvenanceObs}
                onAskAI={() => setIsAiModalOpen(true)}
                selectedMission={selectedMission}
                onMissionChange={setSelectedMission}
                cloudCoverMax={cloudCoverMax}
                onCloudCoverChange={setCloudCoverMax}
                isLoading={isLoadingObs}
              />
            </div>
            <div className="md:col-span-7 h-[540px]">
              {selectedObservation ? (
                <UnifiedDashboard
                  bbox={bbox}
                  point={point}
                  locationName={locationName}
                  selectedObservation={selectedObservation}
                  observations={observations}
                  timeSeries={timeSeries}
                  onBboxChange={setBbox}
                  onPointChange={setPoint}
                  onSelectObservation={setSelectedObservation}
                  onOpenProvenance={setProvenanceObs}
                  onOpenAI={() => setIsAiModalOpen(true)}
                />
              ) : (
                <div className="h-full bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                  Sélectionnez une observation dans la liste pour l'examiner.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'climate' && (
          <div className="flex-1 p-3 sm:p-4 max-w-5xl mx-auto w-full overflow-y-auto">
            <ClimateAnalysisView
              climatology={climatology}
              onOpenProvenance={() => {
                if (observations.length > 0) setProvenanceObs(observations[0]);
              }}
            />
          </div>
        )}

        {activeTab === 'atmosphere' && (
          <div className="flex-1 p-3 sm:p-4 max-w-5xl mx-auto w-full overflow-y-auto">
            <AtmosphereView />
          </div>
        )}

        {activeTab === 'marine' && (
          <div className="flex-1 p-3 sm:p-4 max-w-5xl mx-auto w-full overflow-y-auto">
            <MarineView />
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="flex-1 overflow-y-auto">
            <SourcesDocsView />
          </div>
        )}
      </main>

      {/* Bottom Timeline Bar */}
      <footer className="flex-shrink-0 z-20">
        <TimelineBar
          startDate={startDate}
          endDate={endDate}
          onChangeRange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
        />
      </footer>

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* Modals */}
      <AIAnalystModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        locationName={locationName}
        coordinates={point}
        startDate={startDate}
        endDate={endDate}
        selectedObservation={selectedObservation}
        timeSeries={timeSeries}
      />

      <ProvenanceModal
        isOpen={!!provenanceObs}
        observation={provenanceObs}
        onClose={() => setProvenanceObs(null)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        locationName={locationName}
        coordinates={point}
        bbox={bbox}
        startDate={startDate}
        endDate={endDate}
        observations={observations}
        timeSeries={timeSeries}
      />
    </div>
  );
}
