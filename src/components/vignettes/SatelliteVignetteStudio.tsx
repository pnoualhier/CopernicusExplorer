import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SatelliteSpectralEngine,
  VignetteSpectralMode,
  ComparisonTheme,
  COMPARISON_THEMES,
} from '../../utils/satelliteSpectralEngine';
import {
  Sliders,
  Layers,
  Calendar,
  Sparkles,
  Download,
  Flame,
  Trees,
  Droplets,
  Building2,
  Snowflake,
  Wheat,
  Waves,
  Eye,
  Info,
  Maximize2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface SatelliteVignetteStudioProps {
  initialTheme?: ComparisonTheme;
  initialMode?: VignetteSpectralMode;
  onOpenAI?: (contextPrompt: string) => void;
}

export const SatelliteVignetteStudio: React.FC<SatelliteVignetteStudioProps> = ({
  initialTheme = 'urbanisation',
  initialMode = 'SWIR',
  onOpenAI,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ComparisonTheme>(initialTheme);
  const [spectralMode, setSpectralMode] = useState<VignetteSpectralMode>(initialMode);
  const [opacity, setOpacity] = useState<number>(100);
  const [splitPosition, setSplitPosition] = useState<number>(50); // 0 to 100%

  // Dates
  const [yearA, setYearA] = useState<number>(2020);
  const [yearB, setYearB] = useState<number>(2026);

  // Dragging state for canvas split slider
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active theme info
  const themeInfo = COMPARISON_THEMES.find((t) => t.id === selectedTheme) || COMPARISON_THEMES[0];

  // Set recommended mode when switching theme
  const handleSelectTheme = (t: ComparisonTheme) => {
    setSelectedTheme(t);
    const target = COMPARISON_THEMES.find((item) => item.id === t);
    if (target) {
      setSpectralMode(target.recommendedMode);
      setYearA(target.yearA);
      setYearB(target.yearB);
    }
  };

  // Re-render canvas
  const renderComparison = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    SatelliteSpectralEngine.renderSplitComparison(
      ctx,
      canvas.width,
      canvas.height,
      spectralMode,
      selectedTheme,
      splitPosition,
      opacity
    );
  }, [spectralMode, selectedTheme, splitPosition, opacity, yearA, yearB]);

  useEffect(() => {
    renderComparison();
  }, [renderComparison]);

  // Mouse & Touch interactions on canvas for split cursor
  const updateSplitFromClientX = (clientX: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(5, Math.min(95, Math.round((x / rect.width) * 100)));
    setSplitPosition(percent);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSplit(true);
    updateSplitFromClientX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSplit) return;
    updateSplitFromClientX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDraggingSplit(false);
  };

  // Touch support for mobile / tablets
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      updateSplitFromClientX(e.touches[0].clientX);
    }
  };

  // Download high-resolution split capture
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `Copernicus_Comparateur_${selectedTheme}_${yearA}_vs_${yearB}_${spectralMode}.png`;
    a.href = url;
    a.click();
  };

  // Themes list with specific Lucide icons
  const themesList: { id: ComparisonTheme; label: string; icon: any }[] = [
    { id: 'urbanisation', label: 'Urbanisation', icon: Building2 },
    { id: 'agriculture', label: 'Agriculture', icon: Wheat },
    { id: 'incendies', label: 'Incendies', icon: Flame },
    { id: 'deforestation', label: 'Déforestation', icon: Trees },
    { id: 'eau', label: 'Plans d\'eau', icon: Droplets },
    { id: 'littoral', label: 'Littoral', icon: Waves },
    { id: 'glaciers', label: 'Neige/Glaciers', icon: Snowflake },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-y-auto p-3 sm:p-4 space-y-4">
      {/* Top Header: Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Vignettes Satellites & Comparateur Bi-Date ({yearA} | {yearB})
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Observation directe des mutations territoriales par imagerie multispectrale Sentinel-2.
            Faites glisser le curseur vertical <strong className="text-cyan-300">2020 | 2026</strong> pour inspecter la scène sous différents spectres.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenAI && (
            <button
              onClick={() => {
                const prompt = `Analyse environnementale comparative entre ${yearA} et ${yearB} pour le thème : ${themeInfo.title}. Mode spectral utilisé : ${spectralMode}. Impact constaté : ${themeInfo.impactMetrics.value} (${themeInfo.impactMetrics.delta}). Décris les mécanismes écologiques et recommandations Copernicus associées.`;
                onOpenAI(prompt);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Analyse IA de la Scène</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
            title="Exporter l'image de comparaison (PNG)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exporter PNG</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Control Sidebar & Comparison Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Theme Presets & Configuration (4 cols) */}
        <div className="lg:col-span-4 space-y-3.5 flex flex-col">
          {/* 1. Theme Presets Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              1. Thèmes d'Observation du Changement
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
              {themesList.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left ${
                      isSelected
                        ? 'bg-cyan-600/90 text-white border border-cyan-400/80 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/60 text-slate-300 border border-slate-800/80 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-cyan-400'}`} />
                      <span className="truncate">{t.label}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-700">
                        Actif
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Spectral Modes Selector (RGB, False Color, NDVI, SWIR, NDWI) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                2. Rendus Spectraux
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Bandes Sentinel-2</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5">
              <button
                onClick={() => setSpectralMode('RGB')}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  spectralMode === 'RGB'
                    ? 'bg-cyan-600 text-white border border-cyan-400'
                    : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>🌍</span>
                <div className="text-left">
                  <div className="truncate font-bold">RGB</div>
                  <div className="text-[9px] text-slate-300 font-normal">Couleur Vraie</div>
                </div>
              </button>

              <button
                onClick={() => setSpectralMode('FALSE_COLOR')}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  spectralMode === 'FALSE_COLOR'
                    ? 'bg-rose-600 text-white border border-rose-400'
                    : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>🍁</span>
                <div className="text-left">
                  <div className="truncate font-bold">False Color</div>
                  <div className="text-[9px] text-slate-300 font-normal">Infrarouge NIR</div>
                </div>
              </button>

              <button
                onClick={() => setSpectralMode('NDVI')}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  spectralMode === 'NDVI'
                    ? 'bg-emerald-600 text-white border border-emerald-400'
                    : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>🌿</span>
                <div className="text-left">
                  <div className="truncate font-bold">NDVI</div>
                  <div className="text-[9px] text-slate-300 font-normal">Végétation</div>
                </div>
              </button>

              <button
                onClick={() => setSpectralMode('SWIR')}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  spectralMode === 'SWIR'
                    ? 'bg-amber-600 text-white border border-amber-400'
                    : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>🔥</span>
                <div className="text-left">
                  <div className="truncate font-bold">SWIR</div>
                  <div className="text-[9px] text-slate-300 font-normal">Ondes Courtes</div>
                </div>
              </button>

              <button
                onClick={() => setSpectralMode('NDWI')}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 col-span-2 sm:col-span-1 lg:col-span-2 ${
                  spectralMode === 'NDWI'
                    ? 'bg-blue-600 text-white border border-blue-400'
                    : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>💧</span>
                <div className="text-left">
                  <div className="truncate font-bold">NDWI</div>
                  <div className="text-[9px] text-slate-300 font-normal">Eau & Humidité</div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Opacity Slider Section: Opacité : 0 ━━━━━●━━ 100 % */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Opacité : 0 ━━━━━●━━ 100 %</span>
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {opacity} %
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-400">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800"
              />
              <span className="text-[10px] font-mono text-slate-400">100%</span>
            </div>
          </div>

          {/* 4. Active Theme Change Impact Assessment */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-2 flex-1">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                Bilan Territorial Détecté
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {themeInfo.category}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-200">
              {themeInfo.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              {themeInfo.description}
            </p>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-[10px] text-slate-400 font-mono">{themeInfo.impactMetrics.label}</div>
                <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                  {themeInfo.impactMetrics.value}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {themeInfo.impactMetrics.delta}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Split Comparison Interactive Canvas & Date Ribbon (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3.5">
          {/* Interactive Date Bar & Curtain Position */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left Date indicator */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="font-mono text-slate-400">Date Référence (Gauche) :</span>
              <select
                value={yearA}
                onChange={(e) => setYearA(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-cyan-300 outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value={2018}>2018</option>
                <option value={2019}>2019</option>
                <option value={2020}>2020 (Référence)</option>
                <option value={2021}>2021</option>
                <option value={2022}>2022</option>
              </select>
            </div>

            {/* Split Cursor Position Slider */}
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400 hidden sm:inline">Position du Curseur :</span>
              <span className="text-cyan-400 font-bold">{splitPosition}%</span>
            </div>

            {/* Right Date indicator */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="font-mono text-slate-400">Date Récente (Droite) :</span>
              <select
                value={yearB}
                onChange={(e) => setYearB(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-blue-300 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026 (Actuel)</option>
              </select>
            </div>
          </div>

          {/* Interactive Split Canvas Viewport */}
          <div
            ref={containerRef}
            className="relative flex-1 bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl min-h-[380px] sm:min-h-[460px] cursor-ew-resize group flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
          >
            <canvas
              ref={canvasRef}
              width={720}
              height={460}
              className="w-full h-full object-cover filter contrast-105"
            />

            {/* Floating Label: Left Side Date */}
            <div
              className="absolute top-4 left-4 pointer-events-none transition-opacity"
              style={{ opacity: splitPosition > 15 ? 1 : 0 }}
            >
              <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/50 rounded-xl px-3 py-1.5 shadow-2xl">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  Scène Avant
                </div>
                <div className="text-sm font-bold font-mono text-white">
                  {yearA} • Sentinel-2
                </div>
              </div>
            </div>

            {/* Floating Label: Right Side Date */}
            <div
              className="absolute top-4 right-4 pointer-events-none transition-opacity"
              style={{ opacity: splitPosition < 85 ? 1 : 0 }}
            >
              <div className="bg-slate-950/85 backdrop-blur-md border border-blue-500/50 rounded-xl px-3 py-1.5 shadow-2xl text-right">
                <div className="text-[10px] font-mono text-blue-400 uppercase font-bold">
                  Scène Après
                </div>
                <div className="text-sm font-bold font-mono text-white">
                  {yearB} • Sentinel-2
                </div>
              </div>
            </div>

            {/* Floating Center Badge on the Split Line */}
            <div
              className="absolute bottom-4 -translate-x-1/2 pointer-events-none bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-full px-3 py-1 text-[11px] font-mono text-slate-200 shadow-2xl flex items-center gap-1.5"
              style={{ left: `${splitPosition}%` }}
            >
              <span className="text-cyan-400 font-bold">{yearA}</span>
              <span className="text-slate-500">|</span>
              <span className="text-blue-400 font-bold">{yearB}</span>
            </div>

            {/* Instruction tooltip in corner */}
            <div className="absolute bottom-4 left-4 pointer-events-none hidden sm:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-400">
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>Cliquez et glissez horizontalement pour déplacer le rideau</span>
            </div>
          </div>

          {/* Quick Slider at the bottom of Canvas */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-cyan-400">{yearA}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={splitPosition}
              onChange={(e) => setSplitPosition(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800"
            />
            <span className="text-xs font-mono font-bold text-blue-400">{yearB}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
