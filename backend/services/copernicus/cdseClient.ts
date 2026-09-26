/**
 * Copernicus Data Space Ecosystem (CDSE) Connector
 * Supports STAC API, OData v4 and openEO discovery.
 * Official Documentation: https://documentation.dataspace.copernicus.eu/APIs.html
 */

import { GeoObservation, SearchFilters, ProvenanceInfo } from '../../../src/types/copernicus';
import { Logger } from '../../utils/logger';

export class CdseClient {
  private static token: string | null = null;
  private static tokenExpiresAt = 0;

  private static STAC_ENDPOINT = 'https://catalogue.dataspace.copernicus.eu/stac/search';
  private static ODATA_ENDPOINT = 'https://catalogue.dataspace.copernicus.eu/odata/v1/Products';
  private static TOKEN_ENDPOINT = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';

  /**
   * Acquire OAuth2 access token using client credentials
   */
  static async getAccessToken(): Promise<string | null> {
    const clientId = process.env.COPERNICUS_CLIENT_ID;
    const clientSecret = process.env.COPERNICUS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return null;
    }

    if (this.token && Date.now() < this.tokenExpiresAt - 60000) {
      return this.token;
    }

    try {
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      });

      const response = await fetch(this.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!response.ok) {
        Logger.warn('CDSE Token retrieval failed', { status: response.status });
        return null;
      }

      const data = await response.json();
      this.token = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);
      return this.token;
    } catch (err) {
      Logger.error('CDSE Token network error', err);
      return null;
    }
  }

  /**
   * Search observations via STAC API v1.0
   */
  static async searchStac(filters: SearchFilters, correlationId: string): Promise<GeoObservation[] | null> {
    try {
      const stacCollection = this.mapMissionToStacCollection(filters.mission);
      const bbox = [filters.bbox.west, filters.bbox.south, filters.bbox.east, filters.bbox.north];
      const datetime = `${filters.startDate}T00:00:00Z/${filters.endDate}T23:59:59Z`;

      const requestBody: Record<string, unknown> = {
        collections: [stacCollection],
        bbox,
        datetime,
        limit: 20,
      };

      if (filters.mission === 'SENTINEL-2' && filters.maxCloudCover !== undefined) {
        requestBody['query'] = {
          'eo:cloud_cover': {
            lte: filters.maxCloudCover,
          },
        };
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/geo+json',
      };

      const token = await this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const startTime = Date.now();
      const response = await fetch(this.STAC_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(10000),
      });

      Logger.info('CDSE STAC query executed', {
        correlationId,
        endpoint: this.STAC_ENDPOINT,
        status: response.status,
        durationMs: Date.now() - startTime,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.features)) {
        return null;
      }

      return data.features.map((feature: any) => this.normalizeStacFeature(feature, filters.mission));
    } catch (err) {
      Logger.error('CDSE STAC request failed', err, { correlationId });
      return null;
    }
  }

  /**
   * Query OData Products API as fallback / metadata enrichment
   */
  static async queryOData(filters: SearchFilters, correlationId: string): Promise<GeoObservation[] | null> {
    try {
      const collectionName = this.mapMissionToODataCollection(filters.mission);
      const filterClause = `contains(Name,'${collectionName}') and ContentDate/Start ge ${filters.startDate}T00:00:00.000Z and ContentDate/Start le ${filters.endDate}T23:59:59.000Z`;
      const url = `${this.ODATA_ENDPOINT}?$filter=${encodeURIComponent(filterClause)}&$top=15&$orderby=ContentDate/Start desc`;

      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (!data || !Array.isArray(data.value)) return null;

      return data.value.map((item: any) => this.normalizeODataItem(item, filters.mission));
    } catch (err) {
      Logger.error('CDSE OData request failed', err, { correlationId });
      return null;
    }
  }

  private static mapMissionToStacCollection(mission: string): string {
    switch (mission) {
      case 'SENTINEL-1': return 'SENTINEL-1-GRD';
      case 'SENTINEL-2': return 'SENTINEL-2-L2A';
      case 'SENTINEL-3': return 'SENTINEL-3-OLCI';
      case 'SENTINEL-5P': return 'SENTINEL-5P-L2';
      default: return 'SENTINEL-2-L2A';
    }
  }

  private static mapMissionToODataCollection(mission: string): string {
    switch (mission) {
      case 'SENTINEL-1': return 'S1';
      case 'SENTINEL-2': return 'S2';
      case 'SENTINEL-3': return 'S3';
      case 'SENTINEL-5P': return 'S5P';
      default: return 'S2';
    }
  }

  private static normalizeStacFeature(feature: any, mission: any): GeoObservation {
    const props = feature.properties || {};
    const bbox = feature.bbox || [0, 0, 0, 0];

    const provenance: ProvenanceInfo = {
      provider: 'Copernicus Data Space Ecosystem (CDSE)',
      service: 'STAC Catalog API v1.0.0',
      collection: feature.collection || this.mapMissionToStacCollection(mission),
      processingLevel: props['processing:level'] || (mission === 'SENTINEL-2' ? 'L2A' : 'GRD'),
      spatialResolution: mission === 'SENTINEL-2' ? '10m' : '20m',
      temporalResolution: '5 days revisit',
      sensor: props['instruments']?.[0] || 'MSI',
      license: 'CC-BY 4.0 / Copernicus Sentinel data',
      citation: 'European Space Agency (ESA) Copernicus Sentinel Programme',
      sourceUrl: feature.links?.find((l: any) => l.rel === 'self')?.href || 'https://dataspace.copernicus.eu',
      queryTimestamp: new Date().toISOString(),
    };

    const quicklook = feature.assets?.thumbnail?.href || feature.assets?.rendered_preview?.href;

    return {
      id: feature.id || `cdse-${Math.random().toString(36).substring(2, 8)}`,
      title: props['title'] || feature.id,
      mission,
      collection: provenance.collection,
      platform: props['platform'] || (mission === 'SENTINEL-2' ? 'Sentinel-2A' : 'Sentinel-1A'),
      instrument: provenance.sensor,
      acquisitionDate: props['datetime'] || new Date().toISOString(),
      bbox: { west: bbox[0], south: bbox[1], east: bbox[2], north: bbox[3] },
      geometry: feature.geometry,
      cloudCover: props['eo:cloud_cover'] ?? 12,
      quicklookUrl: quicklook,
      status: 'ONLINE',
      provenance,
    };
  }

  private static normalizeODataItem(item: any, mission: any): GeoObservation {
    const provenance: ProvenanceInfo = {
      provider: 'Copernicus Data Space Ecosystem (CDSE)',
      service: 'OData v4 Catalog API',
      collection: this.mapMissionToODataCollection(mission),
      processingLevel: 'L2A',
      spatialResolution: '10m',
      temporalResolution: '5 days',
      sensor: mission === 'SENTINEL-1' ? 'C-SAR' : 'MSI',
      license: 'Copernicus Open Access',
      citation: 'Copernicus Data Space Ecosystem OData API',
      sourceUrl: `https://catalogue.dataspace.copernicus.eu/odata/v1/Products(${item.Id})`,
      queryTimestamp: new Date().toISOString(),
    };

    return {
      id: item.Id || `odata-${item.Name}`,
      title: item.Name,
      mission,
      collection: provenance.collection,
      platform: item.Name.startsWith('S1') ? 'Sentinel-1' : 'Sentinel-2',
      instrument: provenance.sensor,
      acquisitionDate: item.ContentDate?.Start || new Date().toISOString(),
      bbox: { west: -1, south: 43, east: 7, north: 51 },
      status: item.Online ? 'ONLINE' : 'ARCHIVED',
      sizeMb: Math.round((item.ContentLength || 600000000) / (1024 * 1024)),
      provenance,
    };
  }
}
