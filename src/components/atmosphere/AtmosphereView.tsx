import React from 'react';
import { Wind, AlertCircle, ShieldCheck, Activity } from 'lucide-react';

export const AtmosphereView: React.FC = () => {
  const pollutants = [
    { name: 'Dioxyde d\'azote (NO₂)', value: '24.2 µg/m³', status: 'BON', limit: '40 µg/m³ (OMS)', sat: 'Sentinel-5P TROPOMI & CAMS' },
    { name: 'Particules fines (PM2.5)', value: '11.8 µg/m³', status: 'MODÉRÉ', limit: '15 µg/m³ (OMS)', sat: 'CAMS Ensemble Régional' },
    { name: 'Particules (PM10)', value: '19.4 µg/m³', status: 'BON', limit: '45 µg/m³ (OMS)', sat: 'CAMS Ensemble Régional' },
    { name: 'Ozone troposphérique (O₃)', value: '72.0 µg/m³', status: 'MODÉRÉ', limit: '100 µg/m³ (OMS)', sat: 'Sentinel-5P & CAMS' },
    { name: 'Monoxyde de carbone (CO)', value: '0.28 mg/m³', status: 'EXCELLENT', limit: '4 mg/m³ (OMS)', sat: 'Sentinel-5P TROPOMI' },
    { name: 'Dioxyde de soufre (SO₂)', value: '4.1 µg/m³', status: 'EXCELLENT', limit: '40 µg/m³ (OMS)', sat: 'Sentinel-5P TROPOMI' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Qualité de l'Air & Atmosphère (CAMS / Sentinel-5P)
            </h3>
            <p className="text-xs text-slate-400">
              Copernicus Atmosphere Monitoring Service • Réanalyse et Prévision
            </p>
          </div>
        </div>

        {/* Global AQI Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-mono text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Indice Global : 2/5 (Bon)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {pollutants.map((p) => (
          <div key={p.name} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">{p.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  p.status === 'EXCELLENT' || p.status === 'BON'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                }`}
              >
                {p.status}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2 font-mono">
              <span className="text-lg font-bold text-slate-100">{p.value}</span>
              <span className="text-[10px] text-slate-400">/ Seuil {p.limit}</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">
              Fournisseur : {p.sat}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
