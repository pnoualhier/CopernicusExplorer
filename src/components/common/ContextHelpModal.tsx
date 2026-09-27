import React, { useState, useMemo } from 'react';
import { X, Search, HelpCircle, BookOpen, Layers, Satellite, ShieldCheck, Compass, Sparkles } from 'lucide-react';

interface ContextHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOnboarding?: () => void;
}

interface HelpTopic {
  id: string;
  category: 'guide' | 'missions' | 'spectral' | 'services';
  title: string;
  shortDesc: string;
  content: string;
  tags: string[];
}

export const ContextHelpModal: React.FC<ContextHelpModalProps> = ({
  isOpen,
  onClose,
  onStartOnboarding,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'guide' | 'missions' | 'spectral' | 'services'>('all');

  const topics: HelpTopic[] = [
    {
      id: 'guide-search',
      category: 'guide',
      title: 'Recherche de zone géographique & Coordonnées',
      shortDesc: 'Localiser un secteur d\'intérêt par nom de commune ou coordonnées GPS.',
      content: 'Vous pouvez saisir soit un toponyme (ex: "Bordeaux", "Montpellier", "Delta du Pô"), soit directement une latitude et une longitude séparées par une virgule (ex: "43.60, 3.87"). Le système recentre instantanément la carte et calcule la boîte englobante (Bounding Box) WGS84 correspondante.',
      tags: ['recherche', 'bbox', 'gps', 'wgs84', 'coordonnées'],
    },
    {
      id: 'guide-bbox',
      category: 'guide',
      title: 'Tracé manuel d\'emprise Bounding Box',
      shortDesc: 'Définir un polygone rectangulaire sur la carte interactive.',
      content: 'Cliquez sur l\'outil "Tracer BBox" sur la carte interactive, puis cliquez-glissez sur la zone d\'étude souhaitée. Les coordonnées [Ouest, Sud, Est, Nord] sont immédiatement synchronisées avec l\'ensemble des requêtes d\'imagerie et de climatologie.',
      tags: ['carte', 'bbox', 'emprise', 'rectangle', 'tracé'],
    },
    {
      id: 'guide-temporal',
      category: 'guide',
      title: 'Barre chronologique & Période temporelle',
      shortDesc: 'Ajuster les dates d\'observation et analyser les séries temporelles.',
      content: 'La frise temporelle en bas d\'écran permet de filtrer les acquisitions satellitaires et les données climatologiques. Utilisez les raccourcis (30 jours, 90 jours, 1 an, 2024, etc.) ou les curseurs de date de début et de fin.',
      tags: ['temps', 'timeline', 'dates', 'historique', 'era5'],
    },
    {
      id: 'mission-s1',
      category: 'missions',
      title: 'Sentinel-1 : Radar à synthèse d\'ouverture (SAR en bande C)',
      shortDesc: 'Imagerie tout-temps jour/nuit pour la surveillance terrestre et maritime.',
      content: 'Sentinel-1 opère un radar micro-ondes qui traverse les nuages, les fumées et la nuit. Idéal pour la cartographie des inondations, la déformation des sols (interférométrie InSAR), le trafic maritime et l\'état de la banquise.',
      tags: ['radar', 'sar', 'sentinel-1', 'inondation', 'interférométrie'],
    },
    {
      id: 'mission-s2',
      category: 'missions',
      title: 'Sentinel-2 : Imagerie optique multispectrale haute résolution',
      shortDesc: '13 bandes spectrales du visible au proche et moyen infrarouge (10m à 60m).',
      content: 'Mission de référence pour le suivi des cultures agricoles, des forêts, de l\'occupation des sols et des cours d\'eau. Permet le calcul d\'indices biophysiques précis (NDVI, NDWI, NBR) avec une revisite de 5 jours.',
      tags: ['optique', 'sentinel-2', 'ndvi', 'infrarouge', 'multispectral'],
    },
    {
      id: 'mission-s3',
      category: 'missions',
      title: 'Sentinel-3 : Surveillance globale des océans et des continents',
      shortDesc: 'Capteurs optiques OLCI, radiomètre SLSTR et altimètre radar SRAL.',
      content: 'Mesure la couleur de l\'eau, la température de surface de la mer (SST) et de la terre (LST), la hauteur des vagues et la dynamique de la végétation à l\'échelle continentale.',
      tags: ['océan', 'sst', 'sentinel-3', 'slstr', 'olci', 'altimétrie'],
    },
    {
      id: 'mission-s5p',
      category: 'missions',
      title: 'Sentinel-5P : Spectromètre atmosphérique TROPOMI',
      shortDesc: 'Cartographie quotidienne des polluants atmosphériques et gaz à effet de serre.',
      content: 'Mesure avec une précision inégalée les colonnes totales et troposphériques de dioxyde d\'azote (NO2), ozone (O3), méthane (CH4), monoxyde de carbone (CO), dioxyde de soufre (SO2) et aérosols.',
      tags: ['atmosphère', 'cams', 'tropomi', 'sentinel-5p', 'pollution', 'no2'],
    },
    {
      id: 'spectral-ndvi',
      category: 'spectral',
      title: 'NDVI (Normalized Difference Vegetation Index)',
      shortDesc: 'Formule : (B8 - B4) / (B8 + B4) • Proche Infrarouge vs Rouge visible',
      content: 'L\'indice de végétation par différence normalisée mesure la vigueur et la densité de la chlorophylle vivante. Les valeurs varient de -1 à +1 : les sols nus ont des valeurs proches de 0.1-0.2, tandis que la végétation dense et saine dépasse 0.6 à 0.85.',
      tags: ['ndvi', 'chlorophylle', 'végétation', 'agriculture', 'indice'],
    },
    {
      id: 'spectral-ndwi',
      category: 'spectral',
      title: 'NDWI (Normalized Difference Water Index)',
      shortDesc: 'Formule : (B3 - B8) / (B3 + B8) ou (B8 - B11) / (B8 + B11)',
      content: 'Détecte les masses d\'eau libres, les zones humides et le stress hydrique foliaire. Très utile pour délimiter les contours des réservoirs, lacs, estuaires et crues.',
      tags: ['ndwi', 'eau', 'sécheresse', 'crues', 'lacs'],
    },
    {
      id: 'spectral-levels',
      category: 'spectral',
      title: 'Niveaux de traitement : L1C (TOA) vs L2A (BOA)',
      shortDesc: 'Top-Of-Atmosphere vs Bottom-Of-Atmosphere (Réflectance corrigée).',
      content: 'Le niveau L1C fournit la réflectance au sommet de l\'atmosphère (incluant la diffusion atmosphérique). Le niveau L2A applique la correction atmosphérique Sen2Cor pour délivrer la réflectance au sol (Bottom-Of-Atmosphere), indispensable aux calculs quantitatifs rigoureux.',
      tags: ['l1c', 'l2a', 'toa', 'boa', 'sen2cor', 'correction'],
    },
    {
      id: 'service-c3s',
      category: 'services',
      title: 'Copernicus C3S & Réanalyses ERA5 (ECMWF)',
      shortDesc: 'Historique météorologique mondial cohérent depuis 1940 à résolution horaire.',
      content: 'Fourni par le Centre Européen pour les Prévisions Météorologiques à Moyen Terme (ECMWF). Combine données d\'observation et modèles physiques pour reconstituer les températures, précipitations, vents et humidité du sol.',
      tags: ['era5', 'c3s', 'climat', 'ecmwf', 'météo'],
    },
    {
      id: 'service-carto',
      category: 'services',
      title: 'Fonds de carte CARTO & Cartographie Web',
      shortDesc: 'Tuiles rasters et vectorielles optimisées avec authentification API.',
      content: 'Copernicus Explorer intègre les fonds de carte CARTO Dark Matter, CARTO Voyager et CARTO Positron. Ces cartes fournissent un contraste parfait pour superposer les données satellitaires sans surcharger la lisibilité.',
      tags: ['carto', 'fond de carte', 'leaflet', 'positron', 'dark matter'],
    },
  ];

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [topics, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Aide & Documentation Scientifique
              </h2>
              <p className="text-xs text-slate-400">
                Guide des capteurs, indices spectraux, missions et services Copernicus
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onStartOnboarding && (
              <button
                onClick={() => {
                  onClose();
                  onStartOnboarding();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Relancer la visite guidée</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher (ex: NDVI, Sentinel-2, ERA5, BBox)..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 transition font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Tous ({topics.length})
            </button>
            <button
              onClick={() => setSelectedCategory('guide')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                selectedCategory === 'guide'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Navigation
            </button>
            <button
              onClick={() => setSelectedCategory('missions')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                selectedCategory === 'missions'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Missions Sentinel
            </button>
            <button
              onClick={() => setSelectedCategory('spectral')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                selectedCategory === 'spectral'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Indices Spectraux
            </button>
            <button
              onClick={() => setSelectedCategory('services')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                selectedCategory === 'services'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Services Copernicus
            </button>
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredTopics.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucun résultat pour "{searchQuery}". Essayez un autre mot-clé comme "NDVI", "Sentinel", "ERA5" ou "Carte".
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    {topic.category === 'missions' && <Satellite className="w-4 h-4 text-cyan-400" />}
                    {topic.category === 'spectral' && <Layers className="w-4 h-4 text-emerald-400" />}
                    {topic.category === 'guide' && <Compass className="w-4 h-4 text-amber-400" />}
                    {topic.category === 'services' && <BookOpen className="w-4 h-4 text-blue-400" />}
                    {topic.title}
                  </h3>
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                    {topic.category}
                  </span>
                </div>
                <p className="text-xs text-cyan-300/90 font-medium mb-2">{topic.shortDesc}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{topic.content}</p>

                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {topic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Données Copernicus sous licence ouverte européenne (ESA / UE)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
