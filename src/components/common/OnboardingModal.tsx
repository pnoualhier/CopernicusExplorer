import React, { useState } from 'react';
import {
  Globe2,
  MapPin,
  Satellite,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  X,
} from 'lucide-react';
import { CopernicusLogo } from './CopernicusLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  const steps = [
    {
      title: 'Bienvenue sur Copernicus Explorer',
      subtitle: "Plateforme scientifique unifiée d'observation de la Terre de l'Union Européenne",
      icon: <CopernicusLogo className="w-12 h-12 shadow-lg" />,
      content:
        "Copernicus Explorer regroupe en une interface unique les missions satellitaires Sentinel (1, 2, 3, 5P, 6) et les services thématiques européens : climatologie ERA5 (C3S), surveillance de l'atmosphère (CAMS) et données océanographiques (CMS).",
      tips: [
        'Accès direct aux catalogues CDSE STAC / OData',
        'Analyses multi-spectrales (NDVI, NDWI, fausses couleurs)',
        'Mises à jour automatiques en arrière-plan',
      ],
    },
    {
      title: 'Navigation Cartographique & Fonds CARTO',
      subtitle: 'Explorez le globe en haute précision avec les fonds de cartes CARTO',
      icon: <Globe2 className="w-10 h-10 text-cyan-400" />,
      content:
        'Localisez n\'importe quel endroit sur Terre via la barre de recherche (villes ou coordonnées GPS). Utilisez les fonds de carte CARTO (Dark, Voyager, Positron) et dessinez directement une emprise Bounding Box personnalisée pour isoler votre région.',
      tips: [
        'Barre de recherche rapide par toponyme ou "lat, lng"',
        'Outil de dessin de rectangle Bounding Box WGS84',
        'Sélecteur de fond de carte CARTO (Dark Matter, Voyager, Positron)',
      ],
    },
    {
      title: 'Missions Sentinel & Séries Temporelles',
      subtitle: 'Radar SAR, imagerie optique 10m et capteurs atmosphériques',
      icon: <Satellite className="w-10 h-10 text-blue-400" />,
      content:
        'Consultez les passages satellitaires Sentinel-2 (optique haute résolution pour l\'agriculture et les forêts), Sentinel-1 (radar tout-temps pour inondations et structures), Sentinel-5P (polluants atmosphériques) et Sentinel-3/6 (température de mer et altimétrie).',
      tips: [
        'Filtrage par couverture nuageuse maximale (0-100%)',
        'Frise chronologique ajustable (30 jours, 1 an, historique)',
        'Visualiseur de bandes spectrales (B2, B3, B4, B8, B11, B12)',
      ],
    },
    {
      title: 'Climatologie ERA5 & Qualité de l\'Air CAMS',
      subtitle: 'Réanalyses météorologiques mondiales et surveillance atmosphérique',
      icon: <Layers className="w-10 h-10 text-emerald-400" />,
      content:
        'Analysez les températures moyennes, les cumuls de précipitations et les anomalies climatiques fournies par le centre européen ECMWF (C3S). Suivez également en temps réel les concentrations de NO2, Ozone, particules fines PM2.5 et PM10.',
      tips: [
        'Graphiques de tendances saisonnières et anomalies climatiques',
        'Indices biophysiques de végétation NDVI et stress hydrique NDWI',
        'Indicateurs maritimes : température de surface (SST) et vagues',
      ],
    },
    {
      title: 'Analyste IA Gemini & Exportations',
      subtitle: 'Diagnostics écologiques automatisés et exports pour vos rapports SIG',
      icon: <Sparkles className="w-10 h-10 text-purple-400" />,
      content:
        'Interrogez l\'Analyste Environnemental IA propulsé par Gemini pour obtenir des synthèses écologiques rigoureuses sur votre zone. Exportez ensuite vos données en un clic aux formats GeoJSON, CSV, JSON ou rapport textuel structuré.',
      tips: [
        'Synthèse des sécheresses, canicules et anomalies de végétation',
        'Export GeoJSON conforme pour QGIS, ArcGIS et Google Earth',
        'Traçabilité complète des données scientifiques avec métadonnées L1C/L2A',
      ],
    },
  ];

  const handleFinish = () => {
    try {
      localStorage.setItem('copernicus_onboarding_done', 'true');
      if (neverShowAgain) {
        localStorage.setItem('copernicus_onboarding_never', 'true');
      }
    } catch {
      // ignore
    }
    onClose();
  };

  if (!isOpen) return null;

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Guide d'accueil • Étape {currentStep + 1} / {steps.length}
            </span>
          </div>
          <button
            onClick={handleFinish}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
            title="Passer l'introduction"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="w-full h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="mb-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center">
            {current.icon}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight mb-1">
            {current.title}
          </h2>
          <p className="text-xs sm:text-sm text-cyan-400 font-medium mb-4">{current.subtitle}</p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mb-6 text-left sm:text-center">
            {current.content}
          </p>

          {/* Key points box */}
          <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-left mb-4">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
              Points clés de cette fonctionnalité :
            </h4>
            <ul className="space-y-1.5">
              {current.tips.map((tip, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Do not show again checkbox */}
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer self-start sm:self-center">
            <input
              type="checkbox"
              checked={neverShowAgain}
              onChange={(e) => setNeverShowAgain(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-600 focus:ring-0"
            />
            <span>Ne plus afficher automatiquement au démarrage</span>
          </label>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentStep ? 'w-6 bg-cyan-500' : 'bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Étape ${i + 1}`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition active:scale-95"
            >
              <span>Suivant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 transition active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Commencer l'exploration</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
