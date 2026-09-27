/**
/**
 * System Management & Update API Router
 * Provides versioning metadata, update checks, and background sync status.
 */

import { Router, Request, Response } from 'express';

export const systemRouter = Router();

export const APP_METADATA = {
  name: 'Copernicus Explorer',
  version: '1.2.0',
  releaseDate: '27 septembre 2026',
  releaseDateISO: '2026-09-27',
  build: '2026.09.27-LTS',
  channel: 'production',
  status: 'STABLE',
  changelog: [
    {
      version: '1.2.0',
      date: '2026-09-27',
      highlights: [
        'Nouveau menu Hamburger ergonomique structuré par catégories',
        'Menu de paramètres système complet avec vérification et forçage de mise à jour',
        'Système de mises à jour automatiques en arrière-plan avec notifications discrètes',
        'Thème Clair haute lisibilité (Light Mode) et bascule Thème Sombre/Système',
        'Visite guidée interactive (Onboarding) pour les nouveaux explorateurs',
        'Aide contextuelle, infobulles scientifiques (tooltips) et glossaire télédétection',
        'Intégration native des fonds de carte CARTO (Dark, Voyager, Positron)',
      ],
    },
    {
      version: '1.1.0',
      date: '2026-09-26',
      highlights: [
        'Support PWA hors-ligne et installation sur smartphone/desktop',
        'Exports scientifiques aux formats GeoJSON, CSV, JSON et synthèses TXT',
        'Analyste environnemental multi-modal Gemini avec diagnostics écologiques',
        'Intégration CDSE STAC/OData, ECMWF ERA5, CAMS et Marine CMS',
      ],
    },
    {
      version: '1.0.0',
      date: '2026-09-25',
      highlights: [
        'Lancement initial de la suite unifiée Copernicus Explorer',
        'Visualiseur spectral multispectral (NDVI, NDWI, fausses couleurs)',
        'Cartographie Leaflet interactive avec emprise Bounding Box',
      ],
    },
  ],
};

// GET /api/system/version
systemRouter.get('/version', (req: Request, res: Response) => {
  res.json({
    ...APP_METADATA,
    serverTimestamp: new Date().toISOString(),
  });
});

// GET /api/system/check-updates
systemRouter.get('/check-updates', (req: Request, res: Response) => {
  const clientVersion = (req.query.current as string) || APP_METADATA.version;
  const isUpToDate = clientVersion === APP_METADATA.version;

  res.json({
    clientVersion,
    latestVersion: APP_METADATA.version,
    updateAvailable: !isUpToDate,
    releaseDate: APP_METADATA.releaseDate,
    releaseDateISO: APP_METADATA.releaseDateISO,
    checkedAt: new Date().toISOString(),
    channel: APP_METADATA.channel,
    releaseNotes: `Version ${APP_METADATA.version} : ${APP_METADATA.changelog[0].highlights.join(', ')}`,
    changelog: APP_METADATA.changelog,
  });
});

// POST /api/system/force-update
systemRouter.post('/force-update', (req: Request, res: Response) => {
  res.json({
    success: true,
    action: 'FORCE_UPDATE_TRIGGERED',
    message: 'Cache serveur synchronisé. Les clients recevront la version fraîche.',
    version: APP_METADATA.version,
    timestamp: new Date().toISOString(),
  });
});
