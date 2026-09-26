# Architecture de Copernicus Explorer

Copernicus Explorer est une plateforme web Progressive Web App (PWA) modulaire, résiliente et sécurisée conçue pour unifier les différents services et APIs de l'écosystème Copernicus.

## 1. Schéma d'Architecture Globale

```text
┌────────────────────────────────────────────────────────┐
│                   Navigateur / PWA                     │
│  - React 19 + TypeScript + Tailwind CSS               │
│  - Map GIS Leaflet (WGS84 / EPSG:4326)                │
│  - Visualiseur multispectral & indices (NDVI, NDWI)   │
│  - Graphiques temporels scientifiques multi-capteurs  │
│  - Service Worker (vite-plugin-pwa) & Cache Offline    │
└───────────────────────────┬────────────────────────────┘
                            │ Requêtes sécurisées /api/*
                            ▼
┌────────────────────────────────────────────────────────┐
│               Backend Proxy (Express + Node.js)        │
│  - Protection des identifiants (secrets jamais au client)│
│  - Rate Limiting (60 req/min/IP)                       │
│  - Cache LRU en mémoire / Redis                        │
│  - Découverte dynamique de collections                 │
│  - Validation géospatiale & assainissement             │
│  - Observabilité (logs structurés, correlation IDs)    │
└───────┬──────────────┬──────────────┬──────────────┬───┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│  CDSE STAC   ││  C3S / CDS   ││  CAMS / ADS  ││ Mercator CMS │
│   & OData    ││ ERA5-Land    ││ Qualité Air  ││  Océans PHY  │
│  Sentinel 1-6││  Climat      ││  Atmosphère  ││  Altimétrie  │
└──────────────┘└──────────────┘└──────────────┘└──────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────────┐
                        │   Module IA (Gemini 3.8)     │
                        │ Corrélations multi-capteurs  │
                        │ Rigueur scientifique non-    │
                        │ causale obligatoire          │
                        └──────────────────────────────┘
```

## 2. Principes Fondamentaux

1. **Isolation des Secrets** : Aucun token OAuth, clé CDS ou identifiant Copernicus n'est transmis au navigateur. Tout transite par le proxy Express (`/api/copernicus/*`).
2. **Mode Dégradé / Démo Automatique** : En l'absence de clés ou si l'API externe subit une panne de service ou un quota dépassé, le fournisseur scientifique de simulation `DemoProvider` prend immédiatement le relais avec des valeurs cohérentes (saisonnalité, latitude, normales climatiques).
3. **PWA et Résilience Hors-Ligne** : Cache intelligent des requêtes et dernières recherches pour consultation hors connexion.
