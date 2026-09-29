import React from 'react';
import { AnalysisProject } from '../../types/project';
import {
  Activity,
  Layers,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Flame,
  Droplet,
  CloudRain,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface Step4AnalysesProps {
  project: AnalysisProject;
  onUpdateProject: (updated: AnalysisProject) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenAI: () => void;
}

export const Step4Analyses: React.FC<Step4AnalysesProps> = ({
  project,
  onNextStep,
  onPrevStep,
  onOpenAI,
}) => {
  const { analyses, results } = project;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              <span>Étape 4 : Traitement Télédétection & Détection d'Événements</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
              Indices Spectraux & Corrélations Environnementales
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Calcul des indices biophysiques, croisement avec ERA5 et recensement des anomalies critiques.
            </p>
          </div>

          <button
            onClick={onOpenAI}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition active:scale-95 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Diagnostic Corrélations IA</span>
          </button>
        </div>

        {/* Spectral Indices Formula Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          {/* NDVI */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                <span>NDVI (Vigueur Végétale)</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
                Actif
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Formule : (B8 - B4) / (B8 + B4)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Sensible à la densité foliaire et la teneur en chlorophylle. Mesuré de -1 à +1.
            </p>
          </div>

          {/* NDWI */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Droplet className="w-4 h-4" />
                <span>NDWI (Stress Hydrique)</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold">
                Actif
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Formule : (B3 - B8) / (B3 + B8)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Mesure la teneur en eau du couvert végétal et les plans d'eau de surface.
            </p>
          </div>

          {/* NBR */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                <span>NBR (Sévérité / Brûlis)</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold">
                Actif
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Formule : (B8 - B12) / (B8 + B12)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Détecte les cicatrices de feux et le dessèchement extrême des sols.
            </p>
          </div>
        </div>
      </div>

      {/* Cross-correlations Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-500" />
          <span>Matrice de Corrélation Multi-Capteurs (Copernicus Sentinel & ECMWF)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-400">Végétation vs Température</span>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
              r = {analyses.correlations.vegTempCorrelation}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Forte corrélation négative : les canicules estivales provoquent un dépérissement foliaire immédiat.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-400">Végétation vs Pluviométrie</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              r = +{analyses.correlations.vegPrecipCorrelation}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Forte corrélation positive : la disponibilité en eau conditionne directement la biomasse chlorophyllienne.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-400">Qualité de l'Air (CAMS)</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-2">
              {analyses.correlations.airQualityIndexAvg}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Colonnes de NO₂ et PM2.5 mesurées sur l'agglomération par Sentinel-5P TROPOMI.
            </p>
          </div>
        </div>
      </div>

      {/* Extreme Events Detection Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Événements Extrêmes & Anomalies Détectées (2018 - 2026)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Événements documentés automatiquement par rupture de pente spectrale et anomalie ERA5.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
            {analyses.detectedEvents.length} événements répertoriés
          </span>
        </div>

        <div className="space-y-3">
          {analyses.detectedEvents.map((ev) => {
            const severityColors = {
              EXTREME: 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300',
              SEVERE: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300',
              MODERATE: 'border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300',
            };

            return (
              <div
                key={ev.id}
                className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 ${severityColors[ev.severity]}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900/10 dark:bg-slate-100/10">
                      {ev.period}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {ev.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                    Sévérité : {ev.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ev.description}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Impact NDVI</span>
                    <span className={`font-bold ${ev.impactNdviPercent < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {ev.impactNdviPercent > 0 ? `+${ev.impactNdviPercent}` : ev.impactNdviPercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Anomalie Température</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      +{ev.deltaTempC}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Déficit Pluie</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {ev.deficitPrecipPercent}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <button
          onClick={onPrevStep}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Précédent : Données</span>
        </button>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Étape 4 sur 6 validée • Traitements spectraux & événements modélisés
        </span>

        <button
          onClick={onNextStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition active:scale-95"
        >
          <span>Passer aux Résultats & Graphiques</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
