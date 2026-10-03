import React, { useState, useEffect, useRef } from 'react';
import { SpectralIndex, GeoObservation } from '../../types/copernicus';
import { Layers, HelpCircle, Download, Sliders, Maximize2 } from 'lucide-react';

interface SpectralVisualizerProps {
  observation: GeoObservation;
  onOpenProvenance: () => void;
  onOpenBiDateComparison?: () => void;
}

export const SpectralVisualizer: React.FC<SpectralVisualizerProps> = ({
  observation,
  onOpenProvenance,
  onOpenBiDateComparison,
}) => {
  const [indexMode, setIndexMode] = useState<SpectralIndex>('NDVI');
  const [opacity, setOpacity] = useState<number>(100);
  const [customFormula, setCustomFormula] = useState('(B08 - B04) / (B08 + B04)');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ndviMean = observation.opticalDetails?.indices?.ndviMean ?? 0.68;
  const ndwiMean = observation.opticalDetails?.indices?.ndwiMean ?? -0.32;
  const ndbiMean = observation.opticalDetails?.indices?.ndbiMean ?? -0.15;

  // Render spectral synthesis simulation onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Seed generation with observation acquisition timestamp
    const seed = observation.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const opacityFactor = opacity / 100;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Multi-frequency Perlin-like pseudo landscape
        const nx = x / width;
        const ny = y / height;
        const fieldNoise = Math.sin(nx * 12 + seed * 0.01) * Math.cos(ny * 10 + seed * 0.02);
        const fineNoise = Math.sin(nx * 30 + ny * 25) * 0.15;
        const val = Math.max(0, Math.min(1, 0.5 + fieldNoise * 0.35 + fineNoise));

        if (indexMode === 'TRUE_COLOR') {
          // Natural Earth Colors (RGB: B04, B03, B02)
          data[idx] = Math.floor(val * 85 + 30);      // R
          data[idx + 1] = Math.floor(val * 130 + 50); // G
          data[idx + 2] = Math.floor(val * 60 + 20);  // B
        } else if (indexMode === 'FALSE_COLOR') {
          // False Color Infrared (NIR -> Red, Red -> Green, Green -> Blue)
          // Healthy vegetation appears brilliant red/magenta
          data[idx] = Math.floor(val * 220 + 25);     // NIR -> Red channel
          data[idx + 1] = Math.floor(val * 50 + 20);  // Red -> Green channel
          data[idx + 2] = Math.floor(val * 90 + 30);  // Green -> Blue channel
        } else if (indexMode === 'SWIR') {
          // SWIR composite (B12, B8A, B04)
          // Healthy vegetation green, bare soil/minerals orange/brown, water black
          data[idx] = Math.floor(val * 210 + 20);     // SWIR -> Red
          data[idx + 1] = Math.floor(val * 170 + 40); // NIR -> Green
          data[idx + 2] = Math.floor(val * 40 + 15);  // Red -> Blue
        } else if (indexMode === 'NDVI') {
          // NDVI ramp: Brown (-0.2) -> Yellow (0.2) -> Bright Green (0.8+)
          const ndviPix = (val - 0.5) * 0.8 + ndviMean;
          if (ndviPix < 0.1) {
            // Soil / sand / bare
            data[idx] = 180; data[idx + 1] = 150; data[idx + 2] = 110;
          } else if (ndviPix < 0.35) {
            // Sparse vegetation / yellow-green
            data[idx] = 220; data[idx + 1] = 210; data[idx + 2] = 50;
          } else if (ndviPix < 0.6) {
            // Moderate canopy / light green
            data[idx] = 100; data[idx + 1] = 190; data[idx + 2] = 60;
          } else {
            // Dense healthy forest / deep emerald
            data[idx] = 20; data[idx + 1] = 135; data[idx + 2] = 40;
          }
        } else if (indexMode === 'NDWI') {
          // NDWI: Water bodies blue/cyan, land negative brown/grey
          const ndwiPix = (val - 0.5) * 0.6 + ndwiMean;
          if (ndwiPix > 0.1) {
            // Water
            data[idx] = 30; data[idx + 1] = 144; data[idx + 2] = 255;
          } else {
            // Land
            data[idx] = 120; data[idx + 1] = 110; data[idx + 2] = 100;
          }
        } else if (indexMode === 'NDBI') {
          // NDBI: Urban/Built-up orange/red, vegetation negative
          const ndbiPix = (val - 0.5) * 0.6 + ndbiMean;
          if (ndbiPix > 0.05) {
            data[idx] = 230; data[idx + 1] = 80; data[idx + 2] = 30;
          } else {
            data[idx] = 70; data[idx + 1] = 110; data[idx + 2] = 70;
          }
        } else {
          // Custom index
          data[idx] = Math.floor(val * 200);
          data[idx + 1] = Math.floor(150 + val * 105);
          data[idx + 2] = Math.floor(220 - val * 100);
        }

        data[idx + 3] = Math.floor(255 * opacityFactor);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [indexMode, opacity, observation, ndviMean, ndwiMean, ndbiMean]);

  const downloadCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `${observation.id}_${indexMode}.png`;
    a.href = url;
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Rendu Multispectral & Indices : {observation.platform}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {onOpenBiDateComparison && (
            <button
              onClick={onOpenBiDateComparison}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition active:scale-95"
              title="Comparer deux dates avec curseur vertical (2020 | 2026)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Comparer Bi-Date (2020 | 2026)</span>
            </button>
          )}
          <button
            onClick={onOpenProvenance}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition"
            title="Inspecter la provenance et métadonnées"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Provenance</span>
          </button>
          <button
            onClick={downloadCanvasImage}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            title="Télécharger l'image de synthèse (PNG)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Index Selector Tabs & Opacity Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950/50 border-b border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setIndexMode('TRUE_COLOR')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              indexMode === 'TRUE_COLOR' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            RGB (Vraie Couleur)
          </button>
          <button
            onClick={() => setIndexMode('FALSE_COLOR')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              indexMode === 'FALSE_COLOR' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            False Color (NIR)
          </button>
          <button
            onClick={() => setIndexMode('NDVI')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              indexMode === 'NDVI' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            NDVI (Végétation)
          </button>
          <button
            onClick={() => setIndexMode('SWIR')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              indexMode === 'SWIR' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            SWIR (Infrarouge Court)
          </button>
          <button
            onClick={() => setIndexMode('NDWI')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              indexMode === 'NDWI' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            NDWI (Eau / Humidité)
          </button>
          <button
            onClick={() => setIndexMode('NDBI')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              indexMode === 'NDBI' ? 'bg-amber-700 text-white shadow' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            NDBI (Bâti)
          </button>
          <button
            onClick={() => setIndexMode('CUSTOM')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              indexMode === 'CUSTOM' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Formule
          </button>
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span>Opacité :</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-20 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-cyan-300 font-bold w-8 text-right">{opacity}%</span>
        </div>
      </div>

      {/* Custom Formula input when in custom mode */}
      {indexMode === 'CUSTOM' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/80 border-b border-slate-800 text-xs">
          <span className="text-slate-400 font-mono">Indice =</span>
          <input
            type="text"
            value={customFormula}
            onChange={(e) => setCustomFormula(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs outline-none focus:border-purple-500"
            placeholder="(B08 - B04) / (B08 + B04)"
          />
        </div>
      )}

      {/* Main Canvas Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center min-h-[260px] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="w-full h-full max-h-[340px] object-cover filter contrast-105"
        />

        {/* Legend / Colorbar overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md rounded-lg p-2 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">
              {indexMode === 'NDVI' ? 'NDVI' : indexMode === 'NDWI' ? 'NDWI' : indexMode === 'NDBI' ? 'NDBI' : indexMode}
            </span>
            <div className="h-3 w-28 rounded overflow-hidden flex">
              {indexMode === 'NDVI' ? (
                <>
                  <div className="flex-1 bg-[#b4966e]" title="-0.2 Sol nu" />
                  <div className="flex-1 bg-[#dcd232]" title="0.2 Faible" />
                  <div className="flex-1 bg-[#64be3c]" title="0.5 Moyen" />
                  <div className="flex-1 bg-[#148728]" title="0.8+ Dense" />
                </>
              ) : indexMode === 'NDWI' ? (
                <>
                  <div className="flex-1 bg-[#786e64]" title="Terre sèche" />
                  <div className="flex-1 bg-[#4682b4]" title="Humide" />
                  <div className="flex-1 bg-[#1e90ff]" title="Eau libre" />
                </>
              ) : (
                <div className="w-full bg-gradient-to-r from-blue-900 via-green-500 to-red-500" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            {indexMode === 'NDVI' && (
              <>
                <span className="text-emerald-400 font-bold">Moy : {ndviMean}</span>
                <span className="text-slate-400 hidden sm:inline">
                  Couvert : {Math.round(ndviMean * 95)}%
                </span>
              </>
            )}
            {indexMode === 'NDWI' && (
              <span className="text-blue-400 font-bold">Moy : {ndwiMean}</span>
            )}
            {indexMode === 'NDBI' && (
              <span className="text-amber-400 font-bold">Moy : {ndbiMean}</span>
            )}
            <span className="text-slate-400">Rés : 10m</span>
          </div>
        </div>
      </div>

      {/* Footer Info details */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 font-mono">
          <span>Date : {observation.acquisitionDate.split('T')[0]}</span>
          <span>Nuages : {observation.cloudCover ?? 0}%</span>
          <span>Niveau : {observation.provenance.processingLevel}</span>
        </div>
        <div className="text-slate-400 italic">
          {indexMode === 'NDVI' && 'Formule : (B08[NIR] - B04[RED]) / (B08 + B04)'}
          {indexMode === 'NDWI' && 'Formule : (B03[GREEN] - B08[NIR]) / (B03 + B08)'}
          {indexMode === 'NDBI' && 'Formule : (B11[SWIR] - B08[NIR]) / (B11 + B08)'}
          {indexMode === 'TRUE_COLOR' && 'Bandes RGB : B04 (665nm), B03 (560nm), B02 (490nm)'}
          {indexMode === 'FALSE_COLOR' && 'Infrarouge végétation : B08 (842nm), B04, B03'}
        </div>
      </div>
    </div>
  );
};
