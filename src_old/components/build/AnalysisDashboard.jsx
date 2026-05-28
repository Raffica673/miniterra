import GlassPanel from '../shared/GlassPanel';
import { PrimaryButton, GhostButton } from '../shared/Button';
import ScoreGauge from './ScoreGauge';
import { useApp } from '../../contexts/AppContext';
import { getInfraDefinition } from '../../data/infrastructure';

export default function AnalysisDashboard({ scores, cells, onRemove, onNavigateBack }) {
  const { navigateTo } = useApp();
  const placed = cells.filter(c => c.placedInfra);
  const hasBattery = placed.some(c => c.placedInfra.type === 'battery');

  // Risk assessment
  const avgFloodRisk = placed.length > 0
    ? placed.reduce((s, c) => s + c.floodRisk, 0) / placed.length
    : 0;
  const floodLevel = avgFloodRisk < 33 ? 'Low' : avgFloodRisk < 66 ? 'Moderate' : 'High';
  const floodColor = avgFloodRisk < 33 ? '#66BB6A' : avgFloodRisk < 66 ? '#FFC107' : '#FF1744';

  const avgTemp = placed.length > 0
    ? placed.reduce((s, c) => s + c.temperature, 0) / placed.length
    : 0;
  const tempLevel = avgTemp < 20 ? 'Low' : avgTemp < 30 ? 'Moderate' : 'High';
  const tempColor = avgTemp < 20 ? '#66BB6A' : avgTemp < 30 ? '#FFC107' : '#FF7043';

  const connPct = scores.connectivity;
  const connColor = connPct >= 100 ? '#00E676' : connPct >= 70 ? '#FFC107' : '#FF1744';

  return (
    <GlassPanel style={{
      width: 320,
      height: '100%',
      padding: 20,
      overflowY: 'auto',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 0,
    }}>
      {/* Score */}
      <ScoreGauge score={scores.overall} />

      {/* Energy Output */}
      <Section title="ENERGY OUTPUT">
        <EnergyBar label="Solar Output" value={scores.solarMW} max={300} color="#FFD54F" unit="MW" />
        <EnergyBar label="Wind Output" value={scores.windMW} max={200} color="#4FC3F7" unit="MW" />
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: '#00E676',
          marginTop: 8,
        }}>
          Total Renewable · {scores.totalMW} MW
        </div>
        {hasBattery && (
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#AB47BC', marginTop: 4 }}>
            + 200 MWh Storage
          </div>
        )}
      </Section>

      {/* Risk Assessment */}
      <Section title="RISK ASSESSMENT">
        <RiskRow emoji="🌊" label="Flood Exposure" value={floodLevel} color={floodColor} />
        <RiskRow emoji="🌡" label="Thermal Stress" value={tempLevel} color={tempColor} />
        <RiskRow emoji="⚡" label="Grid Connectivity" value={`${Math.round(connPct)}%`} color={connColor} />
      </Section>

      {/* Placements */}
      <Section title={`PLACEMENTS (${placed.length})`}>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {placed.map(c => {
            const def = getInfraDefinition(c.placedInfra.type);
            return (
              <div
                key={c.placedInfra.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                }}
              >
                <span>
                  <span style={{ color: def.themeColor, marginRight: 6 }}>●</span>
                  {def.name} ({c.x},{c.y})
                  {(c.placedInfra.type === 'solar' || c.placedInfra.type === 'wind')
                    ? ` — ${c.placedInfra.efficiency}% eff.`
                    : ''}
                </span>
                <button
                  onClick={() => onRemove(c.x, c.y)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FF1744',
                    cursor: 'pointer',
                    fontSize: 12,
                    opacity: 0.6,
                    padding: '2px 4px',
                  }}
                  onMouseEnter={e => { e.target.style.opacity = 1; }}
                  onMouseLeave={e => { e.target.style.opacity = 0.6; }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Generate Report */}
      <PrimaryButton
        disabled={false}
        onClick={() => navigateTo('report')}
      >
        Generate Site Report →
      </PrimaryButton>

      <div style={{ marginTop: 8 }}>
        <GhostButton onClick={onNavigateBack}>
          ← Back to Scout
        </GhostButton>
      </div>
    </GlassPanel>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: 2,
        marginBottom: 8,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function EnergyBar({ label, value, max, color, unit }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color, width: 90, flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-surface)', borderRadius: 3 }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 3,
          transition: 'width 300ms',
        }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'white', width: 60, textAlign: 'right' }}>
        {value} {unit}
      </span>
    </div>
  );
}

function RiskRow({ emoji, label, value, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 0',
    }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-secondary)' }}>
        {emoji} {label}
      </span>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        fontWeight: 600,
        color,
        background: `${color}1A`,
        padding: '2px 8px',
        borderRadius: 10,
      }}>
        {value}
      </span>
    </div>
  );
}
