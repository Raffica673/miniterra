import MiniMapPreview from './MiniMapPreview';

const LEVEL_COLORS = {
  High: { solar: '#FFD54F', wind: '#4FC3F7', flood: '#EF5350' },
  Moderate: { solar: '#FFB74D', wind: '#81D4FA', flood: '#FF8A65' },
  Low: { solar: '#8D6E63', wind: '#B3E5FC', flood: '#66BB6A' },
  None: { solar: '#5F6368', wind: '#5F6368', flood: '#66BB6A' },
};

export default function RegionCard({ region, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        width: '100%',
        background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-tertiary)',
        borderRadius: 10,
        border: isSelected ? '1px solid #00E676' : '1px solid var(--glass-border)',
        borderLeft: isSelected ? '3px solid #00E676' : '1px solid var(--glass-border)',
        padding: 14,
        cursor: 'pointer',
        transition: 'all 200ms',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'rgba(0,230,118,0.3)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.transform = 'none';
        }
      }}
    >
      {/* Region name */}
      <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 8 }}>
        {region.name}
      </div>

      {/* Mini map */}
      <MiniMapPreview regionId={region.id} />

      {/* Stat pills */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        <Pill label={`☀ ${region.solar}`} color={LEVEL_COLORS[region.solar]?.solar || '#5F6368'} />
        <Pill label={`💨 ${region.wind}`} color={LEVEL_COLORS[region.wind]?.wind || '#5F6368'} />
        <Pill label={`🌊 ${region.flood}`} color={LEVEL_COLORS[region.flood]?.flood || '#5F6368'} />
      </div>

      {/* Description */}
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 12,
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        marginTop: 8,
      }}>
        {region.description}
      </div>

      {/* Coordinates */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: 'var(--text-dim)',
        marginTop: 6,
      }}>
        {region.coordinates}
      </div>
    </div>
  );
}

function Pill({ label, color }) {
  return (
    <span style={{
      background: 'var(--bg-surface)',
      borderRadius: 12,
      padding: '3px 8px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 10,
      color,
    }}>
      {label}
    </span>
  );
}
