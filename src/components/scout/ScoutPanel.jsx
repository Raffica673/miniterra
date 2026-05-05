import { useState } from 'react';
import { REGIONS } from '../../data/regions';
import { useApp } from '../../contexts/AppContext';
import GlassPanel from '../shared/GlassPanel';

const OVERLAY_OPTIONS = [
  { id: 'solar', label: 'Solar Irradiance', icon: '☀️', color: '#FFD54F', desc: 'GHI kWh/m²/day' },
  { id: 'wind', label: 'Wind Speed', icon: '💨', color: '#4FC3F7', desc: '80m hub height m/s' },
  { id: 'temperature', label: 'Temperature', icon: '🌡️', color: '#FF7043', desc: 'Annual average °C' },
  { id: 'flood', label: 'Flood Risk', icon: '🌊', color: '#EF5350', desc: 'Risk index 0-100' },
];

export default function ScoutPanel({ onSelectRegion }) {
  const { selectedRegion, setSelectedRegion, activeOverlays, toggleOverlay } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = REGIONS.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    onSelectRegion?.(region);
  };

  return (
    <GlassPanel style={{
      width: 320,
      height: '100%',
      padding: 0,
      overflowY: 'auto',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: 3,
          marginBottom: 8,
        }}>
          SCOUT · REGIONS
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search Santiago regions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--glass-border)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'white',
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none',
          }}
        />
      </div>

      {/* Region cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {filtered.map(region => (
          <RegionCard
            key={region.id}
            region={region}
            isSelected={selectedRegion?.id === region.id}
            onSelect={() => handleSelectRegion(region)}
          />
        ))}
      </div>

      {/* Data layer toggles */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: 2,
          marginBottom: 8,
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
                  borderRadius: 8,
                  padding: '8px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 2,
                  transition: 'all 200ms',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 14 }}>{opt.icon}</span>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 10,
                    fontWeight: 600,
                    color: isActive ? opt.color : 'var(--text-secondary)',
                  }}>
                    {opt.label}
                  </span>
                </div>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 8,
                  color: 'var(--text-muted)',
                }}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data sources */}
      <div style={{
        padding: '8px 16px 12px',
        borderTop: '1px solid var(--glass-border)',
        fontSize: 8,
        color: 'var(--text-dim)',
        fontFamily: "'DM Sans', sans-serif",
        lineHeight: 1.5,
      }}>
        Data: Explorador Solar (Min. Energía) · Global Solar Atlas (ESMAP) · 
        Explorador Eólico · NASA POWER · SRTM · WorldClim 2.1
      </div>
    </GlassPanel>
  );
}

function RegionCard({ region, isSelected, onSelect }) {
  const chars = region.characteristics;

  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%',
        textAlign: 'left',
        background: isSelected ? 'rgba(0,230,118,0.08)' : 'var(--bg-tertiary)',
        border: `1px solid ${isSelected ? 'rgba(0,230,118,0.3)' : 'var(--glass-border)'}`,
        borderRadius: 10,
        padding: '12px 14px',
        marginBottom: 6,
        cursor: 'pointer',
        transition: 'all 200ms',
        display: 'block',
      }}
    >
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: isSelected ? '#00E676' : 'white',
        marginBottom: 4,
      }}>
        {region.name}
      </div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        color: 'var(--text-secondary)',
        marginBottom: 8,
        lineHeight: 1.4,
      }}>
        {region.description}
      </div>

      {/* Characteristics */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {Object.entries(chars).map(([key, val]) => (
          <span
            key={key}
            style={{
              fontSize: 9,
              fontFamily: "'DM Sans', sans-serif",
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 4,
              padding: '2px 6px',
              color: 'var(--text-secondary)',
            }}
          >
            {key === 'solar' && '☀️'}
            {key === 'wind' && '💨'}
            {key === 'temperature' && '🌡️'}
            {key === 'elevation' && '⛰️'}
            {key === 'terrain' && '🏗️'}
            {' '}{val}
          </span>
        ))}
      </div>
    </button>
  );
}
