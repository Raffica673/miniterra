/**
 * Santiago Metropolitan Region exploration zones.
 * Coordinates from Google Maps / OpenStreetMap.
 * Nido de Aguilas: -33.3543, -70.5217 (Lo Barnechea)
 */

// Featured special zone
export const NIDO_ZONE = {
  id: 'nido',
  name: 'Nido de Aguilas',
  subtitle: 'Sustainable Design Challenge',
  description: 'Design a renewable micro-grid for Nido de Aguilas and its surrounding hillside. Place solar panels, wind turbines, and battery storage to power the campus sustainably.',
  center: [-33.3543, -70.5217],
  zoom: 16,
  area: '~12 ha',
  terrain: 'Andean foothill, 780–950m elevation',
  climate: 'Semi-arid Mediterranean, high solar potential',
  featured: true,
};

// Regular exploration regions
export const REGIONS = [
  {
    id: 'santiago-centro',
    name: 'Santiago Centro',
    description: 'The urban core — dense buildings, heat island effects, limited open space. Great for rooftop solar and battery storage testing.',
    center: [-33.4489, -70.6693],
    zoom: 14,
    area: '~22 km²',
    terrain: 'Flat basin, 520m elevation',
    climate: 'Urban heat island, moderate solar',
    solarPotential: 72,
    windPotential: 18,
    floodRisk: 35,
  },
  {
    id: 'maipu-cerrillos',
    name: 'Maipú – Cerrillos',
    description: 'Flat suburban sprawl with large industrial lots. Excellent solar farm potential and space for grid-scale battery storage.',
    center: [-33.5100, -70.7580],
    zoom: 13,
    area: '~80 km²',
    terrain: 'Flat basin, 470–510m',
    climate: 'Open exposure, good solar',
    solarPotential: 82,
    windPotential: 28,
    floodRisk: 20,
  },
  {
    id: 'la-florida-penalolen',
    name: 'La Florida – Peñalolén',
    description: 'Piedmont communities at the base of the Andes. Rising elevation gives moderate wind and excellent views for solar tracking.',
    center: [-33.5180, -70.5870],
    zoom: 13,
    area: '~65 km²',
    terrain: 'Piedmont, 550–800m',
    climate: 'Foothill breeze, good solar',
    solarPotential: 78,
    windPotential: 38,
    floodRisk: 25,
  },
  {
    id: 'quilicura-lampa',
    name: 'Quilicura – Lampa',
    description: 'Northern industrial corridor with wide-open land. Wind funnels through the Chacabuco pass make it promising for wind energy.',
    center: [-33.3500, -70.7350],
    zoom: 13,
    area: '~100 km²',
    terrain: 'Valley floor, 480–520m',
    climate: 'Channeled wind, strong solar',
    solarPotential: 85,
    windPotential: 55,
    floodRisk: 15,
  },
  {
    id: 'lo-barnechea',
    name: 'Lo Barnechea – Farellones',
    description: 'Mountain zone from 700m to 3000m. Extreme elevation = high wind and solar but challenging terrain and flash flood risk in quebradas.',
    center: [-33.3500, -70.4300],
    zoom: 13,
    area: '~120 km²',
    terrain: 'Andes, 700–3200m',
    climate: 'Mountain, high wind + solar',
    solarPotential: 90,
    windPotential: 75,
    floodRisk: 40,
  },
  {
    id: 'pudahuel-oeste',
    name: 'Pudahuel Oeste',
    description: 'Western Santiago near the airport. Flat terrain with good solar exposure and proximity to existing grid infrastructure.',
    center: [-33.4400, -70.8300],
    zoom: 13,
    area: '~55 km²',
    terrain: 'Flat, 460–500m',
    climate: 'Coastal influence, moderate',
    solarPotential: 74,
    windPotential: 30,
    floodRisk: 22,
  },
];

export function getRegionById(id) {
  if (id === 'nido') return NIDO_ZONE;
  return REGIONS.find(r => r.id === id) || null;
}
