import { useState } from 'react';
import { INFRASTRUCTURE } from '../../data/infrastructure';
import GlassPanel from '../shared/GlassPanel';

export default function Toolbox({ budget, totalBudget, activeTool, onSelectTool, onBudgetChange }) {
  const pct = budget / totalBudget;
  const budgetColor = pct > 0.6 ? '#00E676' : pct > 0.3 ? '#FFC107' : '#FF1744';
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);

  const categories = [
    { key: 'generation', label: 'GENERATION', items: INFRASTRUCTURE.filter(i => i.category === 'generation') },
    { key: 'grid', label: 'GRID', items: INFRASTRUCTURE.filter(i => i.category === 'grid') },
    { key: 'storage', label: 'STORAGE', items: INFRASTRUCTURE.filter(i => i.category === 'storage') },
    { key: 'monitoring', label: 'MONITORING', items: INFRASTRUCTURE.filter(i => i.category === 'monitoring') },
    { key: 'protection', label: 'PROTECTION', items: INFRASTRUCTURE.filter(i => i.category === 'protection') },
  ];

  return (
    <GlassPanel style={{
      width: 300,
      height: '100%',
      padding: 0,
      overflowY: 'auto',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 0,
      userSelect: 'none',
    }}>
      {/* Budget section */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: 2,
          }}>
            BUDGET
          </span>
          <button
            onClick={() => setShowBudgetEdit(!showBudgetEdit)}
            style={{
              background: 'none',
              border: '1px solid var(--glass-border)',
              borderRadius: 4,
              padding: '2px 6px',
              color: 'var(--text-secondary)',
              fontSize: 9,
              cursor: 'pointer',
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {showBudgetEdit ? 'DONE' : 'EDIT'}
          </button>
        </div>

        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 18,
          color: budgetColor,
          marginBottom: 6,
        }}>
          {budget} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ {totalBudget}</span>
        </div>

        <div style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          background: 'var(--bg-surface)',
        }}>
          <div style={{
            width: `${pct * 100}%`,
            height: '100%',
            borderRadius: 3,
            background: budgetColor,
            transition: 'width 300ms, background 300ms',
          }} />
        </div>

        {/* Budget editor */}
        {showBudgetEdit && onBudgetChange && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif" }}>
              Total Budget
            </label>
            <input
              type="range"
              min={200}
              max={5000}
              step={100}
              value={totalBudget}
              onChange={(e) => onBudgetChange(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)' }}>
              <span>200</span>
              <span style={{ color: budgetColor, fontWeight: 700 }}>{totalBudget} units</span>
              <span>5000</span>
            </div>
          </div>
        )}
      </div>

      {/* Active tool indicator */}
      {activeTool && (
        <div style={{
          margin: '8px 12px',
          padding: '10px 14px',
          background: 'rgba(0,230,118,0.1)',
          border: '1px solid rgba(0,230,118,0.3)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#00E676', fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
              PLACING MODE
            </div>
            <div style={{ fontSize: 12, color: 'white', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
              Click on map to place {INFRASTRUCTURE.find(i => i.type === activeTool)?.name}
            </div>
          </div>
          <button
            onClick={() => onSelectTool(null)}
            style={{
              background: 'rgba(255,23,68,0.15)',
              border: '1px solid rgba(255,23,68,0.3)',
              borderRadius: 6,
              padding: '4px 8px',
              color: '#FF1744',
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: "'Space Mono', monospace",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Infrastructure categories */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px' }}>
        {categories.map(cat => (
          <div key={cat.key}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              color: 'var(--text-muted)',
              letterSpacing: 2,
              marginTop: 12,
              marginBottom: 6,
              paddingLeft: 4,
            }}>
              {cat.label}
            </div>
            {cat.items.map(infra => {
              const isActive = activeTool === infra.type;
              const canAfford = budget >= infra.cost;

              return (
                <button
                  key={infra.type}
                  onClick={() => canAfford && onSelectTool(isActive ? null : infra.type)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    marginBottom: 4,
                    borderRadius: 8,
                    border: `1px solid ${isActive ? infra.themeColor + '60' : 'var(--glass-border)'}`,
                    background: isActive ? `${infra.themeColor}15` : 'var(--bg-tertiary)',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    opacity: canAfford ? 1 : 0.4,
                    transition: 'all 200ms',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{infra.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      color: isActive ? infra.themeColor : 'white',
                    }}>
                      {infra.name}
                    </div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 10,
                      color: 'var(--text-secondary)',
                    }}>
                      {infra.description}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: canAfford ? 'var(--text-secondary)' : '#FF1744',
                    flexShrink: 0,
                  }}>
                    ◆{infra.cost}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
