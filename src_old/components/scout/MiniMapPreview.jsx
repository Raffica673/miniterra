import { useMemo, memo } from 'react';
import { generateGrid, GRID_COLS, GRID_ROWS } from '../../utils/gridGenerator';
import { TERRAIN_COLORS } from '../../utils/colors';

const MINI_TILE = 8;
const MINI_HALF = 4;

const MiniMapPreview = memo(function MiniMapPreview({ regionId }) {
  const cells = useMemo(() => generateGrid(regionId), [regionId]);

  const width = (GRID_COLS + GRID_ROWS) * MINI_HALF + MINI_TILE;
  const height = (GRID_COLS + GRID_ROWS) * (MINI_HALF / 2) + MINI_HALF;

  return (
    <div style={{
      width: '100%',
      height: 100,
      borderRadius: 6,
      overflow: 'hidden',
      background: 'var(--bg-primary)',
    }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {cells.map(cell => {
          const sx = (cell.x - cell.y) * MINI_HALF + width / 2;
          const sy = (cell.x + cell.y) * (MINI_HALF / 2) + 4;
          const color = TERRAIN_COLORS[cell.terrain].base;
          return (
            <polygon
              key={`${cell.x}-${cell.y}`}
              points={`${sx},${sy - MINI_HALF / 2} ${sx + MINI_HALF},${sy} ${sx},${sy + MINI_HALF / 2} ${sx - MINI_HALF},${sy}`}
              fill={color}
            />
          );
        })}
      </svg>
    </div>
  );
});

export default MiniMapPreview;
