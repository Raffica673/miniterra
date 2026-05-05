import { GRID_COLS, GRID_ROWS } from './gridGenerator';

function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Calculates connectivity for all placed infrastructure.
 * Connected = within 4 cells of a substation, or within 4 cells of a
 * transmission line that is itself connected to a substation (transitively).
 */
export function calculateConnections(cells) {
  const placed = cells.filter(c => c.placedInfra);
  const substations = placed.filter(c => c.placedInfra.type === 'substation');
  const transmissions = placed.filter(c => c.placedInfra.type === 'transmission');
  const others = placed.filter(c => c.placedInfra.type !== 'substation' && c.placedInfra.type !== 'transmission');

  // Mark substations as always connected
  substations.forEach(s => { s.placedInfra.isConnected = true; });

  // Build connectivity graph using BFS from substations through transmission lines
  const connectedSet = new Set();
  substations.forEach(s => connectedSet.add(`${s.x},${s.y}`));

  // Expand through transmission lines
  let changed = true;
  while (changed) {
    changed = false;
    for (const t of transmissions) {
      const key = `${t.x},${t.y}`;
      if (connectedSet.has(key)) continue;

      // Check if within 4 cells of any connected node
      const isNearConnected = [...connectedSet].some(k => {
        const [cx, cy] = k.split(',').map(Number);
        return distance({ x: t.x, y: t.y }, { x: cx, y: cy }) <= 4;
      });

      if (isNearConnected) {
        connectedSet.add(key);
        t.placedInfra.isConnected = true;
        changed = true;
      }
    }
  }

  // Mark transmission lines not in connected set
  transmissions.forEach(t => {
    if (!connectedSet.has(`${t.x},${t.y}`)) {
      t.placedInfra.isConnected = false;
    }
  });

  // Check all other infrastructure
  for (const cell of others) {
    const isConnected = [...connectedSet].some(k => {
      const [cx, cy] = k.split(',').map(Number);
      return distance({ x: cell.x, y: cell.y }, { x: cx, y: cy }) <= 4;
    });
    cell.placedInfra.isConnected = isConnected;
  }

  return cells;
}

export function getConnectionLines(cells) {
  const placed = cells.filter(c => c.placedInfra && c.placedInfra.isConnected);
  const substations = placed.filter(c => c.placedInfra.type === 'substation');
  const lines = [];

  for (const cell of placed) {
    if (cell.placedInfra.type === 'substation') continue;
    // Find nearest connected substation or transmission
    let nearest = null;
    let minDist = Infinity;
    for (const s of substations) {
      const d = distance(cell, s);
      if (d < minDist && d <= 8) {
        minDist = d;
        nearest = s;
      }
    }
    if (nearest) {
      lines.push({ from: { x: cell.x, y: cell.y }, to: { x: nearest.x, y: nearest.y } });
    }
  }
  return lines;
}
