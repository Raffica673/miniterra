import { memo, useMemo } from 'react';
import { TILE_WIDTH, TILE_HEIGHT, gridToScreen } from '../../utils/isometric';
import { TERRAIN_COLORS, getOverlayColor } from '../../utils/colors';
import TerrainProps from './TerrainProps';
import InfrastructureIcon from './InfrastructureIcon';

function seededRandTile(x, y) {
  let s = ((x * 73856093) ^ (y * 19349663)) & 0x7fffffff;
  if (s === 0) s = 1;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const IsometricTile = memo(function IsometricTile({
  cell,
  overlays = [],
  isHovered = false,
  onPointerEnter,
  onPointerLeave,
  onPointerUp,
  showCompare = false,
}) {
  const { x, y, terrain, elevation } = cell;
  const colors = TERRAIN_COLORS[terrain];

  // Screen position (top-left corner of tile)
  const { screenX, screenY } = gridToScreen(x, y, 0);

  // Overlay colors
  const overlayColor1 = overlays.length > 0 ? getOverlayValue(cell, overlays[0]) : null;
  const overlayColor2 = overlays.length > 1 ? getOverlayValue(cell, overlays[1]) : null;

  const isWater = terrain === 'water';
  const hatchId = `hatch-${x}-${y}`;

  // Elevation-based shade variation for more detail
  const elevShade = useMemo(() => {
    const factor = 0.85 + (elevation / 100) * 0.3;
    return factor;
  }, [elevation]);

  // Terrain detail noise for fidelity
  const rand = useMemo(() => seededRandTile(x, y), [x, y]);
  const noiseVariation = useMemo(() => {
    const v = rand();
    return 0.92 + v * 0.16;
  }, [rand]);

  const baseColor = colors.base;

  return (
    <g
      transform={`translate(${screenX}, ${screenY})`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerUp={onPointerUp}
      style={{ cursor: 'pointer' }}
    >
      {/* Base tile square */}
      <rect
        x={0} y={0}
        width={TILE_WIDTH} height={TILE_HEIGHT}
        fill={baseColor}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={0.5}
      />

      {/* Elevation shading - subtle gradient for topographic feel */}
      <rect
        x={0} y={0}
        width={TILE_WIDTH} height={TILE_HEIGHT}
        fill={elevation > 50 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
      />

      {/* Terrain detail noise patch */}
      {(terrain === 'land') && <LandDetail x={x} y={y} />}

      {/* Water animation */}
      {isWater && <WaterDetail x={x} y={y} />}

      {/* Urban grid detail */}
      {terrain === 'urban' && <UrbanDetail x={x} y={y} />}

      {/* Mountain contour lines */}
      {terrain === 'mountain' && <MountainDetail x={x} y={y} elevation={elevation} />}

      {/* Forest canopy */}
      {terrain === 'forest' && <ForestDetail x={x} y={y} />}

      {/* Overlay tint */}
      {overlayColor1 && !showCompare && (
        <rect x={0} y={0} width={TILE_WIDTH} height={TILE_HEIGHT} fill={overlayColor1} />
      )}
      {showCompare && overlayColor1 && overlayColor2 && (
        <>
          <polygon
            points={`0,0 ${TILE_WIDTH},0 0,${TILE_HEIGHT}`}
            fill={overlayColor1}
          />
          <polygon
            points={`${TILE_WIDTH},0 ${TILE_WIDTH},${TILE_HEIGHT} 0,${TILE_HEIGHT}`}
            fill={overlayColor2}
          />
        </>
      )}
      {showCompare && overlayColor1 && !overlayColor2 && (
        <rect x={0} y={0} width={TILE_WIDTH} height={TILE_HEIGHT} fill={overlayColor1} />
      )}

      {/* Restricted hatch */}
      {cell.isRestricted && (
        <>
          <defs>
            <pattern id={hatchId} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="5" stroke="var(--accent-danger)" strokeWidth="2" opacity="0.25" />
            </pattern>
          </defs>
          <rect x={0} y={0} width={TILE_WIDTH} height={TILE_HEIGHT} fill={`url(#${hatchId})`} />
          <text x={TILE_WIDTH - 10} y={10} fontSize={8} fill="var(--accent-danger)" opacity={0.6}>⛔</text>
        </>
      )}

      {/* Terrain props (trees, mountains, buildings) */}
      <g transform={`translate(${TILE_WIDTH / 2}, ${TILE_HEIGHT / 2})`}>
        <TerrainProps terrain={terrain} x={x} y={y} />
      </g>

      {/* Placed infrastructure */}
      {cell.placedInfra && (
        <g transform={`translate(${TILE_WIDTH / 2}, ${TILE_HEIGHT / 2})`}>
          <InfrastructureIcon type={cell.placedInfra.type} cell={cell} />
        </g>
      )}

      {/* Hover highlight */}
      {isHovered && (
        <rect
          x={0} y={0}
          width={TILE_WIDTH} height={TILE_HEIGHT}
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(0,230,118,0.6)"
          strokeWidth={2}
        />
      )}
    </g>
  );
});

function WaterDetail({ x, y }) {
  const rand = seededRandTile(x + 200, y + 200);
  const offsets = [0.25, 0.5, 0.75];
  return (
    <g>
      {offsets.map((frac, i) => {
        const yPos = TILE_HEIGHT * frac;
        const xOff = rand() * 4;
        return (
          <line
            key={i}
            x1={4 + xOff}
            y1={yPos}
            x2={TILE_WIDTH - 4 - xOff}
            y2={yPos}
            stroke="rgba(100,180,255,0.15)"
            strokeWidth={1}
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="-2,0;2,0;-2,0"
              dur={`${5 + i}s`}
              begin={`${i * 1.2}s`}
              repeatCount="indefinite"
            />
          </line>
        );
      })}
      {/* Water shimmer dot */}
      <circle cx={TILE_WIDTH * 0.3 + rand() * 10} cy={TILE_HEIGHT * 0.4} r={1} fill="rgba(150,220,255,0.2)">
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function LandDetail({ x, y }) {
  const rand = seededRandTile(x + 300, y + 300);
  const dots = [];
  for (let i = 0; i < 5; i++) {
    dots.push(
      <circle
        key={i}
        cx={4 + rand() * (TILE_WIDTH - 8)}
        cy={4 + rand() * (TILE_HEIGHT - 8)}
        r={0.6 + rand() * 0.5}
        fill={rand() > 0.5 ? 'rgba(120,180,100,0.12)' : 'rgba(80,130,70,0.1)'}
      />
    );
  }
  // Subtle terrain texture lines
  return (
    <g>
      {dots}
      {rand() > 0.6 && (
        <line
          x1={6} y1={TILE_HEIGHT * 0.3 + rand() * 10}
          x2={TILE_WIDTH - 6} y2={TILE_HEIGHT * 0.3 + rand() * 10 + 3}
          stroke="rgba(100,160,80,0.06)"
          strokeWidth={0.8}
        />
      )}
    </g>
  );
}

function UrbanDetail({ x, y }) {
  const rand = seededRandTile(x + 400, y + 400);
  // Road grid lines
  return (
    <g opacity={0.08}>
      <line x1={TILE_WIDTH * 0.5} y1={2} x2={TILE_WIDTH * 0.5} y2={TILE_HEIGHT - 2} stroke="white" strokeWidth={0.8} />
      <line x1={2} y1={TILE_HEIGHT * 0.5} x2={TILE_WIDTH - 2} y2={TILE_HEIGHT * 0.5} stroke="white" strokeWidth={0.8} />
      {rand() > 0.5 && (
        <rect
          x={TILE_WIDTH * 0.15} y={TILE_HEIGHT * 0.15}
          width={TILE_WIDTH * 0.25} height={TILE_HEIGHT * 0.25}
          fill="rgba(255,220,100,0.15)"
          rx={1}
        />
      )}
    </g>
  );
}

function MountainDetail({ x, y, elevation }) {
  const rand = seededRandTile(x + 500, y + 500);
  // Contour lines for elevation
  return (
    <g>
      <line
        x1={3} y1={TILE_HEIGHT * 0.3}
        x2={TILE_WIDTH - 5} y2={TILE_HEIGHT * 0.35}
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={0.6}
      />
      <line
        x1={6} y1={TILE_HEIGHT * 0.6}
        x2={TILE_WIDTH - 3} y2={TILE_HEIGHT * 0.55}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={0.6}
      />
      {elevation > 80 && (
        <circle
          cx={TILE_WIDTH * 0.5} cy={TILE_HEIGHT * 0.4}
          r={3} fill="rgba(224,224,232,0.15)"
        />
      )}
    </g>
  );
}

function ForestDetail({ x, y }) {
  const rand = seededRandTile(x + 600, y + 600);
  // Canopy dots for top-down forest view
  const dots = [];
  for (let i = 0; i < 4; i++) {
    const cx = 6 + rand() * (TILE_WIDTH - 12);
    const cy = 6 + rand() * (TILE_HEIGHT - 12);
    const r = 3 + rand() * 4;
    dots.push(
      <circle
        key={i}
        cx={cx} cy={cy} r={r}
        fill={rand() > 0.5 ? 'rgba(30,80,40,0.35)' : 'rgba(45,107,63,0.3)'}
        stroke="rgba(20,60,30,0.15)"
        strokeWidth={0.3}
      />
    );
  }
  return <g>{dots}</g>;
}

function getOverlayValue(cell, overlay) {
  if (!overlay) return null;
  if (overlay === 'solar') return getOverlayColor('solar', cell.solarIndex);
  if (overlay === 'wind') return getOverlayColor('wind', cell.windIndex);
  if (overlay === 'flood') return getOverlayColor('flood', cell.floodRisk);
  if (overlay === 'temp') return getOverlayColor('temp', cell.temperature);
  return null;
}

export default IsometricTile;
