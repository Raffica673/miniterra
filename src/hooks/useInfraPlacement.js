import { useState, useCallback } from 'react';
import { getInfraDefinition } from '../data/infrastructure';
import { getEnvironmentalData } from '../data/environmentalModels';

let nextId = 1;

/**
 * Hook for managing infrastructure placements on real map coordinates.
 * Each placement has: id, type, lat, lng, envData, efficiency, isConnected, warnings
 */
export function useInfraPlacement() {
  const [placements, setPlacements] = useState([]);
  const [placementLog, setPlacementLog] = useState([]);

  const addPlacement = useCallback((type, lat, lng) => {
    const def = getInfraDefinition(type);
    if (!def) return null;

    const envData = getEnvironmentalData(lat, lng);
    const placeResult = def.canPlace(envData);
    if (!placeResult.valid) return placeResult;

    const efficiency = def.getEfficiency(envData);
    const warnings = [];
    if (placeResult.suboptimal) warnings.push(placeResult.reason);
    if (envData.floodRisk > 50) warnings.push(`Flood risk: ${envData.floodRisk}%`);

    const id = `infra-${nextId++}`;
    const placement = {
      id,
      type,
      lat,
      lng,
      envData,
      efficiency,
      isConnected: type === 'substation', // Substations are always connected
      warnings,
      placedAt: Date.now(),
    };

    setPlacements(prev => {
      const next = [...prev, placement];
      return recalculateConnections(next);
    });

    // Log entry
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setPlacementLog(prev => [...prev, {
      time,
      text: `Placed ${def.name} at ${lat.toFixed(4)}°, ${lng.toFixed(4)}°${efficiency !== 100 ? ` — Eff: ${efficiency}%` : ''}`,
      type,
    }]);

    return { valid: true, placement };
  }, []);

  const removePlacement = useCallback((id) => {
    setPlacements(prev => {
      const item = prev.find(p => p.id === id);
      if (!item) return prev;
      const next = prev.filter(p => p.id !== id);
      return recalculateConnections(next);
    });
    setPlacementLog(prev => [...prev, {
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      text: `Removed infrastructure ${id}`,
      type: 'remove',
    }]);
  }, []);

  const undoLast = useCallback(() => {
    setPlacements(prev => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      return recalculateConnections(next);
    });
    setPlacementLog(prev => prev.slice(0, -1));
  }, []);

  const clearAll = useCallback(() => {
    setPlacements([]);
    setPlacementLog([]);
    nextId = 1;
  }, []);

  return {
    placements,
    placementLog,
    addPlacement,
    removePlacement,
    undoLast,
    clearAll,
  };
}

/**
 * Connection range in degrees (~500m at Santiago's latitude)
 * 1 degree latitude ≈ 111km, so 0.005° ≈ 550m
 */
const CONNECTION_RANGE = 0.008; // ~890m

function getDistance(a, b) {
  return Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2));
}

/**
 * Recalculate which placements are connected to the grid.
 * A placement is "connected" if it's within range of a substation,
 * or within range of a transmission line that is itself connected.
 */
function recalculateConnections(placements) {
  const substations = placements.filter(p => p.type === 'substation');
  const connectedSet = new Set(substations.map(s => s.id));

  // BFS through transmission lines
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of placements) {
      if (connectedSet.has(p.id)) continue;
      if (p.type !== 'transmission') continue;

      const isNearConnected = placements.some(c =>
        connectedSet.has(c.id) && getDistance(p, c) <= CONNECTION_RANGE
      );

      if (isNearConnected) {
        connectedSet.add(p.id);
        changed = true;
      }
    }
  }

  // Now check all other infrastructure
  return placements.map(p => {
    if (p.type === 'substation') return { ...p, isConnected: true };
    if (connectedSet.has(p.id)) return { ...p, isConnected: true };

    const isConnected = placements.some(c =>
      connectedSet.has(c.id) && getDistance(p, c) <= CONNECTION_RANGE
    );

    return { ...p, isConnected };
  });
}

/**
 * Get power line connections for rendering
 */
export function getConnectionLines(placements) {
  const connected = placements.filter(p => p.isConnected);
  const substations = connected.filter(p => p.type === 'substation');
  const lines = [];

  for (const p of connected) {
    if (p.type === 'substation') continue;

    // Find nearest connected node (prefer substation, then transmission)
    let nearest = null;
    let minDist = Infinity;

    for (const s of substations) {
      const d = getDistance(p, s);
      if (d < minDist && d <= CONNECTION_RANGE * 2) {
        minDist = d;
        nearest = s;
      }
    }

    // If no substation nearby, connect to nearest transmission
    if (!nearest) {
      for (const t of connected) {
        if (t.id === p.id) continue;
        if (t.type !== 'transmission' && t.type !== 'substation') continue;
        const d = getDistance(p, t);
        if (d < minDist) {
          minDist = d;
          nearest = t;
        }
      }
    }

    if (nearest) {
      lines.push({
        from: { lat: p.lat, lng: p.lng },
        to: { lat: nearest.lat, lng: nearest.lng },
        fromType: p.type,
        toType: nearest.type,
      });
    }
  }

  return lines;
}
