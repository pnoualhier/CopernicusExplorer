/**
 * Copernicus Satellite Spectral Synthesis & Bi-Date Comparison Engine
 * High-performance canvas-based multi-band rendering (RGB, False Color, NDVI, SWIR, NDWI)
 * Supports continuous opacity blending and vertical split-view change detection.
 */

export type VignetteSpectralMode = 'RGB' | 'FALSE_COLOR' | 'NDVI' | 'SWIR' | 'NDWI';

export type ComparisonTheme =
  | 'urbanisation'
  | 'agriculture'
  | 'incendies'
  | 'deforestation'
  | 'eau'
  | 'littoral'
  | 'glaciers';

export interface ThemePresetInfo {
  id: ComparisonTheme;
  title: string;
  category: string;
  location: string;
  yearA: number;
  yearB: number;
  recommendedMode: VignetteSpectralMode;
  description: string;
  impactMetrics: {
    label: string;
    value: string;
    delta: string;
    status: 'alert' | 'warning' | 'info' | 'positive';
  };
}

export const COMPARISON_THEMES: ThemePresetInfo[] = [
  {
    id: 'urbanisation',
    title: 'Urbanisation & Artificialisation',
    category: 'Aménagement & Sols',
    location: 'Couronne périurbaine métropolitaine',
    yearA: 2020,
    yearB: 2026,
    recommendedMode: 'SWIR',
    description: 'Expansion de zones pavillonnaires et plateformes logistiques sur anciennes terres agricoles. Mise en valeur spectrale des surfaces minérales imperméables.',
    impactMetrics: {
      label: 'Surfaces artificialisées',
      value: '+142 hectares',
      delta: '+18.4% de bâti',
      status: 'warning',
    },
  },
  {
    id: 'agriculture',
    title: 'Agriculture & Assolement',
    category: 'Agro-écologie',
    location: 'Plaines céréalières & maraîchères',
    yearA: 2020,
    yearB: 2026,
    recommendedMode: 'NDVI',
    description: 'Dynamique des rotations culturales, parcelles irriguées en pivot vs parcelles en jachère ou en stress hydrique estival.',
    impactMetrics: {
      label: 'Biomasse moyenne active',
      value: 'NDVI 0.62 → 0.49',
      delta: '-21% vigueur',
      status: 'alert',
    },
  },
  {
    id: 'incendies',
    title: 'Incendies & Brûlis',
    category: 'Risques Naturels',
    location: 'Massif forestier méditerranéen / pins',
    yearA: 2020,
    yearB: 2026,
    recommendedMode: 'SWIR',
    description: 'Massif boisé intact en 2020 comparé aux cicatrices de feux massifs en 2026. Le SWIR révèle instantanément les sols calcinés et la lente régénération.',
    impactMetrics: {
      label: 'Cicatrices d\'incendie',
      value: '3 850 hectares',
      delta: '-84% canopée',
      status: 'alert',
    },
  },
  {
    id: 'deforestation',
    title: 'Déforestation & Coupes Rases',
    category: 'Forêts & Biodiversité',
    location: 'Massif forestier et vallées',
    yearA: 2020,
    yearB: 2026,
    recommendedMode: 'FALSE_COLOR',
    description: 'Fragmentation des peuplements forestiers anciens. Le proche infrarouge (False Color) fait ressortir la canopée intacte en rouge vermillon intense.',
    impactMetrics: {
      label: 'Couvert forestier dense',
      value: '78% → 59%',
      delta: '-19 pts de forêt',
      status: 'alert',
    },
  },
  {
    id: 'eau',
    title: 'Évolution des Plans d\'Eau & Sécheresse',
    category: 'Ressources Hydriques',
    location: 'Lac de retenue / barrage hydroélectrique',
    yearA: 2020,
    yearB: 2026,
    recommendedMode: 'NDWI',
    description: 'Rétraction de la ligne d\'eau et marnage extrême sous épisodes de canicules répétées. L\'indice NDWI isole sans ambiguïté la surface en eau.',
    impactMetrics: {
      label: 'Volume de plan d\'eau',
      value: '100% → 64%',
      delta: '-36% de miroir d\'eau',
      status: 'alert',
    },
  },
  {
    id: 'littoral',
    title: 'Dynamique Littorale & Érosion Côtière',
    category: 'Océan & Côtes',
    location: 'Trait de côte & bancs sableux estuariens',
    yearA: 2020,
    yearB: 2026,
    recommendedMode: 'NDWI',
    description: 'Recul dunaire face aux tempêtes hivernales, migration des passes sous-marines et bancs de sable découverts à marée basse.',
    impactMetrics: {
      label: 'Déplacement moyen trait de côte',
      value: '-18.5 mètres',
      delta: 'Érosion active',
      status: 'warning',
    },
  },
  {
    id: 'glaciers',
    title: 'Neige, Névés & Glaciers',
    category: 'Cryosphère',
    location: 'Haute montagne alpine',
    yearA: 2020,
    yearB: 2026,
    recommendedMode: 'SWIR',
    description: 'Fonte estivale accélérée des langues glaciaires et dénudation des moraines rocheuses. Le canal SWIR permet de distinguer nettement neige propre et roches.',
    impactMetrics: {
      label: 'Extension de la langue glaciaire',
      value: '-280 mètres',
      delta: '-12% surface englacée',
      status: 'alert',
    },
  },
];

/**
 * Procedural synthesis engine for multi-band satellite imagery
 */
export class SatelliteSpectralEngine {
  /**
   * Render a satellite scene for a specific mode, theme and year onto a target canvas
   */
  static renderScene(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mode: VignetteSpectralMode,
    theme: ComparisonTheme,
    year: number,
    opacityPercent: number = 100,
    seedOffset: number = 0
  ) {
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const opacityFactor = Math.max(0, Math.min(1, opacityPercent / 100));

    // Base coordinates / pseudo-noise generation parameters
    const isYear2026 = year >= 2024;
    const progress = isYear2026 ? 1.0 : 0.0;

    for (let y = 0; y < height; y++) {
      const ny = y / height;
      for (let x = 0; x < width; x++) {
        const nx = x / width;
        const idx = (y * width + x) * 4;

        // Multi-scale terrain features
        const f1 = Math.sin(nx * 8 + seedOffset) * Math.cos(ny * 8);
        const f2 = Math.sin(nx * 22 + ny * 18) * 0.3;
        const f3 = Math.cos(nx * 40 - ny * 35) * 0.15;
        const baseElevation = Math.max(0, Math.min(1, 0.5 + f1 * 0.35 + f2 + f3));

        // Compute simulated physical reflectance bands:
        // B02 (Blue), B03 (Green), B04 (Red), B08 (NIR), B11/B12 (SWIR)
        let b02 = 0.1;
        let b03 = 0.15;
        let b04 = 0.12;
        let b08 = 0.45;
        let b12 = 0.18;

        switch (theme) {
          case 'urbanisation': {
            // Center is expanding urban grid, surroundings are fields
            const distCenter = Math.hypot(nx - 0.5, ny - 0.5);
            // In 2026, urban radius expands from 0.22 to 0.38
            const urbanRadius = 0.22 + progress * 0.16;
            const isUrban = distCenter < urbanRadius || (nx > 0.65 && ny > 0.4 && isYear2026);

            if (isUrban) {
              b02 = 0.28; b03 = 0.29; b04 = 0.31; b08 = 0.25; b12 = 0.42; // Mineral/asphalt high SWIR
            } else {
              // Agriculture/greenery
              b02 = 0.06; b03 = 0.18; b04 = 0.08; b08 = 0.65; b12 = 0.15;
            }
            break;
          }

          case 'agriculture': {
            // Patchwork agricultural parcels
            const px = Math.floor(nx * 8);
            const py = Math.floor(ny * 8);
            const parcelId = (px * 7 + py * 13) % 5;

            // In 2026, severe summer drought or rotated harvest
            const isDroughtOrHarvested = isYear2026 && (parcelId === 1 || parcelId === 3 || parcelId === 4);

            if (isDroughtOrHarvested) {
              b02 = 0.18; b03 = 0.24; b04 = 0.28; b08 = 0.28; b12 = 0.44; // Stubble / dry soil
            } else {
              b02 = 0.05; b03 = 0.20; b04 = 0.07; b08 = 0.72; b12 = 0.12; // Dense crops
            }
            break;
          }

          case 'incendies': {
            // Central burn scar appears in 2026
            const burnZone = Math.hypot(nx - 0.48, (ny - 0.45) * 1.3);
            const isBurned = isYear2026 && burnZone < 0.32 && (Math.sin(nx * 30 + ny * 20) > -0.4);

            if (isBurned) {
              // Charcoal / bare ash: low visible, high SWIR thermal reflectance
              b02 = 0.05; b03 = 0.06; b04 = 0.12; b08 = 0.09; b12 = 0.58;
            } else {
              // Healthy Pine forest: low visible, strong NIR
              b02 = 0.04; b03 = 0.14; b04 = 0.06; b08 = 0.68; b12 = 0.11;
            }
            break;
          }

          case 'deforestation': {
            // Continuous forest in 2020 vs patchwork clear-cuts in 2026
            const cutGrid = (Math.floor(nx * 6) + Math.floor(ny * 5)) % 3 === 0;
            const isClearCut = isYear2026 && cutGrid && nx > 0.2 && ny > 0.25;

            if (isClearCut) {
              b02 = 0.14; b03 = 0.18; b04 = 0.22; b08 = 0.22; b12 = 0.38; // Bare soil
            } else {
              b02 = 0.03; b03 = 0.12; b04 = 0.05; b08 = 0.75; b12 = 0.09; // Primary forest
            }
            break;
          }

          case 'eau': {
            // Meandering lake / dam reservoir
            const riverCenter = Math.sin(nx * 4) * 0.15 + 0.5;
            const distFromLake = Math.abs(ny - riverCenter);
            // In 2026, lake shrinks from width 0.24 to 0.11
            const lakeWidth = isYear2026 ? 0.11 : 0.24;

            if (distFromLake < lakeWidth) {
              // Deep water body
              b02 = 0.22; b03 = 0.20; b04 = 0.05; b08 = 0.02; b12 = 0.01;
            } else if (distFromLake < 0.25 && isYear2026) {
              // Exposed muddy/silt lakebed
              b02 = 0.15; b03 = 0.22; b04 = 0.26; b08 = 0.24; b12 = 0.48;
            } else {
              // Surrounding vegetation
              b02 = 0.05; b03 = 0.16; b04 = 0.08; b08 = 0.62; b12 = 0.14;
            }
            break;
          }

          case 'littoral': {
            // Coastline: Left is ocean, right is beach & dune
            const coastlineX = 0.45 + Math.sin(ny * 6) * 0.1 - (isYear2026 ? 0.08 : 0);

            if (nx < coastlineX) {
              // Ocean water
              b02 = 0.32; b03 = 0.28; b04 = 0.08; b08 = 0.02; b12 = 0.01;
            } else if (nx < coastlineX + 0.12) {
              // Sand dune / beach
              b02 = 0.34; b03 = 0.36; b04 = 0.40; b08 = 0.38; b12 = 0.48;
            } else {
              // Coastal pine forest / wetlands
              b02 = 0.05; b03 = 0.15; b04 = 0.07; b08 = 0.64; b12 = 0.12;
            }
            break;
          }

          case 'glaciers': {
            // Mountain valley with glacial tongue
            const glacierTongue = Math.abs(nx - (0.5 + (ny - 0.5) * 0.2));
            // In 2026, glacier retreats from bottom 0.85 to 0.55
            const glacierLength = isYear2026 ? 0.55 : 0.85;
            const isGlacialIce = glacierTongue < 0.18 && ny < glacierLength;

            if (isGlacialIce) {
              // Snow / dense glacial ice: very high visible, low SWIR
              b02 = 0.85; b03 = 0.88; b04 = 0.86; b08 = 0.72; b12 = 0.08;
            } else {
              // Exposed rock / moraine
              b02 = 0.22; b03 = 0.24; b04 = 0.26; b08 = 0.28; b12 = 0.45;
            }
            break;
          }

          default:
            break;
        }

        // Apply spectral mode synthesis
        let r = 0;
        let g = 0;
        let b = 0;

        switch (mode) {
          case 'RGB':
            // Natural true color (B04, B03, B02)
            r = Math.floor(Math.min(255, b04 * 480));
            g = Math.floor(Math.min(255, b03 * 480));
            b = Math.floor(Math.min(255, b02 * 480));
            break;

          case 'FALSE_COLOR':
            // Color Infrared CIR (B08 -> R, B04 -> G, B03 -> B)
            // Dense vegetation glows vivid red/crimson
            r = Math.floor(Math.min(255, b08 * 360));
            g = Math.floor(Math.min(255, b04 * 320));
            b = Math.floor(Math.min(255, b03 * 320));
            break;

          case 'NDVI': {
            // (B08 - B04) / (B08 + B04)
            const ndvi = (b08 - b04) / Math.max(0.01, b08 + b04);
            if (ndvi < 0.0) {
              // Water / non-veg
              r = 20; g = 80; b = 160;
            } else if (ndvi < 0.2) {
              // Bare soil / sand / urban
              r = 180; g = 140; b = 90;
            } else if (ndvi < 0.4) {
              // Dry / sparse vegetation
              r = 220; g = 210; b = 50;
            } else if (ndvi < 0.6) {
              // Moderate canopy
              r = 90; g = 185; b = 50;
            } else {
              // Deep, dense forest
              r = 15; g = 125; b = 35;
            }
            break;
          }

          case 'SWIR':
            // Short-Wave Infrared Composite (B12, B8A, B04)
            // Water = dark navy/black, soil = bright ochre, fires = rust/orange, veg = green, urban = gray/cyan
            r = Math.floor(Math.min(255, b12 * 420));
            g = Math.floor(Math.min(255, b08 * 380));
            b = Math.floor(Math.min(255, b04 * 320));
            break;

          case 'NDWI': {
            // (B03 - B08) / (B03 + B08)
            const ndwi = (b03 - b08) / Math.max(0.01, b03 + b08);
            if (ndwi > 0.05) {
              // Open water
              r = 10; g = 110; b = 240;
            } else if (ndwi > -0.15) {
              // Humid soil / shoreline
              r = 50; g = 160; b = 210;
            } else {
              // Dry land / vegetation
              r = 110; g = 100; b = 90;
            }
            break;
          }
        }

        // Write pixel RGBA with opacity
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = Math.floor(255 * opacityFactor);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  /**
   * Render dual-date comparison with a vertical curtain split line (2020 | 2026)
   */
  static renderSplitComparison(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mode: VignetteSpectralMode,
    theme: ComparisonTheme,
    splitPositionPercent: number, // 0 - 100
    opacityPercent: number = 100
  ) {
    const splitX = Math.round((width * splitPositionPercent) / 100);

    // Off-screen canvas A (Year 2020)
    const canvasA = document.createElement('canvas');
    canvasA.width = width;
    canvasA.height = height;
    const ctxA = canvasA.getContext('2d');
    if (!ctxA) return;
    this.renderScene(ctxA, width, height, mode, theme, 2020, opacityPercent, 10);

    // Off-screen canvas B (Year 2026)
    const canvasB = document.createElement('canvas');
    canvasB.width = width;
    canvasB.height = height;
    const ctxB = canvasB.getContext('2d');
    if (!ctxB) return;
    this.renderScene(ctxB, width, height, mode, theme, 2026, opacityPercent, 10);

    // Clear destination
    ctx.clearRect(0, 0, width, height);

    // Draw Left (2020) clipped
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, splitX, height);
    ctx.clip();
    ctx.drawImage(canvasA, 0, 0);
    ctx.restore();

    // Draw Right (2026) clipped
    ctx.save();
    ctx.beginPath();
    ctx.rect(splitX, 0, width - splitX, height);
    ctx.clip();
    ctx.drawImage(canvasB, 0, 0);
    ctx.restore();

    // Draw high-visibility vertical dividing line
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, height);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#38bdf8'; // Sky cyan
    ctx.stroke();

    // Draw center handle circle
    const handleY = height / 2;
    ctx.beginPath();
    ctx.arc(splitX, handleY, 14, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // Draw arrows < > inside handle
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◀ ▶', splitX, handleY);
  }
}
