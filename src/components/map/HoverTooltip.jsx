import { memo } from 'react';

const HoverTooltip = memo(function HoverTooltip({ cell, pos }) {
  if (!cell || !pos) return null;

  const terrainLabels = {
    water: 'Water', land: 'Land', forest: 'Forest',
    mountain: 'Mountain', urban: 'Urban',
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x + 16,
        top: pos.y - 80,
        zIndex: 10,
        pointerEvents: 'none',
        background: 'rgba(11, 15, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 180,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        paddingBottom: 6,
        borderBottom: '1px solid var(--glass-border)',
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          color: 'white',
        }}>
          {terrainLabels[cell.terrain] || cell.terrain}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: 'var(--text-muted)',
        }}>
          ({cell.x}, {cell.y}) · {cell.elevation}m
        </span>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
        <StatRow icon="☀" label="Solar" value={cell.solarIndex} color="#FFD54F" />
        <StatRow icon="💨" label="Wind" value={cell.windIndex} color="#4FC3F7" />
        <StatRow icon="🌊" label="Flood" value={cell.floodRisk} color="#EF5350" />
        <StatRow icon="🌡" label="Temp" value={`${cell.temperature}°C`} color="#7E57C2" />
      </div>

      {/* Restricted badge */}
      {cell.isRestricted && (
        <div style={{
          marginTop: 6,
          paddingTop: 6,
          borderTop: '1px solid var(--glass-border)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10,
          color: '#FF1744',
        }}>
          ⛔ Protected Area — No Construction
        </div>
      )}

      {/* Placed infra */}
      {cell.placedInfra && (
        <div style={{
          marginTop: 6,
          paddingTop: 6,
          borderTop: '1px solid var(--glass-border)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10,
          color: '#00E676',
        }}>
          ⚡ {cell.placedInfra.type} — {cell.placedInfra.efficiency}% eff.
        </div>
      )}
    </div>
  );
});

function StatRow({ icon, label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 10 }}>{icon}</span>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 10,
        color: 'var(--text-muted)',
        flex: 1,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        fontWeight: 500,
        color,
      }}>
        {value}
      </span>
    </div>
  );
}

export default HoverTooltip;
