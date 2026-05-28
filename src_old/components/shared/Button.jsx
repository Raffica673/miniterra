export function PrimaryButton({ children, onClick, disabled = false, style = {}, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-space ${className}`}
      style={{
        background: disabled ? 'rgba(0, 230, 118, 0.4)' : '#00E676',
        color: '#0B0F14',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 600,
        fontSize: 13,
        letterSpacing: 0.5,
        padding: '12px 24px',
        borderRadius: 8,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 200ms',
        width: '100%',
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.target.style.filter = 'brightness(1.15)';
          e.target.style.boxShadow = '0 0 20px rgba(0, 230, 118, 0.25)';
        }
      }}
      onMouseLeave={e => {
        e.target.style.filter = 'none';
        e.target.style.boxShadow = 'none';
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, style = {}, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`font-space ${className}`}
      style={{
        background: 'transparent',
        color: 'var(--text-secondary)',
        fontFamily: "'Space Mono', monospace",
        fontSize: 13,
        padding: '10px 20px',
        borderRadius: 8,
        border: '1px solid var(--glass-border)',
        cursor: 'pointer',
        transition: 'all 200ms',
        width: '100%',
        ...style,
      }}
      onMouseEnter={e => {
        e.target.style.background = 'var(--bg-tertiary)';
        e.target.style.color = 'white';
      }}
      onMouseLeave={e => {
        e.target.style.background = 'transparent';
        e.target.style.color = 'var(--text-secondary)';
      }}
    >
      {children}
    </button>
  );
}
