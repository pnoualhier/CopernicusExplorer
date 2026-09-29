import { AnalysisProject } from '../types/project';

export const SAMPLE_PROJECTS: AnalysisProject[] = [
  {
    id: 'toulouse-vegetation-2018-2026',
    title: 'Évolution de la végétation et sécheresses autour de Toulouse',
    description:
      'Étude multidécennale de la vigueur chlorophyllienne (NDVI) et du stress hydrique (NDWI) dans le bassin toulousain face aux vagues de chaleur et sécheresses de 2018 à 2026.',
    theme: 'VEGETATION',
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-09-27T16:30:00Z',
    author: 'Observatoire Scientifique Copernicus • Unité Télédétection',
    zone: {
      name: 'Bassin Toulousain & Plaine de la Garonne',
      region: 'Occitanie, France (Haute-Garonne)',
      description: 'Zone agricole et péri-urbaine comprenant les terrasses de la Garonne, la plaine du Lauragais et la forêt de Bouconne.',
      bbox: {
        west: 1.25,
        south: 43.45,
        east: 1.65,
        north: 43.75,
      },
      center: { lat: 43.604, lng: 1.444 },
      areaKm2: 485,
      elevationAvgMeters: 145,
      ecoregion: 'Plaines alluviales subméditerranéennes et coteaux argilo-calcaires',
    },
    dataConfig: {
      startDate: '2018-01-01',
      endDate: '2026-09-27',
      missions: ['SENTINEL-2', 'ERA5-CLIMATE', 'CAMS-ATMOSPHERE'],
      maxCloudCover: 20,
      processingLevel: 'Sentinel-2 L2A (BOA Réflectance) • ERA5-Land Horaire',
      provider: 'Copernicus Data Space Ecosystem (CDSE) + ECMWF Climate Data Store',
      resolutionMeters: 10,
      acquiredScenesCount: 312,
    },
    analyses: {
      indices: ['NDVI', 'NDWI', 'TRUE_COLOR', 'FALSE_COLOR'],
      correlations: {
        vegTempCorrelation: -0.76,
        vegPrecipCorrelation: 0.81,
        airQualityIndexAvg: 'Indice Moyen 2.1 / 5 (Conforme OMS)',
      },
      detectedEvents: [
        {
          id: 'ev-2022-drought',
          period: 'Juin - Août 2022',
          year: 2022,
          type: 'DROUGHT',
          title: 'Sécheresse historique et canicule record de 2022',
          description:
            'Chute massive de la réflectance proche infrarouge (B8). Déficit pluviométrique sévère de 68% combiné à 3 vagues de chaleur successives (>38°C). Chute brutale du NDVI moyen de 0.74 à 0.44.',
          severity: 'EXTREME',
          impactNdviPercent: -35.2,
          deltaTempC: 3.9,
          deficitPrecipPercent: -68.4,
        },
        {
          id: 'ev-2023-winter',
          period: 'Janvier - Février 2023',
          year: 2023,
          type: 'DROUGHT',
          title: 'Sécheresse hivernale précoce record',
          description:
            '32 jours consécutifs sans précipitations significatives sur le bassin garonnais, retardant la recharge des nappes phréatiques.',
          severity: 'SEVERE',
          impactNdviPercent: -14.0,
          deltaTempC: 1.8,
          deficitPrecipPercent: -54.0,
        },
        {
          id: 'ev-2024-rebound',
          period: 'Printemps 2024 - 2026',
          year: 2024,
          type: 'HEATWAVE',
          title: 'Recharge hydrique et résilience printanière',
          description:
            'Retour de précipitations régulières printanières permettant un rebond spectaculaire de la biomasse chlorophyllienne (NDVI atteignant 0.78).',
          severity: 'MODERATE',
          impactNdviPercent: 18.5,
          deltaTempC: 0.9,
          deficitPrecipPercent: 14.2,
        },
      ],
    },
    results: {
      baselineYear: 2018,
      targetYear: 2022,
      recentYear: 2026,
      baselineNdvi: 0.73,
      targetNdvi: 0.45,
      recentNdvi: 0.70,
      longTermTrend: 'Tendance globale de résilience avec forte vulnérabilité estivale récurrente.',
      yearlyStats: [
        { year: 2018, meanNdvi: 0.73, meanNdwi: 0.18, meanTempC: 14.8, totalPrecipMm: 720, no2Avg: 26.4, vegetationStatus: 'Vigoureuse (Référence nominale)' },
        { year: 2019, meanNdvi: 0.70, meanNdwi: 0.15, meanTempC: 15.2, totalPrecipMm: 645, no2Avg: 25.1, vegetationStatus: 'Normale (Léger stress estival)' },
        { year: 2020, meanNdvi: 0.74, meanNdwi: 0.20, meanTempC: 15.4, totalPrecipMm: 760, no2Avg: 21.0, vegetationStatus: 'Très vigoureuse (Confinement & pluies)' },
        { year: 2021, meanNdvi: 0.72, meanNdwi: 0.17, meanTempC: 14.6, totalPrecipMm: 690, no2Avg: 23.8, vegetationStatus: 'Normale' },
        { year: 2022, meanNdvi: 0.45, meanNdwi: -0.08, meanTempC: 16.5, totalPrecipMm: 410, no2Avg: 27.2, vegetationStatus: 'Crise sévère (Sécheresse historique)' },
        { year: 2023, meanNdvi: 0.58, meanNdwi: 0.04, meanTempC: 15.9, totalPrecipMm: 520, no2Avg: 24.5, vegetationStatus: 'Convalescente (Déficit hivernal)' },
        { year: 2024, meanNdvi: 0.71, meanNdwi: 0.16, meanTempC: 15.1, totalPrecipMm: 740, no2Avg: 22.3, vegetationStatus: 'Bonne régénération' },
        { year: 2025, meanNdvi: 0.69, meanNdwi: 0.14, meanTempC: 15.5, totalPrecipMm: 680, no2Avg: 21.8, vegetationStatus: 'Stable' },
        { year: 2026, meanNdvi: 0.70, meanNdwi: 0.15, meanTempC: 15.3, totalPrecipMm: 710, no2Avg: 20.9, vegetationStatus: 'Rétablie' },
      ],
    },
    report: {
      title: 'Rapport d\'Analyse Spatiale : Trajectoire Végétale & Climat à Toulouse (2018-2026)',
      executiveSummary:
        'L\'analyse croisée des données Sentinel-2 (MSI 10m L2A) et des réanalyses ERA5 sur le bassin toulousain révèle une vulnérabilité thermique accentuée au cours de la période 2018-2026. L\'été 2022 a constitué une rupture majeure avec un effondrement de 35% de l\'indice NDVI moyen. Cependant, la résilience des agro-écosystèmes a permis un rétablissement substantiel dès 2024 grâce à la reconstitution des réserves hydriques superficielles.',
      methodology:
        'Extraction temporelle continue basée sur 312 scènes Sentinel-2 Bottom-of-Atmosphere (BOA L2A) issues du catalogue CDSE. Masquage strict des nuages (SCL Cloud < 20%). Corrélation bilatérale avec les températures de l\'air à 2m et précipitations cumulées réanalysées par ERA5-Land (ECMWF).',
      conclusions:
        '1. La canicule de 2022 a induit un déclin sans précédent du couvert foliaire.\n2. La corrélation entre déficit de précipitations et chute du NDVI est établie à r = +0.81.\n3. Les zones boisées (Bouconne) ont démontré une résistance hydrique supérieure de 40% par rapport aux parcelles agricoles nues.\n4. La période 2024-2026 marque un retour à la moyenne décennale.',
      recommendations: [
        'Développer les bandes enherbées et la couverture végétale permanente des sols agricoles pour retenir l\'humidité printanière.',
        'Renforcer les îlots de fraîcheur forestiers périurbains pour mitiger le dôme de chaleur toulousain.',
        'Mettre en place une veille satellite précoce basée sur l\'indice NDWI dès le mois de mai pour anticiper les arrêtés sécheresse.',
      ],
      citation: 'Copernicus Earth Observation Programme • ESA / ECMWF / CDSE • Projet Analyse Réf. COP-TOULOUSE-2026-V1',
      isGenerated: true,
    },
  },
  {
    id: 'gironde-foret-2020-2026',
    title: 'Dynamique forestière & Résilience post-incendie en Gironde',
    description:
      'Surveillance satellite de l\'impact des méga-feux de forêt de l\'été 2022 en Gironde (Landiras et La Teste-de-Buch) et mesure de la régénération du pin maritime jusqu\'en 2026.',
    theme: 'FORESTRY',
    createdAt: '2026-09-22T14:00:00Z',
    updatedAt: '2026-09-26T18:00:00Z',
    author: 'Service Régional d\'Observation Forestière • Copernicus Sentinel Hub',
    zone: {
      name: 'Massif des Landes de Gascogne (Secteur Landiras / La Teste)',
      region: 'Nouvelle-Aquitaine, France (Gironde)',
      description: 'Massif forestier de pin maritime sur sols sableux podzolisés, bordé par le bassin d\'Arcachon.',
      bbox: {
        west: -1.25,
        south: 44.45,
        east: -0.45,
        north: 44.85,
      },
      center: { lat: 44.60, lng: -0.85 },
      areaKm2: 820,
      elevationAvgMeters: 45,
      ecoregion: 'Dunes et plaines sableuses atlantiques des Landes',
    },
    dataConfig: {
      startDate: '2020-01-01',
      endDate: '2026-09-27',
      missions: ['SENTINEL-2', 'SENTINEL-1', 'ERA5-CLIMATE'],
      maxCloudCover: 15,
      processingLevel: 'Sentinel-2 L2A + Sentinel-1 SAR Sigma0 Coherence',
      provider: 'Copernicus Data Space Ecosystem (CDSE)',
      resolutionMeters: 10,
      acquiredScenesCount: 280,
    },
    analyses: {
      indices: ['NBR', 'NDVI', 'FALSE_COLOR', 'TRUE_COLOR'],
      correlations: {
        vegTempCorrelation: -0.82,
        vegPrecipCorrelation: 0.74,
        airQualityIndexAvg: 'Pics d\'aérosols majeurs en juillet 2022',
      },
      detectedEvents: [
        {
          id: 'ev-feux-2022',
          period: '12 - 25 Juillet 2022',
          year: 2022,
          type: 'HEATWAVE',
          title: 'Méga-incendies de Landiras et La Teste',
          description:
            'Plus de 30 000 hectares détruits sous des températures de 42°C et un vent tournant. Chute instantanée du NBR (Normalized Burn Ratio) à -0.45.',
          severity: 'EXTREME',
          impactNdviPercent: -58.0,
          deltaTempC: 4.8,
          deficitPrecipPercent: -85.0,
        },
      ],
    },
    results: {
      baselineYear: 2020,
      targetYear: 2022,
      recentYear: 2026,
      baselineNdvi: 0.78,
      targetNdvi: 0.32,
      recentNdvi: 0.62,
      longTermTrend: 'Régénération végétale pionnière active (fougères, ajoncs) et réensemencement forestier.',
      yearlyStats: [
        { year: 2020, meanNdvi: 0.78, meanNdwi: 0.22, meanTempC: 14.5, totalPrecipMm: 890, no2Avg: 18.2, vegetationStatus: 'Canopée mature dense' },
        { year: 2021, meanNdvi: 0.77, meanNdwi: 0.20, meanTempC: 14.1, totalPrecipMm: 850, no2Avg: 17.5, vegetationStatus: 'Normal' },
        { year: 2022, meanNdvi: 0.32, meanNdwi: -0.18, meanTempC: 16.2, totalPrecipMm: 520, no2Avg: 34.0, vegetationStatus: 'Destruction par le feu' },
        { year: 2023, meanNdvi: 0.44, meanNdwi: -0.05, meanTempC: 15.6, totalPrecipMm: 910, no2Avg: 19.1, vegetationStatus: 'Repousse pionnière' },
        { year: 2024, meanNdvi: 0.54, meanNdwi: 0.08, meanTempC: 14.9, totalPrecipMm: 980, no2Avg: 17.8, vegetationStatus: 'Sous-bois reconstitué' },
        { year: 2025, meanNdvi: 0.59, meanNdwi: 0.11, meanTempC: 15.0, totalPrecipMm: 870, no2Avg: 17.0, vegetationStatus: 'Jeunes pins en croissance' },
        { year: 2026, meanNdvi: 0.62, meanNdwi: 0.13, meanTempC: 14.8, totalPrecipMm: 860, no2Avg: 16.5, vegetationStatus: 'Couverture en densification' },
      ],
    },
    report: {
      title: 'Bilan Satellitaire de la Résilience Post-Incendie en Gironde (2020-2026)',
      executiveSummary:
        'L\'indice spectral de sévérité de brûlis (dNBR) a permis de cartographier avec une résolution de 10 mètres le périmètre exact des zones calcinées en 2022. Quatre années après les incendies, la couverture végétale atteint 62% de son niveau initial de 2020.',
      methodology:
        'Combinaison des canaux proche infrarouge (B8) et infrarouge à ondes courtes (SWIR B12) Sentinel-2 avec vérification de rétrodiffusion radar Sentinel-1 en bande C pour évaluer la perte de rugosité de la canopée.',
      conclusions:
        '1. Délimitation précise de 31 200 ha brûlés.\n2. La recolonisation végétale naturelle a débuté dès l\'automne 2022.\n3. La surveillance satellitaire confirme l\'absence de glissement de terrain ou d\'érosion dunaire majeure.',
      recommendations: [
        'Maintenir une surveillance satellitaire bimensuelle des zones reboisées contre les risques de feux résiduels.',
        'Diversifier les essences arborées pour limiter la combustibilité en cas de sécheresse.',
      ],
      citation: 'Copernicus Sentinel Hub • Projet Réf. COP-GIRONDE-FIRE-2026',
      isGenerated: true,
    },
  },
  {
    id: 'camargue-hydrologie-2019-2026',
    title: 'Stress hydrique et dynamique lagunaire en Camargue',
    description:
      'Suivi de la salinité, du recul des lagunes d\'eau douce et de la température de surface de l\'eau (SST) dans le delta du Rhône face au changement climatique.',
    theme: 'HYDROLOGY',
    createdAt: '2026-09-21T09:00:00Z',
    updatedAt: '2026-09-25T11:00:00Z',
    author: 'Pôle d\'Écologie Méditerranéenne • Copernicus Marine & Land',
    zone: {
      name: 'Delta de la Camargue & Étang de Vaccarès',
      region: 'Provence-Alpes-Côte d\'Azur, France (Bouches-du-Rhône)',
      description: 'Complexe de zones humides d\'importance internationale (Convention Ramsar), lagunes côtières et sansouïres.',
      bbox: {
        west: 4.35,
        south: 43.40,
        east: 4.85,
        north: 43.70,
      },
      center: { lat: 43.53, lng: 4.60 },
      areaKm2: 750,
      elevationAvgMeters: 2,
      ecoregion: 'Zone humide deltaïque méditerranéenne et lagunes côtières',
    },
    dataConfig: {
      startDate: '2019-01-01',
      endDate: '2026-09-27',
      missions: ['SENTINEL-2', 'SENTINEL-3', 'COPERNICUS-MARINE', 'ERA5-CLIMATE'],
      maxCloudCover: 25,
      processingLevel: 'Sentinel-2 L2A NDWI • Sentinel-3 SLSTR L2 SST • CMS Ocean Physics',
      provider: 'Copernicus CDSE + Mercator Ocean',
      resolutionMeters: 10,
      acquiredScenesCount: 340,
    },
    analyses: {
      indices: ['NDWI', 'NDVI', 'TRUE_COLOR'],
      correlations: {
        vegTempCorrelation: -0.65,
        vegPrecipCorrelation: 0.88,
        airQualityIndexAvg: 'Excellente qualité de l\'air marin',
      },
      detectedEvents: [
        {
          id: 'ev-salinisation-2022',
          period: 'Août - Octobre 2022',
          year: 2022,
          type: 'DROUGHT',
          title: 'Assec partiel des lagunes et sursalinisation',
          description:
            'Évaporation intense sous des températures d\'eau dépassant 28°C sur l\'étang de Vaccarès. Rétractation de 22% de la surface en eau libre (NDWI).',
          severity: 'SEVERE',
          impactNdviPercent: -28.0,
          deltaTempC: 3.2,
          deficitPrecipPercent: -72.0,
        },
      ],
    },
    results: {
      baselineYear: 2019,
      targetYear: 2022,
      recentYear: 2026,
      baselineNdvi: 0.65,
      targetNdvi: 0.42,
      recentNdvi: 0.63,
      longTermTrend: 'Forte sensibilité aux apports saisonniers du Rhône et aux épisodes de sécheresse estivale.',
      yearlyStats: [
        { year: 2019, meanNdvi: 0.65, meanNdwi: 0.52, meanTempC: 15.6, totalPrecipMm: 620, no2Avg: 14.2, vegetationStatus: 'Équilibre hydrique nominal' },
        { year: 2020, meanNdvi: 0.68, meanNdwi: 0.55, meanTempC: 15.8, totalPrecipMm: 690, no2Avg: 12.0, vegetationStatus: 'Excellente immersion' },
        { year: 2021, meanNdvi: 0.64, meanNdwi: 0.48, meanTempC: 15.2, totalPrecipMm: 580, no2Avg: 13.8, vegetationStatus: 'Stable' },
        { year: 2022, meanNdvi: 0.42, meanNdwi: 0.26, meanTempC: 17.1, totalPrecipMm: 340, no2Avg: 15.2, vegetationStatus: 'Déficit hydrique critique' },
        { year: 2023, meanNdvi: 0.53, meanNdwi: 0.38, meanTempC: 16.4, totalPrecipMm: 460, no2Avg: 14.5, vegetationStatus: 'Remise en eau partielle' },
        { year: 2024, meanNdvi: 0.66, meanNdwi: 0.53, meanTempC: 15.7, totalPrecipMm: 710, no2Avg: 13.0, vegetationStatus: 'Normalisation' },
        { year: 2025, meanNdvi: 0.64, meanNdwi: 0.50, meanTempC: 16.0, totalPrecipMm: 640, no2Avg: 12.8, vegetationStatus: 'Bonne productivité' },
        { year: 2026, meanNdvi: 0.63, meanNdwi: 0.49, meanTempC: 15.9, totalPrecipMm: 630, no2Avg: 12.5, vegetationStatus: 'Stable' },
      ],
    },
    report: {
      title: 'Bilan Éco-Hydrologique de la Camargue par Télédétection (2019-2026)',
      executiveSummary:
        'L\'application conjointe des indices NDWI (Sentinel-2) et des températures radiométriques (Sentinel-3 SLSTR) met en évidence le rôle stabilisateur des apports d\'eau douce du fleuve Rhône lors des périodes de canicule.',
      methodology:
        'Cartographie bi-mensuelle des surfaces en eau libre par seuillage NDWI > 0.0 et corrélation avec les réanalyses de précipitations ERA5 et les bouées in-situ Mercator Ocean.',
      conclusions:
        '1. La surface totale en eau a chuté à un minimum de 180 km² en août 2022 contre 245 km² en 2020.\n2. La corrélation précipitations / étendue lagunaire est très forte (r = +0.88).\n3. Les roselières périphériques ont retrouvé leur vigueur dès le printemps 2024.',
      recommendations: [
        'Maintenir une gestion dynamique des martelières pour équilibrer salinité et niveau d\'eau.',
        'Intégrer les alertes satellitaires de bloom algal basées sur la couleur de l\'océan Sentinel-3 OLCI.',
      ],
      citation: 'Copernicus Marine and Land Monitoring • Projet Réf. COP-CAMARGUE-2026',
      isGenerated: true,
    },
  },
];

const STORAGE_KEY_PROJECTS = 'copernicus_analysis_projects';
const STORAGE_KEY_ACTIVE_PROJECT_ID = 'copernicus_active_project_id';

export class ProjectService {
  static getAllProjects(): AnalysisProject[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    // Fallback to sample projects
    return SAMPLE_PROJECTS;
  }

  static getActiveProjectId(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_PROJECT_ID);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return SAMPLE_PROJECTS[0].id; // Default Toulouse
  }

  static setActiveProjectId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT_ID, id);
    } catch {
      // ignore
    }
  }

  static getActiveProject(): AnalysisProject {
    const projects = this.getAllProjects();
    const activeId = this.getActiveProjectId();
    const found = projects.find((p) => p.id === activeId);
    return found || projects[0] || SAMPLE_PROJECTS[0];
  }

  static saveProject(project: AnalysisProject): void {
    const projects = this.getAllProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    let updated: AnalysisProject[];
    if (index >= 0) {
      updated = [...projects];
      updated[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      updated = [project, ...projects];
    }
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  static createNewProject(params: {
    title: string;
    description: string;
    theme: AnalysisProject['theme'];
    center?: { lat: number; lng: number };
    locationName?: string;
  }): AnalysisProject {
    const id = `project-${Date.now()}`;
    const lat = params.center?.lat || 43.60;
    const lng = params.center?.lng || 1.44;
    const delta = 0.2;

    const newProject: AnalysisProject = {
      id,
      title: params.title || 'Nouveau Projet d\'Analyse Spatiale',
      description: params.description || 'Étude d\'observation de la Terre Copernicus sur mesure.',
      theme: params.theme || 'VEGETATION',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Analyste Spatial Copernicus',
      zone: {
        name: params.locationName || 'Zone d\'Étude Personnalisée',
        region: 'Secteur d\'Observation',
        description: 'Polygone d\'étude défini sur la carte interactive.',
        bbox: {
          west: Number((lng - delta).toFixed(4)),
          south: Number((lat - delta).toFixed(4)),
          east: Number((lng + delta).toFixed(4)),
          north: Number((lat + delta).toFixed(4)),
        },
        center: { lat, lng },
        areaKm2: 320,
        elevationAvgMeters: 180,
        ecoregion: 'Zone tempérée européenne',
      },
      dataConfig: {
        startDate: '2018-01-01',
        endDate: '2026-09-27',
        missions: ['SENTINEL-2', 'ERA5-CLIMATE', 'CAMS-ATMOSPHERE'],
        maxCloudCover: 20,
        processingLevel: 'L2A (Bottom of Atmosphere BOA)',
        provider: 'Copernicus Data Space Ecosystem (CDSE)',
        resolutionMeters: 10,
        acquiredScenesCount: 154,
      },
      analyses: {
        indices: ['NDVI', 'NDWI', 'TRUE_COLOR'],
        correlations: {
          vegTempCorrelation: -0.68,
          vegPrecipCorrelation: 0.75,
          airQualityIndexAvg: 'Indice Moyen 2.0 / 5',
        },
        detectedEvents: [
          {
            id: `ev-${Date.now()}`,
            period: 'Été 2022',
            year: 2022,
            type: 'DROUGHT',
            title: 'Sécheresse et stress foliaire estival',
            description: 'Déficit de pluie et élévation de température moyenne.',
            severity: 'SEVERE',
            impactNdviPercent: -28,
            deltaTempC: 3.2,
            deficitPrecipPercent: -55,
          },
        ],
      },
      results: {
        baselineYear: 2018,
        targetYear: 2022,
        recentYear: 2026,
        baselineNdvi: 0.72,
        targetNdvi: 0.48,
        recentNdvi: 0.69,
        longTermTrend: 'Tendance globale de stabilité avec vulnérabilités estivales ponctuelles.',
        yearlyStats: [
          { year: 2018, meanNdvi: 0.72, meanNdwi: 0.17, meanTempC: 14.9, totalPrecipMm: 710, no2Avg: 25.0, vegetationStatus: 'Nominale' },
          { year: 2019, meanNdvi: 0.69, meanNdwi: 0.14, meanTempC: 15.3, totalPrecipMm: 630, no2Avg: 24.2, vegetationStatus: 'Stress modéré' },
          { year: 2020, meanNdvi: 0.73, meanNdwi: 0.19, meanTempC: 15.5, totalPrecipMm: 740, no2Avg: 20.8, vegetationStatus: 'Vigoureuse' },
          { year: 2021, meanNdvi: 0.71, meanNdwi: 0.16, meanTempC: 14.7, totalPrecipMm: 680, no2Avg: 23.5, vegetationStatus: 'Normale' },
          { year: 2022, meanNdvi: 0.48, meanNdwi: -0.06, meanTempC: 16.4, totalPrecipMm: 420, no2Avg: 26.8, vegetationStatus: 'Sécheresse' },
          { year: 2023, meanNdvi: 0.59, meanNdwi: 0.05, meanTempC: 15.8, totalPrecipMm: 540, no2Avg: 24.0, vegetationStatus: 'Récupération' },
          { year: 2024, meanNdvi: 0.70, meanNdwi: 0.15, meanTempC: 15.2, totalPrecipMm: 730, no2Avg: 22.0, vegetationStatus: 'Bonne' },
          { year: 2025, meanNdvi: 0.68, meanNdwi: 0.13, meanTempC: 15.6, totalPrecipMm: 670, no2Avg: 21.5, vegetationStatus: 'Stable' },
          { year: 2026, meanNdvi: 0.69, meanNdwi: 0.14, meanTempC: 15.4, totalPrecipMm: 700, no2Avg: 20.6, vegetationStatus: 'Rétablie' },
        ],
      },
      report: {
        title: `Rapport d'Analyse : ${params.title || 'Projet Spatial'}`,
        executiveSummary: `Synthèse de l'évolution environnementale sur la période 2018-2026 dans le secteur ${params.locationName || 'd\'étude'}.`,
        methodology: 'Traitement multispectral Sentinel-2 (L2A) et réanalyses climatiques ERA5 ECMWF.',
        conclusions: 'Observation d\'une forte résilience territoriale post-2022 et stabilisation des indices spectraux.',
        recommendations: [
          'Assurer le suivi régulier du couvert végétal par NDVI.',
          'Conserver les corridors écologiques et réservoirs d\'eau de surface.',
        ],
        citation: 'Copernicus Explorer • Projet Personnalisé',
        isGenerated: true,
      },
    };

    this.saveProject(newProject);
    this.setActiveProjectId(id);
    return newProject;
  }

  static deleteProject(id: string): void {
    const projects = this.getAllProjects().filter((p) => p.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
      if (this.getActiveProjectId() === id && projects.length > 0) {
        this.setActiveProjectId(projects[0].id);
      }
    } catch {
      // ignore
    }
  }

  static resetToDefaults(): AnalysisProject[] {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(SAMPLE_PROJECTS));
      this.setActiveProjectId(SAMPLE_PROJECTS[0].id);
    } catch {
      // ignore
    }
    return SAMPLE_PROJECTS;
  }
}
