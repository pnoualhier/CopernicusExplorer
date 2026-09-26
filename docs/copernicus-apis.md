# Guide des APIs Copernicus & Endpoints Officiels

Ce document référence l'ensemble des endpoints officiels actuels vérifiés pour l'écosystème Copernicus.

## 1. Copernicus Data Space Ecosystem (CDSE)

Documentation officielle : https://documentation.dataspace.copernicus.eu/APIs.html

### A. STAC Catalog API (SpatioTemporal Asset Catalog v1.0.0)
- **Endpoint de Recherche** : `https://catalogue.dataspace.copernicus.eu/stac/search`
- **Méthode** : `POST` ou `GET`
- **Collections supportées** :
  - `SENTINEL-1-GRD` : Radar SAR mode IW, EW, SM
  - `SENTINEL-2-L2A` : Optique multispectrale corrigée de l'atmosphère (BOA)
  - `SENTINEL-3-OLCI` : Couleur de la terre et de l'océan
  - `SENTINEL-3-SLSTR` : Température de surface de la terre et de la mer
  - `SENTINEL-5P-L2` : Chimie atmosphérique TROPOMI

### B. OData API v4
- **Endpoint** : `https://catalogue.dataspace.copernicus.eu/odata/v1/Products`
- **Filtres OData** : `$filter=contains(Name,'S2') and ContentDate/Start ge 2024-01-01T00:00:00.000Z`

### C. Authentification CDSE
- **Token OAuth2 Endpoint** : `https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token`
- **Grant type** : `client_credentials`

### D. openEO
- **Endpoint** : `https://openeo.dataspace.copernicus.eu/openeo/1.2/`

---

## 2. Copernicus Climate Data Store (CDS / C3S)

Documentation : https://cds.climate.copernicus.eu/how-to-api

- **API URL** : `https://cds.climate.copernicus.eu/api`
- **Datasets clés** :
  - `reanalysis-era5-land` : Résolution 0.1° (~9 km), pas de temps horaire ou mensuel.
  - `reanalysis-era5-single-levels` : Résolution 0.25° (~31 km).

---

## 3. Copernicus Atmosphere Data Store (ADS / CAMS)

Documentation : https://ads.atmosphere.copernicus.eu/how-to-api

- **API URL** : `https://ads.atmosphere.copernicus.eu/api`
- **Datasets clés** :
  - `cams-europe-air-quality-forecasts` : Ensemble de 11 modèles régionaux européens (PM2.5, PM10, NO2, O3, SO2, CO).

---

## 4. Copernicus Marine Service (CMS / CMEMS)

Documentation : https://help.marine.copernicus.eu/

- **Service** : Global Ocean Physics Reanalysis and Forecast
- **Variables** : Sea Surface Temperature (SST), Sea Level Anomaly (SLA), Salinity, Currents, Wave Height.
