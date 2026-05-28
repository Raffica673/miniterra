import { useState, useCallback } from 'react';
import { generateGrid, GRID_COLS, GRID_ROWS } from '../utils/gridGenerator';
import { getInfraDefinition } from '../data/infrastructure';
import { calculateConnections } from '../utils/connections';

let nextId = 1;

export function useGridState() {
  const [cells, setCells] = useState([]);
  const [placementLog, setPlacementLog] = useState([]);

  const loadRegion = useCallback((regionId) => {
    nextId = 1;
    const grid = generateGrid(regionId);
    setCells(grid);
    setPlacementLog([]);
  }, []);

  const placeInfrastructure = useCallback((x, y, type) => {
    setCells(prev => {
      const next = prev.map(c => {
        if (c.x === x && c.y === y) {
          const def = getInfraDefinition(type);
          const efficiency = def.getEfficiency(c);
          const warnings = [];
          if (type === 'solar' && c.temperature > 35) warnings.push('Thermal efficiency penalty -15%');
          if (type === 'wind' && c.windIndex < 25) warnings.push('Low wind zone');
          if (c.floodRisk > 60) warnings.push('High flood risk zone');

          return {
            ...c,
            placedInfra: {
              type,
              id: `infra-${nextId++}`,
              efficiency,
              isConnected: false,
              warnings,
            },
          };
        }
        return c;
      });

      // Apply flood barrier effect
      if (type === 'floodBarrier') {
        return calculateConnections(applyFloodBarrier(next, x, y));
      }

      return calculateConnections(next);
    });

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const def = getInfraDefinition(type);
    const cell = cells.find(c => c.x === x && c.y === y);
    const eff = def.getEfficiency(cell);
    setPlacementLog(prev => [...prev, {
      time,
      text: `Placed ${def.name} at (${x},${y})${type === 'solar' || type === 'wind' ? ` — Eff: ${eff}%` : ''}`,
    }]);
  }, [cells]);

  const removeInfrastructure = useCallback((x, y) => {
    setCells(prev => {
      const next = prev.map(c => {
        if (c.x === x && c.y === y) {
          return { ...c, placedInfra: null };
        }
        return c;
      });
      return calculateConnections(next);
    });
  }, []);

  const undoLastPlacement = useCallback(() => {
    setCells(prev => {
      const placed = prev.filter(c => c.placedInfra);
      if (placed.length === 0) return prev;
      const last = placed[placed.length - 1];
      const next = prev.map(c => {
        if (c.x === last.x && c.y === last.y) {
          return { ...c, placedInfra: null };
        }
        return c;
      });
      return calculateConnections(next);
    });
    setPlacementLog(prev => prev.slice(0, -1));
  }, []);

  return {
    cells, setCells,
    loadRegion,
    placeInfrastructure,
    removeInfrastructure,
    undoLastPlacement,
    placementLog,
  };
}

function applyFloodBarrier(cells, bx, by) {
  return cells.map(c => {
    const dist = Math.abs(c.x - bx) + Math.abs(c.y - by);
    if (dist <= 2 && c.terrain !== 'water') {
      return { ...c, floodRisk: Math.max(0, c.floodRisk - 40) };
    }
    return c;
  });
}
