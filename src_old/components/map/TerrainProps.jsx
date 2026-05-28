import { memo, useMemo } from 'react';

function seededRandForTile(x, y) {
  let s = ((x * 73856093) ^ (y * 19349663)) & 0x7fffffff;
  if (s === 0) s = 1;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const TerrainProps = memo(function TerrainProps({ terrain, x, y }) {
  const rand = useMemo(() => seededRandForTile(x, y), [x, y]);

  if (terrain === 'forest') return <ForestProps rand={rand} />;
  if (terrain === 'mountain') return <MountainProps rand={rand} />;
  if (terrain === 'urban') return <UrbanProps rand={rand} />;
  return null;
});

// Top-down forest: canopy circles
function ForestProps({ rand }) {
  const trees = useMemo(() => {
    const count = 3 + Math.floor(rand() * 3);
    return Array.from({ length: count }, (_, i) => ({
      ox: (rand() - 0.5) * 16,
      oy: (rand() - 0.5) * 16,
      r: 3 + rand() * 3,
      shade: rand() > 0.5 ? '#2D6B3F' : '#256B35',
      highlight: rand() > 0.6,
      key: i,
    }));
  }, [rand]);

  return (
    <g>
      {trees.map(t => (
        <g key={t.key}>
          {/* Tree shadow */}
          <ellipse cx={t.ox + 1} cy={t.oy + 1} rx={t.r * 0.8} ry={t.r * 0.8} fill="rgba(0,0,0,0.1)" />
          {/* Canopy */}
          <circle cx={t.ox} cy={t.oy} r={t.r} fill={t.shade} stroke="#1A4A28" strokeWidth={0.4} />
          {/* Canopy highlight */}
          {t.highlight && (
            <circle cx={t.ox - t.r * 0.25} cy={t.oy - t.r * 0.25} r={t.r * 0.35} fill="rgba(255,255,255,0.06)" />
          )}
        </g>
      ))}
    </g>
  );
}

// Top-down mountain: contour rings + peak marker
function MountainProps({ rand }) {
  const hasPeak = rand() > 0.3;
  return (
    <g>
      {/* Contour rings */}
      <ellipse cx={0} cy={0} rx={10} ry={8} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
      <ellipse cx={0} cy={-1} rx={7} ry={5} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
      <ellipse cx={0} cy={-2} rx={4} ry={3} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
      {/* Peak */}
      {hasPeak && (
        <>
          <circle cx={0} cy={-2} r={2} fill="rgba(224,224,232,0.2)" />
          <polygon points="0,-5 1.5,-1 -1.5,-1" fill="rgba(224,224,232,0.15)" />
        </>
      )}
    </g>
  );
}

// Top-down urban: building footprints
function UrbanProps({ rand }) {
  const buildings = useMemo(() => {
    const count = 3 + Math.floor(rand() * 3);
    return Array.from({ length: count }, (_, i) => {
      const w = 3 + rand() * 6;
      const h = 3 + rand() * 6;
      return {
        ox: (rand() - 0.5) * 14,
        oy: (rand() - 0.5) * 14,
        w,
        h,
        color: ['#3D3D52', '#4A4A60', '#353548'][Math.floor(rand() * 3)],
        hasLight: rand() < 0.3,
        key: i,
      };
    });
  }, [rand]);

  return (
    <g>
      {buildings.map(b => (
        <g key={b.key}>
          {/* Building shadow */}
          <rect
            x={b.ox - b.w / 2 + 0.8}
            y={b.oy - b.h / 2 + 0.8}
            width={b.w} height={b.h}
            fill="rgba(0,0,0,0.15)"
            rx={0.5}
          />
          {/* Building footprint */}
          <rect
            x={b.ox - b.w / 2}
            y={b.oy - b.h / 2}
            width={b.w} height={b.h}
            fill={b.color}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={0.3}
            rx={0.5}
          />
          {/* Rooftop light */}
          {b.hasLight && (
            <circle cx={b.ox} cy={b.oy} r={0.8} fill="rgba(255,220,100,0.5)">
              <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite" />
            </circle>
          )}
        </g>
      ))}
    </g>
  );
}

export default TerrainProps;
