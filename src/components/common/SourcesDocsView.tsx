import React, { useEffect, useState } from 'react';
import { CopernicusApiClient } from '../../services/apiClient';
import { Database, ExternalLink, ShieldCheck, BookOpen, Layers, Radio, Satellite, Wind, Droplet, Calendar } from 'lucide-react';

export const SourcesDocsView: React.FC = () => {
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    CopernicusApiClient.getCollections().then((data) => {
      if (data && data.collections) {
        setCollections(data.collections);
      }
    });
  }, []);

  const coreServices = [
    {
      name: 'Copernicus Data Space Ecosystem (CDSE)',
      role: 'Catalogue unifié STAC & OData, Sentinel Hub Processing API, openEO',
      desc: 'Point d\'accès principal lancé en 2023 par l\'Agence Spatiale Européenne (ESA) et la Commission Européenne pour distribuer l\'ensemble des archives Sentinel.',
      endpoints: [
        'STAC API v1.0.0 : https://catalogue.dataspace.copernicus.eu/stac',
        'OData v4 : https://catalogue.dataspace.copernicus.eu/odata/v1/Products',
        'Sentinel Hub API : https://sh.dataspace.copernicus.eu/api/v1/process',
        'openEO : https://openeo.dataspace.copernicus.eu/openeo/1.2/',
      ],
      url: 'https://documentation.dataspace.copernicus.eu',
    },
    {
      name: 'Copernicus Climate Change Service (C3S / CDS)',
      role: 'Réanalyses climatiques globales ERA5 & ERA5-Land, projections et anomalies',
      desc: 'Opéré par l\'ECMWF. Fournit des réanalyses atmosphériques cohérentes à l\'échelle planétaire de 1950 à aujourd\'hui.',
      endpoints: [
        'CDS API : https://cds.climate.copernicus.eu/how-to-api',
        'Datasets : reanalysis-era5-land, reanalysis-era5-single-levels',
      ],
      url: 'https://cds.climate.copernicus.eu',
    },
    {
      name: 'Copernicus Atmosphere Monitoring Service (CAMS / ADS)',
      role: 'Surveillance de la composition atmosphérique, qualité de l\'air et aérosols',
      desc: 'Modélisation et assimilation multi-modèles (11 modèles européens) pour l\'ozone, le NO₂, les particules fines et les poussières.',
      endpoints: [
        'ADS API : https://ads.atmosphere.copernicus.eu/how-to-api',
        'Datasets : cams-europe-air-quality-forecasts, cams-global-reanalysis',
      ],
      url: 'https://ads.atmosphere.copernicus.eu',
    },
    {
      name: 'Copernicus Marine Service (CMS / CMEMS)',
      role: 'Océanographie physique, bio-géochimie et altimétrie marine',
      desc: 'Opéré par Mercator Ocean International. Données de température de surface, salinité, courants, vagues et glaces marines.',
      endpoints: [
        'CMEMS Toolbox & API : https://help.marine.copernicus.eu',
        'Catalogue : GLOBAL_ANALYSISFORECAST_PHY_001_024',
      ],
      url: 'https://marine.copernicus.eu',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 text-slate-200">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Sources de Données & APIs Copernicus</h2>
          <p className="text-xs text-slate-400">
            Architecture multi-services et conformité aux standards européens de données ouvertes (Open Access)
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">
          Piliers Programmatiques Copernicus Intégrés
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coreServices.map((svc) => (
            <div key={svc.name} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{svc.name}</h4>
                  <a
                    href={svc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="text-[11px] text-cyan-400 font-medium mt-0.5">{svc.role}</div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{svc.desc}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Endpoints Officiels :</div>
                <div className="space-y-1">
                  {svc.endpoints.map((ep, i) => (
                    <div key={i} className="font-mono text-[10px] text-slate-400 truncate bg-slate-950 px-2 py-1 rounded border border-slate-800/60">
                      {ep}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collections Discovery Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">
          Missions Spatiales & Produits Détectés Dynamiquement
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collections.map((col) => (
            <div key={col.mission} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100">{col.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {col.family}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">{col.description}</p>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Rév : {col.revisit}</span>
                <a
                  href={col.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Doc ESA</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open Access & Licence */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Politique de Données Ouvertes Copernicus :</strong> Conformément au règlement de l'Union Européenne, les données Sentinel et les produits d'information des services Copernicus sont fournis gratuitement, de manière ouverte et accessible sans restriction d'usage scientifique, institutionnel ou commercial (Creative Commons CC-BY 4.0 / Copernicus Sentinel data).
        </div>
      </div>
    </div>
  );
};
