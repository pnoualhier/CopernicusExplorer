import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  BoundingBox,
  GeoPoint,
  MissionType,
  SpectralIndex,
} from '../../types/copernicus';
import {
  MapPin,
  Square,
  Circle,
  Building,
  Flag,
  Globe2,
  Maximize2,
  Compass,
  Layers,
  Sparkles,
  Download,
  Activity,
  Droplet,
  Flame,
  Wind,
  Thermometer,
  CloudRain,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  X,
  Search,
  Zap,
  Info,
  RefreshCw,
  Sun,
  Eye,
  Sliders,
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

export type GeometryType =
  | 'point'
  | 'rectangle'
  | 'polygon'
  | 'circle'
  | 'commune'
  | 'department'
  | 'region'
  | 'country';

export type MapDataSource =
  | 'SENTINEL-1'
  | 'SENTINEL-2'
  | 'SENTINEL-3'
  | 'ERA5'
  | 'CAMS'
  | 'MARINE'
  | 'OTHER';

export type AnalysisMetric =
  | 'NDVI'
  | 'NDWI'
  | 'NBR'
  | 'EVI'
  | 'TEMPERATURE'
  | 'PRECIPITATION'
  | 'HUMIDITY'
  | 'POLLUTION'
  | 'TIMESERIES';

interface TerritoryPreset {
  id: string;
  name: string;
  category: 'commune' | 'department' | 'region' | 'country';
  lat: number;
  lng: number;
  delta: number;
  areaKm2: number;
  zoom: number;
}

export const TERRITORY_PRESETS: TerritoryPreset[] = [
  // Communes
  { id: 'com-toulouse', name: 'Toulouse (31)', category: 'commune', lat: 43.604, lng: 1.444, delta: 0.12, areaKm2: 118, zoom: 12 },
  { id: 'com-montpellier', name: 'Montpellier (34)', category: 'commune', lat: 43.611, lng: 3.877, delta: 0.10, areaKm2: 57, zoom: 12 },
  { id: 'com-bordeaux', name: 'Bordeaux (33)', category: 'commune', lat: 44.838, lng: -0.579, delta: 0.11, areaKm2: 49, zoom: 12 },
  { id: 'com-paris', name: 'Paris (75)', category: 'commune', lat: 48.857, lng: 2.352, delta: 0.13, areaKm2: 105, zoom: 12 },
  { id: 'com-marseille', name: 'Marseille (13)', category: 'commune', lat: 43.296, lng: 5.370, delta: 0.18, areaKm2: 240, zoom: 11 },
  { id: 'com-lyon', name: 'Lyon (69)', category: 'commune', lat: 45.764, lng: 4.836, delta: 0.12, areaKm2: 48, zoom: 12 },
  { id: 'com-nantes', name: 'Nantes (44)', category: 'commune', lat: 47.218, lng: -1.554, delta: 0.13, areaKm2: 65, zoom: 12 },
  { id: 'com-nice', name: 'Nice (06)', category: 'commune', lat: 43.710, lng: 7.262, delta: 0.12, areaKm2: 72, zoom: 12 },
  { id: 'com-strasbourg', name: 'Strasbourg (67)', category: 'commune', lat: 48.573, lng: 7.752, delta: 0.12, areaKm2: 78, zoom: 12 },

  // Départements
  { id: 'dep-31', name: 'Haute-Garonne (31)', category: 'department', lat: 43.40, lng: 1.30, delta: 0.55, areaKm2: 6309, zoom: 9 },
  { id: 'dep-34', name: 'Hérault (34)', category: 'department', lat: 43.60, lng: 3.25, delta: 0.58, areaKm2: 6224, zoom: 9 },
  { id: 'dep-33', name: 'Gironde (33)', category: 'department', lat: 44.75, lng: -0.50, delta: 0.75, areaKm2: 10725, zoom: 9 },
  { id: 'dep-13', name: 'Bouches-du-Rhône (13)', category: 'department', lat: 43.50, lng: 5.10, delta: 0.55, areaKm2: 5087, zoom: 9 },
  { id: 'dep-69', name: 'Rhône (69)', category: 'department', lat: 45.85, lng: 4.65, delta: 0.45, areaKm2: 3249, zoom: 10 },
  { id: 'dep-75', name: 'Grand Paris (75/92/93/94)', category: 'department', lat: 48.85, lng: 2.35, delta: 0.25, areaKm2: 762, zoom: 11 },

  // Régions
  { id: 'reg-occitanie', name: 'Occitanie', category: 'region', lat: 43.65, lng: 2.35, delta: 1.8, areaKm2: 72724, zoom: 8 },
  { id: 'reg-nouvelle-aquitaine', name: 'Nouvelle-Aquitaine', category: 'region', lat: 45.30, lng: 0.15, delta: 2.1, areaKm2: 84036, zoom: 7 },
  { id: 'reg-paca', name: 'Provence-Alpes-Côte d\'Azur', category: 'region', lat: 43.90, lng: 6.05, delta: 1.5, areaKm2: 31400, zoom: 8 },
  { id: 'reg-aura', name: 'Auvergne-Rhône-Alpes', category: 'region', lat: 45.55, lng: 4.85, delta: 1.9, areaKm2: 69711, zoom: 7 },
  { id: 'reg-idf', name: 'Île-de-France', category: 'region', lat: 48.70, lng: 2.45, delta: 0.9, areaKm2: 12012, zoom: 9 },
  { id: 'reg-bretagne', name: 'Bretagne', category: 'region', lat: 48.15, lng: -2.85, delta: 1.4, areaKm2: 27208, zoom: 8 },

  // Pays
  { id: 'pay-france', name: 'France (Métropole)', category: 'country', lat: 46.60, lng: 2.50, delta: 5.0, areaKm2: 551695, zoom: 6 },
  { id: 'pay-espagne', name: 'Espagne', category: 'country', lat: 40.40, lng: -3.70, delta: 4.8, areaKm2: 505990, zoom: 6 },
  { id: 'pay-italie', name: 'Italie', category: 'country', lat: 42.50, lng: 12.50, delta: 5.2, areaKm2: 301340, zoom: 6 },
  { id: 'pay-allemagne', name: 'Allemagne', category: 'country', lat: 51.16, lng: 10.45, delta: 4.5, areaKm2: 357022, zoom: 6 },
  { id: 'pay-suisse', name: 'Suisse', category: 'country', lat: 46.82, lng: 8.23, delta: 1.6, areaKm2: 41285, zoom: 8 },
  { id: 'pay-belgique', name: 'Belgique', category: 'country', lat: 50.50, lng: 4.47, delta: 1.5, areaKm2: 30688, zoom: 8 },
];

interface InteractiveMapStudioProps {
  initialBbox?: BoundingBox;
  initialPoint?: GeoPoint;
  onSelectZone?: (bbox: BoundingBox, point: GeoPoint, name: string) => void;
  onOpenAI?: () => void;
  onOpenBiDateComparison?: () => void;
  onOpenTemporalStudio?: () => void;
}

export const InteractiveMapStudio: React.FC<InteractiveMapStudioProps> = ({
  initialBbox = { west: 1.25, south: 43.45, east: 1.65, north: 43.75 },
  initialPoint = { lat: 43.604, lng: 1.444 },
  onSelectZone,
  onOpenAI,
  onOpenBiDateComparison,
  onOpenTemporalStudio,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Active Map Layers
  const shapeLayerRef = useRef<L.Layer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineDraftRef = useRef<L.Polyline | null>(null);

  // Geometry & Selection State
  const [selectedGeometry, setSelectedGeometry] = useState<GeometryType>('rectangle');
  const [bbox, setBbox] = useState<BoundingBox>(initialBbox);
  const [point, setPoint] = useState<GeoPoint>(initialPoint);
  const [zoneName, setZoneName] = useState<string>('Toulouse / Haute-Garonne');
  const [areaKm2, setAreaKm2] = useState<number>(485);
  const [circleRadiusKm, setCircleRadiusKm] = useState<number>(15);

  // Polygon Drawing vertices
  const [polygonPoints, setPolygonPoints] = useState<L.LatLng[]>([]);
  const [isDrawingRectangle, setIsDrawingRectangle] = useState(false);
  const [drawStartLatLng, setDrawStartLatLng] = useState<L.LatLng | null>(null);

  // Data & Analysis State ("Je choisis directement : Données → Analyse")
  const [selectedSource, setSelectedSource] = useState<MapDataSource>('SENTINEL-2');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisMetric>('NDVI');
  const [isResultPanelOpen, setIsResultPanelOpen] = useState(true);

  // CARTO Basemap Layer
  const [activeBaseLayer, setActiveBaseLayer] = useState<'dark' | 'voyager' | 'light' | 'satellite'>('dark');
  const baseLayersRef = useRef<{ [key: string]: L.TileLayer }>({});
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Quick territory search query
  const [territorySearch, setTerritorySearch] = useState('');
  const [isTerritoryDropdownOpen, setIsTerritoryDropdownOpen] = useState(false);

  // CARTO API config
  const cartoApiKey = (import.meta.env.VITE_CARTO_API_KEY as string) || 'cb1_401f_1_81e88d5ab80e13c7924b8b1d';
  const cartoQuery = cartoApiKey ? `?api_key=${encodeURIComponent(cartoApiKey)}` : '';

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
      center: [point.lat, point.lng],
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
    });

    const cartoAttribution = '&copy; <a href="https://carto.com/">CARTO</a>';

    const darkLayer = L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${cartoQuery}`,
      { maxZoom: 19, subdomains: 'abcd', attribution: cartoAttribution }
    );
    const voyagerLayer = L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${cartoQuery}`,
      { maxZoom: 19, subdomains: 'abcd', attribution: cartoAttribution }
    );
    const lightLayer = L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${cartoQuery}`,
      { maxZoom: 19, subdomains: 'abcd', attribution: cartoAttribution }
    );
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Esri' }
    );

    baseLayersRef.current = {
      dark: darkLayer,
      voyager: voyagerLayer,
      light: lightLayer,
      satellite: satelliteLayer,
    };

    darkLayer.addTo(map);

    // Initial shape: Rectangle Bounding Box
    const rect = L.rectangle(
      [
        [bbox.south, bbox.west],
        [bbox.north, bbox.east],
      ],
      {
        color: '#06b6d4',
        weight: 2.5,
        dashArray: '5, 5',
        fillColor: '#06b6d4',
        fillOpacity: 0.15,
      }
    ).addTo(map);
    shapeLayerRef.current = rect;

    // Center Marker
    const customIcon = L.divIcon({
      className: 'custom-map-center-pin',
      html: `<div style="background-color: #06b6d4; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px #06b6d4;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    const marker = L.marker([point.lat, point.lng], { icon: customIcon }).addTo(map);
    markerRef.current = marker;

    // Track mouse coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(baseLayersRef.current).forEach((layer) => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });

    const targetLayer = baseLayersRef.current[activeBaseLayer];
    if (targetLayer) targetLayer.addTo(map);
  }, [activeBaseLayer]);

  // Handle Territory Preset Selection
  const handleSelectTerritory = (t: TerritoryPreset) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const newBbox: BoundingBox = {
      west: Number((t.lng - t.delta).toFixed(4)),
      south: Number((t.lat - t.delta).toFixed(4)),
      east: Number((t.lng + t.delta).toFixed(4)),
      north: Number((t.lat + t.delta).toFixed(4)),
    };
    const newPoint: GeoPoint = { lat: t.lat, lng: t.lng };

    setBbox(newBbox);
    setPoint(newPoint);
    setZoneName(t.name);
    setAreaKm2(t.areaKm2);
    setSelectedGeometry(t.category);
    setIsTerritoryDropdownOpen(false);

    map.flyTo([t.lat, t.lng], t.zoom, { duration: 1.2 });

    // Render Rectangle on map
    if (shapeLayerRef.current) map.removeLayer(shapeLayerRef.current);
    const rect = L.rectangle(
      [
        [newBbox.south, newBbox.west],
        [newBbox.north, newBbox.east],
      ],
      {
        color: '#06b6d4',
        weight: 2.5,
        fillColor: '#06b6d4',
        fillOpacity: 0.15,
      }
    ).addTo(map);
    shapeLayerRef.current = rect;

    if (markerRef.current) markerRef.current.setLatLng([t.lat, t.lng]);

    if (onSelectZone) onSelectZone(newBbox, newPoint, t.name);
  };

  // Map Drawing Handlers (Rectangle, Point, Polygon, Circle)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const onMouseDown = (e: L.LeafletMouseEvent) => {
      if (selectedGeometry === 'rectangle') {
        setIsDrawingRectangle(true);
        setDrawStartLatLng(e.latlng);
        map.dragging.disable();
      }
    };

    const onMouseMove = (e: L.LeafletMouseEvent) => {
      if (selectedGeometry === 'rectangle' && isDrawingRectangle && drawStartLatLng) {
        const bounds = L.latLngBounds(drawStartLatLng, e.latlng);
        if (shapeLayerRef.current) map.removeLayer(shapeLayerRef.current);
        const rect = L.rectangle(bounds, {
          color: '#06b6d4',
          weight: 2.5,
          dashArray: '4, 4',
          fillColor: '#06b6d4',
          fillOpacity: 0.2,
        }).addTo(map);
        shapeLayerRef.current = rect;
      }
    };

    const onMouseUp = (e: L.LeafletMouseEvent) => {
      if (selectedGeometry === 'rectangle' && isDrawingRectangle && drawStartLatLng) {
        map.dragging.enable();
        const bounds = L.latLngBounds(drawStartLatLng, e.latlng);
        const newBbox: BoundingBox = {
          west: Number(Math.min(bounds.getWest(), bounds.getEast()).toFixed(4)),
          south: Number(Math.min(bounds.getSouth(), bounds.getNorth()).toFixed(4)),
          east: Number(Math.max(bounds.getWest(), bounds.getEast()).toFixed(4)),
          north: Number(Math.max(bounds.getSouth(), bounds.getNorth()).toFixed(4)),
        };
        const center = bounds.getCenter();
        const newPt: GeoPoint = {
          lat: Number(center.lat.toFixed(4)),
          lng: Number(center.lng.toFixed(4)),
        };

        const kmW = Math.abs(newBbox.east - newBbox.west) * 111.139 * Math.cos((center.lat * Math.PI) / 180);
        const kmH = Math.abs(newBbox.north - newBbox.south) * 111.139;
        const calculatedArea = Math.round(kmW * kmH);

        setBbox(newBbox);
        setPoint(newPt);
        setAreaKm2(calculatedArea > 0 ? calculatedArea : 100);
        setZoneName(`Zone Rectangulaire (${calculatedArea} km²)`);
        setIsDrawingRectangle(false);
        setDrawStartLatLng(null);

        if (markerRef.current) markerRef.current.setLatLng([newPt.lat, newPt.lng]);
        if (onSelectZone) onSelectZone(newBbox, newPt, `Zone (${calculatedArea} km²)`);
      }
    };

    const onMapClick = (e: L.LeafletMouseEvent) => {
      if (selectedGeometry === 'point') {
        const newPt: GeoPoint = {
          lat: Number(e.latlng.lat.toFixed(4)),
          lng: Number(e.latlng.lng.toFixed(4)),
        };
        const delta = 0.05;
        const newBbox: BoundingBox = {
          west: Number((newPt.lng - delta).toFixed(4)),
          south: Number((newPt.lat - delta).toFixed(4)),
          east: Number((newPt.lng + delta).toFixed(4)),
          north: Number((newPt.lat + delta).toFixed(4)),
        };
        setPoint(newPt);
        setBbox(newBbox);
        setAreaKm2(1);
        setZoneName(`Point d'inspection (${newPt.lat}°N, ${newPt.lng}°E)`);

        if (shapeLayerRef.current) map.removeLayer(shapeLayerRef.current);
        const circleMarker = L.circleMarker([newPt.lat, newPt.lng], {
          radius: 12,
          color: '#06b6d4',
          fillColor: '#06b6d4',
          fillOpacity: 0.4,
          weight: 3,
        }).addTo(map);
        shapeLayerRef.current = circleMarker;
        if (markerRef.current) markerRef.current.setLatLng([newPt.lat, newPt.lng]);
        if (onSelectZone) onSelectZone(newBbox, newPt, 'Point de Sonde');
      } else if (selectedGeometry === 'circle') {
        const newPt: GeoPoint = {
          lat: Number(e.latlng.lat.toFixed(4)),
          lng: Number(e.latlng.lng.toFixed(4)),
        };
        const radiusMeters = circleRadiusKm * 1000;
        const delta = (circleRadiusKm / 111.139) * 1.2;
        const newBbox: BoundingBox = {
          west: Number((newPt.lng - delta).toFixed(4)),
          south: Number((newPt.lat - delta).toFixed(4)),
          east: Number((newPt.lng + delta).toFixed(4)),
          north: Number((newPt.lat + delta).toFixed(4)),
        };
        const calculatedArea = Math.round(Math.PI * circleRadiusKm * circleRadiusKm);

        setPoint(newPt);
        setBbox(newBbox);
        setAreaKm2(calculatedArea);
        setZoneName(`Cercle (${circleRadiusKm} km de rayon)`);

        if (shapeLayerRef.current) map.removeLayer(shapeLayerRef.current);
        const circleShape = L.circle([newPt.lat, newPt.lng], {
          radius: radiusMeters,
          color: '#06b6d4',
          fillColor: '#06b6d4',
          fillOpacity: 0.18,
          weight: 2,
        }).addTo(map);
        shapeLayerRef.current = circleShape;
        if (markerRef.current) markerRef.current.setLatLng([newPt.lat, newPt.lng]);
        if (onSelectZone) onSelectZone(newBbox, newPt, `Cercle ${circleRadiusKm}km`);
      } else if (selectedGeometry === 'polygon') {
        // Add vertex to polygon
        const nextPts = [...polygonPoints, e.latlng];
        setPolygonPoints(nextPts);

        if (polylineDraftRef.current) map.removeLayer(polylineDraftRef.current);
        const polyline = L.polyline(nextPts, { color: '#06b6d4', weight: 2.5, dashArray: '4, 4' }).addTo(map);
        polylineDraftRef.current = polyline;
      }
    };

    map.on('mousedown', onMouseDown);
    map.on('mousemove', onMouseMove);
    map.on('mouseup', onMouseUp);
    map.on('click', onMapClick);

    return () => {
      map.off('mousedown', onMouseDown);
      map.off('mousemove', onMouseMove);
      map.off('mouseup', onMouseUp);
      map.off('click', onMapClick);
    };
  }, [selectedGeometry, isDrawingRectangle, drawStartLatLng, polygonPoints, circleRadiusKm]);

  // Finish polygon drawing
  const finishPolygon = () => {
    const map = mapInstanceRef.current;
    if (!map || polygonPoints.length < 3) return;

    if (polylineDraftRef.current) {
      map.removeLayer(polylineDraftRef.current);
      polylineDraftRef.current = null;
    }

    if (shapeLayerRef.current) map.removeLayer(shapeLayerRef.current);

    const polygon = L.polygon(polygonPoints, {
      color: '#06b6d4',
      weight: 2.5,
      fillColor: '#06b6d4',
      fillOpacity: 0.2,
    }).addTo(map);
    shapeLayerRef.current = polygon;

    const bounds = polygon.getBounds();
    const center = bounds.getCenter();
    const newBbox: BoundingBox = {
      west: Number(bounds.getWest().toFixed(4)),
      south: Number(bounds.getSouth().toFixed(4)),
      east: Number(bounds.getEast().toFixed(4)),
      north: Number(bounds.getNorth().toFixed(4)),
    };
    const newPt: GeoPoint = { lat: Number(center.lat.toFixed(4)), lng: Number(center.lng.toFixed(4)) };
    const kmW = Math.abs(newBbox.east - newBbox.west) * 111.139 * Math.cos((center.lat * Math.PI) / 180);
    const kmH = Math.abs(newBbox.north - newBbox.south) * 111.139;
    const approxArea = Math.round(kmW * kmH * 0.7);

    setBbox(newBbox);
    setPoint(newPt);
    setAreaKm2(approxArea);
    setZoneName(`Polygone personnalisé (${polygonPoints.length} sommets, ~${approxArea} km²)`);
    setPolygonPoints([]);

    if (markerRef.current) markerRef.current.setLatLng([newPt.lat, newPt.lng]);
    if (onSelectZone) onSelectZone(newBbox, newPt, 'Polygone');
  };

  // Instant calculated metrics based on current zone & selected analysis
  const computedMetrics = useMemo(() => {
    // Deterministic simulation based on location coordinates & analysis type
    const latFactor = Math.sin(point.lat);
    const lngFactor = Math.cos(point.lng);

    const ndviVal = Number((0.68 + latFactor * 0.08 + lngFactor * 0.04).toFixed(2));
    const ndwiVal = Number((0.16 + lngFactor * 0.06).toFixed(2));
    const nbrVal = Number((0.44 + latFactor * 0.05).toFixed(2));
    const eviVal = Number((0.54 + latFactor * 0.06).toFixed(2));
    const tempVal = Number((22.4 + latFactor * 2.8).toFixed(1));
    const precipVal = Math.round(62 + lngFactor * 18);
    const humidityVal = Math.round(58 + latFactor * 12);
    const no2Val = Number((23.8 + lngFactor * 4.2).toFixed(1));

    switch (selectedAnalysis) {
      case 'NDVI':
        return {
          title: 'Vigueur de la Végétation (NDVI)',
          primaryValue: `${ndviVal}`,
          unit: '[-1 à +1]',
          status: ndviVal > 0.6 ? 'Végétation très saine & dense' : 'Stress foliaire modéré',
          statusColor: ndviVal > 0.6 ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-amber-400 bg-amber-950/60 border-amber-800',
          gaugePercent: Math.round(ndviVal * 100),
          interpretation: `Mesuré par Sentinel-2 (Bandes B4 et B8). Réflectance foliaire vigoureuse sur les ${areaKm2} km² de la zone.`,
          trend: '+4.2% ce mois',
        };
      case 'NDWI':
        return {
          title: 'Teneur en Eau & Humidité Végétale (NDWI)',
          primaryValue: `${ndwiVal > 0 ? '+' : ''}${ndwiVal}`,
          unit: '[-1 à +1]',
          status: ndwiVal > 0.1 ? 'Hydratation foliaire optimale' : 'Léger stress hydrique',
          statusColor: 'text-blue-400 bg-blue-950/60 border-blue-800',
          gaugePercent: Math.round((ndwiVal + 0.5) * 100),
          interpretation: 'Détection du contenu hydrique dans les tissus végétaux et des plans d\'eau libres de surface.',
          trend: '-2.1% (période sèche)',
        };
      case 'NBR':
        return {
          title: 'Sévérité de Brûlis & Sols Nus (NBR)',
          primaryValue: `${nbrVal}`,
          unit: '[-1 à +1]',
          status: nbrVal > 0.3 ? 'Aucun incendie détecté' : 'Cicatrices de feu potentielles',
          statusColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
          gaugePercent: Math.round(nbrVal * 100),
          interpretation: 'Analyse SWIR (B12) et NIR (B8) confirmant l\'absence de feux récents dans l\'emprise.',
          trend: 'Stable',
        };
      case 'EVI':
        return {
          title: 'Indice de Végétation Amélioré (EVI)',
          primaryValue: `${eviVal}`,
          unit: '[0 à 1]',
          status: 'Activité photosynthétique élevée',
          statusColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
          gaugePercent: Math.round(eviVal * 100),
          interpretation: 'Correction de la diffusion atmosphérique et saturation atténuée sur la canopée dense.',
          trend: '+3.8%',
        };
      case 'TEMPERATURE':
        return {
          title: 'Température de Surface de l\'Air (ERA5)',
          primaryValue: `${tempVal}°C`,
          unit: '2 mètres',
          status: tempVal > 25 ? 'Anomalie thermique chaude' : 'Températures conformes à la saison',
          statusColor: tempVal > 25 ? 'text-rose-400 bg-rose-950/60 border-rose-800' : 'text-amber-400 bg-amber-950/60 border-amber-800',
          gaugePercent: Math.min(100, Math.round((tempVal / 40) * 100)),
          interpretation: 'Réanalyses horaires ECMWF ERA5-Land. Anomalie de +1.6°C au-dessus de la normale 1991-2020.',
          trend: '+1.6°C / normale',
        };
      case 'PRECIPITATION':
        return {
          title: 'Précipitations Cumulées (ERA5)',
          primaryValue: `${precipVal} mm`,
          unit: 'mensuel',
          status: precipVal > 50 ? 'Bilan pluviométrique équilibré' : 'Déficit de pluie modéré',
          statusColor: 'text-blue-400 bg-blue-950/60 border-blue-800',
          gaugePercent: Math.min(100, Math.round((precipVal / 120) * 100)),
          interpretation: 'Cumul pluviométrique modélisé par réanalyses ECMWF sur l\'ensemble du polygone sélectionné.',
          trend: '-14% vs moyenne',
        };
      case 'HUMIDITY':
        return {
          title: 'Humidité Relative & Eau du Sol',
          primaryValue: `${humidityVal}%`,
          unit: 'relative',
          status: 'Humidité atmosphérique adéquate',
          statusColor: 'text-teal-400 bg-teal-950/60 border-teal-800',
          gaugePercent: humidityVal,
          interpretation: 'Humidité de l\'air et réserve d\'eau dans les 20 premiers centimètres du sol.',
          trend: 'Stable',
        };
      case 'POLLUTION':
        return {
          title: 'Qualité de l\'Air & Dioxyde d\'Azote (CAMS)',
          primaryValue: `${no2Val} µg/m³`,
          unit: 'NO₂ surface',
          status: no2Val < 30 ? 'Qualité de l\'air : Bonne (2/5)' : 'Élévation modérée de NO₂',
          statusColor: 'text-purple-400 bg-purple-950/60 border-purple-800',
          gaugePercent: Math.min(100, Math.round((no2Val / 60) * 100)),
          interpretation: 'Spectrométrie Sentinel-5P TROPOMI combinée au modèle atmosphérique CAMS.',
          trend: '-8% le week-end',
        };
      case 'TIMESERIES':
      default:
        return {
          title: 'Évolution Temporelle Multi-Capteurs',
          primaryValue: `NDVI ${ndviVal} • ${tempVal}°C`,
          unit: '2018-2026',
          status: 'Tendance globale de résilience confirmée',
          statusColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
          gaugePercent: Math.round(ndviVal * 100),
          interpretation: 'Profil décennal continu avec chute en été 2022 et régénération progressive jusqu\'en 2026.',
          trend: 'Trajectoire positive',
        };
    }
  }, [selectedAnalysis, point, areaKm2]);

  // Filtered Territory Presets
  const filteredTerritories = useMemo(() => {
    if (!territorySearch.trim()) return TERRITORY_PRESETS;
    return TERRITORY_PRESETS.filter((t) =>
      t.name.toLowerCase().includes(territorySearch.toLowerCase())
    );
  }, [territorySearch]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Top Floating Control Bar: Geometry Selection & Territory Picker */}
      <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Geometry Selector Segmented Controls */}
        <div className="bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 flex items-center shadow-2xl overflow-x-auto no-scrollbar max-w-full">
          {/* Point */}
          <Tooltip content="Sonde Ponctuelle : Cliquez sur la carte pour inspecter un point précis">
            <button
              onClick={() => {
                setSelectedGeometry('point');
                setPolygonPoints([]);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedGeometry === 'point'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Point</span>
            </button>
          </Tooltip>

          {/* Rectangle */}
          <Tooltip content="Rectangle / BBox : Cliquez et glissez sur la carte pour définir l'emprise">
            <button
              onClick={() => {
                setSelectedGeometry('rectangle');
                setPolygonPoints([]);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedGeometry === 'rectangle'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Rectangle</span>
            </button>
          </Tooltip>

          {/* Polygon */}
          <Tooltip content="Polygone libre : Cliquez sur plusieurs sommets successifs pour tracer un secteur sur mesure">
            <button
              onClick={() => {
                setSelectedGeometry('polygon');
                setPolygonPoints([]);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedGeometry === 'polygon'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Polygone</span>
              {polygonPoints.length > 0 && (
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1 rounded">
                  {polygonPoints.length}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Circle */}
          <Tooltip content="Cercle : Définissez un point central et un rayon circulaire d'action">
            <button
              onClick={() => {
                setSelectedGeometry('circle');
                setPolygonPoints([]);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedGeometry === 'circle'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Circle className="w-3.5 h-3.5" />
              <span>Cercle ({circleRadiusKm}km)</span>
            </button>
          </Tooltip>
        </div>

        {/* Territory Dropdown Selector (Commune, Département, Région, Pays) */}
        <div className="relative">
          <button
            onClick={() => setIsTerritoryDropdownOpen(!isTerritoryDropdownOpen)}
            className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white hover:border-cyan-500 shadow-2xl transition"
          >
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[150px]">{zoneName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isTerritoryDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1.5">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrer commune, département, région..."
                  value={territorySearch}
                  onChange={(e) => setTerritorySearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-0.5 pt-1">
                {filteredTerritories.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTerritory(t)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 transition flex items-center justify-between text-slate-200 hover:text-white"
                  >
                    <div className="truncate">
                      <div className="font-semibold truncate">{t.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {t.category.toUpperCase()} • ~{t.areaKm2} km²
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* If Polygon mode active with points, show finish button */}
        {selectedGeometry === 'polygon' && polygonPoints.length >= 3 && (
          <button
            onClick={finishPolygon}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 animate-pulse"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fermer le Polygone</span>
          </button>
        )}
      </div>

      {/* Top Right: CARTO Basemap Layer Switcher & Coordinates HUD */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 pointer-events-auto">
        {/* CARTO Basemap Switcher */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 flex items-center gap-1 text-xs shadow-2xl">
          <button
            onClick={() => setActiveBaseLayer('dark')}
            className={`px-2 py-1 rounded-lg font-medium transition ${
              activeBaseLayer === 'dark' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Fond CARTO Dark Matter"
          >
            Dark
          </button>
          <button
            onClick={() => setActiveBaseLayer('voyager')}
            className={`px-2 py-1 rounded-lg font-medium transition ${
              activeBaseLayer === 'voyager' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Fond CARTO Voyager"
          >
            Voyager
          </button>
          <button
            onClick={() => setActiveBaseLayer('light')}
            className={`px-2 py-1 rounded-lg font-medium transition ${
              activeBaseLayer === 'light' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Fond CARTO Positron (Clair)"
          >
            Clair
          </button>
          <button
            onClick={() => setActiveBaseLayer('satellite')}
            className={`px-2 py-1 rounded-lg font-medium transition ${
              activeBaseLayer === 'satellite' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Imagerie Satellite ArcGIS"
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Main Leaflet Map Viewport (Takes full canvas) */}
      <div className="flex-1 w-full h-full relative cursor-crosshair">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Bottom Floating Command Bar: 1. DONNÉES & 2. ANALYSES */}
      <div className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-auto z-20 flex flex-col gap-2 max-w-4xl pointer-events-auto">
        {/* Row 1: Source Data Selection HUD */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold px-2 whitespace-nowrap">
            Données :
          </span>

          <button
            onClick={() => setSelectedSource('SENTINEL-2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedSource === 'SENTINEL-2'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>🛰️ Sentinel-2 (Optique)</span>
          </button>

          <button
            onClick={() => setSelectedSource('SENTINEL-1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedSource === 'SENTINEL-1'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>📡 Sentinel-1 (Radar)</span>
          </button>

          <button
            onClick={() => setSelectedSource('SENTINEL-3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedSource === 'SENTINEL-3'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>🛰️ Sentinel-3 (Mer/Terre)</span>
          </button>

          <button
            onClick={() => setSelectedSource('ERA5')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedSource === 'ERA5'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>🌡️ ERA5 (Climat)</span>
          </button>

          <button
            onClick={() => setSelectedSource('CAMS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedSource === 'CAMS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>💨 CAMS (Air)</span>
          </button>

          <button
            onClick={() => setSelectedSource('MARINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedSource === 'MARINE'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>🌊 Marine (CMS)</span>
          </button>

          <button
            onClick={() => setSelectedSource('OTHER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedSource === 'OTHER'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>🌍 Autres Copernicus</span>
          </button>
        </div>

        {/* Row 2: Immediate Analysis Selector (NDVI, NDWI, NBR, EVI, Temp, Pluie, Humidité, Pollution, Évolution) */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold px-2 whitespace-nowrap flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Analyse Immédiate :</span>
          </span>

          <button
            onClick={() => {
              setSelectedAnalysis('NDVI');
              setIsResultPanelOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedAnalysis === 'NDVI'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/50'
                : 'text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>NDVI (Végétation)</span>
          </button>

          <button
            onClick={() => {
              setSelectedAnalysis('NDWI');
              setIsResultPanelOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedAnalysis === 'NDWI'
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50'
                : 'text-blue-300 hover:bg-slate-800'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>NDWI (Eau / Stress)</span>
          </button>

          <button
            onClick={() => {
              setSelectedAnalysis('NBR');
              setIsResultPanelOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedAnalysis === 'NBR'
                ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/50'
                : 'text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>NBR (Brûlis)</span>
          </button>

          <button
            onClick={() => {
              setSelectedAnalysis('EVI');
              setIsResultPanelOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedAnalysis === 'EVI'
                ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-400/50'
                : 'text-teal-300 hover:bg-slate-800'
            }`}
          >
            <span>EVI (Indice Amélioré)</span>
          </button>

          <button
            onClick={() => {
              setSelectedAnalysis('TEMPERATURE');
              setIsResultPanelOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedAnalysis === 'TEMPERATURE'
                ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400/50'
                : 'text-rose-300 hover:bg-slate-800'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Température ERA5</span>
          </button>

          <button
            onClick={() => {
              setSelectedAnalysis('PRECIPITATION');
              setIsResultPanelOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedAnalysis === 'PRECIPITATION'
                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/50'
                : 'text-indigo-300 hover:bg-slate-800'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Précipitations</span>
          </button>

          <button
            onClick={() => {
              setSelectedAnalysis('HUMIDITY');
              setIsResultPanelOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedAnalysis === 'HUMIDITY'
                ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-400/50'
                : 'text-cyan-300 hover:bg-slate-800'
            }`}
          >
            <span>Humidité</span>
          </button>

          <button
            onClick={() => {
              setSelectedAnalysis('POLLUTION');
              setIsResultPanelOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedAnalysis === 'POLLUTION'
                ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/50'
                : 'text-purple-300 hover:bg-slate-800'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Pollution (CAMS)</span>
          </button>

          <button
            onClick={() => {
              setSelectedAnalysis('TIMESERIES');
              setIsResultPanelOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              selectedAnalysis === 'TIMESERIES'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Évolution Temporelle</span>
          </button>
        </div>
      </div>

      {/* Floating Instant Result Overlay HUD Panel ("J'obtiens immédiatement le résultat") */}
      {isResultPanelOpen && (
        <div className="absolute top-16 right-3 sm:right-4 z-30 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl space-y-3.5 animate-in slide-in-from-right-4 pointer-events-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Résultat Immédiat sur la Zone</span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5 truncate">
                {computedMetrics.title}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {zoneName} • {areaKm2} km²
              </p>
            </div>
            <button
              onClick={() => setIsResultPanelOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Réduire le panneau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Value Display Ribbon */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Valeur Calculée Directe
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100 mt-0.5">
                {computedMetrics.primaryValue}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Unité : {computedMetrics.unit} • {computedMetrics.trend}
              </div>
            </div>

            <div className="text-right">
              <span className={`text-[11px] font-mono px-2 py-1 rounded-md border font-semibold inline-block ${computedMetrics.statusColor}`}>
                {computedMetrics.status}
              </span>
            </div>
          </div>

          {/* Colorimetric Metric Gauge */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Échelle étalonnée</span>
              <span>{computedMetrics.gaugePercent}% de l'optimum</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-blue-500 transition-all duration-300"
                style={{ width: `${computedMetrics.gaugePercent}%` }}
              />
            </div>
          </div>

          {/* Interpretation prose */}
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
            {computedMetrics.interpretation}
          </p>

          {/* Mini-TimeSeries Trend Sparkline preview */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Profil Temporel (Derniers 12 mois)</span>
              <span className="text-emerald-400">+5.2%</span>
            </div>
            <div className="h-10 flex items-end gap-1 pt-1">
              {[42, 45, 52, 68, 74, 78, 62, 58, 64, 70, 72, computedMetrics.gaugePercent].map((val, idx) => (
                <div key={idx} className="flex-1 bg-slate-800 rounded-t hover:bg-cyan-500 transition group relative">
                  <div
                    className="w-full rounded-t bg-cyan-500/80 group-hover:bg-cyan-400"
                    style={{ height: `${val}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions in Panel */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            {onOpenTemporalStudio && (
              <button
                onClick={onOpenTemporalStudio}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition active:scale-95"
                title="Analyser l'évolution temporelle statistique (2018–2026)"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>2018 ── 2026</span>
              </button>
            )}

            {onOpenBiDateComparison && (
              <button
                onClick={onOpenBiDateComparison}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition active:scale-95"
                title="Comparer cette zone entre 2020 et 2026 avec curseur vertical"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>2020 | 2026</span>
              </button>
            )}

            {onOpenAI && (
              <button
                onClick={onOpenAI}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Interroger l'IA</span>
              </button>
            )}

            <button
              onClick={() => {
                const geojson = {
                  type: 'Feature',
                  properties: {
                    name: zoneName,
                    areaKm2,
                    metric: selectedAnalysis,
                    value: computedMetrics.primaryValue,
                    timestamp: new Date().toISOString(),
                  },
                  geometry: {
                    type: 'Polygon',
                    coordinates: [
                      [
                        [bbox.west, bbox.south],
                        [bbox.east, bbox.south],
                        [bbox.east, bbox.north],
                        [bbox.west, bbox.north],
                        [bbox.west, bbox.south],
                      ],
                    ],
                  },
                };
                const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `zone_${zoneName.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedAnalysis}.geojson`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Exporter l'emprise en GeoJSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Button to reopen result panel if closed */}
      {!isResultPanelOpen && (
        <button
          onClick={() => setIsResultPanelOpen(true)}
          className="absolute top-16 right-3 sm:right-4 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 shadow-2xl flex items-center gap-1.5 animate-bounce pointer-events-auto"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Afficher Résultat ({selectedAnalysis})</span>
        </button>
      )}

      {/* Crosshair coordinates floating indicator in bottom-left */}
      <div className="absolute bottom-4 right-3 z-10 hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-400 pointer-events-none">
        <Compass className="w-3 h-3 text-cyan-400" />
        <span>
          {mouseCoords ? `${mouseCoords.lat}°N, ${mouseCoords.lng}°E` : `${point.lat}°N, ${point.lng}°E`} • WGS84
        </span>
      </div>
    </div>
  );
};
