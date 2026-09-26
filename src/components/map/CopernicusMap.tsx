import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BoundingBox, GeoPoint, GeoObservation } from '../../types/copernicus';
import { MapPin, Layers, Square, Crosshair, Compass } from 'lucide-react';

interface CopernicusMapProps {
  bbox: BoundingBox;
  point: GeoPoint;
  selectedObservation?: GeoObservation | null;
  onBboxChange: (bbox: BoundingBox) => void;
  onPointChange: (point: GeoPoint, locationName?: string) => void;
}

export const PRESET_REGIONS = [
  { name: 'Sud de la France / Occitanie', lat: 43.60, lng: 3.87, zoom: 9, delta: 0.5 },
  { name: 'Beauce / Bassin Parisien', lat: 48.35, lng: 1.95, zoom: 9, delta: 0.45 },
  { name: 'Forêt des Landes', lat: 44.20, lng: -0.65, zoom: 9, delta: 0.5 },
  { name: 'Delta du Rhône / Camargue', lat: 43.52, lng: 4.65, zoom: 10, delta: 0.35 },
  { name: 'Méditerranée occidentale', lat: 41.50, lng: 5.50, zoom: 7, delta: 1.5 },
  { name: 'Glaciers des Alpes / Mont-Blanc', lat: 45.83, lng: 6.86, zoom: 10, delta: 0.3 },
  { name: 'Forêt Amazonienne (Brésil)', lat: -3.40, lng: -62.20, zoom: 8, delta: 1.0 },
  { name: 'Sahara / Dunes de sel', lat: 19.50, lng: 11.20, zoom: 7, delta: 1.8 },
];

export const CopernicusMap: React.FC<CopernicusMapProps> = ({
  bbox,
  point,
  selectedObservation,
  onBboxChange,
  onPointChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const bboxLayerRef = useRef<L.Rectangle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isDrawingBbox, setIsDrawingBbox] = useState(false);
  const [drawStartLatLng, setDrawStartLatLng] = useState<L.LatLng | null>(null);
  const [activeBaseLayer, setActiveBaseLayer] = useState<'dark' | 'satellite' | 'street'>('dark');
  const baseLayersRef = useRef<{ [key: string]: L.TileLayer }>({});
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fix default marker icon assets
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
      center: [point.lat, point.lng],
      zoom: 8,
      zoomControl: false,
      attributionControl: false,
    });

    // Tile providers
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    });

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    });

    baseLayersRef.current = {
      dark: darkLayer,
      satellite: satelliteLayer,
      street: streetLayer,
    };

    darkLayer.addTo(map);

    // Initial bbox rectangle
    const bounds: L.LatLngBoundsExpression = [
      [bbox.south, bbox.west],
      [bbox.north, bbox.east],
    ];
    const rect = L.rectangle(bounds, {
      color: '#06b6d4',
      weight: 2,
      dashArray: '4, 4',
      fillColor: '#06b6d4',
      fillOpacity: 0.12,
    }).addTo(map);
    bboxLayerRef.current = rect;

    // Marker for point
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color: #06b6d4; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #06b6d4;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const marker = L.marker([point.lat, point.lng], { icon: customIcon }).addTo(map);
    markerRef.current = marker;

    // Map Events
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

  // Handle BaseLayer change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(baseLayersRef.current).forEach((layer) => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });

    const nextLayer = baseLayersRef.current[activeBaseLayer];
    if (nextLayer) nextLayer.addTo(map);
  }, [activeBaseLayer]);

  // Handle BBOX and Point updates from props
  useEffect(() => {
    if (!mapInstanceRef.current || !bboxLayerRef.current) return;
    const bounds: L.LatLngBoundsExpression = [
      [bbox.south, bbox.west],
      [bbox.north, bbox.east],
    ];
    bboxLayerRef.current.setBounds(bounds);

    if (markerRef.current) {
      markerRef.current.setLatLng([point.lat, point.lng]);
    }
  }, [bbox, point]);

  // Click & Drag drawing for BBOX
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const onMouseDown = (e: L.LeafletMouseEvent) => {
      if (!isDrawingBbox) return;
      setDrawStartLatLng(e.latlng);
      map.dragging.disable();
    };

    const onMouseMove = (e: L.LeafletMouseEvent) => {
      if (!isDrawingBbox || !drawStartLatLng || !bboxLayerRef.current) return;
      const bounds = L.latLngBounds(drawStartLatLng, e.latlng);
      bboxLayerRef.current.setBounds(bounds);
    };

    const onMouseUp = (e: L.LeafletMouseEvent) => {
      if (!isDrawingBbox || !drawStartLatLng) return;
      map.dragging.enable();
      const bounds = L.latLngBounds(drawStartLatLng, e.latlng);
      const newBbox: BoundingBox = {
        west: Number(Math.min(bounds.getWest(), bounds.getEast()).toFixed(4)),
        south: Number(Math.min(bounds.getSouth(), bounds.getNorth()).toFixed(4)),
        east: Number(Math.max(bounds.getWest(), bounds.getEast()).toFixed(4)),
        north: Number(Math.max(bounds.getSouth(), bounds.getNorth()).toFixed(4)),
      };
      const center = bounds.getCenter();
      onBboxChange(newBbox);
      onPointChange({ lat: Number(center.lat.toFixed(4)), lng: Number(center.lng.toFixed(4)) }, 'Zone personnalisée');
      setIsDrawingBbox(false);
      setDrawStartLatLng(null);
    };

    const onMapClick = (e: L.LeafletMouseEvent) => {
      if (isDrawingBbox) return;
      const newPt: GeoPoint = {
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
      };
      const delta = 0.35;
      const newBbox: BoundingBox = {
        west: Number((newPt.lng - delta).toFixed(4)),
        south: Number((newPt.lat - delta).toFixed(4)),
        east: Number((newPt.lng + delta).toFixed(4)),
        north: Number((newPt.lat + delta).toFixed(4)),
      };
      onPointChange(newPt, `Point (${newPt.lat}°, ${newPt.lng}°)`);
      onBboxChange(newBbox);
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
  }, [isDrawingBbox, drawStartLatLng, onBboxChange, onPointChange]);

  const selectPreset = (preset: typeof PRESET_REGIONS[0]) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([preset.lat, preset.lng], preset.zoom);
    const newBbox: BoundingBox = {
      west: Number((preset.lng - preset.delta).toFixed(4)),
      south: Number((preset.lat - preset.delta).toFixed(4)),
      east: Number((preset.lng + preset.delta).toFixed(4)),
      north: Number((preset.lat + preset.delta).toFixed(4)),
    };
    onPointChange({ lat: preset.lat, lng: preset.lng }, preset.name);
    onBboxChange(newBbox);
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-950 overflow-hidden flex flex-col">
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        {/* Preset Selector */}
        <div className="flex items-center rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1.5 shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0" />
          <select
            className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-1"
            onChange={(e) => {
              const p = PRESET_REGIONS.find((r) => r.name === e.target.value);
              if (p) selectPreset(p);
            }}
            defaultValue={PRESET_REGIONS[0].name}
          >
            {PRESET_REGIONS.map((preset) => (
              <option key={preset.name} value={preset.name} className="bg-slate-900 text-slate-200">
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Draw Bbox Tool */}
        <button
          onClick={() => setIsDrawingBbox(!isDrawingBbox)}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium backdrop-blur-md shadow-lg transition border ${
            isDrawingBbox
              ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
              : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
          }`}
          title="Cliquez puis glissez sur la carte pour tracer une zone rectangulaire (Bounding Box)"
        >
          <Square className="w-3.5 h-3.5" />
          <span>{isDrawingBbox ? 'Tracé en cours (Glisser)' : 'Tracer BBox'}</span>
        </button>

        {/* Base Layer Switcher */}
        <div className="flex items-center rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-0.5 shadow-lg">
          <button
            onClick={() => setActiveBaseLayer('dark')}
            className={`px-2 py-1 text-[11px] rounded font-medium transition ${
              activeBaseLayer === 'dark' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sombre
          </button>
          <button
            onClick={() => setActiveBaseLayer('satellite')}
            className={`px-2 py-1 text-[11px] rounded font-medium transition ${
              activeBaseLayer === 'satellite' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveBaseLayer('street')}
            className={`px-2 py-1 text-[11px] rounded font-medium transition ${
              activeBaseLayer === 'street' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rues
          </button>
        </div>
      </div>

      {/* Zoom and Center Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="w-8 h-8 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:bg-slate-800 flex items-center justify-center font-bold text-sm shadow-lg transition active:scale-95"
          title="Zoom avant"
        >
          +
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="w-8 h-8 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:bg-slate-800 flex items-center justify-center font-bold text-sm shadow-lg transition active:scale-95"
          title="Zoom arrière"
        >
          -
        </button>
        <button
          onClick={() => mapInstanceRef.current?.setView([point.lat, point.lng], 8)}
          className="w-8 h-8 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:bg-slate-800 flex items-center justify-center shadow-lg transition active:scale-95"
          title="Centrer sur la zone active"
        >
          <Crosshair className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className={`w-full flex-1 ${isDrawingBbox ? 'cursor-crosshair' : 'cursor-grab'}`}
      />

      {/* Bottom GIS Status Bar */}
      <div className="z-[1000] border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-cyan-300">
            <Compass className="w-3 h-3 text-cyan-400" />
            Centre : {point.lat.toFixed(4)}°N, {point.lng.toFixed(4)}°E
          </span>
          {mouseCoords && (
            <span className="hidden sm:inline font-mono text-slate-400">
              Curseur : {mouseCoords.lat}°N, {mouseCoords.lng}°E
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-slate-400">
            BBox : [{bbox.west}, {bbox.south}, {bbox.east}, {bbox.north}]
          </span>
          <span className="text-slate-400 border-l border-slate-800 pl-3">
            CRS: EPSG:4326 (WGS 84)
          </span>
        </div>
      </div>
    </div>
  );
};
