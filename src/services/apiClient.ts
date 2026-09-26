/**
 * Frontend Copernicus API Client
 * Calls backend proxy endpoints with offline caching and graceful fallback.
 */

import {
  SearchFilters,
  GeoObservation,
  TimeSeriesPoint,
  ClimateClimatologyData,
  AIAnalysisRequest,
  AIAnalysisResponse,
} from '../types/copernicus';

const STORAGE_PREFIX = 'copernicus_cache_';

export class CopernicusApiClient {
  static async search(filters: SearchFilters): Promise<{ results: GeoObservation[]; cached: boolean; source: string }> {
    const localKey = `${STORAGE_PREFIX}search_${filters.mission}_${filters.startDate}_${filters.endDate}`;

    try {
      const res = await fetch('/api/copernicus/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      // Cache last successful results for offline PWA browsing
      try {
        localStorage.setItem(localKey, JSON.stringify(data.results));
      } catch (e) {
        // quota exceeded fallback
      }

      return data;
    } catch (err) {
      console.warn('Network search failed, trying offline storage', err);
      const offline = localStorage.getItem(localKey);
      if (offline) {
        return { results: JSON.parse(offline), cached: true, source: 'OFFLINE_STORAGE' };
      }
      throw err;
    }
  }

  static async getTimeSeries(filters: SearchFilters): Promise<TimeSeriesPoint[]> {
    const localKey = `${STORAGE_PREFIX}ts_${filters.startDate}_${filters.endDate}`;

    try {
      const res = await fetch('/api/copernicus/timeseries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      try {
        localStorage.setItem(localKey, JSON.stringify(data.series));
      } catch (e) {}
      return data.series;
    } catch (err) {
      const offline = localStorage.getItem(localKey);
      if (offline) return JSON.parse(offline);
      throw err;
    }
  }

  static async getClimatology(lat: number, lng: number, name?: string): Promise<ClimateClimatologyData> {
    const localKey = `${STORAGE_PREFIX}clim_${lat.toFixed(2)}_${lng.toFixed(2)}`;

    try {
      const query = new URLSearchParams({ lat: lat.toString(), lng: lng.toString(), name: name || '' });
      const res = await fetch(`/api/copernicus/climatology?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      try {
        localStorage.setItem(localKey, JSON.stringify(data.data));
      } catch (e) {}
      return data.data;
    } catch (err) {
      const offline = localStorage.getItem(localKey);
      if (offline) return JSON.parse(offline);
      throw err;
    }
  }

  static async getCollections() {
    try {
      const res = await fetch('/api/copernicus/collections');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return { collections: [] };
    }
  }

  static async analyzeWithAI(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const res = await fetch('/api/copernicus/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(`AI Analysis failed with status ${res.status}`);
    }

    const data = await res.json();
    return data.result;
  }

  static async getHealth() {
    try {
      const res = await fetch('/api/copernicus/health');
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }
}
