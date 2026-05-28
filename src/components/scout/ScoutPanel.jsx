import { useState } from 'react';
import { SCOUT_REGIONS, BUILD_REGIONS } from '../../data/regions';
import { useApp } from '../../contexts/AppContext';
import GlassPanel from '../shared/GlassPanel';

const OVERLAY_OPTIONS = [
  { id: 'solar', label: 'Solar', icon: '☀️', color: '#FFD54F', desc: 'Sun energy' },
  { id: 'wind', label: 'Wind', icon: '💨', color: '#4FC3F7', desc: 'Air energy' },
  { id: 'temperature', label: 'Temperature', icon: '🌡️', color: '#FF7043', desc: 'Heat levels' },
  { id: 'hydro', label: 'Water', icon: '🌊', color: '#00BCD4', desc: 'Water energy' },
];

export default function ScoutPanel({ onSelectRegion }) {
  const { selectedRegion, setSelectedRegion, activeOverlays, toggleOverlay, currentMode, navigateTo } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Use SCOUT_REGIONS for scout mode, BUILD_REGIONS for build mode
  const REGIONS = currentMode === 'scout' ? SCOUT_REGIONS : BUILD_REGIONS;

  const filtered = searchQuery
    ? REGIONS.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    onSelectRegion?.(region);
  };

  const toggleRegionGroup = (groupName) => {
    setExpandedRegions(prev =>
      prev.includes(groupName)
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };


  return (
    <GlassPanel className="scout-panel" style={{
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
          {currentMode === 'scout' ? 'SCOUT · REGIONS' : 'SELECT REGION'}
        </div>

        {/* Build mode selector */}
        {currentMode === 'scout' && (
          <div className="build-buttons" style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <button
              onClick={() => navigateTo('build1')}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #66BB6A, #43A047)',
                border: 'none',
                borderRadius: 8,
                padding: '10px',
                color: 'white',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              🏗️ BUILD 1: Sandbox
            </button>
            <button
              onClick={() => {
                if (!selectedRegion) {
                  alert('Please select a city first!');
                  return;
                }
                navigateTo('build2');
              }}
              style={{
                flex: 1,
                background: selectedRegion ? 'linear-gradient(135deg, #4FC3F7, #0288D1)' : 'var(--bg-tertiary)',
                border: 'none',
                borderRadius: 8,
                padding: '10px',
                color: 'white',
                fontSize: 11,
                fontWeight: 600,
                cursor: selectedRegion ? 'pointer' : 'not-allowed',
                fontFamily: "'DM Sans', sans-serif",
                opacity: selectedRegion ? 1 : 0.5,
              }}
            >
              🌍 BUILD 2: {selectedRegion ? selectedRegion.name : 'Select City'}
            </button>
          </div>
        )}

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
        {filtered ? (
          // Search results - flat list
          filtered.map(region => (
            <RegionCard
              key={region.id}
              region={region}
              isSelected={selectedRegion?.id === region.id}
              onSelect={() => handleSelectRegion(region)}
            />
          ))
        ) : (
          // Simple list for scout/build regions
          REGIONS.map(region => (
            <RegionCard
              key={region.id}
              region={region}
              isSelected={selectedRegion?.id === region.id}
              onSelect={() => handleSelectRegion(region)}
            />
          ))
        )}
      </div>

      {/* Data layer toggles */}
      <div className="data-layers" style={{ padding: '12px 16px', borderTop: '1px solid var(--glass-border)' }}>
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
                  background: isActive ? `${opt.color}30` : 'var(--bg-tertiary)',
                  border: `2px solid ${isActive ? opt.color : 'var(--glass-border)'}`,
                  borderRadius: 8,
                  padding: '8px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 2,
                  transition: 'all 200ms',
                  boxShadow: isActive ? `0 0 12px ${opt.color}40` : 'none',
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
