function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

const GRID_COLS = 32;
const GRID_ROWS = 22;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Settlement labels for each region
const ATACAMA_SETTLEMENTS = [
  { name: 'San Pedro', x: 13, y: 9 },
  { name: 'Calama', x: 20, y: 5 },
  { name: 'Toconao', x: 8, y: 14 },
  { name: 'Peine', x: 25, y: 12 },
  { name: 'Socaire', x: 5, y: 3 },
  { name: 'Río Grande', x: 17, y: 16 },
];

const PATAGONIA_SETTLEMENTS = [
  { name: 'Puerto Natales', x: 12, y: 7 },
  { name: 'Punta Arenas', x: 14, y: 14 },
  { name: 'Porvenir', x: 8, y: 3 },
  { name: 'Cerro Castillo', x: 22, y: 10 },
  { name: 'Villa Tehuelches', x: 6, y: 18 },
  { name: 'Bahía Azul', x: 20, y: 4 },
];

const CENTRAL_VALLEY_SETTLEMENTS = [
  { name: 'Rancagua', x: 12, y: 6 },
  { name: 'San Fernando', x: 16, y: 12 },
  { name: 'Rengo', x: 8, y: 4 },
  { name: 'Santa Cruz', x: 22, y: 8 },
  { name: 'Pichilemu', x: 4, y: 15 },
  { name: 'Chimbarongo', x: 20, y: 16 },
  { name: 'Machalí', x: 14, y: 9 },
];

function generateAtacama(rand) {
  const cells = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      let terrain = 'land';
      let elevation = 30 + Math.floor(rand() * 30);

      // Mountains in rows 0-3, columns 0-8
      if (y <= 3 && x <= 8) {
        terrain = 'mountain';
        elevation = 80 + Math.floor(rand() * 20);
      }
      // Additional mountain ridge at top-right
      if (y <= 2 && x >= 26 && x <= 31) {
        terrain = 'mountain';
        elevation = 70 + Math.floor(rand() * 25);
      }

      // Diagonal river from ~(4,3) to ~(12,20)
      const ry = 3 + ((x - 4) * 17) / 8;
      if (x >= 4 && x <= 12 && Math.abs(y - ry) < 1.5) {
        terrain = 'water';
        elevation = 3;
      }
      // Lake at (18,14)-(20,16)
      if (x >= 18 && x <= 21 && y >= 14 && y <= 17) {
        terrain = 'water';
        elevation = 5;
      }

      // Forest near river
      if (terrain === 'land' && x >= 3 && x <= 14) {
        const dist = Math.abs(y - (3 + ((x - 4) * 17) / 8));
        if (dist >= 1.5 && dist < 3.5 && rand() < 0.45) {
          terrain = 'forest';
          elevation = 25 + Math.floor(rand() * 15);
        }
      }
      // Forest patch near lake
      if (terrain === 'land' && x >= 16 && x <= 23 && y >= 12 && y <= 19 && rand() < 0.25) {
        terrain = 'forest';
        elevation = 22 + Math.floor(rand() * 12);
      }

      // Urban cluster - San Pedro
      if (x >= 12 && x <= 15 && y >= 8 && y <= 11) {
        terrain = 'urban';
        elevation = 30 + Math.floor(rand() * 15);
      }
      // Urban cluster - Calama
      if (x >= 19 && x <= 22 && y >= 4 && y <= 6) {
        terrain = 'urban';
        elevation = 32 + Math.floor(rand() * 12);
      }
      // Small village - Toconao
      if (x >= 7 && x <= 9 && y >= 13 && y <= 15) {
        terrain = 'urban';
        elevation = 28 + Math.floor(rand() * 10);
      }

      // Solar: high 75-95
      let solarIndex = 75 + Math.floor(rand() * 20);
      if (terrain === 'forest') solarIndex -= 20;
      if (terrain === 'mountain') solarIndex -= 10;
      if (y > 3 && y <= 6 && x <= 8) solarIndex -= 30;

      // Wind: low 15-35
      let windIndex = 15 + Math.floor(rand() * 20);
      if (terrain === 'mountain' || elevation > 60) windIndex += 15;
      if (terrain === 'urban') windIndex -= 20;

      let floodRisk = 5;
      if (terrain === 'water') floodRisk = 0;
      else {
        if (elevation < 20) floodRisk += 60;
        if (terrain === 'mountain') floodRisk -= 30;
      }

      let temperature = 28 + Math.floor(rand() * 10);
      temperature -= Math.floor(elevation / 20) * 5;

      const isRestricted = terrain === 'mountain' || (terrain === 'forest' && rand() < 0.08);

      cells.push({
        x, y, terrain, elevation,
        solarIndex: clamp(solarIndex + Math.floor((rand() - 0.5) * 10), 0, 100),
        windIndex: clamp(windIndex + Math.floor((rand() - 0.5) * 10), 0, 100),
        floodRisk: clamp(floodRisk, 0, 100),
        temperature: clamp(temperature, -10, 50),
        isRestricted,
        placedInfra: null,
      });
    }
  }
  addFloodAdjacency(cells);
  return cells;
}

function generatePatagonia(rand) {
  const cells = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      let terrain = 'land';
      let elevation = 25 + Math.floor(rand() * 30);

      // Ocean: columns 24-31
      if (x >= 24) {
        terrain = 'water';
        elevation = 3;
      }
      // Fjord inlet
      if (x >= 22 && x <= 25 && y >= 8 && y <= 12) {
        terrain = 'water';
        elevation = 3;
      }

      // Mountains: columns 0-3
      if (x <= 3) {
        terrain = 'mountain';
        elevation = 80 + Math.floor(rand() * 20);
      }
      // Additional peaks
      if (x >= 4 && x <= 6 && y <= 3) {
        terrain = 'mountain';
        elevation = 70 + Math.floor(rand() * 20);
      }

      // Forest in lower-left
      if (x >= 4 && x <= 12 && y >= 14 && terrain === 'land' && rand() < 0.55) {
        terrain = 'forest';
        elevation = 20 + Math.floor(rand() * 20);
      }
      // Forest mid-section
      if (x >= 8 && x <= 16 && y >= 2 && y <= 6 && terrain === 'land' && rand() < 0.35) {
        terrain = 'forest';
        elevation = 18 + Math.floor(rand() * 18);
      }

      // Urban - Puerto Natales
      if (x >= 11 && x <= 14 && y >= 6 && y <= 9) {
        terrain = 'urban';
        elevation = 30 + Math.floor(rand() * 10);
      }
      // Urban - Punta Arenas
      if (x >= 13 && x <= 16 && y >= 13 && y <= 16) {
        terrain = 'urban';
        elevation = 28 + Math.floor(rand() * 12);
      }
      // Small village
      if (x >= 7 && x <= 9 && y >= 2 && y <= 4) {
        terrain = 'urban';
        elevation = 26 + Math.floor(rand() * 10);
      }

      let solarIndex = 30 + Math.floor(rand() * 25);
      let windIndex = 65 + Math.floor(rand() * 25);
      let floodRisk = 15;
      if (x >= 21 && x < 24) floodRisk += 70;
      if (terrain === 'water') floodRisk = 0;
      let temperature = 2 + Math.floor(rand() * 10);

      const isRestricted = terrain === 'mountain' || (terrain === 'forest' && rand() < 0.08);

      cells.push({
        x, y, terrain, elevation,
        solarIndex: clamp(solarIndex, 0, 100),
        windIndex: clamp(windIndex, 0, 100),
        floodRisk: clamp(floodRisk, 0, 100),
        temperature: clamp(temperature, -10, 50),
        isRestricted,
        placedInfra: null,
      });
    }
  }
  addFloodAdjacency(cells);
  return cells;
}

function generateCentralValley(rand) {
  const cells = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      let terrain = 'land';
      let elevation = 25 + Math.floor(rand() * 25);

      // River rows 10-11
      if (y === 10 || y === 11) {
        terrain = 'water';
        elevation = 3;
      }
      // Stream tributary
      if (x >= 20 && x <= 22 && y >= 6 && y <= 10) {
        terrain = 'water';
        elevation = 4;
      }

      // Forest patches in corners (larger blocks)
      if ((x < 5 && y < 5) || (x < 5 && y >= 17) ||
          (x >= 27 && y < 5) || (x >= 27 && y >= 17)) {
        if (terrain !== 'water') {
          terrain = 'forest';
          elevation = 20 + Math.floor(rand() * 20);
        }
      }
      // Additional forest strip
      if (x >= 6 && x <= 10 && y >= 15 && y <= 18 && terrain === 'land' && rand() < 0.4) {
        terrain = 'forest';
        elevation = 22 + Math.floor(rand() * 15);
      }

      // Large urban area - Rancagua
      if (x >= 11 && x <= 14 && y >= 5 && y <= 8 && terrain !== 'water') {
        terrain = 'urban';
        elevation = 30 + Math.floor(rand() * 15);
      }
      // Urban - San Fernando
      if (x >= 15 && x <= 18 && y >= 11 && y <= 14 && terrain !== 'water') {
        terrain = 'urban';
        elevation = 28 + Math.floor(rand() * 12);
      }
      // Small town - Santa Cruz
      if (x >= 21 && x <= 24 && y >= 7 && y <= 9) {
        terrain = 'urban';
        elevation = 26 + Math.floor(rand() * 10);
      }

      let solarIndex = 50 + Math.floor(rand() * 20);
      let windIndex = 30 + Math.floor(rand() * 20);
      let floodRisk = 10;
      if ((y === 9 || y === 12) && terrain !== 'water') floodRisk += 50;
      if (terrain === 'water') floodRisk = 0;
      let temperature = 15 + Math.floor(rand() * 10);

      const isRestricted = (terrain === 'forest' && rand() < 0.08);

      cells.push({
        x, y, terrain, elevation,
        solarIndex: clamp(solarIndex, 0, 100),
        windIndex: clamp(windIndex, 0, 100),
        floodRisk: clamp(floodRisk, 0, 100),
        temperature: clamp(temperature, -10, 50),
        isRestricted,
        placedInfra: null,
      });
    }
  }
  addFloodAdjacency(cells);
  return cells;
}

function addFloodAdjacency(cells) {
  const getCell = (x, y) => cells.find(c => c.x === x && c.y === y);
  for (const cell of cells) {
    if (cell.terrain === 'water') continue;
    const neighbors = [
      getCell(cell.x - 1, cell.y),
      getCell(cell.x + 1, cell.y),
      getCell(cell.x, cell.y - 1),
      getCell(cell.x, cell.y + 1),
    ];
    if (neighbors.some(n => n && n.terrain === 'water')) {
      cell.floodRisk = clamp(cell.floodRisk + 40, 0, 100);
    }
  }
}

export function getSettlements(regionId) {
  switch (regionId) {
    case 'atacama': return ATACAMA_SETTLEMENTS;
    case 'patagonia': return PATAGONIA_SETTLEMENTS;
    case 'central-valley': return CENTRAL_VALLEY_SETTLEMENTS;
    default: return ATACAMA_SETTLEMENTS;
  }
}

export function generateGrid(regionId) {
  const rand = seededRandom(hashString(regionId));
  switch (regionId) {
    case 'atacama': return generateAtacama(rand);
    case 'patagonia': return generatePatagonia(rand);
    case 'central-valley': return generateCentralValley(rand);
    default: return generateAtacama(rand);
  }
}

export { GRID_COLS, GRID_ROWS, clamp };
