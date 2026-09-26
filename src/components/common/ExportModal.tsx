import React, { useState } from 'react';
import {
  BoundingBox,
  GeoPoint,
  GeoObservation,
  TimeSeriesPoint,
} from '../../types/copernicus';
import { Download, FileText, FileSpreadsheet, Map, X, Check, Printer } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  coordinates: GeoPoint;
  bbox: BoundingBox;
  startDate: string;
  endDate: string;
  observations: GeoObservation[];
  timeSeries: TimeSeriesPoint[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  locationName,
  coordinates,
  bbox,
  startDate,
  endDate,
  observations,
  timeSeries,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // Export GeoJSON
  const handleExportGeoJson = () => {
    const geoJson = {
      type: 'FeatureCollection',
      metadata: {
        title: `Copernicus Explorer Export - ${locationName}`,
        generatedAt: new Date().toISOString(),
        timeRange: { startDate, endDate },
        centerCoordinates: coordinates,
      },
      features: [
        {
          type: 'Feature',
          properties: {
            name: locationName,
            type: 'SearchBoundingBox',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [bbox.west, bbox.south],
                [bbox.east, bbox.south],
                [bbox.east, bbox.north],
                [bbox.west, bbox.north],
                [bbox.west, bbox.south],
              ],
            ],
          },
        },
        ...observations.map((obs) => ({
          type: 'Feature',
          properties: {
            id: obs.id,
            title: obs.title,
            mission: obs.mission,
            platform: obs.platform,
            acquisitionDate: obs.acquisitionDate,
            cloudCover: obs.cloudCover,
            ndviMean: obs.opticalDetails?.indices?.ndviMean,
            provider: obs.provenance.provider,
            service: obs.provenance.service,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [obs.bbox.west, obs.bbox.south],
                [obs.bbox.east, obs.bbox.south],
                [obs.bbox.east, obs.bbox.north],
                [obs.bbox.west, obs.bbox.north],
                [obs.bbox.west, obs.bbox.south],
              ],
            ],
          },
        })),
      ],
    };

    triggerDownload(
      JSON.stringify(geoJson, null, 2),
      `copernicus_${locationName.replace(/\s+/g, '_')}_${startDate}_${endDate}.geojson`,
      'application/geo+json'
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'NDVI', 'NDWI', 'Temperature_C', 'Precipitation_mm', 'SolarRadiation_Wm2', 'WindSpeed_kmh', 'CloudCover_pct'];
    const rows = timeSeries.map((p) => [
      p.date,
      p.ndvi ?? '',
      p.ndwi ?? '',
      p.temperature ?? '',
      p.precipitation ?? '',
      p.solarRadiation ?? '',
      p.windSpeed ?? '',
      p.cloudCover ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    triggerDownload(
      csvContent,
      `copernicus_timeseries_${locationName.replace(/\s+/g, '_')}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  // Export JSON Report
  const handleExportJSON = () => {
    const report = {
      title: 'Copernicus Explorer Scientific Data Export',
      location: { name: locationName, coordinates, bbox },
      period: { startDate, endDate },
      observationsCount: observations.length,
      observations,
      timeSeries,
      attribution: 'European Commission / ESA Copernicus Programme',
      exportedAt: new Date().toISOString(),
    };
    triggerDownload(
      JSON.stringify(report, null, 2),
      `copernicus_report_${locationName.replace(/\s+/g, '_')}.json`,
      'application/json'
    );
  };

  // Print Scientific Summary Report
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Exporter les Données & Rapports</h3>
              <p className="text-xs text-slate-400">
                Zone : {locationName} • {startDate} → {endDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          {downloadSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300">
              <Check className="w-4 h-4" />
              <span>Fichier <strong>{downloadSuccess}</strong> téléchargé avec succès !</span>
            </div>
          )}

          {/* GeoJSON */}
          <button
            onClick={handleExportGeoJson}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/60 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <Map className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-semibold text-slate-200">Format GIS GeoJSON (.geojson)</div>
                <div className="text-[11px] text-slate-400">
                  Emprises géométriques, métadonnées STAC et coordonnées WGS84
                </div>
              </div>
            </div>
            <span className="text-xs text-cyan-400 font-medium">Télécharger</span>
          </button>

          {/* CSV */}
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/60 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-semibold text-slate-200">Table de Séries Temporelles CSV (.csv)</div>
                <div className="text-[11px] text-slate-400">
                  NDVI, Température, Précipitations, Rayonnement, Nuages ({timeSeries.length} points)
                </div>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-medium">Télécharger</span>
          </button>

          {/* JSON */}
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/60 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-semibold text-slate-200">Dossier Scientifique Complet (.json)</div>
                <div className="text-[11px] text-slate-400">
                  Observations complètes, provenance, attributions et traçabilité
                </div>
              </div>
            </div>
            <span className="text-xs text-amber-400 font-medium">Télécharger</span>
          </button>

          {/* Printable Report */}
          <button
            onClick={handlePrintReport}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/60 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <Printer className="w-5 h-5 text-purple-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-semibold text-slate-200">Imprimer / Exporter en PDF</div>
                <div className="text-[11px] text-slate-400">
                  Mise en page prête à l'impression avec carte, graphiques et métriques
                </div>
              </div>
            </div>
            <span className="text-xs text-purple-400 font-medium">Imprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
