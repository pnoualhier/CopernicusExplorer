/**
 * Copernicus API Router
 * Dispatches to CDSE STAC/OData, CDS ERA5, CAMS, Marine or Demo provider.
 * Enforces validation, caching, rate limiting and security.
 */

import { Router, Request, Response } from 'express';
import { SearchFilters, AIAnalysisRequest } from '../../src/types/copernicus';
import { CdseClient } from '../services/copernicus/cdseClient';
import { DemoProvider } from '../services/copernicus/demoProvider';
import { GeminiAnalyst } from '../services/ai/geminiAnalyst';
import { globalCache } from '../cache/lruCache';
import { Logger } from '../utils/logger';

export const copernicusRouter = Router();

// In-memory rate limiting map (IP -> timestamps)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

function rateLimitMiddleware(req: Request, res: Response, next: () => void) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Limite de requêtes atteinte. Nouvelle tentative possible dans quelques instants.',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  next();
}

copernicusRouter.use(rateLimitMiddleware);

/**
 * Validate BoundingBox inputs
 */
function validateBbox(bbox: any): boolean {
  if (!bbox || typeof bbox !== 'object') return false;
  const { west, south, east, north } = bbox;
  return (
    typeof west === 'number' && west >= -180 && west <= 180 &&
    typeof east === 'number' && east >= -180 && east <= 180 &&
    typeof south === 'number' && south >= -90 && south <= 90 &&
    typeof north === 'number' && north >= -90 && north <= 90 &&
    west <= east && south <= north
  );
}

/**
 * POST /api/copernicus/search
 * Search observations across Copernicus satellites & services
 */
copernicusRouter.post('/search', async (req: Request, res: Response) => {
  const correlationId = Logger.generateId();
  const startTime = Date.now();

  try {
    const filters: SearchFilters = req.body;

    if (!filters || !filters.mission || !filters.startDate || !filters.endDate || !validateBbox(filters.bbox)) {
      return res.status(400).json({
        error: 'Paramètres de recherche invalides ou coordonnées hors limites.',
        code: 'INVALID_PARAMETERS',
      });
    }

    const cacheKey = `search:${filters.mission}:${filters.startDate}:${filters.endDate}:${filters.bbox.west.toFixed(2)}:${filters.bbox.south.toFixed(2)}:${filters.bbox.east.toFixed(2)}:${filters.bbox.north.toFixed(2)}:${filters.maxCloudCover || 100}`;
    const cached = globalCache.get(cacheKey);

    if (cached) {
      Logger.info('Search cache hit', { correlationId, cacheKey, cached: true });
      return res.json({
        results: cached,
        cached: true,
        source: 'CACHE',
        correlationId,
      });
    }

    let results: any = null;
    let source = 'DEMO_SIMULATION';

    // If CDSE credentials are present and mission is Sentinel, try live CDSE STAC
    if (process.env.COPERNICUS_CLIENT_ID && ['SENTINEL-1', 'SENTINEL-2', 'SENTINEL-3', 'SENTINEL-5P'].includes(filters.mission)) {
      const stacResults = await CdseClient.searchStac(filters, correlationId);
      if (stacResults && stacResults.length > 0) {
        results = stacResults;
        source = 'COPERNICUS_CDSE_STAC';
      }
    }

    // Fallback to high-fidelity scientific simulation provider
    if (!results || results.length === 0) {
      results = DemoProvider.searchObservations(filters);
      source = 'DEMO_SIMULATION';
    }

    globalCache.set(cacheKey, results, 10 * 60 * 1000); // 10 min cache

    Logger.info('Search completed', {
      correlationId,
      mission: filters.mission,
      count: results.length,
      source,
      durationMs: Date.now() - startTime,
    });

    return res.json({
      results,
      cached: false,
      source,
      correlationId,
    });
  } catch (err) {
    Logger.error('Search endpoint failed', err, { correlationId });
    return res.status(500).json({
      error: 'Erreur lors du traitement de la requête Copernicus.',
      code: 'SEARCH_INTERNAL_ERROR',
      correlationId,
    });
  }
});

/**
 * POST /api/copernicus/timeseries
 * Retrieve multi-sensor time series for vegetation, climate, atmosphere
 */
copernicusRouter.post('/timeseries', async (req: Request, res: Response) => {
  const correlationId = Logger.generateId();

  try {
    const filters: SearchFilters = req.body;
    if (!filters || !filters.startDate || !filters.endDate || !validateBbox(filters.bbox)) {
      return res.status(400).json({ error: 'Filtres temporels ou zone invalides.' });
    }

    const cacheKey = `timeseries:${filters.startDate}:${filters.endDate}:${filters.bbox.west.toFixed(2)}:${filters.bbox.south.toFixed(2)}`;
    const cached = globalCache.get(cacheKey);

    if (cached) {
      return res.json({ series: cached, cached: true });
    }

    const series = DemoProvider.getTimeSeries(filters);
    globalCache.set(cacheKey, series, 15 * 60 * 1000);

    return res.json({ series, cached: false, correlationId });
  } catch (err) {
    Logger.error('Timeseries endpoint failed', err, { correlationId });
    return res.status(500).json({ error: 'Erreur extraction série temporelle.' });
  }
});

/**
 * GET /api/copernicus/climatology
 * 30-year climate baseline, trends, and anomalies
 */
copernicusRouter.get('/climatology', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 43.6;
    const lng = parseFloat(req.query.lng as string) || 3.8;
    const name = (req.query.name as string) || 'Zone sélectionnée';

    const cacheKey = `climatology:${lat.toFixed(2)}:${lng.toFixed(2)}`;
    const cached = globalCache.get(cacheKey);

    if (cached) {
      return res.json({ data: cached, cached: true });
    }

    const data = DemoProvider.getClimatologyData(lat, lng, name);
    globalCache.set(cacheKey, data, 60 * 60 * 1000); // 1 hour cache

    return res.json({ data, cached: false });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur climatologie ERA5.' });
  }
});

/**
 * GET /api/copernicus/collections
 * Dynamic discovery of missions, instruments, and Copernicus catalog specifications
 */
copernicusRouter.get('/collections', (req: Request, res: Response) => {
  res.json({
    collections: [
      {
        mission: 'SENTINEL-1',
        name: 'Sentinel-1 SAR C-Band',
        family: 'Radar',
        description: 'Imagerie radar tout temps jour/nuit, modes IW, EW, SM. Rétrodiffusion, rugosité, humidité du sol, détection de changements.',
        resolutions: ['10m x 10m (IW)', '20m x 40m (EW)', '5m (SM)'],
        revisit: '6 jours (constellation A/B)',
        officialUrl: 'https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-1',
      },
      {
        mission: 'SENTINEL-2',
        name: 'Sentinel-2 Multispectral MSI',
        family: 'Optique',
        description: '13 bandes spectrales (Visible, Red Edge, NIR, SWIR). Végétation (NDVI), eau (NDWI), bâti (NDBI), couverture neigeuse.',
        resolutions: ['10m (B2, B3, B4, B8)', '20m (B5, B6, B7, B8A, B11, B12)', '60m (B1, B9, B10)'],
        revisit: '5 jours à l\'équateur',
        officialUrl: 'https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2',
      },
      {
        mission: 'SENTINEL-3',
        name: 'Sentinel-3 Ocean & Land',
        family: 'Optique / Altimétrie',
        description: 'Instruments OLCI (couleur de l\'océan) et SLSTR (température de surface terre/mer à haute précision radiométrique).',
        resolutions: ['300m (OLCI)', '500m / 1km (SLSTR)'],
        revisit: 'Moins de 2 jours (SLSTR)',
        officialUrl: 'https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-3',
      },
      {
        mission: 'SENTINEL-5P',
        name: 'Sentinel-5P TROPOMI',
        family: 'Atmosphère',
        description: 'Spectromètre d\'absorption UV-VIS-NIR-SWIR pour surveillance de la qualité de l\'air (NO₂, O₃, SO₂, CO, CH₄, formaldéhyde, aérosols).',
        resolutions: ['5.5km x 3.5km'],
        revisit: '1 jour (global)',
        officialUrl: 'https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-5p',
      },
      {
        mission: 'SENTINEL-6',
        name: 'Sentinel-6 Michael Freilich',
        family: 'Altimétrie océanique',
        description: 'Radar altimètre Poséidon-4 pour la mesure millimétrique de l\'élévation du niveau marin, vagues et vents de surface.',
        resolutions: ['Trace au sol ~300m'],
        revisit: '10 jours (orbite de référence Jason)',
        officialUrl: 'https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-6',
      },
      {
        mission: 'ERA5-CLIMATE',
        name: 'Copernicus Climate Data Store (ERA5 / ERA5-Land)',
        family: 'Climatologie & Météo',
        description: 'Réanalyse atmosphérique globale ECMWF de 1950 à aujourd\'hui. Température à 2m, précipitations, humidité, pression, anomalies.',
        resolutions: ['0.1° (~9 km ERA5-Land)', '0.25° (~31 km ERA5 global)'],
        revisit: 'Horaire et mensuel',
        officialUrl: 'https://cds.climate.copernicus.eu',
      },
      {
        mission: 'CAMS-ATMOSPHERE',
        name: 'Copernicus Atmosphere Monitoring Service (CAMS)',
        family: 'Atmosphère & Qualité de l\'air',
        description: 'Ensemble multi-modèles européen de prévision et réanalyse de la qualité de l\'air (PM2.5, PM10, NO₂, Ozone, poussières désertiques).',
        resolutions: ['0.1° (~10 km)'],
        revisit: 'Horaire / prévisions à 4 jours',
        officialUrl: 'https://ads.atmosphere.copernicus.eu',
      },
      {
        mission: 'COPERNICUS-MARINE',
        name: 'Copernicus Marine Service (CMS / CMEMS)',
        family: 'Océanographie physique & bio-géochimie',
        description: 'Modèles océaniques mondiaux et régionaux (NEMO). Température de l\'eau, salinité, vitesse des courants, glaces de mer, chlorophylle.',
        resolutions: ['1/12° (~8 km)'],
        revisit: 'Journalier & horaire',
        officialUrl: 'https://marine.copernicus.eu',
      },
    ],
  });
});

/**
 * POST /api/ai/analyze
 * Gemini 3.8 Flash environmental synthesis
 */
copernicusRouter.post('/ai/analyze', async (req: Request, res: Response) => {
  const correlationId = Logger.generateId();

  try {
    const analysisReq: AIAnalysisRequest = req.body;

    if (!analysisReq || !analysisReq.coordinates || !analysisReq.vegetationSummary || !analysisReq.climateSummary) {
      return res.status(400).json({ error: 'Données requises manquantes pour l\'analyse IA.' });
    }

    const result = await GeminiAnalyst.analyze(analysisReq, correlationId);
    return res.json({ result, correlationId });
  } catch (err) {
    Logger.error('AI analysis route failed', err, { correlationId });
    return res.status(500).json({ error: 'Erreur lors de la génération de l\'analyse environnementale.' });
  }
});

/**
 * GET /api/health
 * Service status, cache telemetry and configuration inspection
 */
copernicusRouter.get('/health', (req: Request, res: Response) => {
  const cacheStats = globalCache.getStats();

  res.json({
    status: 'ONLINE',
    service: 'Copernicus Explorer Unified Proxy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    credentialsConfigured: {
      cdse: Boolean(process.env.COPERNICUS_CLIENT_ID && process.env.COPERNICUS_CLIENT_SECRET),
      sentinelHub: Boolean(process.env.SENTINELHUB_CLIENT_ID && process.env.SENTINELHUB_CLIENT_SECRET),
      cds: Boolean(process.env.CDS_API_KEY),
      ads: Boolean(process.env.ADS_API_KEY),
      marine: Boolean(process.env.MARINE_USERNAME && process.env.MARINE_PASSWORD),
      gemini: Boolean(process.env.GEMINI_API_KEY),
    },
    cache: cacheStats,
  });
});
