import { useCallback, useRef } from 'react';

const ICONS = {
  solar: (
    <svg width={24} height={24} viewBox="0 0 24 24">
      <rect x={3} y={3} width={8} height={8} rx={2} fill="#FFD54F" opacity={0.3} />
      {[0,1,2].map(r => [0,1,2].map(c => (
        <rect key={`${r}${c}`} x={4 + c * 6} y={4 + r * 6} width={4} height={4} rx={0.5} fill="#FFD54F" />
      )))}
      <line x1={2} y1={2} x2={4} y2={4} stroke="#FFD54F" strokeWidth={1} opacity={0.5} />
      <line x1={2} y1={5} x2={3} y2={5} stroke="#FFD54F" strokeWidth={1} opacity={0.5} />
      <line x1={5} y1={2} x2={5} y2={3} stroke="#FFD54F" strokeWidth={1} opacity={0.5} />
    </svg>
  ),
  wind: (
    <svg width={24} height={24} viewBox="0 0 24 24">
      <line x1={12} y1={22} x2={12} y2={8} stroke="white" strokeWidth={1.5} />
      <line x1={12} y1={8} x2={12} y2={2} stroke="white" strokeWidth={1} />
      <line x1={12} y1={8} x2={18} y2={14} stroke="white" strokeWidth={1} />
      <line x1={12} y1={8} x2={6} y2={14} stroke="white" strokeWidth={1} />
    </svg>
  ),
  substation: (
    <svg width={24} height={24} viewBox="0 0 24 24">
      <rect x={4} y={4} width={16} height={16} rx={2} fill="#00E676" opacity={0.2} />
      <path d="M13,6 L11,12 L14,12 L10,18" fill="none" stroke="#00E676" strokeWidth={1.5} />
    </svg>
  ),
  transmission: (
    <svg width={24} height={24} viewBox="0 0 24 24">
      <line x1={4} y1={12} x2={20} y2={12} stroke="#00E676" strokeWidth={1} opacity={0.6} />
      <rect x={5} y={8} width={1.5} height={8} fill="#78909C" />
      <rect x={17.5} y={8} width={1.5} height={8} fill="#78909C" />
      <rect x={11} y={8} width={1.5} height={8} fill="#78909C" />
    </svg>
  ),
  floodBarrier: (
    <svg width={24} height={24} viewBox="0 0 24 24">
      <path d="M3,10 Q8,6 12,10 Q16,14 21,10" fill="none" stroke="#4FC3F7" strokeWidth={1} />
      <rect x={3} y={12} width={18} height={6} rx={1} fill="#66BB6A" opacity={0.5} />
    </svg>
  ),
  weatherStation: (
    <svg width={24} height={24} viewBox="0 0 24 24">
      <rect x={11} y={8} width={2} height={14} fill="white" rx={0.5} />
      <path d="M8,8 Q12,5 16,8" fill="none" stroke="#448AFF" strokeWidth={1.5} />
      <circle cx={12} cy={6} r={3} fill="none" stroke="#448AFF" strokeWidth={0.5} opacity={0.4} />
      <circle cx={12} cy={6} r={6} fill="none" stroke="#448AFF" strokeWidth={0.5} opacity={0.2} />
    </svg>
  ),
  battery: (
    <svg width={24} height={24} viewBox="0 0 24 24">
      <rect x={4} y={6} width={16} height={12} rx={2} fill="#AB47BC" opacity={0.3} />
      <rect x={6} y={9} width={12} height={2} rx={1} fill="#AB47BC" />
      <rect x={6} y={12} width={12} height={2} rx={1} fill="#AB47BC" />
      <rect x={6} y={15} width={8} height={2} rx={1} fill="#AB47BC" opacity={0.6} />
    </svg>
  ),
};

export default function InfraTile({ infra, canAfford, onDragStart }) {
  const ref = useRef(null);
  const holdTimer = useRef(null);

  const handlePointerDown = useCallback((e) => {
    if (!canAfford) return;
    holdTimer.current = setTimeout(() => {
      onDragStart(infra.type, { x: e.clientX, y: e.clientY });
    }, 100);
  }, [canAfford, infra.type, onDragStart]);

  const handlePointerUp = useCallback(() => {
    clearTimeout(holdTimer.current);
  }, []);

  return (
    <div
      ref={ref}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDragStart={(e) => e.preventDefault()}
      draggable={false}
      style={{
        width: '100%',
        height: 72,
        borderRadius: 10,
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--glass-border)',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: canAfford ? 'grab' : 'not-allowed',
        opacity: canAfford ? 1 : 0.4,
        transition: 'all 200ms',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
      onMouseEnter={e => {
        if (canAfford) {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.transform = 'translateX(4px)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--glass-border)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Icon */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: `${infra.themeColor}1A`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {ICONS[infra.type]}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'white' }}>
          {infra.name}
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-secondary)' }}>
          {infra.description}
        </div>
      </div>

      {/* Cost badge */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        color: 'var(--text-secondary)',
        position: 'absolute',
        top: 8,
        right: 12,
      }}>
        ◆ {infra.cost}
      </div>
    </div>
  );
}
