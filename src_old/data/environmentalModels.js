/**
 * Environmental data models for Santiago metropolitan region.
 * Based on published data from:
 * - Explorador Solar (Chilean Ministry of Energy / GIZ)
 * - Global Solar Atlas (World Bank / ESMAP)
 * - Explorador Eólico (Chilean Ministry of Energy)
 * - NASA POWER (Surface Meteorology)
 * - SRTM elevation data
 *
 * Models are tuned for the Santiago Metropolitan Region bounding box:
 * Lat: -33.65 to -33.20, Lng: -71.05 to -70.30
 */

// Boundaries of the Santiago Metropolitan Region
const BOUNDS = { minLat: -33.65, maxLat: -33.20, minLng: -71.05, maxLng: -70.30 };

function clampLat(lat) { return Math.max(BOUNDS.minLat, Math.min(BOUNDS.maxLat, lat)); }
function clampLng(lng) { return Math.max(BOUNDS.minLng, Math.min(BOUNDS.maxLng, lng)); }

/**
 * Elevation model (meters above sea level)
 * Santiago basin: ~480-560m, Andes foothills: 700-1500m,
 * High Andes (Farellones): 2000-3200m, Coastal range: 600-800m
 */
export function getElevation(rawLat, rawLng) {
  const lat = clampLat(rawLat);
  const lng = clampLng(rawLng);
  
  // Base elevation varies across the basin
  let elev = 520;
  
  // East-west gradient: Andes rise to the east
  // Transition starts around lng -70.55
  if (lng > -70.55) {
    const t = (lng - (-70.55)) / ((-70.30) - (-70.55)); // 0 to 1
    elev += t * t * 2200; // Quadratic rise to ~2700m at the eastern edge
  }
  
  // Lo Barnechea / Nido area (lng ~ -70.52, lat ~ -33.35): ~750-900m
  if (lng > -70.56 && lng < -70.48 && lat > -33.40 && lat < -33.30) {
    elev = Math.max(elev, 780 + (lng - (-70.56)) / 0.08 * 200);
  }
  
  // Cordillera de la Costa (western hills): gentle rise west of -70.85
  if (lng < -70.85) {
    const t = ((-70.85) - lng) / 0.20; // 0 to 1
    elev += Math.min(t * 250, 350);
  }
  
  // Northern Lampa valley: slightly lower
  if (lat > -33.32) {
    elev -= 40;
  }
  
  // Mapocho River valley: subtle depression
  const mapochoLat = -33.43;
  const distToMapocho = Math.abs(lat - mapochoLat);
  if (distToMapocho < 0.015 && lng > -70.75 && lng < -70.50) {
    elev -= (1 - distToMapocho / 0.015) * 25;
  }
  
  // Southern edge near Maipo
  if (lat < -33.55) {
    elev -= 20;
  }
  
  return Math.max(350, Math.min(3200, Math.round(elev)));
}

/**
 * Solar GHI (Global Horizontal Irradiance) in kWh/m²/day
 * Santiago annual average: 4.5-5.5 kWh/m²/day
 * Higher in northern/eastern areas, lower in urban/western areas
 */
export function getSolarGHI(rawLat, rawLng) {
  const lat = clampLat(rawLat);
  const lng = clampLng(rawLng);
  
  // Base GHI for central Santiago
  let ghi = 4.85;
  
  // Latitude effect: northern areas ~0.1 more per 0.1° north
  ghi += ((-33.45) - lat) * 1.0;
  
  // Elevation effect: clearer air at altitude
  const elev = getElevation(lat, lng);
  if (elev > 600) {
    ghi += Math.min((elev - 600) / 2000, 0.6);
  }
  
  // Urban pollution reduces solar in city center
  const distToCenter = Math.sqrt(Math.pow(lat + 33.4489, 2) + Math.pow(lng + 70.6693, 2));
  if (distToCenter < 0.06) {
    ghi -= (1 - distToCenter / 0.06) * 0.25;
  }
  
  // Western coastal influence: slightly less sun
  if (lng < -70.85) {
    ghi -= 0.1;
  }
  
  return Math.max(3.8, Math.min(6.0, Math.round(ghi * 100) / 100));
}

/**
 * Solar suitability index (0-100)
 */
export function getSolarIndex(lat, lng) {
  const ghi = getSolarGHI(lat, lng);
  return Math.round(Math.max(0, Math.min(100, ((ghi - 3.5) / 2.5) * 100)));
}

/**
 * Wind speed at 80m hub height in m/s
 * Santiago basin: 2-4 m/s (sheltered by mountains)
 * Mountain ridges: 6-10 m/s, Coastal range: 4-6 m/s
 */
export function getWindSpeed(rawLat, rawLng) {
  const lat = clampLat(rawLat);
  const lng = clampLng(rawLng);
  
  let wind = 3.2; // Base for Santiago basin
  
  const elev = getElevation(lat, lng);
  
  // Higher elevation = more wind exposure
  if (elev > 700) {
    wind += Math.min((elev - 700) / 400, 5.0);
  }
  
  // Chacabuco pass (north)
  if (lat > -33.30 && lng > -70.80 && lng < -70.55) {
    wind += 1.2;
  }
  
  // Lo Barnechea / eastern foothills: mountain-valley breeze
  if (lng > -70.58 && lng < -70.45 && lat > -33.42 && lat < -33.30) {
    wind += 0.8;
  }
  
  // Urban roughness reduces wind
  const distToCenter = Math.sqrt(Math.pow(lat + 33.4489, 2) + Math.pow(lng + 70.6693, 2));
  if (distToCenter < 0.08) {
    wind -= (1 - distToCenter / 0.08) * 1.2;
  }
  
  // Coastal range gets moderate wind
  if (lng < -70.85) {
    wind += 0.8;
  }
  
  return Math.max(1.5, Math.min(10, Math.round(wind * 10) / 10));
}

/**
 * Wind suitability index (0-100)
 */
export function getWindIndex(lat, lng) {
  const speed = getWindSpeed(lat, lng);
  if (speed < 3.5) return Math.round((speed / 3.5) * 25);
  if (speed < 5.5) return Math.round(25 + ((speed - 3.5) / 2.0) * 30);
  return Math.round(Math.min(100, 55 + ((speed - 5.5) / 4.5) * 45));
}

/**
 * Temperature (annual average) in °C
 * Santiago: 14-15°C annual average at basin floor
 * Lapse rate: ~6.0°C per 1000m
 */
export function getTemperature(rawLat, rawLng) {
  const lat = clampLat(rawLat);
  const lng = clampLng(rawLng);
  
  let temp = 14.5; // Basin average
  
  const elev = getElevation(lat, lng);
  
  // Lapse rate from basin floor (520m)
  if (elev > 520) {
    temp -= ((elev - 520) / 1000) * 6.0;
  }
  
  // Urban heat island: +1.5°C in city core
  const distToCenter = Math.sqrt(Math.pow(lat + 33.4489, 2) + Math.pow(lng + 70.6693, 2));
  if (distToCenter < 0.06) {
    temp += (1 - distToCenter / 0.06) * 1.5;
  }
  
  // Slight north-south gradient
  temp += ((-33.45) - lat) * 0.8;
  
  return Math.max(-5, Math.min(20, Math.round(temp * 10) / 10));
}

/**
 * Flood risk index (0-100)
 */
export function getFloodRisk(rawLat, rawLng) {
  const lat = clampLat(rawLat);
  const lng = clampLng(rawLng);
  
  let risk = 12;
  const elev = getElevation(lat, lng);
  
  // Low-lying areas
  if (elev < 500) {
    risk += (500 - elev) / 8;
  }
  
  // Mapocho River corridor
  const mapochoLat = -33.43;
  const distToMapocho = Math.abs(lat - mapochoLat);
  if (distToMapocho < 0.012 && lng > -70.75 && lng < -70.50) {
    risk += (1 - distToMapocho / 0.012) * 45;
  }
  
  // Maipo River (southern)
  const distToMaipo = Math.abs(lat - (-33.58));
  if (distToMaipo < 0.015) {
    risk += (1 - distToMaipo / 0.015) * 35;
  }
  
  // Eastern quebradas (mountain flash floods)
  if (elev > 800 && lng > -70.55) {
    risk += 15;
  }
  
  // Urban impervious surfaces
  if (distToMapocho < 0.05) {
    risk += 8;
  }
  
  return Math.max(0, Math.min(100, Math.round(risk)));
}

/**
 * Get all environmental data for a point
 */
export function getEnvironmentalData(lat, lng) {
  return {
    elevation: getElevation(lat, lng),
    solarGHI: getSolarGHI(lat, lng),
    solarIndex: getSolarIndex(lat, lng),
    windSpeed: getWindSpeed(lat, lng),
    windIndex: getWindIndex(lat, lng),
    temperature: getTemperature(lat, lng),
    floodRisk: getFloodRisk(lat, lng),
  };
}
