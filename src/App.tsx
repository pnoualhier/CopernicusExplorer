/**
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
import { CopernicusLogo } from './components/common/CopernicusLogo';
import { HamburgerMenu } from './components/navigation/HamburgerMenu';
import { SystemSettingsModal } from './components/system/SystemSettingsModal';
import { ContextHelpModal } from './components/common/ContextHelpModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { Tooltip } from './components/common/Tooltip';
import { useAutoUpdater } from './hooks/useAutoUpdater';
import { useTheme } from './context/ThemeContext';
import { ProjectWorkspace } from './components/project/ProjectWorkspace';
import { NewProjectModal } from './components/project/NewProjectModal';
import { InteractiveMapStudio } from './components/map/InteractiveMapStudio';
import { SatelliteVignetteStudio } from './components/vignettes/SatelliteVignetteStudio';
import { TemporalEngineStudio } from './components/temporal/TemporalEngineStudio';
import { ProjectService } from './services/projectService';
import { AnalysisProject } from './types/project';
import {
  Menu,
  Globe2,
  FolderKanban,
  Satellite,
  Search,
  Sparkles,
  Download,
  Eye,
  Sliders,
  TrendingUp,
  Thermometer,
  Wind,
  Droplet,
  BookOpen,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Zap,
  X,
} from 'lucide-react';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const updater = useAutoUpdater();

  // Projects State
  const [projects, setProjects] = useState<AnalysisProject[]>(() => ProjectService.getAllProjects());
  const [activeProject, setActiveProject] = useState<AnalysisProject>(() => ProjectService.getActiveProject());
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Region & Map State
  const [bbox, setBbox] = useState<BoundingBox>(() => activeProject.zone.bbox);
  const [point, setPoint] = useState<GeoPoint>(() => activeProject.zone.center);
  const [locationName, setLocationName] = useState(() => activeProject.zone.name);
  const [searchQuery, setSearchQuery] = useState('');

  // Temporal & Mission Filters
  const [startDate, setStartDate] = useState(() => activeProject.dataConfig.startDate);
  const [endDate, setEndDate] = useState(() => activeProject.dataConfig.endDate);
  const [selectedMission, setSelectedMission] = useState<MissionType>(() => activeProject.dataConfig.missions[0] || 'SENTINEL-2');
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
    'map' | 'vignettes' | 'temporal' | 'project' | 'dashboard' | 'observations' | 'climate' | 'atmosphere' | 'marine' | 'sources'
  >('map');

  // Modals & Drawers
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [provenanceObs, setProvenanceObs] = useState<GeoObservation | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Project Handlers
  const handleSelectProject = (id: string) => {
    ProjectService.setActiveProjectId(id);
    const found = projects.find((p) => p.id === id);
    if (found) {
      setActiveProject(found);
      setBbox(found.zone.bbox);
      setPoint(found.zone.center);
      setLocationName(found.zone.name);
      setStartDate(found.dataConfig.startDate);
      setEndDate(found.dataConfig.endDate);
      setSelectedMission(found.dataConfig.missions[0] || 'SENTINEL-2');
    }
  };

  const handleUpdateProject = (updated: AnalysisProject) => {
    ProjectService.saveProject(updated);
    setProjects(ProjectService.getAllProjects());
    setActiveProject(updated);
    setBbox(updated.zone.bbox);
    setPoint(updated.zone.center);
    setLocationName(updated.zone.name);
    setStartDate(updated.dataConfig.startDate);
    setEndDate(updated.dataConfig.endDate);
  };

  const handleCreateNewProject = (params: {
    title: string;
    description: string;
    theme: AnalysisProject['theme'];
    locationName?: string;
  }) => {
    const created = ProjectService.createNewProject({
      ...params,
      center: point,
    });
    setProjects(ProjectService.getAllProjects());
    setActiveProject(created);
    setBbox(created.zone.bbox);
    setPoint(created.zone.center);
    setLocationName(created.zone.name);
  };

  const handleResetDefaults = () => {
    const reset = ProjectService.resetToDefaults();
    setProjects(reset);
    setActiveProject(reset[0]);
    setBbox(reset[0].zone.bbox);
    setPoint(reset[0].zone.center);
    setLocationName(reset[0].zone.name);
  };

  // Auto-launch onboarding on very first visit
  useEffect(() => {
    try {
      const never = localStorage.getItem('copernicus_onboarding_never');
      const done = localStorage.getItem('copernicus_onboarding_done');
      if (!done && !never) {
        setIsOnboardingOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

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
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Top Application Header */}
      <header className="flex-shrink-0 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm z-30">
        {/* Left: Hamburger Button & Logo */}
        <div className="flex items-center gap-2.5">
          {/* Hamburger Menu Trigger */}
          <Tooltip content="Ouvrir le menu des fonctionnalités par catégorie" position="bottom">
            <button
              onClick={() => setIsHamburgerOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 relative"
              aria-label="Menu principal"
            >
              <Menu className="w-5 h-5" />
              {updater.updateAvailable && (
                <span className="absolute 1 top-1 right-1 w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              )}
            </button>
          </Tooltip>

          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <CopernicusLogo className="w-8 h-8 flex-shrink-0 drop-shadow-md" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Copernicus Explorer
                </h1>
                <Tooltip content={`Version ${updater.currentVersion} • Publiée le ${updater.releaseDate}`}>
                  <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/60 font-semibold cursor-help">
                    v{updater.currentVersion}
                  </span>
                </Tooltip>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden md:block">
                Observation de la Terre • Sentinel 1-6 • ERA5 • CAMS • Marine
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleLocationSearch} className="flex-1 max-w-sm mx-2">
          <Tooltip content="Recherchez un toponyme ou saisissez des coordonnées GPS (lat, lng)" position="bottom" className="w-full">
            <div className="relative flex items-center w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une ville ou lat, lng (ex: Montpellier)..."
                className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-cyan-500 placeholder-slate-400 dark:placeholder-slate-500 transition font-mono"
              />
            </div>
          </Tooltip>
        </form>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Trigger */}
          <Tooltip content="Consulter l'Analyste Environnemental IA Gemini" position="bottom">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span className="hidden lg:inline">Analyste IA</span>
            </button>
          </Tooltip>

          {/* Export Button */}
          <Tooltip content="Exporter les données (GeoJSON, CSV, JSON, Synthèse)" position="bottom">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700/80 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Exporter</span>
            </button>
          </Tooltip>

          {/* Theme Toggle Button */}
          <Tooltip content={theme === 'dark' ? 'Passer au Thème Clair' : 'Passer au Thème Sombre'} position="bottom">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Basculer le thème"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-600" />
              )}
            </button>
          </Tooltip>

          {/* Help Button */}
          <Tooltip content="Aide contextuelle & Glossaire technique" position="bottom">
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Aide scientifique"
            >
              <HelpCircle className="w-4 h-4 text-emerald-500" />
            </button>
          </Tooltip>

          {/* System Settings Button */}
          <Tooltip content="Paramètres Système & Mises à jour" position="bottom">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="relative p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Paramètres système"
            >
              <Settings className="w-4 h-4 text-slate-500 dark:text-slate-300" />
              {updater.updateAvailable && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>
          </Tooltip>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </header>

      {/* Navigation Tab Bar */}
      <nav className="flex-shrink-0 bg-slate-100 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-4 py-1 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar z-20 text-xs">
        <div className="flex items-center gap-1">
          <Tooltip content="Studio Cartographique Central : Sélection de zone (point, rectangle, polygone, cercle, commune, département, région, pays) → Données → Analyse immédiate">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === 'map'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md ring-1 ring-cyan-400'
                  : 'text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/40'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Studio Carte</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hidden sm:inline">
                Centre
              </span>
            </button>
          </Tooltip>

          <Tooltip content="Vignettes satellites multispectrales (RGB, False Color, NDVI, SWIR, NDWI), curseur d'opacité et comparateur vertical de dates (2020 | 2026)">
            <button
              onClick={() => setActiveTab('vignettes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === 'vignettes'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md ring-1 ring-cyan-400'
                  : 'text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/40'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vignettes & Bi-Date</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hidden sm:inline">
                2020 | 2026
              </span>
            </button>
          </Tooltip>

          <Tooltip content="Moteur temporel statistique pluri-annuel (2018–2026) : NDVI, moyenne, médiane, percentiles, tendance, moyennes mobiles, climatologie 2018–2025 et détection d'anomalies (-18%)">
            <button
              onClick={() => setActiveTab('temporal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === 'temporal'
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md ring-1 ring-emerald-400'
                  : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Moteur Temporel</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hidden sm:inline">
                2018 ── 2026
              </span>
            </button>
          </Tooltip>

          <Tooltip content="Workflow central d'étude : Projet → Zone d'étude → Données → Analyses → Résultats → Rapport">
            <button
              onClick={() => setActiveTab('project')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === 'project'
                  ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Projet d'Analyse</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hidden sm:inline">
                Workflow
              </span>
            </button>
          </Tooltip>

          <Tooltip content="Vue d'ensemble cartographique et télédétection multi-capteurs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard Unifié</span>
            </button>
          </Tooltip>

          <Tooltip content="Images satellitaires Sentinel-1 (Radar) et Sentinel-2 (Optique)">
            <button
              onClick={() => setActiveTab('observations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === 'observations'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Missions Sentinel</span>
            </button>
          </Tooltip>

          <Tooltip content="Réanalyses climatiques ECMWF ERA5 (Températures, Précipitations, Anomalies)">
            <button
              onClick={() => setActiveTab('climate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === 'climate'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Climat & Météo (ERA5)</span>
            </button>
          </Tooltip>

          <Tooltip content="Surveillance de l'atmosphère CAMS (NO2, Ozone, PM2.5, PM10)">
            <button
              onClick={() => setActiveTab('atmosphere')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === 'atmosphere'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Atmosphère (CAMS)</span>
            </button>
          </Tooltip>

          <Tooltip content="Milieu marin CMS (Température de surface de mer SST, Vagues, Altimétrie)">
            <button
              onClick={() => setActiveTab('marine')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === 'marine'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>Océans & Altimétrie</span>
            </button>
          </Tooltip>

          <Tooltip content="Documentation officielle des APIs Copernicus CDSE, ECMWF & CARTO">
            <button
              onClick={() => setActiveTab('sources')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === 'sources'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sources & APIs</span>
            </button>
          </Tooltip>
        </div>

        {/* Right Info: Data Source & Update Status Indicator */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">
          {updater.updateAvailable && (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hidden sm:flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
            >
              <Zap className="w-3 h-3 text-cyan-500 animate-bounce" />
              <span>Mise à jour dispo</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">
              Mode Copernicus : {dataSourceMode === 'LIVE' ? 'CDSE Live' : 'Simulation Scientifique Réaliste'}
            </span>
          </div>
        </div>
      </nav>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'map' && (
          <InteractiveMapStudio
            initialBbox={bbox}
            initialPoint={point}
            onSelectZone={(newBbox, newPoint, name) => {
              setBbox(newBbox);
              setPoint(newPoint);
              setLocationName(name);
            }}
            onOpenAI={() => setIsAiModalOpen(true)}
            onOpenBiDateComparison={() => setActiveTab('vignettes')}
            onOpenTemporalStudio={() => setActiveTab('temporal')}
          />
        )}

        {activeTab === 'vignettes' && (
          <SatelliteVignetteStudio
            onOpenAI={(prompt) => {
              setIsAiModalOpen(true);
            }}
          />
        )}

        {activeTab === 'temporal' && (
          <TemporalEngineStudio
            initialLat={point.lat}
            initialLng={point.lng}
            locationName={locationName}
            onOpenAI={(prompt) => {
              setIsAiModalOpen(true);
            }}
          />
        )}

        {activeTab === 'project' && (
          <ProjectWorkspace
            project={activeProject}
            projects={projects}
            onSelectProject={handleSelectProject}
            onUpdateProject={handleUpdateProject}
            onCreateProject={() => setIsNewProjectModalOpen(true)}
            onResetDefaults={handleResetDefaults}
            onOpenAI={() => setIsAiModalOpen(true)}
            onExportGeoJson={() => setIsExportModalOpen(true)}
          />
        )}

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
            onOpenBiDateComparison={() => setActiveTab('vignettes')}
            onOpenTemporalStudio={() => setActiveTab('temporal')}
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
                onOpenBiDateComparison={() => setActiveTab('vignettes')}
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
                  onOpenBiDateComparison={() => setActiveTab('vignettes')}
                  onOpenTemporalStudio={() => setActiveTab('temporal')}
                />
              ) : (
                <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs">
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

      {/* Background Update Notification Toast */}
      {updater.backgroundInstalled && (
        <div className="fixed bottom-14 right-4 z-40 bg-slate-900 text-slate-100 border border-cyan-500/60 rounded-xl p-3 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-3 max-w-md">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Zap className="w-4 h-4 animate-bounce" />
          </div>
          <div className="text-xs flex-1">
            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
              <span>Mise à jour prête en arrière-plan</span>
              <span className="font-mono text-[10px] text-cyan-400">v{updater.latestVersion}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Téléchargée et installée automatiquement.
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={updater.forceUpdate}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              Appliquer
            </button>
            <button
              onClick={updater.dismissBackgroundToast}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* Hamburger Navigation Drawer */}
      <HamburgerMenu
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAI={() => setIsAiModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        updateAvailable={updater.updateAvailable}
      />

      {/* System Settings Modal */}
      <SystemSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        updater={updater}
      />

      {/* Context Help & Scientific Glossary Modal */}
      <ContextHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onStartOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Interactive Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* AI Analyst Modal */}
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

      {/* Data Provenance Modal */}
      <ProvenanceModal
        isOpen={!!provenanceObs}
        observation={provenanceObs}
        onClose={() => setProvenanceObs(null)}
      />

      {/* Multi-Format Export Modal */}
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

      {/* New Project Creation Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreate={handleCreateNewProject}
      />
    </div>
  );
}
