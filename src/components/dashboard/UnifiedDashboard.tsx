import React from 'react';
import {
  BoundingBox,
  GeoPoint,
  GeoObservation,
  TimeSeriesPoint,
} from '../../types/copernicus';
import { CopernicusMap } from '../map/CopernicusMap';
import { SpectralVisualizer } from '../sentinel/SpectralVisualizer';
import { TimeSeriesChart } from '../charts/TimeSeriesChart';
import { Thermometer, CloudRain, Wind, Activity, Sparkles, Satellite, Eye } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface UnifiedDashboardProps {
  bbox: BoundingBox;
  point: GeoPoint;
  locationName: string;
  selectedObservation: GeoObservation | null;
  observations: GeoObservation[];
  timeSeries: TimeSeriesPoint[];
  onBboxChange: (b: BoundingBox) => void;
  onPointChange: (p: GeoPoint, name?: string) => void;
  onSelectObservation: (obs: GeoObservation) => void;
  onOpenProvenance: (obs: GeoObservation) => void;
  onOpenAI: () => void;
  onOpenBiDateComparison?: () => void;
  onOpenTemporalStudio?: () => void;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  bbox,
  point,
  locationName,
  selectedObservation,
  timeSeries,
  onBboxChange,
  onPointChange,
  onOpenProvenance,
  onOpenAI,
  onOpenBiDateComparison,
  onOpenTemporalStudio,
}) => {
  // Current real-time indicators
  const latestTs = timeSeries[timeSeries.length - 1] || {
    temperature: 23.4,
    precipitation: 2.4,
    windSpeed: 18.0,
    ndvi: 0.72,
    no2: 24.2,
    sst: 19.8,
  };

  const currentNdvi = selectedObservation?.opticalDetails?.indices?.ndviMean ?? latestTs.ndvi ?? 0.72;

  return (
    <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-7xl mx-auto w-full overflow-y-auto">
      {/* Top Quick Status Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Weather Card */}
        <Tooltip content="Température de surface ERA5 (ECMWF C3S)" className="w-full">
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm dark:shadow-md transition">
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                <span>Météo (ERA5)</span>
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-slate-100">
                {latestTs.temperature ?? 23.4}°C
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Pluie {latestTs.precipitation ?? 2.4} mm • Vent {latestTs.windSpeed ?? 18} km/h
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CloudRain className="w-5 h-5" />
            </div>
          </div>
        </Tooltip>

        {/* Vegetation Card */}
        <Tooltip content="Indice NDVI moyen calculé à partir des bandes B4 (Rouge) et B8 (PIR)" className="w-full">
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm dark:shadow-md transition">
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>Végétation (NDVI)</span>
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {currentNdvi}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Couvert végétal ~{Math.round(currentNdvi * 95)}% (Sentinel-2)
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Satellite className="w-5 h-5" />
            </div>
          </div>
        </Tooltip>

        {/* Atmosphere Card */}
        <Tooltip content="Densité totale de dioxyde d'azote mesurée par CAMS / Sentinel-5P" className="w-full">
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm dark:shadow-md transition">
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-purple-500" />
                <span>Atmosphère (CAMS)</span>
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-purple-600 dark:text-purple-400">
                NO₂ : {latestTs.no2 ?? 24.2}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Qualité de l'air : 2/5 (Bon)
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
          </div>
        </Tooltip>

        {/* AI Quick Insight Card */}
        <Tooltip content="Lancer une analyse environnementale automatisée avec Gemini" className="w-full">
          <div
            onClick={onOpenAI}
            className="w-full bg-gradient-to-br from-cyan-600/10 to-blue-600/10 dark:from-cyan-950/80 dark:to-blue-950/80 border border-cyan-300 dark:border-cyan-700/60 hover:border-cyan-500 rounded-xl p-3 flex items-center justify-between shadow-sm dark:shadow-md cursor-pointer transition group"
          >
            <div>
              <div className="text-[11px] font-medium text-cyan-700 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Analyste IA</span>
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-200 transition">
                Détecter corrélations
              </div>
              <div className="text-[10px] text-cyan-700 dark:text-cyan-300/80 mt-0.5">
                Synthèse multi-capteurs Gemini
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-cyan-600/20 dark:bg-cyan-600/30 border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 flex items-center justify-center group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </Tooltip>
      </div>

      {/* Main Grid: Interactive Map + Spectral Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[460px]">
        {/* Map (7 cols) */}
        <div className="lg:col-span-7 h-[360px] lg:h-auto rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md relative">
          <CopernicusMap
            bbox={bbox}
            point={point}
            selectedObservation={selectedObservation}
            onBboxChange={onBboxChange}
            onPointChange={onPointChange}
          />
        </div>

        {/* Spectral Visualizer / Observation View (5 cols) */}
        <div className="lg:col-span-5 h-[380px] lg:h-auto">
          {selectedObservation ? (
            <SpectralVisualizer
              observation={selectedObservation}
              onOpenProvenance={() => onOpenProvenance(selectedObservation)}
              onOpenBiDateComparison={onOpenBiDateComparison}
            />
          ) : (
            <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
              <Eye className="w-8 h-8 text-cyan-500 mb-2" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Sélectionnez une observation
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Cliquez sur une observation satellite pour afficher les rendus multispectraux et indices de végétation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Multi-Sensor Temporal Chart */}
      <div className="w-full">
        <TimeSeriesChart
          series={timeSeries}
          title={`Évolution Temporelle Multi-Capteurs : ${locationName}`}
          onOpenTemporalStudio={onOpenTemporalStudio}
        />
      </div>
    </div>
  );
};
