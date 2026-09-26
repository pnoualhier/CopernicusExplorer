import React from 'react';
import { GeoObservation, ProvenanceInfo } from '../../types/copernicus';
import { Info, X, ExternalLink, ShieldCheck, Database, Calendar, Compass } from 'lucide-react';

interface ProvenanceModalProps {
  observation: GeoObservation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProvenanceModal: React.FC<ProvenanceModalProps> = ({
  observation,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !observation) return null;

  const prov: ProvenanceInfo = observation.provenance;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                ℹ️ À propos de cette donnée & Traçabilité Copernicus
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                ID : {observation.id}
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

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
              <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Fournisseur de Service
              </div>
              <div className="mt-1 font-semibold text-slate-100">{prov.provider}</div>
              <div className="text-[11px] text-cyan-400 mt-0.5">{prov.service}</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
              <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Date & Heure d'Acquisition
              </div>
              <div className="mt-1 font-mono font-semibold text-slate-100">
                {observation.acquisitionDate.replace('T', ' ').substring(0, 19)} UTC
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Revisit: {prov.temporalResolution}</div>
            </div>
          </div>

          {/* Technical Specifications Table */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 font-semibold text-slate-300">
              Spécifications Techniques du Produit
            </div>
            <div className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-400">Mission & Plateforme</span>
                <span className="text-slate-200">{observation.mission} ({observation.platform})</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-400">Capteur / Instrument</span>
                <span className="text-slate-200">{observation.instrument}</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-400">Collection STAC / OData</span>
                <span className="text-cyan-300">{prov.collection}</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-400">Niveau de Traitement</span>
                <span className="text-slate-200">{prov.processingLevel}</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-400">Résolution Spatiale</span>
                <span className="text-emerald-400 font-bold">{prov.spatialResolution}</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-400">Licence de Données</span>
                <span className="text-slate-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {prov.license}
                </span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-400">Citation Officielle</span>
                <span className="text-slate-300 text-right max-w-xs">{prov.citation}</span>
              </div>
            </div>
          </div>

          {/* Direct Link to Copernicus Data Space */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/50">
            <span className="text-slate-300">Consulter sur Copernicus Data Space :</span>
            <a
              href={prov.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition"
            >
              <span>Ouvrir CDSE Browser</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
