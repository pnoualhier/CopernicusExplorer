import React from 'react';
import { ClimateClimatologyData } from '../../types/copernicus';
import { Thermometer, TrendingUp, Calendar, AlertTriangle, CloudRain, ExternalLink } from 'lucide-react';

interface ClimateAnalysisViewProps {
  climatology: ClimateClimatologyData | null;
  onOpenProvenance?: () => void;
}

export const ClimateAnalysisView: React.FC<ClimateAnalysisViewProps> = ({
  climatology,
  onOpenProvenance,
}) => {
  if (!climatology) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
        Chargement des données climatiques ERA5...
      </div>
    );
  }

  const {
    locationName,
    baselineYearlyAvgTemp,
    recentYearlyAvgTemp,
    temperatureAnomaly,
    decadeTrends,
    monthlyComparison,
    historicalBaselinePeriod,
  } = climatology;

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-rose-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Analyse Climatique & Anomalies ERA5 : {locationName}
            </h3>
            <p className="text-xs text-slate-400">
              Réanalyse ECMWF C3S • Période de référence : {historicalBaselinePeriod}
            </p>
          </div>
        </div>

        {/* Global Anomaly Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-lg border font-mono text-xs font-bold ${
              temperatureAnomaly > 0
                ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                : 'bg-blue-950/80 text-blue-300 border-blue-800/80'
            }`}
          >
            Anomalie thermique : {temperatureAnomaly > 0 ? '+' : ''}{temperatureAnomaly}°C
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
          <div className="text-slate-400">Normale climatologique (1991-2020)</div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-200">
            {baselineYearlyAvgTemp}°C
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Moyenne annuelle 30 ans</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
          <div className="text-slate-400">Période récente (2020-2025)</div>
          <div className="mt-1 font-mono text-lg font-bold text-rose-400">
            {recentYearlyAvgTemp}°C
          </div>
          <div className="text-[10px] text-rose-400/90 mt-1 font-semibold">
            +{temperatureAnomaly}°C au-dessus de la normale
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
          <div className="text-slate-400">Précipitations annuelles moyennes</div>
          <div className="mt-1 font-mono text-lg font-bold text-cyan-400">
            670 mm
          </div>
          <div className="text-[10px] text-amber-400 mt-1">Déficit de -14% vs 1970-1999</div>
        </div>
      </div>

      {/* Decadal Anomalies Chart (ASCII / Scientific SVG bars as requested) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          Évolution de l'anomalie de température par décennie vs normale 1991-2020
        </h4>

        <div className="space-y-2 mt-3">
          {decadeTrends.map((d) => {
            const isPositive = d.anomaly >= 0;
            const barWidth = Math.min(100, Math.abs(d.anomaly) * 50);

            return (
              <div key={d.decade} className="flex items-center text-xs font-mono">
                <span className="w-20 text-slate-400 font-semibold">{d.decade}</span>
                <div className="flex-1 flex items-center h-5 bg-slate-900 rounded overflow-hidden relative mx-2 border border-slate-800">
                  {/* Center 0°C line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700 z-10" />

                  {isPositive ? (
                    <div
                      className="h-full bg-rose-500/80 rounded-r relative ml-auto"
                      style={{
                        left: '50%',
                        width: `${barWidth}%`,
                        position: 'absolute',
                      }}
                    />
                  ) : (
                    <div
                      className="h-full bg-blue-500/80 rounded-l relative"
                      style={{
                        right: '50%',
                        width: `${barWidth}%`,
                        position: 'absolute',
                      }}
                    />
                  )}
                </div>
                <span
                  className={`w-16 text-right font-bold ${
                    isPositive ? 'text-rose-400' : 'text-blue-400'
                  }`}
                >
                  {isPositive ? '+' : ''}{d.anomaly}°C
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Seasonal Comparison Table */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 overflow-x-auto">
        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          Comparatif mensuel : Moyenne historique vs Année en cours
        </h4>

        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
              <th className="pb-1.5 font-medium">Mois</th>
              <th className="pb-1.5 font-medium">Normale Temp (°C)</th>
              <th className="pb-1.5 font-medium">Année Actuelle (°C)</th>
              <th className="pb-1.5 font-medium">Écart</th>
              <th className="pb-1.5 font-medium">Pluie Normale</th>
              <th className="pb-1.5 font-medium">Pluie Actuelle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {monthlyComparison.map((m) => {
              const diff = Number((m.currentYear - m.historicalMean).toFixed(1));
              return (
                <tr key={m.month} className="hover:bg-slate-800/40">
                  <td className="py-1.5 font-bold text-slate-200">{m.month}</td>
                  <td className="py-1.5 text-slate-400">{m.historicalMean}°C</td>
                  <td className="py-1.5 text-rose-300">{m.currentYear}°C</td>
                  <td className={`py-1.5 font-bold ${diff > 0 ? 'text-rose-400' : 'text-blue-400'}`}>
                    {diff > 0 ? `+${diff}` : diff}°C
                  </td>
                  <td className="py-1.5 text-slate-400">{m.historicalPrecip} mm</td>
                  <td className="py-1.5 text-cyan-300">{m.currentPrecip} mm</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
