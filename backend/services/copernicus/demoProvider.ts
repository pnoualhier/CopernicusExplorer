/**
 * High-Fidelity Scientific Copernicus Simulation Provider
 * Generates physically consistent observations, time series and climatologies
 * based on geographic coordinates, seasonality, and official Copernicus product structures.
 */

import {
  GeoObservation,
  SearchFilters,
  TimeSeriesPoint,
  ClimateClimatologyData,
  ProvenanceInfo,
} from '../../../src/types/copernicus';

export class DemoProvider {
  /**
   * Search simulated realistic observations matching the query
   */
  static searchObservations(filters: SearchFilters): GeoObservation[] {
    const count = 8;
    const results: GeoObservation[] = [];
    const centerLat = (filters.bbox.south + filters.bbox.north) / 2;
    const centerLng = (filters.bbox.west + filters.bbox.east) / 2;

    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    const timeSpan = Math.max(1, endDate.getTime() - startDate.getTime());

    for (let i = 0; i < count; i++) {
      const itemDate = new Date(startDate.getTime() + (timeSpan * (i + 1)) / (count + 1));
      const dateStr = itemDate.toISOString().split('T')[0];
      const isoStr = itemDate.toISOString();

      results.push(this.buildObservation(filters.mission, i, dateStr, isoStr, centerLat, centerLng, filters));
    }

    return results;
  }

  private static buildObservation(
    mission: string,
    idx: number,
    dateStr: string,
    isoStr: string,
    lat: number,
    lng: number,
    filters: SearchFilters
  ): GeoObservation {
    const month = new Date(dateStr).getMonth(); // 0 - 11
    const seasonFactor = Math.sin(((month - 2) / 12) * 2 * Math.PI); // Peak in summer (July ~ month 6)
    const latFactor = Math.max(0, 1 - Math.abs(lat - 45) / 50);

    const delta = 0.25;
    const bbox = {
      west: Number((lng - delta).toFixed(4)),
      south: Number((lat - delta).toFixed(4)),
      east: Number((lng + delta).toFixed(4)),
      north: Number((lat + delta).toFixed(4)),
    };

    switch (mission) {
      case 'SENTINEL-1': {
        const mode = 'IW';
        const pol = (idx % 2 === 0 ? 'VV+VH' : 'VV') as 'VV+VH' | 'VV';
        const orbitDir = idx % 2 === 0 ? 'ASCENDING' : 'DESCENDING';
        const relOrbit = 1 + ((idx * 37) % 175);
        const backscatter = Number((-12.4 + seasonFactor * 2.1 - idx * 0.3).toFixed(2));
        const coherence = Number((0.68 - idx * 0.04 + (seasonFactor > 0 ? -0.1 : 0.05)).toFixed(2));

        const prov: ProvenanceInfo = {
          provider: 'Copernicus Data Space Ecosystem (CDSE)',
          service: 'Sentinel-1 SAR C-Band GRD Catalog',
          collection: 'SENTINEL-1-GRD-IW',
          processingLevel: 'Level-1 GRD (Ground Range Detected)',
          spatialResolution: '10m x 10m (IW mode)',
          temporalResolution: '6-12 days repeat cycle',
          sensor: 'C-SAR (Synthetic Aperture Radar, 5.405 GHz)',
          license: 'CC-BY 4.0 / Copernicus Sentinel data',
          citation: 'European Space Agency (ESA) Sentinel-1 SAR Mission',
          sourceUrl: `https://dataspace.copernicus.eu/browser/?lat=${lat.toFixed(3)}&lng=${lng.toFixed(3)}&zoom=10`,
          queryTimestamp: new Date().toISOString(),
        };

        return {
          id: `S1A_IW_GRDH_1SDV_${dateStr.replace(/-/g, '')}_${100000 + idx}`,
          title: `Sentinel-1A SAR IW GRD (${pol}, ${orbitDir})`,
          mission: 'SENTINEL-1',
          collection: 'SENTINEL-1-GRD',
          platform: 'Sentinel-1A',
          instrument: 'C-SAR',
          acquisitionDate: isoStr,
          bbox,
          status: 'ONLINE',
          sizeMb: 920 + idx * 15,
          sarDetails: {
            mode,
            polarization: pol,
            orbitDirection: orbitDir,
            relativeOrbitNumber: relOrbit,
            backscatterSigma0_dB: backscatter,
            coherence,
          },
          provenance: prov,
        };
      }

      case 'SENTINEL-3': {
        const prov: ProvenanceInfo = {
          provider: 'Copernicus Data Space Ecosystem (CDSE)',
          service: 'Sentinel-3 OLCI/SLSTR Marine & Land',
          collection: 'SENTINEL-3-SLSTR-WST',
          processingLevel: 'Level-2 Ocean & Land Surface Temp',
          spatialResolution: '500m (SLSTR) / 300m (OLCI)',
          temporalResolution: '1-2 days revisit',
          sensor: 'SLSTR / OLCI',
          license: 'Copernicus Open Access Licence',
          citation: 'EUMETSAT / ESA Copernicus Sentinel-3',
          sourceUrl: 'https://dataspace.copernicus.eu',
          queryTimestamp: new Date().toISOString(),
        };

        const sst = Number((16.8 + seasonFactor * 6.5 + (lat < 30 ? 6 : -4)).toFixed(1));
        const chloro = Number((0.45 + (seasonFactor < 0 ? 0.8 : 0.2)).toFixed(2));

        return {
          id: `S3B_SL_2_WST____${dateStr.replace(/-/g, '')}_${200000 + idx}`,
          title: `Sentinel-3B SLSTR SST / OLCI Color Product`,
          mission: 'SENTINEL-3',
          collection: 'SENTINEL-3-SLSTR',
          platform: 'Sentinel-3B',
          instrument: 'SLSTR / OLCI',
          acquisitionDate: isoStr,
          bbox,
          status: 'ONLINE',
          sizeMb: 450,
          marineAltimetryDetails: {
            seaSurfaceTemperature: sst,
            chlorophyllA: chloro,
          },
          provenance: prov,
        };
      }

      case 'SENTINEL-5P': {
        const prov: ProvenanceInfo = {
          provider: 'Copernicus Data Space Ecosystem (CDSE)',
          service: 'Copernicus Sentinel-5P TROPOMI Level-2',
          collection: 'SENTINEL-5P-L2-NO2',
          processingLevel: 'Level-2 Offline (OFFL)',
          spatialResolution: '5.5km x 3.5km',
          temporalResolution: 'Daily global coverage',
          sensor: 'TROPOMI (TROPOspheric Monitoring Instrument)',
          license: 'CC-BY 4.0 / Copernicus Sentinel data',
          citation: 'Royal Netherlands Meteorological Institute (KNMI) / ESA',
          sourceUrl: 'https://dataspace.copernicus.eu',
          queryTimestamp: new Date().toISOString(),
        };

        const no2 = Number((3.2e-5 + Math.random() * 2.5e-5).toExponential(3));
        const aqi = Math.min(5, Math.max(1, Math.round(2 + Math.random() * 2)));

        return {
          id: `S5P_OFFL_L2__NO2____${dateStr.replace(/-/g, '')}_${300000 + idx}`,
          title: `Sentinel-5P TROPOMI Tropospheric NO₂ / Air Quality`,
          mission: 'SENTINEL-5P',
          collection: 'SENTINEL-5P-L2',
          platform: 'Sentinel-5P',
          instrument: 'TROPOMI',
          acquisitionDate: isoStr,
          bbox,
          status: 'ONLINE',
          sizeMb: 310,
          atmosphereDetails: {
            no2Column: no2 as unknown as number,
            o3TotalColumn: Number((320 + Math.random() * 40).toFixed(1)),
            coColumn: Number((0.035 + Math.random() * 0.01).toFixed(3)),
            ch4Column: Number((1875 + Math.random() * 30).toFixed(0)),
            aerosolIndex: Number((0.4 + Math.random() * 0.8).toFixed(2)),
            aqi,
          },
          provenance: prov,
        };
      }

      case 'SENTINEL-6': {
        const prov: ProvenanceInfo = {
          provider: 'Copernicus Data Space Ecosystem / EUMETSAT',
          service: 'Sentinel-6 Michael Freilich Altimetry',
          collection: 'SENTINEL-6-POS4-L2-NTC',
          processingLevel: 'Level-2 Non Time Critical (NTC)',
          spatialResolution: 'Along-track ~300m',
          temporalResolution: '10 days repeat cycle',
          sensor: 'Poseidon-4 Radar Altimeter & AMR-C Radiometer',
          license: 'Copernicus Open Access',
          citation: 'NASA/ESA/EUMETSAT/NOAA Sentinel-6',
          sourceUrl: 'https://dataspace.copernicus.eu',
          queryTimestamp: new Date().toISOString(),
        };

        return {
          id: `S6A_P4_2__NTC_${dateStr.replace(/-/g, '')}_${400000 + idx}`,
          title: `Sentinel-6 Michael Freilich Altimetry & Sea Level`,
          mission: 'SENTINEL-6',
          collection: 'SENTINEL-6-ALTIMETRY',
          platform: 'Sentinel-6A Michael Freilich',
          instrument: 'Poseidon-4 Radar Altimeter',
          acquisitionDate: isoStr,
          bbox,
          status: 'ONLINE',
          sizeMb: 120,
          marineAltimetryDetails: {
            seaLevelAnomaly: Number((2.8 + Math.sin(idx) * 4.2).toFixed(1)), // cm
            significantWaveHeight: Number((1.8 + Math.random() * 1.4).toFixed(2)), // m
          },
          provenance: prov,
        };
      }

      case 'ERA5-CLIMATE': {
        const prov: ProvenanceInfo = {
          provider: 'ECMWF Copernicus Climate Change Service (C3S)',
          service: 'ERA5-Land Hourly & Monthly Reanalysis',
          collection: 'reanalysis-era5-land',
          processingLevel: 'Atmospheric Reanalysis v5',
          spatialResolution: '0.1° (~9 km)',
          temporalResolution: 'Hourly from 1950 to present',
          sensor: 'Numerical Weather Prediction Assimilation (IFS)',
          license: 'Copernicus C3S Licence / Open Access',
          citation: 'Muñoz-Sabater et al., 2021 (ECMWF C3S ERA5-Land)',
          sourceUrl: 'https://cds.climate.copernicus.eu/cdsapp#!/dataset/reanalysis-era5-land',
          queryTimestamp: new Date().toISOString(),
        };

        return {
          id: `ERA5_LAND_${dateStr.replace(/-/g, '')}_${500000 + idx}`,
          title: `ERA5-Land Climate Reanalysis (2m Temp & Rain)`,
          mission: 'ERA5-CLIMATE',
          collection: 'ERA5-LAND',
          platform: 'ECMWF Integrated Forecasting System (IFS)',
          instrument: 'Atmospheric Data Assimilation',
          acquisitionDate: isoStr,
          bbox,
          status: 'ONLINE',
          sizeMb: 85,
          provenance: prov,
        };
      }

      case 'CAMS-ATMOSPHERE': {
        const prov: ProvenanceInfo = {
          provider: 'ECMWF Copernicus Atmosphere Monitoring Service (CAMS)',
          service: 'CAMS European Air Quality Reanalysis & Forecast',
          collection: 'cams-europe-air-quality-forecasts',
          processingLevel: 'Multi-Model Regional Ensemble (11 European models)',
          spatialResolution: '0.1° (~10 km)',
          temporalResolution: 'Hourly forecasts & reanalysis',
          sensor: 'In-situ + Sentinel-5P + MODIS Assimilation',
          license: 'Copernicus CAMS Open Data Licence',
          citation: 'Copernicus Atmosphere Monitoring Service (CAMS)',
          sourceUrl: 'https://ads.atmosphere.copernicus.eu',
          queryTimestamp: new Date().toISOString(),
        };

        return {
          id: `CAMS_AQ_ENS_${dateStr.replace(/-/g, '')}_${600000 + idx}`,
          title: `CAMS Regional Air Quality Ensemble (PM2.5, PM10, NO₂, O₃)`,
          mission: 'CAMS-ATMOSPHERE',
          collection: 'CAMS-EUROPE-AQ',
          platform: 'CAMS Multi-Model Ensemble',
          instrument: 'Atmosphere Chemistry Transport Models',
          acquisitionDate: isoStr,
          bbox,
          status: 'ONLINE',
          sizeMb: 110,
          provenance: prov,
        };
      }

      case 'COPERNICUS-MARINE': {
        const prov: ProvenanceInfo = {
          provider: 'Mercator Ocean International / Copernicus Marine (CMS)',
          service: 'Global Ocean Physics Analysis and Forecast (CMEMS)',
          collection: 'GLOBAL_ANALYSISFORECAST_PHY_001_024',
          processingLevel: 'L4 Gridded Assimilated Analysis',
          spatialResolution: '1/12° (~8 km)',
          temporalResolution: 'Daily & Hourly',
          sensor: 'NEMO Ocean Model + Satellite altimetry & SST assimilation',
          license: 'Copernicus Marine Open Data',
          citation: 'Copernicus Marine Environment Monitoring Service (CMEMS)',
          sourceUrl: 'https://marine.copernicus.eu',
          queryTimestamp: new Date().toISOString(),
        };

        return {
          id: `CMEMS_GLOBAL_PHY_${dateStr.replace(/-/g, '')}_${700000 + idx}`,
          title: `Copernicus Marine Global Ocean Analysis (SST, Salinity, Currents)`,
          mission: 'COPERNICUS-MARINE',
          collection: 'CMEMS-GLOBAL-PHY',
          platform: 'NEMO v3.6 Ocean Engine',
          instrument: 'In-situ Argo Floats + Jason/Sentinel Altimeters',
          acquisitionDate: isoStr,
          bbox,
          status: 'ONLINE',
          sizeMb: 190,
          provenance: prov,
        };
      }

      // Default: Sentinel-2 Multispectral
      case 'SENTINEL-2':
      default: {
        const cloud = Number((4 + (idx * 5) % 35).toFixed(1));
        const baseNdvi = 0.35 + seasonFactor * 0.38 * latFactor;
        const ndviVal = Number(Math.max(0.12, Math.min(0.88, baseNdvi + (idx % 3 === 0 ? 0.05 : -0.03))).toFixed(3));
        const ndwiVal = Number((-0.25 - ndviVal * 0.4).toFixed(3));
        const ndbiVal = Number((-0.18 + (1 - ndviVal) * 0.25).toFixed(3));

        const prov: ProvenanceInfo = {
          provider: 'Copernicus Data Space Ecosystem (CDSE)',
          service: 'Sentinel-2 MSI Level-2A Bottom-Of-Atmosphere (BOA)',
          collection: 'SENTINEL-2-L2A',
          processingLevel: 'Level-2A (Sen2Cor Atmospherically Corrected)',
          spatialResolution: '10m (B02, B03, B04, B08) / 20m (B05-B07, B11, B12)',
          temporalResolution: '5 days with twin satellites (S2A + S2B)',
          sensor: 'MSI (MultiSpectral Instrument, 13 spectral bands)',
          license: 'CC-BY 4.0 / Copernicus Sentinel data',
          citation: 'European Space Agency (ESA) Sentinel-2 MSI Mission',
          sourceUrl: `https://dataspace.copernicus.eu/browser/?lat=${lat.toFixed(3)}&lng=${lng.toFixed(3)}&zoom=11`,
          queryTimestamp: new Date().toISOString(),
        };

        const tileCode = `T${Math.floor(30 + Math.abs(lng) / 6)}${String.fromCharCode(65 + Math.floor(Math.abs(lat) / 4))}${String.fromCharCode(70 + (idx % 15))}`;

        return {
          id: `S2A_MSIL2A_${dateStr.replace(/-/g, '')}T103021_N0500_R108_${tileCode}_${dateStr.replace(/-/g, '')}T120000`,
          title: `Sentinel-2A MSI L2A BOA Reflectance (Tile ${tileCode})`,
          mission: 'SENTINEL-2',
          collection: 'SENTINEL-2-L2A',
          platform: idx % 2 === 0 ? 'Sentinel-2A' : 'Sentinel-2B',
          instrument: 'MSI',
          acquisitionDate: isoStr,
          bbox,
          cloudCover: cloud,
          status: 'ONLINE',
          sizeMb: 820 + idx * 20,
          opticalDetails: {
            tileId: tileCode,
            sunElevation: Number((55 - Math.abs(lat - 20) * 0.5 + seasonFactor * 15).toFixed(1)),
            sunAzimuth: 142.5,
            indices: {
              ndviMean: ndviVal,
              ndwiMean: ndwiVal,
              ndbiMean: ndbiVal,
              vegetationCoverPercent: Math.round(ndviVal * 95),
            },
          },
          provenance: prov,
        };
      }
    }
  }

  /**
   * Produce comprehensive temporal time series (vegetation NDVI, climate ERA5, air quality)
   */
  static getTimeSeries(filters: SearchFilters): TimeSeriesPoint[] {
    const points: TimeSeriesPoint[] = [];
    const centerLat = (filters.bbox.south + filters.bbox.north) / 2;

    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    const daySpan = Math.max(15, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Generate points at regular intervals (e.g. 15-24 time points)
    const stepDays = Math.max(3, Math.floor(daySpan / 20));
    let curDate = new Date(startDate);

    while (curDate <= endDate) {
      const dateStr = curDate.toISOString().split('T')[0];
      const month = curDate.getMonth();
      const seasonFactor = Math.sin(((month - 2) / 12) * 2 * Math.PI); // peak summer
      const latFactor = Math.max(0, 1 - Math.abs(centerLat - 45) / 50);

      // Temperature based on latitude and seasonality
      const baseTemp = 14 + seasonFactor * 12 - (Math.abs(centerLat) - 40) * 0.4;
      const noise = (Math.sin(curDate.getDate() * 1.5) * 2.5);
      const temperature = Number((baseTemp + noise).toFixed(1));

      // Precipitation
      const rain = Number(Math.max(0, (seasonFactor < 0 ? 4.5 : 1.8) + Math.cos(curDate.getDate() * 0.8) * 4.2).toFixed(1));

      // NDVI
      const ndvi = Number(Math.max(0.15, Math.min(0.85, 0.38 + seasonFactor * 0.32 * latFactor + (Math.sin(month) * 0.05))).toFixed(3));
      const ndwi = Number((-0.2 - ndvi * 0.35).toFixed(3));

      points.push({
        date: dateStr,
        ndvi,
        ndwi,
        cloudCover: Number((10 + Math.abs(Math.sin(curDate.getDate())) * 40).toFixed(1)),
        temperature,
        precipitation: rain,
        solarRadiation: Number(Math.max(50, 180 + seasonFactor * 140).toFixed(0)),
        windSpeed: Number((12 + Math.abs(Math.sin(curDate.getDate() * 2)) * 16).toFixed(1)),
        soilMoisture: Number(Math.max(0.08, 0.28 - seasonFactor * 0.12).toFixed(2)),
        no2: Number((18 + (seasonFactor < 0 ? 12 : 2) + Math.sin(curDate.getDate()) * 6).toFixed(1)),
        pm25: Number((9 + Math.abs(Math.cos(curDate.getDate())) * 14).toFixed(1)),
        pm10: Number((16 + Math.abs(Math.cos(curDate.getDate())) * 22).toFixed(1)),
        sst: Number((baseTemp * 0.85 + 2).toFixed(1)),
      });

      curDate.setDate(curDate.getDate() + stepDays);
    }

    return points;
  }

  /**
   * Produce historical 30-year climatology and anomaly trends (ERA5-style)
   */
  static getClimatologyData(lat: number, lng: number, locationName = 'Zone sélectionnée'): ClimateClimatologyData {
    const baselineYearlyAvgTemp = Number((13.4 - (Math.abs(lat) - 42) * 0.4).toFixed(1));
    const recentYearlyAvgTemp = Number((baselineYearlyAvgTemp + 1.45).toFixed(1));
    const temperatureAnomaly = Number((recentYearlyAvgTemp - baselineYearlyAvgTemp).toFixed(2));

    const decades = [
      { decade: '1970-1979', avgTemp: Number((baselineYearlyAvgTemp - 0.42).toFixed(1)), anomaly: -0.42, precipitationSum: 780 },
      { decade: '1980-1989', avgTemp: Number((baselineYearlyAvgTemp - 0.18).toFixed(1)), anomaly: -0.18, precipitationSum: 765 },
      { decade: '1990-1999', avgTemp: Number((baselineYearlyAvgTemp + 0.12).toFixed(1)), anomaly: 0.12, precipitationSum: 745 },
      { decade: '2000-2009', avgTemp: Number((baselineYearlyAvgTemp + 0.54).toFixed(1)), anomaly: 0.54, precipitationSum: 720 },
      { decade: '2010-2019', avgTemp: Number((baselineYearlyAvgTemp + 0.98).toFixed(1)), anomaly: 0.98, precipitationSum: 695 },
      { decade: '2020-2025', avgTemp: Number((baselineYearlyAvgTemp + 1.45).toFixed(1)), anomaly: 1.45, precipitationSum: 670 },
    ];

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyComparison = months.map((m, idx) => {
      const season = Math.sin(((idx - 1.5) / 12) * 2 * Math.PI);
      const histMean = Number((baselineYearlyAvgTemp + season * 10).toFixed(1));
      const curYear = Number((histMean + 1.2 + (idx === 6 || idx === 7 ? 0.9 : 0.2)).toFixed(1));
      const histPrecip = Math.round(55 + (season < 0 ? 25 : -10));
      const curPrecip = Math.round(histPrecip * (idx === 6 || idx === 7 ? 0.65 : 0.92));

      return {
        month: m,
        historicalMean: histMean,
        currentYear: curYear,
        historicalPrecip: histPrecip,
        currentPrecip: curPrecip,
      };
    });

    return {
      locationName,
      coordinates: { lat, lng },
      historicalBaselinePeriod: '1991-2020 (WMO Climatological Standard Normals)',
      currentYear: 2025,
      baselineYearlyAvgTemp,
      recentYearlyAvgTemp,
      temperatureAnomaly,
      decadeTrends: decades,
      monthlyComparison,
    };
  }
}
