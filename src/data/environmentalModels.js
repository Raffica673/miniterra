/**
 * Environmental data models for Santiago metropolitan region.
 * Based on published data from:
 * - Explorador Solar (Chilean Ministry of Energy / GIZ)
 * - Global Solar Atlas (World Bank / ESMAP)
 * - Explorador Eólico (Chilean Ministry of Energy)
 * - NASA POWER (Surface Meteorology)
 * - SRTM elevation data
 *
 * These are simplified continuous models that approximate real conditions.
 */

// Santiago basin approximate elevation model
// Based on SRTM data: Santiago sits in a valley ~500m, 
// Andes rise sharply to the east, Cordillera de la Costa to the west
export function getElevation(lat, lng) {
  // Base elevation of Santiago basin: ~520m
  let elev = 520;
  
  // Eastern Andes rise: longitude east of -70.55 increases sharply
  if (lng > -70.55) {
    const eastFactor = (-70.55 - lng) / (-70.55 - (-70.2)); // 0 to 1 going east
    elev += eastFactor * eastFactor * 2500; // quadratic rise to ~3000m
  }
  
  // Cordillera de la Costa (western hills): slight rise west of -70.85
  if (lng < -70.85) {
    const westFactor = (-70.85 - lng) / 0.15;
    elev += Math.min(westFactor * 300, 400);
  }
  
  // Northern areas slightly lower (toward Lampa valley)
  if (lat > -33.38) {
    elev -= 30;
  }
  
  // Mapocho/Maipo river valleys: slight depression
  const mapochoLat = -33.43;
  const distToMapocho = Math.abs(lat - mapochoLat);
  if (distToMapocho < 0.02) {
    elev -= (1 - distToMapocho / 0.02) * 20;
  }
  
  return Math.max(200, Math.round(elev));
}

/**
 * Solar Global Horizontal Irradiance (GHI) in kWh/m²/day
 * Santiago annual average: 4.5-5.5 kWh/m²/day
 * Based on Explorador Solar data
 */
export function getSolarGHI(lat, lng) {
  // Base GHI for Santiago region
  let ghi = 4.8;
  
  // Latitude effect: northern areas get more sun
  const latEffect = ((-33.5) - lat) * 3; // +0.3 per 0.1° north
  ghi += latEffect;
  
  // Elevation effect: higher = clearer air = more solar (up to a point)
  const elev = getElevation(lat, lng);
  if (elev > 600) {
    ghi += Math.min((elev - 600) / 1000, 0.8); // up to +0.8 for high altitude
  }
  
  // Urban heat island / pollution reduces solar in city center
  const distToCenter = Math.sqrt(
    Math.pow(lat - (-33.4489), 2) + Math.pow(lng - (-70.6693), 2)
  );
  if (distToCenter < 0.05) {
    ghi -= (1 - distToCenter / 0.05) * 0.3;
  }
  
  // Western exposure slightly less (afternoon cloud buildup from coast)
  if (lng < -70.8) {
    ghi -= 0.15;
  }
  
  return Math.max(3.5, Math.min(6.5, Math.round(ghi * 100) / 100));
}

/**
 * Solar suitability index (0-100) for photovoltaic installation
 */
export function getSolarIndex(lat, lng) {
  const ghi = getSolarGHI(lat, lng);
  // Map 3.5-6.5 kWh/m²/day to 0-100
  return Math.round(Math.max(0, Math.min(100, ((ghi - 3.5) / 3.0) * 100)));
}

/**
 * Wind speed at 80m hub height in m/s
 * Santiago basin: 2-4 m/s (sheltered)
 * Mountain passes: 6-10+ m/s
 * Based on Explorador Eólico data
 */
export function getWindSpeed(lat, lng) {
  // Base wind for Santiago basin: low due to mountain shelter
  let wind = 3.0;
  
  const elev = getElevation(lat, lng);
  
  // Elevation dramatically increases wind (mountain ridges/passes)
  if (elev > 800) {
    wind += Math.min((elev - 800) / 300, 6); // up to +6 m/s at high altitude
  }
  
  // Northern gaps (Chacabuco pass area)
  if (lat > -33.35 && lng > -70.8 && lng < -70.6) {
    wind += 1.5;
  }
  
  // Eastern Andes foothills get stronger wind from mountain-valley circulation
  if (lng > -70.6 && lng < -70.45) {
    wind += 1.0;
  }
  
  // Urban areas reduce wind (roughness)
  const distToCenter = Math.sqrt(
    Math.pow(lat - (-33.4489), 2) + Math.pow(lng - (-70.6693), 2)
  );
  if (distToCenter < 0.08) {
    wind -= (1 - distToCenter / 0.08) * 1.5;
  }
  
  return Math.max(1.5, Math.min(12, Math.round(wind * 10) / 10));
}

/**
 * Wind suitability index (0-100) for turbine installation
 * Class 1: <5.5 m/s (poor), Class 2: 5.5-6.5, Class 3: 6.5-7.5, Class 4+: >7.5
 */
export function getWindIndex(lat, lng) {
  const speed = getWindSpeed(lat, lng);
  // Map 1.5-10 m/s to 0-100 (with emphasis on useful range 4-8)
  if (speed < 4) return Math.round((speed / 4) * 30); // 0-30 for <4 m/s
  if (speed < 6) return Math.round(30 + ((speed - 4) / 2) * 30); // 30-60
  return Math.round(Math.min(100, 60 + ((speed - 6) / 4) * 40)); // 60-100
}

/**
 * Average annual temperature in °C
 * Santiago: ~14.5°C average, ranges from 8°C (winter) to 22°C (summer)
 * Based on WorldClim 2.1 / NASA POWER
 */
export function getTemperature(lat, lng) {
  let temp = 14.5;
  
  const elev = getElevation(lat, lng);
  
  // Lapse rate: -6.5°C per 1000m above basin floor (520m)
  if (elev > 520) {
    temp -= ((elev - 520) / 1000) * 6.5;
  }
  
  // Urban heat island effect
  const distToCenter = Math.sqrt(
    Math.pow(lat - (-33.4489), 2) + Math.pow(lng - (-70.6693), 2)
  );
  if (distToCenter < 0.06) {
    temp += (1 - distToCenter / 0.06) * 2; // up to +2°C in city center
  }
  
  // Northern areas slightly warmer
  temp += ((-33.5) - lat) * 2;
  
  return Math.round(temp * 10) / 10;
}

/**
 * Flood risk index (0-100)
 * Based on proximity to rivers, elevation, and drainage
 */
export function getFloodRisk(lat, lng) {
  let risk = 15; // base risk
  
  const elev = getElevation(lat, lng);
  
  // Lower elevation = higher risk (poor drainage)
  if (elev < 500) {
    risk += (500 - elev) / 10;
  }
  
  // Proximity to Mapocho River (rough path)
  const mapochoLat = -33.43;
  const distToMapocho = Math.abs(lat - mapochoLat);
  if (distToMapocho < 0.015 && lng > -70.75 && lng < -70.5) {
    risk += (1 - distToMapocho / 0.015) * 50;
  }
  
  // Proximity to Maipo River (southern)
  const maipoLat = -33.58;
  const distToMaipo = Math.abs(lat - maipoLat);
  if (distToMaipo < 0.02) {
    risk += (1 - distToMaipo / 0.02) * 40;
  }
  
  // Mountain areas: flash flood risk from quebradas
  if (elev > 800 && lng > -70.55) {
    risk += 20;
  }
  
  // Urban impervious surfaces increase runoff risk
  const distToCenter = Math.sqrt(
    Math.pow(lat - (-33.4489), 2) + Math.pow(lng - (-70.6693), 2)
  );
  if (distToCenter < 0.05) {
    risk += 10;
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

/**
 * Color scale utilities for map overlays
 */
export function getSolarColor(ghi, opacity = 0.5) {
  // 3.5 (cool blue) → 5.0 (yellow) → 6.5 (deep orange)
  const t = Math.max(0, Math.min(1, (ghi - 3.5) / 3.0));
  if (t < 0.5) {
    const s = t * 2;
    return `rgba(${Math.round(100 + 155 * s)}, ${Math.round(150 + 105 * s)}, ${Math.round(255 - 180 * s)}, ${opacity})`;
  } else {
    const s = (t - 0.5) * 2;
    return `rgba(${Math.round(255)}, ${Math.round(255 - 120 * s)}, ${Math.round(75 - 75 * s)}, ${opacity})`;
  }
}

export function getWindColor(speed, opacity = 0.5) {
  // 1.5 (light) → 6 (medium blue) → 12 (deep blue/purple)
  const t = Math.max(0, Math.min(1, (speed - 1.5) / 10.5));
  if (t < 0.4) {
    const s = t / 0.4;
    return `rgba(${Math.round(200 - 100 * s)}, ${Math.round(230 - 30 * s)}, ${Math.round(255)}, ${opacity})`;
  } else {
    const s = (t - 0.4) / 0.6;
    return `rgba(${Math.round(100 - 60 * s)}, ${Math.round(200 - 80 * s)}, ${Math.round(255 - 50 * s)}, ${opacity})`;
  }
}

export function getTempColor(temp, opacity = 0.5) {
  // -5 (deep blue) → 15 (green) → 35 (red)
  const t = Math.max(0, Math.min(1, (temp + 5) / 40));
  if (t < 0.5) {
    const s = t * 2;
    return `rgba(${Math.round(50 * s)}, ${Math.round(100 + 155 * s)}, ${Math.round(255 - 100 * s)}, ${opacity})`;
  } else {
    const s = (t - 0.5) * 2;
    return `rgba(${Math.round(50 + 205 * s)}, ${Math.round(255 - 155 * s)}, ${Math.round(155 - 155 * s)}, ${opacity})`;
  }
}

export function getFloodColor(risk, opacity = 0.5) {
  const t = Math.max(0, Math.min(1, risk / 100));
  return `rgba(${Math.round(50 + 200 * t)}, ${Math.round(150 - 100 * t)}, ${Math.round(255 - 200 * t)}, ${opacity * t})`;
}
