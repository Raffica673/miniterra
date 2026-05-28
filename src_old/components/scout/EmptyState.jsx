export default function EmptyState() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      {/* Wireframe globe */}
      <svg width={64} height={64} viewBox="0 0 64 64" style={{ animation: 'spin 30s linear infinite' }}>
        <circle cx={32} cy={32} r={28} fill="none" stroke="var(--text-dim)" strokeWidth={1} />
        {/* Horizontal lines */}
        <ellipse cx={32} cy={22} rx={26} ry={4} fill="none" stroke="var(--text-dim)" strokeWidth={0.5} />
        <ellipse cx={32} cy={32} rx={28} ry={6} fill="none" stroke="var(--text-dim)" strokeWidth={0.5} />
        <ellipse cx={32} cy={42} rx={26} ry={4} fill="none" stroke="var(--text-dim)" strokeWidth={0.5} />
        {/* Vertical lines */}
        <ellipse cx={32} cy={32} rx={10} ry={28} fill="none" stroke="var(--text-dim)" strokeWidth={0.5} />
        <ellipse cx={32} cy={32} rx={22} ry={28} fill="none" stroke="var(--text-dim)" strokeWidth={0.5} />
      </svg>

      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: 'var(--text-muted)',
        textAlign: 'center',
      }}>
        Select a region to begin<br />environmental analysis
      </div>

      {/* Animated icons */}
      <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
        {['☀', '💨', '🌊'].map((icon, i) => (
          <span
            key={icon}
            style={{
              fontSize: 20,
              color: 'var(--text-dim)',
              animation: `fadeInOut 2s ease-in-out ${i * 0.6}s infinite`,
            }}
          >
            {icon}
          </span>
        ))}
      </div>
    </div>
  );
}
