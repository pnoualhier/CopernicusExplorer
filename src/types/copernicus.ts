/**
 * Copernicus Explorer - Common Types & Data Models
 * Follows OGC STAC 1.0, OData v4 and Copernicus Data Space Ecosystem standards.
 */

export type MissionType = 
  | 'SENTINEL-1'
  | 'SENTINEL-2'
  | 'SENTINEL-3'
  | 'SENTINEL-5P'
  | 'SENTINEL-6'
  | 'ERA5-CLIMATE'
  | 'CAMS-ATMOSPHERE'
  | 'COPERNICUS-MARINE';

export type SpectralIndex = 'TRUE_COLOR' | 'FALSE_COLOR' | 'NDVI' | 'SWIR' | 'NDWI' | 'NDBI' | 'CUSTOM';

export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // GeoJSON [lng, lat]
}

export interface SearchFilters {
  mission: MissionType;
  collection?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  bbox: BoundingBox;
  point?: GeoPoint;
  maxCloudCover?: number; // 0 - 100 for optical
  orbitDirection?: 'ASCENDING' | 'DESCENDING' | 'ALL';
  polarization?: 'VV' | 'VH' | 'HH' | 'HV' | 'VV+VH' | 'HH+HV' | 'ALL';
  resolution?: number; // meters
}

export interface ProvenanceInfo {
  provider: string; // e.g. "Copernicus Data Space Ecosystem (CDSE)" | "ECMWF CDS" | "CAMS ADS" | "Mercator Ocean"
  service: string;  // e.g. "STAC API v1.0", "Sentinel Hub Process API", "ERA5-Land Hourly"
  collection: string;
  processingLevel: string; // "L1C", "L2A", "Reanalysis", "Near-Real-Time"
  spatialResolution: string; // "10m", "20m", "0.1° (~9km)", "0.25° (~31km)"
  temporalResolution: string; // "5 days", "hourly", "monthly"
  sensor: string; // "MSI", "C-SAR", "OLCI", "SLSTR", "TROPOMI", "Poseidon-4"
  license: string; // "CC-BY 4.0 / Copernicus Sentinel data and information"
  citation: string;
  sourceUrl: string;
  queryTimestamp: string;
}

export interface GeoObservation {
  id: string;
  title: string;
  mission: MissionType;
  collection: string;
  platform: string; // "Sentinel-2A", "Sentinel-1B", "Sentinel-5P", "ERA5"
  instrument: string;
  acquisitionDate: string; // ISO string
  bbox: BoundingBox;
  geometry?: GeoPolygon;
  cloudCover?: number;
  quicklookUrl?: string;
  thumbnailUrl?: string;
  sizeMb?: number;
  status: 'ONLINE' | 'ARCHIVED';
  
  // Sentinel-1 SAR Specifics
  sarDetails?: {
    mode: 'IW' | 'EW' | 'SM' | 'WV';
    polarization: 'VV' | 'VH' | 'HH' | 'HV' | 'VV+VH';
    orbitDirection: 'ASCENDING' | 'DESCENDING';
    relativeOrbitNumber: number;
    backscatterSigma0_dB?: number;
    coherence?: number;
  };

  // Sentinel-2 Optical Specifics
  opticalDetails?: {
    tileId: string;
    sunElevation: number;
    sunAzimuth: number;
    indices?: {
      ndviMean?: number;
      ndwiMean?: number;
      ndbiMean?: number;
      vegetationCoverPercent?: number;
    };
  };

  // Sentinel-3 & 6 specifics
  marineAltimetryDetails?: {
    seaSurfaceTemperature?: number; // °C
    chlorophyllA?: number; // mg/m³
    seaLevelAnomaly?: number; // cm
    significantWaveHeight?: number; // m
  };

  // Sentinel-5P Atmospheric
  atmosphereDetails?: {
    no2Column?: number; // mol/m²
    so2Column?: number; // mol/m²
    coColumn?: number;  // mol/m²
    o3TotalColumn?: number; // DU
    ch4Column?: number; // ppb
    aerosolIndex?: number;
    aqi?: number; // Air Quality Index 1-5
  };

  provenance: ProvenanceInfo;
  assets?: Record<string, { href: string; type: string; title: string }>;
}

export interface TimeSeriesPoint {
  date: string;
  ndvi?: number;
  ndwi?: number;
  cloudCover?: number;
  temperature?: number; // °C
  precipitation?: number; // mm
  soilMoisture?: number; // m³/m³
  solarRadiation?: number; // W/m²
  windSpeed?: number; // km/h
  no2?: number; // µg/m³
  pm25?: number; // µg/m³
  pm10?: number; // µg/m³
  sst?: number; // Sea surface temp °C
}

export interface ClimateClimatologyData {
  locationName: string;
  coordinates: GeoPoint;
  historicalBaselinePeriod: string; // "1991-2020"
  currentYear: number;
  baselineYearlyAvgTemp: number;
  recentYearlyAvgTemp: number;
  temperatureAnomaly: number;
  decadeTrends: { decade: string; avgTemp: number; anomaly: number; precipitationSum: number }[];
  monthlyComparison: {
    month: string;
    historicalMean: number;
    currentYear: number;
    historicalPrecip: number;
    currentPrecip: number;
  }[];
}

export interface AIAnalysisRequest {
  question?: string;
  locationName: string;
  coordinates: GeoPoint;
  period: { start: string; end: string };
  vegetationSummary: {
    meanNdvi: number;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE' | 'SEASONAL_DROP';
    dropMonth?: string;
    dropPercentage?: number;
  };
  climateSummary: {
    avgTemperature: number;
    tempAnomaly: number;
    totalPrecipitation: number;
    precipDeficitPercent: number;
    solarRadiationAvg: number;
  };
  atmosphereSummary?: {
    avgAqi: number;
    dominantPollutant?: string;
  };
  additionalContext?: string;
}

export interface AIAnalysisResponse {
  summary: string;
  vegetationDynamicsExplanation: string;
  climateCorrelationFactors: string[];
  anomaliesDetected: string[];
  scientificCaution: string; // Explicit non-causal disclaimer
  suggestedFurtherInquiries: string[];
  generatedAt: string;
}
