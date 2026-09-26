import React from 'react';
import { Droplet, Waves, ArrowUpRight } from 'lucide-react';

export const MarineView: React.FC = () => {
  const marineMetrics = [
    { label: 'Température de Surface de la Mer (SST)', val: '19.4°C', anom: '+1.1°C vs normale', sat: 'Sentinel-3 SLSTR' },
    { label: 'Anomalie du Niveau Marin (SLA)', val: '+4.2 cm', anom: 'Tendance décennale +3.4 mm/an', sat: 'Sentinel-6 Poseidon-4' },
    { label: 'Hauteur Significative des Vagues (SWH)', val: '1.45 m', anom: 'Mer peu agitée', sat: 'Sentinel-3 & 6 Altimétrie' },
    { label: 'Salinité Océanique', val: '38.2 PSU', anom: 'Conforme bassin méditerranéen', sat: 'Copernicus Marine CMEMS' },
    { label: 'Vitesse du Courant de Surface', val: '0.24 m/s', anom: 'Direction Ouest-Sud-Ouest (245°)', sat: 'NEMO Modèle Océanique' },
    { label: 'Concentration en Chlorophylle-a', val: '0.38 mg/m³', anom: 'Zone oligotrophe', sat: 'Sentinel-3 OLCI' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Copernicus Marine Service & Altimétrie (Sentinel-3 / Sentinel-6)
            </h3>
            <p className="text-xs text-slate-400">
              Physique océanique, bio-géochimie et altimétrie satellitaire Mercator Ocean
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5">
          <Droplet className="w-3.5 h-3.5 text-cyan-400" />
          <span>CMEMS Global 1/12°</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {marineMetrics.map((m) => (
          <div key={m.label} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-slate-400 font-medium">{m.label}</div>
            <div className="mt-1 font-mono text-lg font-bold text-cyan-300">{m.val}</div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-cyan-400" />
              <span>{m.anom}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
              Capteur : {m.sat}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
