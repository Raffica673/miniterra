/**
 * Simplified infrastructure for G4 students
 * Generation: Solar, Wind, Hydro, Geothermal
 * Grid: Transmission Line (simple connector)
 */
export const INFRASTRUCTURE = [
  {
    type: 'solar',
    name: 'Solar Power Plant',
    description: 'Solar panels that capture energy from the Sun',
    cost: 150,
    mw: 50,
    themeColor: '#FFD54F',
    glowColor: 'rgba(255, 213, 79, 0.4)',
    icon: '☀️',
    category: 'generation',
    educationalInfo: {
      title: 'Solar Energy (Solar Power)',
      definition: 'Energy from the Sun, a renewable resource. Solar panels convert sunlight into electricity that can power homes, schools, and cities.',
      funFact: 'The Sun provides enough energy in one hour to power the entire world for a year!',
    },
    canPlace: (envData) => {
      if (envData.elevation > 2500) return { valid: false, reason: 'Too high — difficult to build here' };
      if (envData.floodRisk > 70) return { valid: false, reason: 'Flood risk too high' };
      if (envData.solarIndex < 20) return { valid: true, suboptimal: true, reason: `Not much sunlight here (${envData.solarIndex}%)` };
      return { valid: true };
    },
    getEfficiency: (envData) => {
      let eff = envData.solarIndex;
      if (envData.temperature > 25) eff *= (1 - (envData.temperature - 25) * 0.004);
      return Math.round(Math.max(0, Math.min(100, eff)));
    },
  },
  {
    type: 'wind',
    name: 'Wind Power Plant',
    description: 'Wind turbines that capture energy from moving air',
    cost: 120,
    mw: 30,
    themeColor: '#4FC3F7',
    glowColor: 'rgba(79, 195, 247, 0.4)',
    icon: '💨',
    category: 'generation',
    educationalInfo: {
      title: 'Wind Energy (Wind Power)',
      definition: 'Energy of moving air, a renewable resource. Wind turbines (windmills) spin when the wind blows and create electricity.',
      funFact: 'One large wind turbine can power about 600 homes!',
    },
    canPlace: (envData) => {
      if (envData.elevation > 3000) return { valid: false, reason: 'Too high — extreme conditions' };
      if (envData.windIndex < 10) return { valid: true, suboptimal: true, reason: `Not much wind here (${envData.windSpeed} m/s)` };
      return { valid: true };
    },
    getEfficiency: (envData) => {
      let eff = envData.windIndex;
      if (envData.elevation > 1500) eff *= 0.9;
      return Math.round(Math.max(0, Math.min(100, eff)));
    },
  },
  {
    type: 'hydro',
    name: 'Hydroelectric Power Plant',
    description: 'Dam that captures energy from moving water',
    cost: 180,
    mw: 40,
    themeColor: '#00BCD4',
    glowColor: 'rgba(0, 188, 212, 0.4)',
    icon: '🌊',
    category: 'generation',
    educationalInfo: {
      title: 'Water Energy (Water Power)',
      definition: 'Energy of moving water, a renewable resource. Hydroelectric dams use flowing rivers to spin turbines and create electricity.',
      funFact: 'Water power provides about 16% of the world\'s electricity!',
    },
    canPlace: (envData) => {
      if (envData.elevation < 400) return { valid: false, reason: 'Not enough elevation — water needs to flow downhill' };
      if (envData.elevation > 2800) return { valid: false, reason: 'Too high — too difficult to build' };
      if (envData.floodRisk > 60) return { valid: true, suboptimal: true, reason: 'High flood risk area' };
      return { valid: true };
    },
    getEfficiency: (envData) => {
      let eff = Math.min(100, 50 + (envData.elevation - 400) / 20);
      if (envData.temperature < 5) eff *= 0.95;
      return Math.round(Math.max(0, Math.min(100, eff)));
    },
  },
  {
    type: 'geothermal',
    name: 'Geothermal Power Plant',
    description: 'Plant that captures heat energy from inside the Earth',
    cost: 200,
    mw: 40,
    themeColor: '#FF5722',
    glowColor: 'rgba(255, 87, 34, 0.4)',
    icon: '🌋',
    category: 'generation',
    educationalInfo: {
      title: 'Heat Energy (Thermal Energy)',
      definition: 'Energy in the form of heat, such as what usually comes from a fire. Geothermal plants use heat from deep underground (near volcanoes) to create electricity.',
      funFact: 'The Earth\'s core is as hot as the surface of the Sun — about 6,000°C!',
    },
    canPlace: (envData) => {
      if (envData.elevation < 800) return { valid: false, reason: 'No volcanic activity at low elevations' };
      if (envData.elevation > 3500) return { valid: false, reason: 'Too high — extreme conditions' };
      if (envData.elevation < 1500) return { valid: true, suboptimal: true, reason: 'Low geothermal potential here' };
      return { valid: true };
    },
    getEfficiency: (envData) => {
      let eff = Math.min(100, 30 + (envData.elevation - 800) / 25);
      return Math.round(Math.max(0, Math.min(100, eff)));
    },
  },
  {
    type: 'transmission',
    name: 'Transmission Line',
    description: 'A special wire that carries electricity from energy stations to homes, schools, and communities',
    cost: 30,
    mw: 0,
    themeColor: '#66BB6A',
    glowColor: 'rgba(102, 187, 106, 0.3)',
    icon: '⚡',
    category: 'grid',
    educationalInfo: {
      title: 'Electricity (Electrical Energy)',
      definition: 'A form of energy, such as what usually powers light bulbs. Transmission lines are special wires that carry electricity from power plants to homes, schools, and communities.',
      funFact: 'Electricity travels through wires at nearly the speed of light — that\'s 300,000 kilometers per second!',
    },
    canPlace: (envData) => {
      if (envData.elevation > 2500) return { valid: false, reason: 'Terrain too extreme for construction' };
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
