import React from 'react';
import { AnalysisProject } from '../../types/project';
import { MissionType } from '../../types/copernicus';
import {
  Satellite,
  Thermometer,
  Wind,
  Droplet,
  Calendar,
  Cloud,
  CheckCircle2,
  Layers,
  ArrowRight,
  ArrowLeft,
  Database,
  ShieldCheck,
} from 'lucide-react';

interface Step3DataSourcesProps {
  project: AnalysisProject;
  onUpdateProject: (updated: AnalysisProject) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const Step3DataSources: React.FC<Step3DataSourcesProps> = ({
  project,
  onUpdateProject,
  onNextStep,
  onPrevStep,
}) => {
  const { dataConfig } = project;

  const toggleMission = (mission: MissionType) => {
    const current = dataConfig.missions;
    let next: MissionType[];
    if (current.includes(mission)) {
      if (current.length === 1) return; // Keep at least one
      next = current.filter((m) => m !== mission);
    } else {
      next = [...current, mission];
    }
    onUpdateProject({
      ...project,
      dataConfig: {
        ...project.dataConfig,
        missions: next,
      },
    });
  };

  const handleDatesChange = (start: string, end: string) => {
    onUpdateProject({
      ...project,
      dataConfig: {
        ...project.dataConfig,
        startDate: start,
        endDate: end,
      },
    });
  };

  const missionsList: {
    id: MissionType;
    title: string;
    subtitle: string;
    icon: any;
    color: string;
    level: string;
  }[] = [
    {
      id: 'SENTINEL-2',
      title: 'Sentinel-2 (MSI)',
      subtitle: 'Imagerie optique 10m • 13 bandes spectrales • Réflectance L2A BOA',
      icon: Satellite,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
      level: 'L2A (Bottom-of-Atmosphere)',
    },
    {
      id: 'ERA5-CLIMATE',
      title: 'ECMWF ERA5 Climat (C3S)',
      subtitle: 'Réanalyses mondiales horaires • Températures 2m, pluie cumulée, vent',
      icon: Thermometer,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      level: 'Reanalysis Hourly (0.1° / ~9km)',
    },
    {
      id: 'CAMS-ATMOSPHERE',
      title: 'Copernicus CAMS Atmosphère',
      subtitle: 'Colonnes de dioxyde d\'azote (NO2), Ozone (O3), PM2.5 et PM10',
      icon: Wind,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
      level: 'Near-Real-Time Reanalysis',
    },
    {
      id: 'SENTINEL-1',
      title: 'Sentinel-1 (C-SAR)',
      subtitle: 'Radar micro-ondes tout-temps jour/nuit • Rétrodiffusion VV/VH',
      icon: Layers,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      level: 'GRD Sigma0 Calibré',
    },
    {
      id: 'COPERNICUS-MARINE',
      title: 'Copernicus Marine (CMS)',
      subtitle: 'Température de surface de l\'eau (SST), vagues et salinité',
      icon: Droplet,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/30',
      level: 'Ocean Physics In-Situ + Satellite',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              <span>Étape 3 : Ingestion Multi-Sources & Fenêtre Temporelle</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
              Sources de Données Copernicus & Période d'Étude
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sélectionnez les capteurs orbitaux et réanalyses météorologiques à intégrer dans le projet.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Catalogue d'Accès</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                CDSE STAC / OData API
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe Controls */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Calendar className="w-4 h-4 text-cyan-500" />
            <span>Période d'observation temporelle du projet (2018 → 2026) :</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">
                Date de début d'étude :
              </label>
              <input
                type="date"
                value={dataConfig.startDate}
                onChange={(e) => handleDatesChange(e.target.value, dataConfig.endDate)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">
                Date de fin d'étude :
              </label>
              <input
                type="date"
                value={dataConfig.endDate}
                onChange={(e) => handleDatesChange(dataConfig.startDate, e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Raccourcis :</span>
            <button
              onClick={() => handleDatesChange('2018-01-01', '2026-09-27')}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-cyan-500 font-mono transition"
            >
              2018 → 2026 (Complet)
            </button>
            <button
              onClick={() => handleDatesChange('2022-01-01', '2022-12-31')}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-cyan-500 font-mono transition"
            >
              Année 2022 (Sécheresse)
            </button>
            <button
              onClick={() => handleDatesChange('2024-01-01', '2026-09-27')}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-cyan-500 font-mono transition"
            >
              2024 → 2026 (Régénération)
            </button>
          </div>
        </div>
      </div>

      {/* Copernicus Missions Selection Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Satellite className="w-4 h-4 text-cyan-500" />
          <span>Capteurs Satellitaires & Catalogues Thématiques Activés</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {missionsList.map((m) => {
            const isSelected = dataConfig.missions.includes(m.id);
            const IconComponent = m.icon;

            return (
              <div
                key={m.id}
                onClick={() => toggleMission(m.id)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-cyan-500 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border ${m.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {m.title}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {m.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {m.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-0.5">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-cyan-600 border-cyan-600 text-white'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cloud Filter & Resolution Summary Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-cyan-500" />
          <span>Filtres de Qualité & Inventaire d'Acquisition</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Couverture Nuageuse Max</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-1">
              &le; {dataConfig.maxCloudCover}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Masquage automatique via masque de classification SCL
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Scènes Satellitaires Indexées</div>
            <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-1">
              {dataConfig.acquiredScenesCount} passages
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Sur la période {dataConfig.startDate.slice(0, 4)} - {dataConfig.endDate.slice(0, 4)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Résolution Spatiale Sol</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-1">
              {dataConfig.resolutionMeters} m (Bandes B2, B3, B4, B8)
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Échantillonnage régulier par pixel
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <button
          onClick={onPrevStep}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Précédent : Zone d'étude</span>
        </button>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Étape 3 sur 6 validée • {dataConfig.acquiredScenesCount} scènes prêtes pour analyse
        </span>

        <button
          onClick={onNextStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition active:scale-95"
        >
          <span>Passer aux Analyses & Indices</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
