import React, { useState, useMemo, useRef } from 'react';
import {
  TemporalAnalyticsEngine,
  MultiYearPoint,
  ClimatologyBaselinePoint,
  AnomalyDetection,
  StatisticalSummary,
} from '../../utils/temporalAnalyticsEngine';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Maximize2,
  Activity,
  BarChart3,
  HelpCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface TemporalEngineStudioProps {
  initialLat?: number;
  initialLng?: number;
  locationName?: string;
  onOpenAI?: (contextPrompt: string) => void;
}

export const TemporalEngineStudio: React.FC<TemporalEngineStudioProps> = ({
  initialLat = 43.604,
  initialLng = 1.444,
  locationName = 'Toulouse (Bassin Garonne)',
  onOpenAI,
}) => {
  // Metric Selection: NDVI, NDWI, Température, Pluviométrie
  const [selectedMetric, setSelectedMetric] = useState<'ndvi' | 'ndwi' | 'temperature' | 'precipitation'>('ndvi');

  // Time Range Selection
  const [timeRange, setTimeRange] = useState<'all' | '5y' | '3y' | '1y' | 'climatology_compare'>('all');

  // Layer Toggles
  const [showMovingAverage, setShowMovingAverage] = useState(true);
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [showPercentileBand, setShowPercentileBand] = useState(true);
  const [showClimatologyBaseline, setShowClimatologyBaseline] = useState(true);
  const [showAnomalyMarkers, setShowAnomalyMarkers] = useState(true);

  // Tooltip Hover State
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate multi-year 2018-2026 data
  const data = useMemo(() => {
    return TemporalAnalyticsEngine.generateMultiYearSeries(initialLat, initialLng, 2018, 2026);
  }, [initialLat, initialLng]);

  // Filter series according to selected timeRange
  const activeSeries = useMemo(() => {
    switch (timeRange) {
      case '1y':
        return data.allPoints.filter((p) => p.year >= 2025);
      case '3y':
        return data.allPoints.filter((p) => p.year >= 2023);
      case '5y':
        return data.allPoints.filter((p) => p.year >= 2021);
      case 'all':
      case 'climatology_compare':
      default:
        return data.allPoints;
    }
  }, [data, timeRange]);

  // Statistical summary of active filtered series
  const stats = useMemo(() => {
    return TemporalAnalyticsEngine.computeStatisticalSummary(activeSeries, 2026, 2018, 2025);
  }, [activeSeries]);

  // Chart Dimensions
  const width = 860;
  const height = 300;
  const padLeft = 50;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 45;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Extract raw values for active metric
  const getMetricValue = (p: MultiYearPoint) => {
    switch (selectedMetric) {
      case 'ndwi': return p.ndwi;
      case 'temperature': return p.temperature;
      case 'precipitation': return p.precipitation;
      case 'ndvi':
      default: return p.ndvi;
    }
  };

  const values = activeSeries.map(getMetricValue);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = Math.max(0.01, maxVal - minVal);
  const yAxisMin = selectedMetric === 'ndvi' ? 0.0 : selectedMetric === 'ndwi' ? -0.7 : Math.floor(minVal - 2);
  const yAxisMax = selectedMetric === 'ndvi' ? 1.0 : selectedMetric === 'ndwi' ? 0.2 : Math.ceil(maxVal + 2);

  const getX = (idx: number) => padLeft + (idx / Math.max(1, activeSeries.length - 1)) * plotW;
  const getY = (val: number) => padTop + (1 - (val - yAxisMin) / (yAxisMax - yAxisMin)) * plotH;

  // Main Raw Line SVG Path
  const mainLinePath = activeSeries
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(getMetricValue(p)).toFixed(1)}`)
    .join(' ');

  // Moving Average Path (30 days)
  const maValues = stats.movingAverage30;
  const maLinePath = maValues
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(v).toFixed(1)}`)
    .join(' ');

  // Linear Trend Path
  const trendSlope = stats.trend.slopePerYear;
  const trendIntercept = stats.trend.intercept;
  const trendStartVal = trendIntercept;
  const trendEndVal = trendIntercept + trendSlope * ((activeSeries.length - 1) / 24);
  const trendLinePath = `M ${padLeft} ${getY(trendStartVal).toFixed(1)} L ${padLeft + plotW} ${getY(trendEndVal).toFixed(1)}`;

  // Climatology Baseline Path (Mapped across series according to month)
  const baselineByMonth = new Map<number, ClimatologyBaselinePoint>();
  data.baseline.forEach((b) => baselineByMonth.set(b.month, b));

  const climatologyPath = activeSeries
    .map((p, i) => {
      const b = baselineByMonth.get(p.month);
      const val = b ? b.meanNdvi : stats.mean;
      return `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)}`;
    })
    .join(' ');

  // Interpercentile envelope (P10 - P90)
  const envelopeAreaPath = (() => {
    if (!showPercentileBand || activeSeries.length === 0) return '';
    const upperPoints = activeSeries.map((p, i) => {
      const b = baselineByMonth.get(p.month);
      const val = b ? b.p90Ndvi : stats.p90;
      return `${getX(i).toFixed(1)} ${getY(val).toFixed(1)}`;
    });
    const lowerPoints = activeSeries.map((p, i) => {
      const b = baselineByMonth.get(p.month);
      const val = b ? b.p10Ndvi : stats.p10;
      return `${getX(i).toFixed(1)} ${getY(val).toFixed(1)}`;
    }).reverse();

    return `M ${upperPoints[0]} L ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;
  })();

  // Most severe anomaly found in current year
  const primaryAnomaly = data.anomalies.find((a) => a.severity === 'extreme_negative') || data.anomalies[0];

  // Export full multi-year CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Annee', 'Mois', 'JourAnnee', 'NDVI', 'NDWI', 'Temp_C', 'Pluie_mm', 'MoyenneMobile_NDVI', 'ClimMoyenne_NDVI', 'Anomalie_Pourcent'];
    const rows = activeSeries.map((p, i) => {
      const b = baselineByMonth.get(p.month);
      const clim = b ? b.meanNdvi : 0.5;
      const anom = clim > 0 ? (((p.ndvi - clim) / clim) * 100).toFixed(1) : '0';
      return [
        p.date,
        p.year,
        p.month,
        p.dayOfYear,
        p.ndvi,
        p.ndwi,
        p.temperature,
        p.precipitation,
        maValues[i]?.toFixed(3) || p.ndvi,
        clim,
        anom,
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Copernicus_MoteurTemporel_${initialLat.toFixed(2)}_${initialLng.toFixed(2)}_2018_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-3 sm:p-4 space-y-4 overflow-y-auto">
      {/* 1. Header Bar: Title, Location, Anomaly Highlight Alert */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Moteur Temporel & Détection d'Anomalies</span>
              <span className="text-xs font-mono font-normal text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                2018 ─── 2026
              </span>
            </h2>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zone : <strong className="text-slate-200">{locationName}</strong> ({initialLat.toFixed(3)}°N, {initialLng.toFixed(3)}°E)</span>
            <span aria-hidden="true">·</span>
            <span>Missions : Sentinel-2 MSI (10m) & ECMWF ERA5-Land</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenAI && (
            <button
              onClick={() => {
                const prompt = `Analyse temporelle multi-annuelle Copernicus 2018-2026 pour la zone : ${locationName}.
Indicateur principal : NDVI.
Moyenne historique 2018-2025 : ${data.baseline[6]?.meanNdvi} en été.
Valeur actuelle 2026 : ${stats.min} (Anomalie constatée : ${stats.climatologyDeltaPercent}%).
Tendance linéaire globale : ${stats.trend.label}.
Explique les facteurs climatiques ERA5 et impacts agronomiques / sylvicoles.`;
                onOpenAI(prompt);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Diagnostic IA de l'Anomalie</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
            title="Exporter les séries et statistiques en CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Automated Anomaly Detection Banner (Requested Highlight) */}
      <div className={`p-4 rounded-2xl border transition shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        stats.climatologyDeltaPercent <= -15
          ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
          : stats.climatologyDeltaPercent <= -5
          ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
          : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl border mt-0.5 ${
            stats.climatologyDeltaPercent <= -15
              ? 'bg-rose-900/60 border-rose-700 text-rose-300'
              : stats.climatologyDeltaPercent <= -5
              ? 'bg-amber-900/60 border-amber-700 text-amber-300'
              : 'bg-emerald-900/60 border-emerald-700 text-emerald-300'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold tracking-wider opacity-80">
                Détection Automatique d'Anomalie Climatologique
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                stats.climatologyDeltaPercent <= -15
                  ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                  : 'bg-amber-950 text-amber-300 border-amber-700'
              }`}>
                {stats.climatologyDeltaPercent > 0 ? `+${stats.climatologyDeltaPercent}%` : `${stats.climatologyDeltaPercent}%`}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              NDVI Actuel (2026) vs Moyenne Climatologique (2018–2025) :{' '}
              <span className="text-rose-400 underline decoration-rose-500 underline-offset-4">
                Anomalie négative : {stats.climatologyDeltaPercent}%
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Déficit végétatif aigu détecté durant la période estivale 2026. L'indice chlorophyllien descend à{' '}
              <strong className="text-white font-mono">{stats.min}</strong> contre une référence normale de{' '}
              <strong className="text-white font-mono">{data.baseline[6]?.meanNdvi}</strong> (écart absolu de{' '}
              <strong className="text-rose-300 font-mono">{(stats.min - (data.baseline[6]?.meanNdvi || 0.7)).toFixed(3)} NDVI</strong>).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center font-mono text-xs">
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Baseline 2018–2025</div>
            <div className="font-bold text-slate-200">{data.baseline[6]?.meanNdvi} NDVI</div>
          </div>
          <span className="text-slate-500">vs</span>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Actuel 2026</div>
            <div className="font-bold text-rose-400">{stats.min} NDVI</div>
          </div>
        </div>
      </div>

      {/* 3. Statistical Control Ribbon (Filters, Metrics, Toggles) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Variable Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedMetric('ndvi')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                selectedMetric === 'ndvi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌿 NDVI (Végétation)</span>
            </button>
            <button
              onClick={() => setSelectedMetric('ndwi')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                selectedMetric === 'ndwi'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>💧 NDWI (Humidité/Eau)</span>
            </button>
            <button
              onClick={() => setSelectedMetric('temperature')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                selectedMetric === 'temperature'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌡️ Température ERA5</span>
            </button>
            <button
              onClick={() => setSelectedMetric('precipitation')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                selectedMetric === 'precipitation'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌧️ Pluviométrie</span>
            </button>
          </div>

          {/* Time Span Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 rounded-lg font-mono font-bold transition ${
                timeRange === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              2018 ── 2026 (Intégrale)
            </button>
            <button
              onClick={() => setTimeRange('5y')}
              className={`px-2.5 py-1 rounded-lg font-mono font-bold transition ${
                timeRange === '5y' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              5 Ans
            </button>
            <button
              onClick={() => setTimeRange('3y')}
              className={`px-2.5 py-1 rounded-lg font-mono font-bold transition ${
                timeRange === '3y' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              3 Ans
            </button>
            <button
              onClick={() => setTimeRange('1y')}
              className={`px-2.5 py-1 rounded-lg font-mono font-bold transition ${
                timeRange === '1y' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              2025–2026
            </button>
          </div>
        </div>

        {/* Statistical Layer Toggles Bar (Checkboxes) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">
              Calques Statistiques :
            </span>

            <button
              onClick={() => setShowMovingAverage(!showMovingAverage)}
              className={`px-2 py-0.5 rounded border transition flex items-center gap-1.5 ${
                showMovingAverage
                  ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Moyenne mobile (30j)</span>
            </button>

            <button
              onClick={() => setShowTrendLine(!showTrendLine)}
              className={`px-2 py-0.5 rounded border transition flex items-center gap-1.5 ${
                showTrendLine
                  ? 'bg-purple-950/80 border-purple-700 text-purple-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Tendance linéaire</span>
            </button>

            <button
              onClick={() => setShowClimatologyBaseline(!showClimatologyBaseline)}
              className={`px-2 py-0.5 rounded border transition flex items-center gap-1.5 ${
                showClimatologyBaseline
                  ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Climatologie 2018–2025</span>
            </button>

            <button
              onClick={() => setShowPercentileBand(!showPercentileBand)}
              className={`px-2 py-0.5 rounded border transition flex items-center gap-1.5 ${
                showPercentileBand
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-sm bg-emerald-500/40 border border-emerald-400" />
              <span>Percentiles (P10–P90)</span>
            </button>

            <button
              onClick={() => setShowAnomalyMarkers(!showAnomalyMarkers)}
              className={`px-2 py-0.5 rounded border transition flex items-center gap-1.5 ${
                showAnomalyMarkers
                  ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Points d'Anomalie (-18%)</span>
            </button>
          </div>

          <div className="text-slate-400 text-[10px]">
            {activeSeries.length} observations synchronisées
          </div>
        </div>
      </div>

      {/* 4. High-Precision Interactive SVG Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl relative select-none">
        <div className="w-full overflow-x-auto no-scrollbar">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[700px] overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Grid Lines Horizontal */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
              const val = yAxisMin + (1 - ratio) * (yAxisMax - yAxisMin);
              const y = padTop + ratio * plotH;
              return (
                <g key={ratio}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={padLeft + plotW}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {val.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Vertical Year Dividers */}
            {[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => {
              const firstIndex = activeSeries.findIndex((p) => p.year === yr);
              if (firstIndex < 0) return null;
              const x = getX(firstIndex);
              return (
                <g key={yr}>
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + plotH}
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  <text
                    x={x + 4}
                    y={padTop + 12}
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {yr}
                  </text>
                </g>
              );
            })}

            {/* 1. Shaded Percentile Range Envelope (P10 - P90) */}
            {envelopeAreaPath && (
              <path
                d={envelopeAreaPath}
                fill="rgba(16, 185, 129, 0.12)"
                stroke="rgba(16, 185, 129, 0.3)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            )}

            {/* 2. Climatology Baseline Path (2018-2025) */}
            {showClimatologyBaseline && (
              <path
                d={climatologyPath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.85"
              />
            )}

            {/* 3. Linear Trend Line */}
            {showTrendLine && (
              <path
                d={trendLinePath}
                fill="none"
                stroke="#c084fc"
                strokeWidth="2"
                strokeDasharray="5 4"
                opacity="0.9"
              />
            )}

            {/* 4. Moving Average Line */}
            {showMovingAverage && (
              <path
                d={maLinePath}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
                opacity="0.9"
              />
            )}

            {/* 5. Main Observed Value Curve */}
            <path
              d={mainLinePath}
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
            />

            {/* 6. Active Observation Points */}
            {activeSeries.map((p, idx) => {
              const x = getX(idx);
              const y = getY(getMetricValue(p));
              const isSelected = hoveredIndex === idx;

              // Check if point is an anomaly
              const isAnomaly = data.anomalies.some((a) => a.date === p.date);

              return (
                <g key={p.date} className="cursor-pointer">
                  {/* Invisible hit box for hover */}
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(idx)}
                  />

                  {/* Anomaly Highlight Ring */}
                  {showAnomalyMarkers && isAnomaly && (
                    <circle
                      cx={x}
                      cy={y}
                      r="7"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      className="animate-pulse"
                    />
                  )}

                  {/* Regular Point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? '5' : isAnomaly ? '4' : '2.5'}
                    fill={isAnomaly ? '#f43f5e' : isSelected ? '#ffffff' : '#34d399'}
                    stroke={isSelected ? '#38bdf8' : '#0f172a'}
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}

            {/* Hover Crosshair & Tooltip */}
            {hoveredIndex !== null && activeSeries[hoveredIndex] && (
              <g pointerEvents="none">
                {(() => {
                  const pt = activeSeries[hoveredIndex];
                  const x = getX(hoveredIndex);
                  const y = getY(getMetricValue(pt));
                  const b = baselineByMonth.get(pt.month);
                  const climVal = b ? b.meanNdvi : 0.5;
                  const deltaPercent = climVal > 0 ? (((pt.ndvi - climVal) / climVal) * 100).toFixed(1) : '0';

                  return (
                    <>
                      {/* Vertical tracking line */}
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + plotH}
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />

                      {/* Tooltip Card */}
                      <g transform={`translate(${Math.min(x + 12, width - 170)}, ${Math.max(padTop + 10, y - 65)})`}>
                        <rect
                          width="160"
                          height="74"
                          rx="8"
                          fill="#090d16"
                          stroke="#38bdf8"
                          strokeWidth="1"
                          filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                        />
                        <text x="10" y="18" fill="#e2e8f0" fontSize="11" fontWeight="bold" fontFamily="monospace">
                          {pt.date} ({pt.year})
                        </text>
                        <text x="10" y="34" fill="#34d399" fontSize="12" fontWeight="bold" fontFamily="monospace">
                          NDVI Actuel : {pt.ndvi}
                        </text>
                        <text x="10" y="48" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                          Moy 2018–25 : {climVal.toFixed(3)}
                        </text>
                        <text
                          x="10"
                          y="62"
                          fill={Number(deltaPercent) < -5 ? '#f43f5e' : '#34d399'}
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          Écart : {Number(deltaPercent) > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`}
                        </text>
                      </g>
                    </>
                  );
                })()}
              </g>
            )}
          </svg>
        </div>

        {/* Floating Legend Badge */}
        <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400" />
              <span>Valeur Réelle Observée</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 border-t border-dashed" />
              <span>Climatologie 2018–2025</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400" />
              <span>Moyenne Mobile</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-purple-400 border-t border-dashed" />
              <span>Tendance Régression</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Anomalies Critiques</span>
            </span>
          </div>

          <div className="font-mono text-[10px] text-slate-400">
            Survolez la courbe pour inspecter les valeurs exactes
          </div>
        </div>
      </div>

      {/* 5. Statistical KPI Grid: Moyenne, Médiane, Min, Max, Percentiles, Tendance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Moyenne (μ)</div>
          <div className="text-base font-bold font-mono text-slate-100 mt-0.5">
            {stats.mean}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">Valeur attendue</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Médiane (P50)</div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
            {stats.median}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">Robuste au bruit</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Minimum</div>
          <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
            {stats.min}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">Creux estival 2026</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Maximum</div>
          <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
            {stats.max}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">Pic printanier</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase">P10 (10%)</div>
          <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
            {stats.p10}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">Plancher 90%</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase">P90 (90%)</div>
          <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
            {stats.p90}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">Plafond 90%</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Écart-Type (σ)</div>
          <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
            ±{stats.stdDev}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">Variabilité</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Pente Tendance</div>
          <div className={`text-base font-bold font-mono mt-0.5 flex items-center gap-1 ${
            stats.trend.direction === 'HAUSSE' ? 'text-emerald-400' : stats.trend.direction === 'BAISSE' ? 'text-rose-400' : 'text-slate-200'
          }`}>
            {stats.trend.direction === 'HAUSSE' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{(stats.trend.slopePerYear * 100).toFixed(1)}%/an</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">R² = {stats.trend.r2}</div>
        </div>
      </div>

      {/* 6. Climatology Comparison Table (Month by Month: Baseline vs 2026 vs Delta %) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-200">
              Grille Climatologique Multi-Annuelle : Cycle Saisonnier (2018–2025 vs 2026)
            </h4>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            Résolution Décadaire Copernicus
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-800">
                <th className="py-2 px-3">Mois</th>
                <th className="py-2 px-3">Moyenne 2018–25</th>
                <th className="py-2 px-3">Médiane (P50)</th>
                <th className="py-2 px-3">Intervalle P10–P90</th>
                <th className="py-2 px-3 text-right">Année 2026</th>
                <th className="py-2 px-3 text-right">Anomalie (%)</th>
                <th className="py-2 px-3 text-right">Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.baseline.map((b) => {
                const curPts = data.currentYearPoints.filter((p) => p.month === b.month);
                const curVal = curPts.length > 0 ? TemporalAnalyticsEngine.mean(curPts.map((p) => p.ndvi)) : null;
                const deltaPct = curVal !== null && b.meanNdvi > 0
                  ? Number((((curVal - b.meanNdvi) / b.meanNdvi) * 100).toFixed(1))
                  : null;

                const isSevereAnomaly = deltaPct !== null && deltaPct <= -15;

                return (
                  <tr
                    key={b.month}
                    className={`transition hover:bg-slate-800/40 ${
                      isSevereAnomaly ? 'bg-rose-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>{b.label}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-bold">{b.meanNdvi}</td>
                    <td className="py-2.5 px-3 text-slate-400">{b.medianNdvi}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      [{b.p10Ndvi} — {b.p90Ndvi}]
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {curVal !== null ? (
                        <span className={isSevereAnomaly ? 'text-rose-400 font-bold' : 'text-slate-100'}>
                          {curVal}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {deltaPct !== null ? (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          deltaPct <= -15
                            ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                            : deltaPct < -5
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : deltaPct > 5
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[11px]">
                      {isSevereAnomaly ? (
                        <span className="text-rose-400 flex items-center justify-end gap-1 font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Déficit Sévère (-18%)</span>
                        </span>
                      ) : deltaPct !== null && deltaPct < -5 ? (
                        <span className="text-amber-400">Stress Hydrique</span>
                      ) : deltaPct !== null && deltaPct > 5 ? (
                        <span className="text-emerald-400">Vigueur Supérieure</span>
                      ) : curVal !== null ? (
                        <span className="text-slate-400">Conforme Normale</span>
                      ) : (
                        <span className="text-slate-600">À venir</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
