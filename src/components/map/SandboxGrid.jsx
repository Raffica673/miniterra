import { useState, useCallback } from 'react';
import { getInfraDefinition } from '../../data/infrastructure';

/**
 * Sandbox Grid - A simple tutorial grid for Build 1 mode
 * No map underlay, just a stylized grid with water features and settlements
 */
export default function SandboxGrid({ 
  placements = [], 
  activeTool, 
  onGridClick, 
  onRemovePlacement,
  activeOverlays = []
}) {
  const [hoveredCell, setHoveredCell] = useState(null);
  
  const GRID_SIZE = 20; // 20x20 grid
  const CELL_SIZE = 40; // pixels
  
  // Define terrain features (water, settlements, etc.)
  const terrainFeatures = {
    water: [
      // River running through middle
      [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10], [11, 10], [12, 10], [13, 10], [14, 10],
      [10, 9], [10, 11], [11, 9], [11, 11], [12, 9], [12, 11],
      // Small lake
      [15, 5], [16, 5], [15, 6], [16, 6], [17, 5], [17, 6],
    ],
    settlement: [
      [3, 3], [4, 3], [3, 4], [4, 4], // Small town top-left
      [16, 16], [17, 16], [16, 17], [17, 17], // Small town bottom-right
    ],
    forest: [
      [2, 15], [3, 15], [4, 15], [2, 16], [3, 16], [4, 16],
      [18, 3], [19, 3], [18, 4], [19, 4],
    ],
  };

  const isWater = (row, col) => terrainFeatures.water.some(([r, c]) => r === row && c === col);
  const isSettlement = (row, col) => terrainFeatures.settlement.some(([r, c]) => r === row && c === col);
  const isForest = (row, col) => terrainFeatures.forest.some(([r, c]) => r === row && c === col);

  const handleCellClick = (row, col) => {
    if (!activeTool) return;
    // Convert grid coordinates to fake lat/lng for compatibility
    const fakeLat = -33.4489 + (row - GRID_SIZE / 2) * 0.001;
    const fakeLng = -70.6693 + (col - GRID_SIZE / 2) * 0.001;
    onGridClick(fakeLat, fakeLng);
  };

  const getCellColor = (row, col) => {
    if (isWater(row, col)) return '#4FC3F7';
    if (isSettlement(row, col)) return '#9E9E9E';
    if (isForest(row, col)) return '#2E7D32';
    
    // Base terrain with slight variation
    const variation = (row + col) % 3;
    if (variation === 0) return '#A5D6A7';
    if (variation === 1) return '#81C784';
    return '#66BB6A';
  };

  const getOverlayColor = (row, col) => {
    if (activeOverlays.length === 0) return null;

    const solarIntensity = Math.max(0, 1 - Math.abs(row - 10) / 15);
    const windIntensity = Math.max(0, 1 - Math.abs(col - 10) / 15);
    const tempIntensity = (row + col) / (GRID_SIZE * 2);
    const floodIntensity = isWater(row, col) ? 1 : Math.max(0, 0.5 - Math.abs(row - 10) / 20);

    let overlayColor = null;
    if (activeOverlays.includes('solar')) {
      overlayColor = `rgba(255, 213, 79, ${solarIntensity * 0.4})`;
    }
    if (activeOverlays.includes('wind')) {
      overlayColor = `rgba(79, 195, 247, ${windIntensity * 0.4})`;
    }
    if (activeOverlays.includes('temp')) {
      overlayColor = `rgba(255, 112, 67, ${tempIntensity * 0.4})`;
    }
    if (activeOverlays.includes('flood')) {
      overlayColor = `rgba(239, 83, 80, ${floodIntensity * 0.5})`;
    }

    return overlayColor;
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
      overflow: 'auto',
      padding: 20,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        gap: 1,
        background: '#1B5E20',
        padding: 2,
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        {Array.from({ length: GRID_SIZE }).map((_, row) =>
          Array.from({ length: GRID_SIZE }).map((_, col) => {
            const cellKey = `${row}-${col}`;
            const isHovered = hoveredCell === cellKey;
            const placement = placements.find(p => {
              const pRow = Math.round((p.lat + 33.4489) / 0.001 + GRID_SIZE / 2);
              const pCol = Math.round((p.lng + 70.6693) / 0.001 + GRID_SIZE / 2);
              return pRow === row && pCol === col;
            });

            return (
              <div
                key={cellKey}
                onMouseEnter={() => setHoveredCell(cellKey)}
                onMouseLeave={() => setHoveredCell(null)}
                onClick={() => handleCellClick(row, col)}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  background: getCellColor(row, col),
                  cursor: activeTool ? 'crosshair' : 'default',
                  border: isHovered ? '2px solid #1B5E20' : '1px solid rgba(27, 94, 32, 0.2)',
                  borderRadius: 2,
                  position: 'relative',
                  transition: 'all 0.2s',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {/* Overlay for data layers */}
                {getOverlayColor(row, col) && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: getOverlayColor(row, col),
                    pointerEvents: 'none',
                    borderRadius: 2,
                  }} />
                )}

                {/* Terrain icons */}
                {isWater(row, col) && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    fontSize: 20,
                    opacity: 0.6,
                  }}>
                    🌊
                  </div>
                )}
                {isSettlement(row, col) && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    fontSize: 20,
                  }}>
                    🏘️
                  </div>
                )}
                {isForest(row, col) && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    fontSize: 20,
                    opacity: 0.7,
                  }}>
                    🌲
                  </div>
                )}

                {/* Placed infrastructure */}
                {placement && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePlacement?.(placement.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: 24,
                      cursor: 'pointer',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  >
                    {getInfraDefinition(placement.type)?.icon ?? '⚙️'}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '2px solid #2E7D32',
      }}>
        <div style={{ 
          fontFamily: "'DM Sans', sans-serif", 
          fontSize: 11, 
          fontWeight: 700, 
          color: '#1B5E20',
          marginBottom: 8,
        }}>
          LEGEND
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
            <span>🌊</span>
            <span style={{ color: '#1B5E20' }}>Water / River</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
            <span>🏘️</span>
            <span style={{ color: '#1B5E20' }}>Settlement</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
            <span>🌲</span>
            <span style={{ color: '#1B5E20' }}>Forest</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
            <div style={{ width: 12, height: 12, background: '#66BB6A', borderRadius: 2 }} />
            <span style={{ color: '#1B5E20' }}>Open Land</span>
          </div>
        </div>
      </div>
    </div>
  );
}
