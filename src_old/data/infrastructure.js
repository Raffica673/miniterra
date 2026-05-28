/**
 * Infrastructure definitions with real-world specifications.
 * Costs are in arbitrary "budget units" (think millions USD).
 * MW ratings based on typical Chilean installations.
 */
export const INFRASTRUCTURE = [
  {
    type: 'solar',
    name: 'Solar Farm',
    description: 'Photovoltaic array · 50 MW peak',
    cost: 120,
    mw: 50,
    themeColor: '#FFD54F',
    glowColor: 'rgba(255, 213, 79, 0.4)',
    icon: '☀️',
    category: 'generation',
    realWorldRef: 'Based on Chilean utility-scale PV (e.g., El Romero Solar)',
    canPlace: (envData) => {
      if (envData.elevation > 2500) return { valid: false, reason: 'Altitude too high — inaccessible terrain' };
      if (envData.floodRisk > 70) return { valid: false, reason: 'High flood risk zone' };
      if (envData.solarIndex < 20) return { valid: true, suboptimal: true, reason: `Low solar suitability (${envData.solarIndex}%) — poor ROI expected` };
      return { valid: true };
    },
    getEfficiency: (envData) => {
      let eff = envData.solarIndex;
      // Temperature penalty above 25°C (panel derating)
      if (envData.temperature > 25) eff *= (1 - (envData.temperature - 25) * 0.004);
      return Math.round(Math.max(0, Math.min(100, eff)));
    },
  },
  {
    type: 'wind',
    name: 'Wind Turbine',
    description: 'Turbine cluster · 30 MW',
    cost: 90,
    mw: 30,
    themeColor: '#4FC3F7',
    glowColor: 'rgba(79, 195, 247, 0.4)',
    icon: '💨',
    category: 'generation',
    realWorldRef: 'Based on Chilean wind farms (e.g., Parque Eólico El Arrayán)',
    canPlace: (envData) => {
      if (envData.elevation > 3000) return { valid: false, reason: 'Extreme altitude — not viable' };
      if (envData.windIndex < 10) return { valid: true, suboptimal: true, reason: `Very low wind (${envData.windSpeed} m/s) — turbine will underperform` };
      return { valid: true };
    },
    getEfficiency: (envData) => {
      let eff = envData.windIndex;
      // High altitude air density penalty
      if (envData.elevation > 1500) eff *= 0.9;
      return Math.round(Math.max(0, Math.min(100, eff)));
    },
  },
  {
    type: 'substation',
    name: 'Substation',
    description: 'Power distribution hub · 220kV',
    cost: 80,
    mw: 0,
    themeColor: '#00E676',
    glowColor: 'rgba(0, 230, 118, 0.3)',
    icon: '⚡',
    category: 'grid',
    realWorldRef: 'Standard Chilean grid substation (SEC regulated)',
    canPlace: (envData) => {
      if (envData.elevation > 2000) return { valid: false, reason: 'Too remote for grid connection' };
      if (envData.floodRisk > 60) return { valid: true, suboptimal: true, reason: 'Flood risk — requires elevated platform' };
      return { valid: true };
    },
    getEfficiency: () => 100,
  },
  {
    type: 'transmission',
    name: 'Transmission Line',
    description: 'High-voltage link · 220kV',
    cost: 30,
    mw: 0,
    themeColor: 'rgba(0, 230, 118, 0.7)',
    glowColor: 'rgba(0, 230, 118, 0.2)',
    icon: '🔌',
    category: 'grid',
    snapsToGrid: true, // This type auto-connects to nearby infrastructure
    realWorldRef: 'Standard transmission tower line',
    canPlace: (envData) => {
      if (envData.elevation > 2500) return { valid: false, reason: 'Terrain too extreme for towers' };
      return { valid: true };
    },
    getEfficiency: () => 100,
  },
  {
    type: 'battery',
    name: 'Battery Storage',
    description: 'Grid-scale Li-ion · 200 MWh',
    cost: 150,
    mw: 0,
    mwh: 200,
    themeColor: '#AB47BC',
    glowColor: 'rgba(171, 71, 188, 0.3)',
    icon: '🔋',
    category: 'storage',
    realWorldRef: 'Based on BESS installations (e.g., AES Andes projects)',
    canPlace: (envData) => {
      if (envData.elevation > 1500) return { valid: false, reason: 'Too remote for battery deployment' };
      if (envData.floodRisk > 50) return { valid: true, suboptimal: true, reason: 'Flood risk — battery systems are water-sensitive' };
      return { valid: true };
    },
    getEfficiency: (envData) => {
      // Temperature affects battery performance
      if (envData.temperature > 30) return 85;
      if (envData.temperature < 5) return 90;
      return 95;
    },
  },
  {
    type: 'weatherStation',
    name: 'Weather Station',
    description: 'Environmental monitor · IoT',
    cost: 15,
    mw: 0,
    themeColor: '#448AFF',
    glowColor: 'rgba(68, 138, 255, 0.3)',
    icon: '📡',
    category: 'monitoring',
    realWorldRef: 'Automatic weather station (AWS) for site validation',
    canPlace: () => ({ valid: true }),
    getEfficiency: () => 100,
  },
  {
    type: 'floodBarrier',
    name: 'Flood Barrier',
    description: 'Flood defense infrastructure',
    cost: 60,
    mw: 0,
    themeColor: '#66BB6A',
    glowColor: 'rgba(102, 187, 106, 0.3)',
    icon: '🛡️',
    category: 'protection',
    realWorldRef: 'Engineered flood protection (levee/barrier)',
    canPlace: (envData) => {
      if (envData.floodRisk < 20) return { valid: true, suboptimal: true, reason: 'Low flood risk — barrier may not be cost-effective' };
      return { valid: true };
    },
    getEfficiency: () => 100,
  },
];

export function getInfraDefinition(type) {
  return INFRASTRUCTURE.find(i => i.type === type);
}

export function getInfraByCategory(category) {
  return INFRASTRUCTURE.filter(i => i.category === category);
}
