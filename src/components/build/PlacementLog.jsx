export default function PlacementLog({ log, onUndo }) {
  const recent = log.slice(-3);

  return (
    <div style={{
      height: 56,
      width: '100%',
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', gap: 24, overflow: 'hidden' }}>
        {recent.length === 0 ? (
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: 'var(--text-dim)',
          }}>
            No placements yet — drag infrastructure onto the grid
          </span>
        ) : (
          recent.map((entry, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: 'var(--text-dim)' }}>[{entry.time}]</span> {entry.text}
            </span>
          ))
        )}
      </div>

      <button
        onClick={onUndo}
        disabled={log.length === 0}
        style={{
          background: 'transparent',
          border: '1px solid var(--glass-border)',
          borderRadius: 6,
          color: log.length > 0 ? 'var(--text-secondary)' : 'var(--text-dim)',
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          padding: '4px 10px',
          cursor: log.length > 0 ? 'pointer' : 'not-allowed',
          opacity: log.length > 0 ? 1 : 0.4,
          whiteSpace: 'nowrap',
        }}
      >
        ↩ Undo
      </button>
    </div>
  );
}
