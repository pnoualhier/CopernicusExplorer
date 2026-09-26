import React, { useState } from 'react';
import { TimeSeriesPoint } from '../../types/copernicus';
import { TrendingUp } from 'lucide-react';

interface TimeSeriesChartProps {
  series: TimeSeriesPoint[];
  title?: string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  series,
  title = 'Évolution Temporelle Multi-Capteurs (Sentinel-2 & ERA5)',
}) => {
  const [showNdvi, setShowNdvi] = useState(true);
  const [showTemp, setShowTemp] = useState(true);
  const [showRain, setShowRain] = useState(true);
  const [showRadiation, setShowRadiation] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);

  if (!series || series.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
        Aucune donnée temporelle disponible pour cette sélection.
      </div>
    );
  }

  // Dimensions
  const width = 640;
  const height = 220;
  const padLeft = 45;
  const padRight = 45;
  const padTop = 20;
  const padBottom = 35;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Scales
  const maxRain = Math.max(10, ...series.map((p) => p.precipitation ?? 0));
  const temps = series.map((p) => p.temperature ?? 15);
  const minTemp = Math.min(0, ...temps) - 2;
  const maxTemp = Math.max(30, ...temps) + 2;

  const getX = (idx: number) => padLeft + (idx / Math.max(1, series.length - 1)) * plotW;
  const getYNdvi = (val: number) => padTop + (1 - val) * plotH; // NDVI 0.0 to 1.0
  const getYTemp = (t: number) => padTop + (1 - (t - minTemp) / (maxTemp - minTemp)) * plotH;
  const getHPrecip = (p: number) => (p / maxRain) * (plotH * 0.45);

  // SVG Paths
  const ndviPath = series
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYNdvi(p.ndvi ?? 0.5).toFixed(1)}`)
    .join(' ');

  const tempPath = series
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYTemp(p.temperature ?? 15).toFixed(1)}`)
    .join(' ');

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
      {/* Header with Title & Variable Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-slate-100">{title}</h3>
        </div>

        {/* Legend / Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <button
            onClick={() => setShowNdvi(!showNdvi)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono transition border ${
              showNdvi ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'text-slate-400 border-transparent hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>NDVI (0-1)</span>
          </button>
          <button
            onClick={() => setShowTemp(!showTemp)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono transition border ${
              showTemp ? 'bg-amber-950 text-amber-300 border-amber-700' : 'text-slate-400 border-transparent hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Temp (°C)</span>
          </button>
          <button
            onClick={() => setShowRain(!showRain)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono transition border ${
              showRain ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'text-slate-400 border-transparent hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Pluie (mm)</span>
          </button>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative mt-2 w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 sm:h-52 overflow-visible"
        >
          {/* Horizontal Grid lines for NDVI */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((val) => {
            const y = getYNdvi(val);
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Right Y-Axis (Temperature) */}
          <text
            x={width - padRight + 6}
            y={getYNdvi(1.0) + 3}
            fill="#f59e0b"
            fontSize="9"
            fontFamily="monospace"
          >
            {maxTemp.toFixed(0)}°C
          </text>
          <text
            x={width - padRight + 6}
            y={getYNdvi(0) + 3}
            fill="#f59e0b"
            fontSize="9"
            fontFamily="monospace"
          >
            {minTemp.toFixed(0)}°C
          </text>

          {/* Precipitation Bars at bottom */}
          {showRain &&
            series.map((p, idx) => {
              if (!p.precipitation || p.precipitation <= 0) return null;
              const barH = getHPrecip(p.precipitation);
              const x = getX(idx) - 4;
              const y = padTop + plotH - barH;
              return (
                <rect
                  key={`rain-${idx}`}
                  x={x}
                  y={y}
                  width={8}
                  height={barH}
                  fill="#06b6d4"
                  opacity={0.65}
                  rx={1}
                />
              );
            })}

          {/* Temperature Line & Area */}
          {showTemp && (
            <path
              d={tempPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 2"
              opacity={0.85}
            />
          )}

          {/* NDVI Curve & Fill */}
          {showNdvi && (
            <>
              <path
                d={`${ndviPath} L ${getX(series.length - 1)} ${padTop + plotH} L ${getX(0)} ${padTop + plotH} Z`}
                fill="url(#ndviGradient)"
                opacity={0.2}
              />
              <path
                d={ndviPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Data point circles & hover triggers */}
          {series.map((p, idx) => {
            const x = getX(idx);
            const y = getYNdvi(p.ndvi ?? 0.5);
            return (
              <g
                key={`pt-${idx}`}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                {/* Transparent hit area */}
                <rect x={x - 10} y={padTop} width={20} height={plotH} fill="transparent" />
                {showNdvi && (
                  <circle
                    cx={x}
                    cy={y}
                    r={hoveredPoint?.date === p.date ? 5 : 2.5}
                    fill="#10b981"
                    stroke="#047857"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* X Axis Dates */}
          {series.map((p, idx) => {
            if (idx % Math.ceil(series.length / 6) !== 0 && idx !== series.length - 1) return null;
            return (
              <text
                key={`lbl-${idx}`}
                x={getX(idx)}
                y={height - 8}
                fill="#94a3b8"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {p.date.substring(5)}
              </text>
            );
          })}

          {/* Gradients */}
          <defs>
            <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div className="absolute top-2 right-12 z-20 rounded-lg border border-slate-700 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 text-[11px] shadow-xl font-mono text-slate-200">
            <div className="font-bold text-cyan-300 border-b border-slate-800 pb-0.5">
              📅 {hoveredPoint.date}
            </div>
            <div className="mt-1 space-y-0.5">
              <div className="text-emerald-400">🌱 NDVI : {hoveredPoint.ndvi}</div>
              <div className="text-amber-400">🌡 Température : {hoveredPoint.temperature}°C</div>
              <div className="text-cyan-400">🌧 Précipitations : {hoveredPoint.precipitation} mm</div>
              {hoveredPoint.solarRadiation && (
                <div className="text-yellow-400">☀️ Rayonnement : {hoveredPoint.solarRadiation} W/m²</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-1 text-[10px] text-slate-400 text-center flex items-center justify-center gap-4">
        <span>Source végétation : Sentinel-2 MSI L2A (10m)</span>
        <span>Source météo : ECMWF ERA5-Land Reanalysis (9km)</span>
      </div>
    </div>
  );
};
