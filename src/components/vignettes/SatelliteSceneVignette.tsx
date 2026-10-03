import React, { useState, useEffect, useRef } from 'react';
import {
  SatelliteSpectralEngine,
  VignetteSpectralMode,
  ComparisonTheme,
} from '../../utils/satelliteSpectralEngine';
import { Eye, Sliders, Maximize2, Sparkles, Layers } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface SatelliteSceneVignetteProps {
  sceneId: string;
  title: string;
  date?: string;
  theme?: ComparisonTheme;
  year?: number;
  initialMode?: VignetteSpectralMode;
  initialOpacity?: number;
  width?: number;
  height?: number;
  onOpenBiDateComparison?: () => void;
  showControls?: boolean;
}

export const SatelliteSceneVignette: React.FC<SatelliteSceneVignetteProps> = ({
  sceneId,
  title,
  date,
  theme = 'urbanisation',
  year = 2026,
  initialMode = 'RGB',
  initialOpacity = 100,
  width = 320,
  height = 200,
  onOpenBiDateComparison,
  showControls = true,
}) => {
  const [spectralMode, setSpectralMode] = useState<VignetteSpectralMode>(initialMode);
  const [opacity, setOpacity] = useState<number>(initialOpacity);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Re-render vignette whenever mode, opacity, theme or year changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use sceneId hash to create deterministic seed
    const seed = sceneId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    SatelliteSpectralEngine.renderScene(
      ctx,
      canvas.width,
      canvas.height,
      spectralMode,
      theme,
      year,
      opacity,
      seed
    );
  }, [spectralMode, opacity, theme, year, sceneId]);

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-md">
      {/* Canvas Viewport */}
      <div className="relative bg-slate-900 overflow-hidden group">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-auto object-cover transition-opacity duration-150"
          style={{ maxHeight: `${height}px` }}
        />

        {/* Floating Mode & Opacity Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-950/85 backdrop-blur-sm text-cyan-300 border border-slate-700/80 shadow-sm">
            {spectralMode === 'FALSE_COLOR' ? 'False Color' : spectralMode}
          </span>
          {opacity < 100 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950/85 backdrop-blur-sm text-slate-300 border border-slate-700/80">
              {opacity}%
            </span>
          )}
        </div>

        {/* Top-Right Quick Bi-Date Compare Button */}
        {onOpenBiDateComparison && (
          <div className="absolute top-2 right-2 opacity-90 group-hover:opacity-100 transition">
            <Tooltip content="Ouvrir le Comparateur Bi-Date interactif (2020 | 2026)">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenBiDateComparison();
                }}
                className="px-2 py-1 rounded-md text-[10px] font-bold bg-cyan-600/90 hover:bg-cyan-500 text-white backdrop-blur-sm shadow flex items-center gap-1 transition active:scale-95"
              >
                <Maximize2 className="w-3 h-3" />
                <span>2020 | 2026</span>
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Controls & Spectral Mode Switcher */}
      {showControls && (
        <div className="p-2 space-y-2 bg-slate-950/90 border-t border-slate-800 text-xs">
          {/* Spectral 5-Button Segmented Strip */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSpectralMode('RGB');
              }}
              className={`flex-1 px-1.5 py-1 rounded text-[10px] font-mono font-bold transition text-center whitespace-nowrap ${
                spectralMode === 'RGB'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="RGB Naturel : Couleurs réelles (B04, B03, B02)"
            >
              RGB
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSpectralMode('FALSE_COLOR');
              }}
              className={`flex-1 px-1.5 py-1 rounded text-[10px] font-mono font-bold transition text-center whitespace-nowrap ${
                spectralMode === 'FALSE_COLOR'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Fausse Couleur Infrarouge (CIR NIR : Végétation en rouge éclatant)"
            >
              False Color
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSpectralMode('NDVI');
              }}
              className={`flex-1 px-1.5 py-1 rounded text-[10px] font-mono font-bold transition text-center whitespace-nowrap ${
                spectralMode === 'NDVI'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="NDVI : Vigueur chlorophyllienne (Indice de végétation)"
            >
              NDVI
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSpectralMode('SWIR');
              }}
              className={`flex-1 px-1.5 py-1 rounded text-[10px] font-mono font-bold transition text-center whitespace-nowrap ${
                spectralMode === 'SWIR'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="SWIR : Infrarouge ondes courtes (Sols, incendies, bâti, pénètre fumées)"
            >
              SWIR
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSpectralMode('NDWI');
              }}
              className={`flex-1 px-1.5 py-1 rounded text-[10px] font-mono font-bold transition text-center whitespace-nowrap ${
                spectralMode === 'NDWI'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="NDWI : Indice d'eau et humidité foliaire"
            >
              NDWI
            </button>
          </div>

          {/* Opacity Slider : 0 ━━━━━●━━ 100 % */}
          <div
            className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" />
              <span>Opacité :</span>
            </span>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] font-mono text-cyan-300 w-8 text-right font-bold">
                {opacity}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
