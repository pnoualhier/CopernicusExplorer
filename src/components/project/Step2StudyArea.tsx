import React from 'react';
import { AnalysisProject } from '../../types/project';
import { CopernicusMap } from '../map/CopernicusMap';
import {
  MapPin,
  Maximize2,
  Mountain,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Info,
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface Step2StudyAreaProps {
  project: AnalysisProject;
  onUpdateProject: (updated: AnalysisProject) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const Step2StudyArea: React.FC<Step2StudyAreaProps> = ({
  project,
  onUpdateProject,
  onNextStep,
  onPrevStep,
}) => {
  const { zone } = project;

  const handleBboxChange = (newBbox: any) => {
    // calculate estimated area in km2 based on bbox delta
    const latSpan = Math.abs(newBbox.north - newBbox.south);
    const lngSpan = Math.abs(newBbox.east - newBbox.west);
    const meanLatRad = ((newBbox.north + newBbox.south) / 2) * (Math.PI / 180);
    const kmLat = latSpan * 111.139;
    const kmLng = lngSpan * 111.139 * Math.cos(meanLatRad);
    const approxArea = Math.round(kmLat * kmLng);

    onUpdateProject({
      ...project,
      zone: {
        ...project.zone,
        bbox: newBbox,
        center: {
          lat: Number(((newBbox.north + newBbox.south) / 2).toFixed(4)),
          lng: Number(((newBbox.east + newBbox.west) / 2).toFixed(4)),
        },
        areaKm2: approxArea > 0 ? approxArea : project.zone.areaKm2,
      },
    });
  };

  const handlePointChange = (p: any, name?: string) => {
    onUpdateProject({
      ...project,
      zone: {
        ...project.zone,
        center: p,
        name: name || project.zone.name,
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Étape 2 : Périmètre & Zone d'Étude Géographique</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
              {zone.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {zone.region} • {zone.description}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <Maximize2 className="w-4 h-4 text-cyan-500" />
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-400">Superficie d'étude</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                ~{zone.areaKm2} km²
              </div>
            </div>
          </div>
        </div>

        {/* Geographic attributes grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Coordonnées Centre</div>
            <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {zone.center.lat.toFixed(3)}°N, {zone.center.lng.toFixed(3)}°E
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Emprise Bounding Box</div>
            <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={`[${zone.bbox.west}, ${zone.bbox.south}, ${zone.bbox.east}, ${zone.bbox.north}]`}>
              [{zone.bbox.west}, {zone.bbox.south}, {zone.bbox.east}, {zone.bbox.north}]
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Altitude Moyenne</div>
            <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              ~{zone.elevationAvgMeters} m (DEM Cop)
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Système Géodésique</div>
            <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              WGS 84 / EPSG:4326
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Stage */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Globe2 className="w-4 h-4 text-cyan-500" />
            <span className="font-semibold">Cartographie Haute Précision CARTO • Délimitation du Périmètre</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Cliquez et glissez pour repositionner ou redessiner l'emprise
          </span>
        </div>

        <div className="h-[440px] w-full relative">
          <CopernicusMap
            bbox={zone.bbox}
            point={zone.center}
            onBboxChange={handleBboxChange}
            onPointChange={handlePointChange}
          />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <button
          onClick={onPrevStep}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Précédent : Projet</span>
        </button>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Étape 2 sur 6 validée • Périmètre de ~{zone.areaKm2} km² prêt
        </span>

        <button
          onClick={onNextStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition active:scale-95"
        >
          <span>Passer aux Données & Séries</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
