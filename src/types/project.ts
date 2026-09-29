import { BoundingBox, GeoPoint, GeoPolygon, MissionType } from './copernicus';

export type ProjectStep = 'project' | 'zone' | 'data' | 'analyses' | 'results' | 'report';

export interface ExtremeEvent {
  id: string;
  period: string; // e.g. "Juin - Août 2022"
  year: number;
  type: 'DROUGHT' | 'HEATWAVE' | 'FLOOD' | 'POLLUTION_PEAK' | 'FROST';
  title: string;
  description: string;
  severity: 'MODERATE' | 'SEVERE' | 'EXTREME';
  impactNdviPercent: number; // e.g. -35%
  deltaTempC: number;        // e.g. +3.8°C
  deficitPrecipPercent: number; // e.g. -68%
}

export interface YearlyStat {
  year: number;
  meanNdvi: number;
  meanNdwi: number;
  meanTempC: number;
  totalPrecipMm: number;
  no2Avg: number;
  vegetationStatus: string;
}

export interface AnalysisProject {
  id: string;
  title: string;
  description: string;
  theme: 'VEGETATION' | 'CLIMATE_RISK' | 'HYDROLOGY' | 'FORESTRY' | 'URBAN_HEAT';
  createdAt: string;
  updatedAt: string;
  author: string;
  
  // 2. Zone d'étude
  zone: {
    name: string;
    region: string;
    description: string;
    bbox: BoundingBox;
    center: GeoPoint;
    areaKm2: number;
    polygon?: GeoPolygon;
    elevationAvgMeters: number;
    ecoregion: string;
  };

  // 3. Données & Période
  dataConfig: {
    startDate: string; // e.g. "2018-01-01"
    endDate: string;   // e.g. "2026-12-31"
    missions: MissionType[];
    maxCloudCover: number;
    processingLevel: string; // "L2A - Bottom of Atmosphere (BOA)"
    provider: string; // "Copernicus Data Space Ecosystem (CDSE)"
    resolutionMeters: number;
    acquiredScenesCount: number;
  };

  // 4. Analyses & Indices
  analyses: {
    indices: ('NDVI' | 'NDWI' | 'NBR' | 'TRUE_COLOR' | 'FALSE_COLOR')[];
    correlations: {
      vegTempCorrelation: number; // e.g. -0.72
      vegPrecipCorrelation: number; // e.g. +0.78
      airQualityIndexAvg: string;
    };
    detectedEvents: ExtremeEvent[];
  };

  // 5. Résultats & Comparaison temporelle
  results: {
    baselineYear: number; // e.g. 2018
    targetYear: number;   // e.g. 2022 (sécheresse)
    recentYear: number;   // e.g. 2026
    baselineNdvi: number; // 0.74
    targetNdvi: number;   // 0.48 (-35%)
    recentNdvi: number;   // 0.69
    longTermTrend: string;
    yearlyStats: YearlyStat[];
  };

  // 6. Rapport final
  report: {
    title: string;
    executiveSummary: string;
    methodology: string;
    conclusions: string;
    recommendations: string[];
    citation: string;
    isGenerated: boolean;
  };
}
