import { useApp } from '../../contexts/AppContext';

const LAYERS = [
  { id: 'solar', label: '☀ Solar', color: '#FFD54F' },
  { id: 'wind', label: '💨 Wind', color: '#4FC3F7' },
  { id: 'flood', label: '🌊 Flood', color: '#EF5350' },
  { id: 'temp', label: '🌡 Temp', color: '#7E57C2' },
];

export default function DataLayerToggles() {
  const { activeOverlays, toggleOverlay, compareMode, setCompareMode } = useApp();

  return (
    <div>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        color: 'var(--text-muted)',
        letterSpacing: 3,
        marginBottom: 12,
      }}>
        DATA LAYERS
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {LAYERS.map(layer => {
          const isActive = activeOverlays.includes(layer.id);
          return (
            <button
              key={layer.id}
              onClick={() => toggleOverlay(layer.id)}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 8,
                background: isActive ? `${layer.color}0D` : 'var(--bg-surface)',
                border: `1px solid ${isActive ? `${layer.color}4D` : 'var(--glass-border)'}`,
                borderLeft: isActive ? `3px solid ${layer.color}` : `1px solid ${isActive ? `${layer.color}4D` : 'var(--glass-border)'}`,
                color: isActive ? layer.color : 'var(--text-secondary)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
            >
              {layer.label}
            </button>
          );
        })}
      </div>

      {/* Compare mode toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
      }}>
        <button
          onClick={() => setCompareMode(!compareMode)}
          style={{
            width: 24,
            height: 14,
            borderRadius: 7,
            border: 'none',
            background: compareMode ? '#00E676' : 'var(--bg-surface)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 200ms',
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'white',
            position: 'absolute',
            top: 2,
            left: compareMode ? 12 : 2,
            transition: 'left 200ms',
          }} />
        </button>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: 'var(--text-muted)',
        }}>
          ◫ Compare Mode
        </span>
      </div>
    </div>
  );
}
