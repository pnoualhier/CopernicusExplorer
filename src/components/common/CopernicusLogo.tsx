import React from 'react';

interface CopernicusLogoProps {
  className?: string;
  size?: number;
}

export const CopernicusLogo: React.FC<CopernicusLogoProps> = ({ className = 'w-8 h-8', size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      role="img"
      aria-label="Logo Copernicus Explorer"
    >
      <defs>
        <radialGradient id="logoSpaceGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="60%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </radialGradient>
        <linearGradient id="logoOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="logoAtmosphere" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Rounded Container */}
      <rect width="512" height="512" rx="112" fill="#0f172a" />
      <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="#38bdf8" strokeWidth="6" strokeOpacity="0.4" />

      {/* Earth Center Sphere */}
      <circle cx="256" cy="256" r="130" fill="url(#logoSpaceGrad)" />

      {/* Atmospheric Halo */}
      <circle cx="256" cy="256" r="142" fill="none" stroke="url(#logoAtmosphere)" strokeWidth="6" />

      {/* Continents & Biosphere */}
      <path
        d="M 190,190 Q 220,170 250,200 T 290,220 T 260,280 T 210,290 Z"
        fill="#10b981"
        fillOpacity="0.85"
      />
      <path
        d="M 270,260 Q 310,250 340,280 T 320,330 T 280,320 Z"
        fill="#10b981"
        fillOpacity="0.75"
      />
      <path
        d="M 180,310 Q 210,300 230,340 T 190,360 Z"
        fill="#10b981"
        fillOpacity="0.65"
      />

      {/* Elliptical Satellite Orbit 1 */}
      <ellipse
        cx="256"
        cy="256"
        rx="210"
        ry="82"
        transform="rotate(-30 256 256)"
        fill="none"
        stroke="url(#logoOrbitGrad)"
        strokeWidth="10"
      />

      {/* Polar Orbit 2 */}
      <ellipse
        cx="256"
        cy="256"
        rx="195"
        ry="75"
        transform="rotate(45 256 256)"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="4"
        strokeDasharray="16 12"
        strokeOpacity="0.7"
      />

      {/* Main Satellite Sentinel */}
      <g transform="translate(385, 175) rotate(-30)">
        {/* Solar Panel Left */}
        <rect x="-46" y="-12" width="32" height="24" rx="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
        <line x1="-30" y1="-12" x2="-30" y2="12" stroke="#0f172a" strokeWidth="2" />
        {/* Solar Panel Right */}
        <rect x="14" y="-12" width="32" height="24" rx="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
        <line x1="30" y1="-12" x2="30" y2="12" stroke="#0f172a" strokeWidth="2" />
        {/* Central Satellite Body */}
        <rect x="-10" y="-16" width="20" height="32" rx="4" fill="#ffffff" stroke="#64748b" strokeWidth="2" />
        {/* Optical / Radar Sensor */}
        <circle cx="0" cy="2" r="5" fill="#0284c7" />
        <circle cx="0" cy="2" r="2" fill="#38bdf8" />
      </g>

      {/* Secondary Sensor Node */}
      <circle cx="120" cy="335" r="9" fill="#38bdf8" />
      <circle cx="120" cy="335" r="16" fill="none" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.6" />
    </svg>
  );
};
