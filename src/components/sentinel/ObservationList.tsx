import React, { useState } from 'react';
import { GeoObservation, MissionType } from '../../types/copernicus';
import { Satellite, Calendar, Cloud, Info, Sparkles, Radio, Droplet, Wind, Eye, Sliders, Maximize2 } from 'lucide-react';
import { SatelliteSceneVignette } from '../vignettes/SatelliteSceneVignette';

interface ObservationListProps {
  observations: GeoObservation[];
  selectedObservation: GeoObservation | null;
  onSelectObservation: (obs: GeoObservation) => void;
  onOpenProvenance: (obs: GeoObservation) => void;
  onAskAI: (obs: GeoObservation) => void;
  selectedMission: MissionType;
  onMissionChange: (m: MissionType) => void;
  cloudCoverMax: number;
  onCloudCoverChange: (c: number) => void;
  onOpenBiDateComparison?: () => void;
  isLoading?: boolean;
}

export const ObservationList: React.FC<ObservationListProps> = ({
  observations,
  selectedObservation,
  onSelectObservation,
  onOpenProvenance,
  onAskAI,
  selectedMission,
  onMissionChange,
  cloudCoverMax,
  onCloudCoverChange,
  onOpenBiDateComparison,
  isLoading = false,
}) => {
  const [expandedVignetteId, setExpandedVignetteId] = useState<string | null>(null);
  const missions: { id: MissionType; label: string; icon: any }[] = [
    { id: 'SENTINEL-2', label: 'Sentinel-2 (Optique)', icon: Satellite },
    { id: 'SENTINEL-1', label: 'Sentinel-1 (Radar SAR)', icon: Radio },
    { id: 'SENTINEL-3', label: 'Sentinel-3 (Terre/Mer)', icon: Droplet },
    { id: 'SENTINEL-5P', label: 'Sentinel-5P (Atmosphère)', icon: Wind },
    { id: 'SENTINEL-6', label: 'Sentinel-6 (Altimétrie)', icon: Satellite },
    { id: 'ERA5-CLIMATE', label: 'ERA5 (Climat/Météo)', icon: Calendar },
    { id: 'CAMS-ATMOSPHERE', label: 'CAMS (Qualité de l\'air)', icon: Wind },
    { id: 'COPERNICUS-MARINE', label: 'Marine (Océans)', icon: Droplet },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Top Filter Bar */}
      <div className="p-3 bg-slate-950/70 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Missions & Capteurs Copernicus
          </h3>
          <span className="text-[11px] font-mono text-cyan-400">
            {observations.length} résultat{observations.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Mission Tabs Horizontal Scroller */}
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {missions.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMission === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onMissionChange(m.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Cloud filter if optical */}
        {selectedMission === 'SENTINEL-2' && (
          <div className="flex items-center justify-between gap-3 pt-1 text-xs text-slate-300">
            <span className="flex items-center gap-1 text-slate-400">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              Couverture nuageuse max :
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={cloudCoverMax}
                onChange={(e) => onCloudCoverChange(Number(e.target.value))}
                className="w-24 accent-cyan-500 cursor-pointer"
              />
              <span className="font-mono text-cyan-300 w-8 text-right">{cloudCoverMax}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Observations List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {isLoading ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span>Interrogation du catalogue Copernicus...</span>
          </div>
        ) : observations.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs gap-1 text-center p-4">
            <Satellite className="w-8 h-8 text-slate-600 mb-1" />
            <p>Aucune observation trouvée pour cette période et zone.</p>
            <p className="text-slate-400">Élargissez la période temporelle ou le seuil de nuages.</p>
          </div>
        ) : (
          observations.map((obs) => {
            const isSelected = selectedObservation?.id === obs.id;

            return (
              <div
                key={obs.id}
                onClick={() => onSelectObservation(obs)}
                className={`relative rounded-xl p-3 border transition cursor-pointer group ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                        {obs.platform}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {obs.acquisitionDate.split('T')[0]}
                      </span>
                    </div>

                    <h4 className="mt-1 text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition">
                      {obs.title}
                    </h4>
                  </div>

                  {/* Cloud or Mode Badge */}
                  {obs.cloudCover !== undefined ? (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        obs.cloudCover < 15
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : obs.cloudCover < 40
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                      }`}
                    >
                      ☁ {obs.cloudCover}%
                    </span>
                  ) : obs.sarDetails ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60">
                      {obs.sarDetails.polarization}
                    </span>
                  ) : null}
                </div>

                {/* Specific Attribute Pills */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {obs.provenance.processingLevel}
                  </span>
                  <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {obs.provenance.spatialResolution}
                  </span>
                  {obs.opticalDetails?.indices?.ndviMean && (
                    <span className="bg-emerald-950/70 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/50">
                      NDVI: {obs.opticalDetails.indices.ndviMean}
                    </span>
                  )}
                  {obs.sarDetails && (
                    <span className="bg-blue-950/70 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/50">
                      σ₀: {obs.sarDetails.backscatterSigma0_dB} dB
                    </span>
                  )}
                  {obs.atmosphereDetails && (
                    <span className="bg-purple-950/70 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/50">
                      AQI: {obs.atmosphereDetails.aqi}/5
                    </span>
                  )}
                  {obs.marineAltimetryDetails?.seaSurfaceTemperature && (
                    <span className="bg-cyan-950/70 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/50">
                      SST: {obs.marineAltimetryDetails.seaSurfaceTemperature}°C
                    </span>
                  )}
                </div>

                {/* Inline Satellite Vignette with RGB, False Color, NDVI, SWIR, NDWI & Opacity slider */}
                {(isSelected || expandedVignetteId === obs.id) && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Vignette Multispectrale de la Scène</span>
                      </span>
                      {onOpenBiDateComparison && (
                        <button
                          onClick={onOpenBiDateComparison}
                          className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Comparer 2020 | 2026</span>
                        </button>
                      )}
                    </div>
                    <SatelliteSceneVignette
                      sceneId={obs.id}
                      title={obs.title}
                      date={obs.acquisitionDate}
                      year={Number(obs.acquisitionDate.split('-')[0]) || 2026}
                      initialMode={obs.mission === 'SENTINEL-1' ? 'SWIR' : 'RGB'}
                      width={380}
                      height={190}
                      onOpenBiDateComparison={onOpenBiDateComparison}
                      showControls={true}
                    />
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedVignetteId(expandedVignetteId === obs.id ? null : obs.id);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition border ${
                        expandedVignetteId === obs.id
                          ? 'bg-cyan-600 text-white border-cyan-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{expandedVignetteId === obs.id ? 'Masquer Vignette' : 'Voir Vignette'}</span>
                    </button>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px] hidden sm:inline">
                      {obs.provenance.service}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onOpenBiDateComparison && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenBiDateComparison();
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                        title="Comparer cette zone entre 2020 et 2026"
                      >
                        2020 | 2026
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProvenance(obs);
                      }}
                      className="p-1 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800 transition"
                      title="Inspecter la provenance et métadonnées complètes"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskAI(obs);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white shadow-sm transition"
                      title="Analyse environnementale croisée par IA Gemini"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-200" />
                      <span>Analyse IA</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
