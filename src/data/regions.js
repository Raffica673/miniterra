// Simplified regions for G4 students
// Scout mode: 3 fictional 3D grid maps
// Build mode: 4 real Chilean cities

export const SCOUT_REGIONS = [
  {
    id: 'mountain-valley',
    name: '🏔️ Mountain Valley',
    description: 'High elevation terrain with varied slopes and valleys',
    gridSize: 20,
    elevationRange: [800, 2200],
    terrain: 'Mountain',
    characteristics: {
      solar: 'High',
      wind: 'Very High',
      temperature: 'Cool (8-15°C)',
      hydro: 'Excellent',
    },
  },
  {
    id: 'coastal-plains',
    name: '🌊 Coastal Plains',
    description: 'Flat coastal area with ocean winds and moderate sun',
    gridSize: 20,
    elevationRange: [0, 300],
    terrain: 'Coastal',
    characteristics: {
      solar: 'Moderate',
      wind: 'Excellent',
      temperature: 'Mild (12-18°C)',
      hydro: 'Low',
    },
  },
  {
    id: 'desert-plateau',
    name: '🏜️ Desert Plateau',
    description: 'High desert with extreme sun and minimal water',
    gridSize: 20,
    elevationRange: [1500, 2000],
    terrain: 'Desert',
    characteristics: {
      solar: 'Extreme',
      wind: 'Moderate',
      temperature: 'Hot (18-28°C)',
      hydro: 'Very Low',
    },
  },
];

export const BUILD_REGIONS = [
  {
    id: 'santiago',
    name: 'Santiago',
    description: 'Capital city — urban energy planning with mountain backdrop',
    center: [-33.4489, -70.6693],
    zoom: 12,
    bounds: [[-33.50, -70.75], [-33.40, -70.59]],
    region: 'Santiago',
    characteristics: {
      solar: 'High',
      wind: 'Moderate',
      temperature: '~14°C avg',
      hydro: 'Low',
      elevation: '520m',
      terrain: 'Urban/Valley',
    },
  },
  {
    id: 'puerto-varas',
    name: 'Puerto Varas',
    description: 'Lake region with volcanoes — excellent hydro and geothermal potential',
    center: [-41.3200, -72.9800],
    zoom: 13,
    bounds: [[-41.38, -73.05], [-41.26, -72.91]],
    region: 'Los Lagos',
    characteristics: {
      solar: 'Moderate',
      wind: 'Moderate',
      temperature: '~11°C avg',
      hydro: 'Excellent',
      elevation: '50-1200m',
      terrain: 'Lakes/Volcanic',
    },
  },
  {
    id: 'punta-arenas',
    name: 'Punta Arenas',
    description: 'Southernmost city — extreme wind resource for green energy',
    center: [-53.1638, -70.9171],
    zoom: 12,
    bounds: [[-53.25, -71.05], [-53.08, -70.78]],
    region: 'Magallanes',
    characteristics: {
      solar: 'Low',
      wind: 'Extreme (12+ m/s)',
      temperature: '~6°C avg',
      hydro: 'Low',
      elevation: '10m',
      terrain: 'Coastal/Steppe',
    },
  },
  {
    id: 'san-pedro',
    name: 'San Pedro de Atacama',
    description: 'Desert oasis — world-class solar and geothermal resources',
    center: [-22.9083, -68.1997],
    zoom: 12,
    bounds: [[-22.98, -68.28], [-22.84, -68.12]],
    region: 'Atacama',
    characteristics: {
      solar: 'Extreme (World Record)',
      wind: 'Moderate',
      temperature: '~18°C avg',
      hydro: 'Very Low',
      elevation: '2400m',
      terrain: 'High Desert',
    },
  },
];

// Legacy export for compatibility
export const REGIONS = BUILD_REGIONS;
