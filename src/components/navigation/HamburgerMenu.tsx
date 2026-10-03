import React from 'react';
import {
  X,
  Globe2,
  Sliders,
  TrendingUp,
  FolderKanban,
  LayoutDashboard,
  Satellite,
  Thermometer,
  Wind,
  Droplet,
  Sparkles,
  Download,
  Settings,
  HelpCircle,
  BookOpen,
  Compass,
  Sun,
  Moon,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { CopernicusLogo } from '../common/CopernicusLogo';
import { useTheme } from '../../context/ThemeContext';

export interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: any) => void;
  onOpenAI: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenOnboarding: () => void;
  updateAvailable?: boolean;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenAI,
  onOpenExport,
  onOpenSettings,
  onOpenHelp,
  onOpenOnboarding,
  updateAvailable = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  const handleNavigate = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative flex flex-col w-full max-w-xs sm:max-w-sm h-full bg-slate-900 border-r border-slate-800 shadow-2xl z-10 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <CopernicusLogo className="w-8 h-8 shadow-md" />
            <div>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Copernicus Explorer
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">
                Menu des Fonctionnalités
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Category 1: Observation & Télédétection */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2 flex items-center gap-2">
              <Satellite className="w-3.5 h-3.5 text-cyan-400" />
              <span>Observation & Télédétection</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavigate(() => onSelectTab('map'))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'map'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe2 className="w-4 h-4 text-cyan-400" />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>Studio Cartographique</span>
                      <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 px-1 rounded border border-cyan-800">
                        Centre
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">Dessin → Données → Analyse Immédiate</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleNavigate(() => onSelectTab('vignettes'))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'vignettes'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>Vignettes & Bi-Date</span>
                      <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 px-1 rounded border border-cyan-800">
                        2020 | 2026
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">RGB, False Color, NDVI, SWIR, NDWI, Curseur vertical</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleNavigate(() => onSelectTab('temporal'))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'temporal'
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>Moteur Temporel</span>
                      <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1 rounded border border-emerald-800">
                        2018 ── 2026
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">Moyenne, médiane, percentiles, climatologie, anomalies (-18%)</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleNavigate(() => onSelectTab('project'))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'project'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderKanban className="w-4 h-4 text-cyan-400" />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span>Projet d'Analyse</span>
                      <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 px-1 rounded border border-cyan-800">
                        Workflow
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">Projet → Zone → Données → Analyses → Résultats → Rapport</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleNavigate(() => onSelectTab('dashboard'))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'dashboard'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  <div className="text-left">
                    <div>Dashboard Unifié</div>
                    <div className="text-[10px] text-slate-400">Cartographie & métriques multi-capteurs</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleNavigate(() => onSelectTab('observations'))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'observations'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Satellite className="w-4 h-4 text-cyan-400" />
                  <div className="text-left">
                    <div>Missions Sentinel</div>
                    <div className="text-[10px] text-slate-400">Catalogue d'images optiques & SAR radar</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>

          {/* Category 2: Services Thématiques Copernicus */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2 flex items-center gap-2">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Services Thématiques Européens</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavigate(() => onSelectTab('climate'))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'climate'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <div>Climat & Météo (ERA5)</div>
                    <div className="text-[10px] text-slate-400">ECMWF C3S • Réanalyses & tendances</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleNavigate(() => onSelectTab('atmosphere'))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'atmosphere'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <div>Atmosphère & Air (CAMS)</div>
                    <div className="text-[10px] text-slate-400">NO2, Ozone, PM2.5, PM10 & SO2</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleNavigate(() => onSelectTab('marine'))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'marine'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Droplet className="w-4 h-4 text-blue-400" />
                  <div className="text-left">
                    <div>Océans & Altimétrie (CMS)</div>
                    <div className="text-[10px] text-slate-400">Températures marines SST, vagues & courants</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>

          {/* Category 3: Outils & Intelligence Artificielle */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Outils & Intelligence Artificielle</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavigate(onOpenAI)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 text-purple-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                      Analyste IA Gemini
                    </div>
                    <div className="text-[10px] text-slate-400">Diagnostics écologiques automatisés</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleNavigate(onOpenExport)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-cyan-300" />
                  <div className="text-left">
                    <div>Export Multi-formats</div>
                    <div className="text-[10px] text-slate-400">GeoJSON, CSV, JSON & Synthèse TXT</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>

          {/* Category 4: Paramètres Système */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2 flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Système & Préférences</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavigate(onOpenSettings)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Settings className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition duration-300" />
                    {updateAvailable && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span>Paramètres Système</span>
                      {updateAvailable && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                          Mise à jour
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">Versions, màj auto & forçage</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-cyan-400" />
                  )}
                  <div className="text-left">
                    <div>Basculer le thème</div>
                    <div className="text-[10px] text-slate-400">
                      Actuel : {theme === 'dark' ? 'Thème Sombre' : 'Thème Clair'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-slate-800 px-2 py-0.5 rounded">
                  {theme === 'dark' ? 'Sombre' : 'Clair'}
                </span>
              </button>
            </div>
          </div>

          {/* Category 5: Assistance & Documentation */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2 flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Assistance & Savoir</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavigate(onOpenOnboarding)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <div className="text-left">
                    <div>Visite Guidée (Onboarding)</div>
                    <div className="text-[10px] text-slate-400">Revoir le guide pas-à-pas interactif</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleNavigate(onOpenHelp)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <div>Aide & Glossaire Technique</div>
                    <div className="text-[10px] text-slate-400">NDVI, ERA5, BOA/TOA, Sentinel-1 à 6</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleNavigate(() => onSelectTab('sources'))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'sources'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <div className="text-left">
                    <div>Sources & APIs Officielles</div>
                    <div className="text-[10px] text-slate-400">Endpoints CDSE, ECMWF CDS & CARTO</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-[11px]">v1.2.0 • Stable</span>
          </div>
          <button
            onClick={() => handleNavigate(onOpenSettings)}
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Mises à jour</span>
          </button>
        </div>
      </div>
    </div>
  );
};
