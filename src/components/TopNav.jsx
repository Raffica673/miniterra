import { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const MODES = ['scout', 'build', 'report'];
const MODE_LABELS = { scout: 'SCOUT', build: 'BUILD', report: 'REPORT' };

const SDG_BADGES = [
  { label: 'SDG 7', full: 'SDG 7 · Clean Energy', color: '#FCC30B' },
  { label: 'SDG 9', full: 'SDG 9 · Infrastructure', color: '#F36D25' },
  { label: 'SDG 11', full: 'SDG 11 · Sustainable Cities', color: '#F99D26' },
];

export default function TopNav() {
  const { currentMode, navigateTo, visitedModes } = useApp();

  const modeIndex = MODES.indexOf(currentMode);

  return (
    <div style={{
      height: 52,
      width: '100%',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      flexShrink: 0,
      zIndex: 50,
    }}>
      {/* Left: Logo */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
        onClick={() => navigateTo('landing')}
      >
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 16, color: 'white' }}>GRID</span>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: '#00E676',
          display: 'inline-block', boxShadow: '0 0 8px rgba(0,230,118,0.5)',
        }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 16, color: 'var(--text-secondary)' }}>SCOPE</span>
      </div>

      {/* Center: Mode Stepper - ALL modes always clickable */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {MODES.map((mode, i) => {
          const isActive = currentMode === mode;
          const isVisited = visitedModes.includes(mode);
          const isPast = modeIndex > i;
          // All modes are always clickable (except the active one)
          const isClickable = !isActive;

          return (
            <div key={mode} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Connecting line before (except first) */}
              {i > 0 && (
                <div style={{
                  width: 40,
                  height: 1,
                  background: isPast || isActive ? '#00E676' : 'var(--text-muted)',
                  transition: 'background 300ms',
                }} />
              )}

              {/* Step */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: isClickable ? 'pointer' : 'default',
                }}
                onClick={() => isClickable && navigateTo(mode)}
              >
                <div style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: isActive ? '#00E676' : 'transparent',
                  border: `2px solid ${isActive || isVisited ? '#00E676' : 'var(--text-secondary)'}`,
                  transition: 'all 300ms',
                }} />
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10,
                    letterSpacing: 2,
                    color: isActive ? 'white' : isVisited ? 'var(--text-secondary)' : 'var(--text-secondary)',
                    transition: 'color 200ms',
                  }}
                  onMouseEnter={e => { if (isClickable) e.target.style.color = 'white'; }}
                  onMouseLeave={e => { if (isClickable) e.target.style.color = isVisited ? 'var(--text-secondary)' : 'var(--text-secondary)'; }}
                >
                  {MODE_LABELS[mode]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Report Button + SDG Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Direct Report Access Button */}
        {currentMode !== 'report' && (
          <button
            onClick={() => navigateTo('report')}
            style={{
              background: 'rgba(0, 230, 118, 0.12)',
              color: '#00E676',
              border: '1px solid rgba(0, 230, 118, 0.3)',
              borderRadius: 20,
              padding: '5px 14px',
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1,
              cursor: 'pointer',
              transition: 'all 200ms',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0, 230, 118, 0.25)';
              e.currentTarget.style.borderColor = 'rgba(0, 230, 118, 0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0, 230, 118, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(0, 230, 118, 0.3)';
            }}
          >
            📊 REPORT
          </button>
        )}

        {SDG_BADGES.map(badge => (
          <SDGBadge key={badge.label} badge={badge} />
        ))}
      </div>
    </div>
  );
}

function SDGBadge({ badge }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: `${badge.color}26`,
        color: badge.color,
        border: `1px solid ${badge.color}4D`,
        borderRadius: 20,
        padding: '4px 10px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 10,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        transition: 'all 250ms',
        cursor: 'default',
        overflow: 'hidden',
        maxWidth: hovered ? 180 : 52,
      }}
    >
      {hovered ? badge.full : badge.label}
    </div>
  );
}
