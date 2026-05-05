import { getInfraDefinition } from '../data/infrastructure';

/**
 * Calculate feasibility scores based on real placement data.
 */
export function calculateScore(placements, budget, totalBudget) {
  if (placements.length === 0) {
    return { overall: 0, solarEff: 0, windEff: 0, floodSafety: 100, connectivity: 0, budgetEff: 100, totalMW: 0, solarMW: 0, windMW: 0, storageMWh: 0, co2Avoided: 0 };
  }

  const solarFarms = placements.filter(p => p.type === 'solar');
  const windTurbines = placements.filter(p => p.type === 'wind');
  const batteries = placements.filter(p => p.type === 'battery');

  // Average efficiencies
  const avgSolarEff = solarFarms.length > 0
    ? solarFarms.reduce((s, p) => s + p.efficiency, 0) / solarFarms.length
    : 50;
  const avgWindEff = windTurbines.length > 0
    ? windTurbines.reduce((s, p) => s + p.efficiency, 0) / windTurbines.length
    : 50;

  // Flood safety: average flood risk of all placements
  const avgFloodRisk = placements.reduce((s, p) => s + p.envData.floodRisk, 0) / placements.length;
  const floodSafety = 100 - avgFloodRisk;

  // Connectivity
  const connected = placements.filter(p => p.isConnected).length;
  const connectivity = (connected / placements.length) * 100;

  // Budget efficiency
  const budgetEff = totalBudget > 0 ? (budget / totalBudget) * 100 : 100;

  // Energy calculations (based on real capacity factors)
  // Santiago solar capacity factor: ~20-25%, wind: ~25-35% (varies by site)
  const solarMW = solarFarms.reduce((s, p) => {
    const def = getInfraDefinition('solar');
    return s + (def.mw * p.efficiency / 100);
  }, 0);
  const windMW = windTurbines.reduce((s, p) => {
    const def = getInfraDefinition('wind');
    return s + (def.mw * p.efficiency / 100);
  }, 0);
  const totalMW = solarMW + windMW;

  // Storage
  const storageMWh = batteries.length * 200;

  // CO2 avoided (tons/year) - Chile's grid emission factor: ~0.4 tCO2/MWh
  // Annual hours: 8760, capacity factor average: ~0.25
  const annualMWh = totalMW * 8760 * 0.25;
  const co2Avoided = Math.round(annualMWh * 0.4);

  const overall = Math.round(
    avgSolarEff * 0.20 +
    avgWindEff * 0.20 +
    floodSafety * 0.15 +
    connectivity * 0.25 +
    budgetEff * 0.10 +
    Math.min(100, (placements.length / 5) * 100) * 0.10
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    solarEff: Math.round(avgSolarEff),
    windEff: Math.round(avgWindEff),
    floodSafety: Math.round(floodSafety),
    connectivity: Math.round(connectivity),
    budgetEff: Math.round(budgetEff),
    totalMW: Math.round(totalMW * 10) / 10,
    solarMW: Math.round(solarMW * 10) / 10,
    windMW: Math.round(windMW * 10) / 10,
    storageMWh,
    co2Avoided,
  };
}

export function getClassification(score) {
  if (score >= 76) return 'Excellent Site';
  if (score >= 51) return 'Strong Site';
  if (score >= 26) return 'Moderate Site';
  return 'Poor Site';
}

export function getScoreColor(score) {
  if (score >= 60) return '#00E676';
  if (score >= 30) return '#FFC107';
  return '#FF1744';
}
