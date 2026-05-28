import { useState } from 'react';
import { REGIONS, NIDO_ZONE } from '../../data/regions';
import { useApp } from '../../contexts/AppContext';
import GlassPanel from '../shared/GlassPanel';

const OVERLAY_OPTIONS = [
  { id: 'solar', label: 'Solar Irradiance', icon: '☀️', color: '#FFD54F', desc: 'GHI kWh/m²/day' },
  { id: 'wind', label: 'Wind Speed', icon: '💨', color: '#4FC3F7', desc: '80m hub height m/s' },
  { id: 'temperature', label: 'Temperature', icon: '🌡️', color: '#FF7043', desc: 'Annual average °C' },
  { id: 'flood', label: 'Flood Risk', icon: '🌊', color: '#EF5350', desc: 'Risk index 0-100' },
];

export default function ScoutPanel() {
  const { selectedRegion, setSelectedRegion, activeOverlays, toggleOverlay } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = REGIONS.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <GlassPanel style={{
      width: 320, height: '100%', padding: 0,
      overflowY: 'auto', flexShrink: 0,
      display: 'flex', flexDirection: 'column', borderRadius: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'var(--text-muted)', letterSpacing: 3, marginBottom: 8 }}>
          SCOUT · REGIONS
        </div>
        <input
          type="text"
          placeholder="Search Santiago regions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
            borderRadius: 8, padding: '8px 12px', color: 'white', fontSize: 12,
            fontFamily: "'DM Sans', sans-serif", outline: 'none',
          }}
        />
      </div>

      {/* ═══ NIDO BANNER ═══ */}
      <div style={{ padding: '10px 12px 6px' }}>
        <button
          onClick={() => setSelectedRegion(NIDO_ZONE)}
          style={{
            width: '100%', textAlign: 'left', cursor: 'pointer',
            background: selectedRegion?.id === 'nido'
              ? 'linear-gradient(135deg, rgba(0,230,118,0.15), rgba(68,138,255,0.15))'
              : 'linear-gradient(135deg, rgba(0,230,118,0.06), rgba(68,138,255,0.06))',
            border: `2px solid ${selectedRegion?.id === 'nido' ? 'rgba(0,230,118,0.5)' : 'rgba(0,230,118,0.2)'}`,
            borderRadius: 12, padding: '14px 16px',
            transition: 'all 200ms',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Glow effect */}
          <div style={{
            position: 'absolute', top: -20, right: -20, width: 80, height: 80,
            background: 'radial-gradient(circle, rgba(0,230,118,0.15), transparent)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>🦅</span>
            <div>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
                color: '#00E676', letterSpacing: 1,
              }}>
                NIDO SUSTAINABLE
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 10,
                color: '#4FC3F7', letterSpacing: 1,
              }}>
                DESIGN CHALLENGE
              </div>
            </div>
          </div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            {NIDO_ZONE.description}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <Tag text={NIDO_ZONE.area} />
            <Tag text={NIDO_ZONE.terrain} />
          </div>
        </button>
      </div>

      {/* Region cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px' }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'var(--text-dim)',
          letterSpacing: 2, padding: '6px 2px 4px',
        }}>
          SANTIAGO METROPOLITAN
        </div>
        {filtered.map(region => (
          <RegionCard
            key={region.id}
            region={region}
            isSelected={selectedRegion?.id === region.id}
            onSelect={() => setSelectedRegion(region)}
          />
        ))}
      </div>

      {/* Data layer toggles */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 10,
          color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8,
        }}>
          DATA LAYERS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {OVERLAY_OPTIONS.map(opt => {
            const isActive = activeOverlays.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleOverlay(opt.id)}
                style={{
                  background: isActive ? `${opt.color}20` : 'var(--bg-tertiary)',
                  border: `1px solid ${isActive ? opt.color + '60' : 'var(--glass-border)'}`,
                  borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
                  transition: 'all 200ms',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 14 }}>{opt.icon}</span>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600,
                    color: isActive ? opt.color : 'var(--text-secondary)',
                  }}>
                    {opt.label}
                  </span>
                </div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, color: 'var(--text-muted)' }}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data sources */}
      <div style={{
        padding: '8px 16px 12px', borderTop: '1px solid var(--glass-border)',
        fontSize: 8, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
      }}>
        Data: Explorador Solar (Min. Energía) · Global Solar Atlas (ESMAP) ·
        Explorador Eólico · NASA POWER · SRTM · WorldClim 2.1
      </div>
    </GlassPanel>
  );
}

function RegionCard({ region, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%', textAlign: 'left',
        background: isSelected ? 'rgba(0,230,118,0.08)' : 'var(--bg-tertiary)',
        border: `1px solid ${isSelected ? 'rgba(0,230,118,0.3)' : 'var(--glass-border)'}`,
        borderRadius: 10, padding: '10px 12px', marginBottom: 5,
        cursor: 'pointer', transition: 'all 200ms', display: 'block',
      }}
    >
      <div style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
        color: isSelected ? '#00E676' : 'white', marginBottom: 3,
      }}>
        {region.name}
      </div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 10,
        color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.4,
      }}>
        {region.description}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <Tag text={`☀️ ${region.solarPotential}%`} />
        <Tag text={`💨 ${region.windPotential}%`} />
        <Tag text={`🌊 ${region.floodRisk}%`} />
        <Tag text={region.terrain} />
      </div>
    </button>
  );
}

function Tag({ text }) {
  return (
    <span style={{
      fontSize: 8, fontFamily: "'DM Sans', sans-serif",
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 4, padding: '2px 6px', color: 'var(--text-secondary)',
    }}>
      {text}
    </span>
  );
}
