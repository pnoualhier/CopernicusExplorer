import React, { useState } from 'react';
import { AnalysisProject } from '../../types/project';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  Droplet,
  Thermometer,
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface Step5ResultsProps {
  project: AnalysisProject;
  onUpdateProject: (updated: AnalysisProject) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const Step5Results: React.FC<Step5ResultsProps> = ({
  project,
  onNextStep,
  onPrevStep,
}) => {
  const { results } = project;
  const [selectedYear, setSelectedYear] = useState<number>(results.targetYear);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              <span>Étape 5 : Résultats Quantitatifs & Comparaison Temporelle</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
              Trajectoire & Comparatif Décennal (2018 - 2026)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Évaluation de la dynamique foliaire, des bilans hydriques et de la résilience globale.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Tendance à long terme</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {results.longTermTrend}
            </span>
          </div>
        </div>

        {/* Temporal Triple Benchmark Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          {/* Baseline 2018 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-400">
                1. Référence Nominale ({results.baselineYear})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold">
                Baseline
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-2">
              NDVI {results.baselineNdvi}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Couvert végétal dense et sain sans stress hydrique majeur.
            </p>
          </div>

          {/* Crisis Year 2022 */}
          <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-rose-600 dark:text-rose-400 font-semibold">
                2. Point Bas Historique ({results.targetYear})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold">
                -38.4%
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-2">
              NDVI {results.targetNdvi}
            </div>
            <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">
              Sécheresse estivale extrême, dessèchement critique des sols.
            </p>
          </div>

          {/* Recent Year 2026 */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold">
                3. Situation Actuelle ({results.recentYear})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
                96% Récupéré
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
              NDVI {results.recentNdvi}
            </div>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">
              Résilience confirmée avec rebond foliaire printanier soutenu.
            </p>
          </div>
        </div>
      </div>

      {/* Yearly Multi-Sensor Statistics Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-500" />
              <span>Bilan Annuel Chronologique (Sentinel-2, ERA5 & CAMS)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Évolution des moyennes annuelles pour chaque indicateur scientifique.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            9 années d'historique
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 py-2.5">Année</th>
                <th className="px-3 py-2.5">NDVI Moyen</th>
                <th className="px-3 py-2.5">NDWI (Eau)</th>
                <th className="px-3 py-2.5">Température ERA5</th>
                <th className="px-3 py-2.5">Précipitations</th>
                <th className="px-3 py-2.5">NO₂ CAMS</th>
                <th className="px-3 py-2.5">Diagnostic Territorial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              {results.yearlyStats.map((row) => {
                const isSelected = row.year === selectedYear;
                const isCrisis = row.year === 2022;

                return (
                  <tr
                    key={row.year}
                    onClick={() => setSelectedYear(row.year)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-cyan-50 dark:bg-cyan-950/40 font-bold'
                        : isCrisis
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-3 py-2.5 font-bold flex items-center gap-1.5">
                      {row.year}
                      {isCrisis && <span className="text-[10px] text-rose-500">⚠️</span>}
                    </td>
                    <td className="px-3 py-2.5 text-emerald-600 dark:text-emerald-400">
                      {row.meanNdvi}
                    </td>
                    <td className="px-3 py-2.5 text-blue-600 dark:text-blue-400">
                      {row.meanNdwi > 0 ? `+${row.meanNdwi}` : row.meanNdwi}
                    </td>
                    <td className="px-3 py-2.5 text-amber-600 dark:text-amber-400">
                      {row.meanTempC}°C
                    </td>
                    <td className="px-3 py-2.5">
                      {row.totalPrecipMm} mm
                    </td>
                    <td className="px-3 py-2.5 text-purple-600 dark:text-purple-400">
                      {row.no2Avg}
                    </td>
                    <td className="px-3 py-2.5 font-sans text-[11px] text-slate-600 dark:text-slate-300">
                      {row.vegetationStatus}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Comparative Chart Representation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-500" />
          <span>Profil Comparatif : Écart au Maximum Historique de 2018</span>
        </h3>

        <div className="space-y-3 pt-2">
          {results.yearlyStats.map((st) => {
            const ratio = Math.max(10, Math.round((st.meanNdvi / results.baselineNdvi) * 100));
            const isCrisis = st.year === 2022;

            return (
              <div key={st.year} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span>{st.year}</span>
                    <span className="text-[10px] text-slate-400 font-sans">{st.vegetationStatus}</span>
                  </span>
                  <span className={`font-bold ${isCrisis ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'}`}>
                    NDVI {st.meanNdvi} ({ratio}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCrisis
                        ? 'bg-rose-500'
                        : ratio >= 90
                        ? 'bg-emerald-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${ratio}%` }}
                  />
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
          <span>Précédent : Analyses</span>
        </button>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Étape 5 sur 6 validée • Données prêtes pour la génération du rapport final
        </span>

        <button
          onClick={onNextStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition active:scale-95"
        >
          <span>Générer le Rapport Final</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
