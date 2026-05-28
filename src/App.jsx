import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AppProvider, useApp } from './contexts/AppContext';
import { useInfraPlacement } from './hooks/useInfraPlacement';
import { useGridState } from './hooks/useGridState';
import { useBudget } from './hooks/useBudget';
import { calculateScore, getScoreColor } from './utils/scoring';
import { getInfraDefinition } from './data/infrastructure';
import { getEnvironmentalData } from './data/environmentalModels';

import LandingPage from './components/LandingPage';
import TopNav from './components/TopNav';
import ScoutPanel from './components/scout/ScoutPanel';
import RealMap from './components/map/RealMap';
import MapGrid from './components/map/MapGrid';
import Toolbox from './components/build/Toolbox';
import ReportPanel from './components/report/ReportPanel';
import { GhostButton } from './components/shared/Button';
import Toast from './components/shared/Toast';

function AppContent() {
  const { currentMode, activeOverlays, navigateTo, selectedRegion } = useApp();

  // ── Build 1: grid sandbox ──────────────────────────────────────
  const {
    cells, loadRegion,
    placeInfrastructure, removeInfrastructure, undoLastPlacement,
    placementLog: gridLog,
  } = useGridState();
  const {
    budget: gridBudget, totalBudget: gridTotal,
    spend: gridSpend, refund: gridRefund, canAfford: gridCanAfford,
    reset: resetGridBudget, changeTotalBudget: changeGridBudget,
  } = useBudget();
  const [gridHovered, setGridHovered] = useState(null);

  // ── Build 2: real map ──────────────────────────────────────────
  const { placements, addPlacement, removePlacement, undoLast, clearAll } = useInfraPlacement();
  const {
    budget, totalBudget,
    spend, refund, canAfford,
    reset: resetBudget, changeTotalBudget,
  } = useBudget();

  const [activeTool, setActiveTool] = useState(null);
  const [cursorPos, setCursorPos] = useState(null);
  const [cursorEnvData, setCursorEnvData] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const mapCenter = selectedRegion?.center || [-33.4489, -70.6693];
  const mapZoom = selectedRegion?.zoom || 12;

  // Load a grid region when entering build1
  useEffect(() => {
    if (currentMode === 'build1') {
      const regionId = selectedRegion?.id || 'central-valley';
      loadRegion(regionId);
      setActiveTool(null);
    }
    if (currentMode === 'build2') {
      setActiveTool(null);
    }
  }, [currentMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive a scoring-compatible placements list from grid cells
  const gridPlacements = useMemo(() =>
    cells.filter(c => c.placedInfra).map(c => ({
      id: c.placedInfra.id,
      type: c.placedInfra.type,
      efficiency: c.placedInfra.efficiency,
      isConnected: c.placedInfra.isConnected,
      envData: {
        solarIndex: c.solarIndex,
        windIndex: c.windIndex,
        floodRisk: c.floodRisk,
        temperature: c.temperature,
      },
      gridX: c.x, gridY: c.y,
      warnings: c.placedInfra.warnings,
    })),
  [cells]);

  const gridScores = useMemo(
    () => calculateScore(gridPlacements, gridBudget, gridTotal),
    [gridPlacements, gridBudget, gridTotal],
  );
  const mapScores = useMemo(
    () => calculateScore(placements, budget, totalBudget),
    [placements, budget, totalBudget],
  );

  // ── Build 1 handlers ──────────────────────────────────────────
  const handleCellDrop = useCallback((cell) => {
    if (cell.placedInfra) {
      gridRefund(cell.placedInfra.type);
      removeInfrastructure(cell.x, cell.y);
      return;
    }
    if (!activeTool) return;
    if (cell.isRestricted) {
      setToastMsg('This area is restricted');
      return;
    }
    if (!gridCanAfford(activeTool)) {
      setToastMsg(`Not enough budget for ${getInfraDefinition(activeTool)?.name}`);
      return;
    }
    const def = getInfraDefinition(activeTool);
    const result = def.canPlace(cell);
    if (!result.valid) {
      setToastMsg(result.reason);
      return;
    }
    placeInfrastructure(cell.x, cell.y, activeTool);
    gridSpend(activeTool);
  }, [activeTool, gridCanAfford, gridSpend, gridRefund, placeInfrastructure, removeInfrastructure]);

  const handleGridUndo = useCallback(() => {
    const placed = cells.filter(c => c.placedInfra);
    if (placed.length === 0) return;
    const last = placed[placed.length - 1];
    gridRefund(last.placedInfra.type);
    undoLastPlacement();
  }, [cells, gridRefund, undoLastPlacement]);

  const handleGridClear = useCallback(() => {
    cells.filter(c => c.placedInfra).forEach(c => gridRefund(c.placedInfra.type));
    loadRegion(selectedRegion?.id || 'central-valley');
    resetGridBudget();
  }, [cells, gridRefund, loadRegion, selectedRegion, resetGridBudget]);

  // ── Build 2 handlers ──────────────────────────────────────────
  const handleMapClick = useCallback((lat, lng) => {
    if (!activeTool) return;
    if (!canAfford(activeTool)) {
      setToastMsg(`Not enough budget for ${getInfraDefinition(activeTool)?.name}`);
      return;
    }
    const result = addPlacement(activeTool, lat, lng);
    if (result?.valid) {
      spend(activeTool);
    } else if (result?.reason) {
      setToastMsg(result.reason);
    }
  }, [activeTool, canAfford, addPlacement, spend]);

  const handleRemove = useCallback((id) => {
    const p = placements.find(p => p.id === id);
    if (p) { refund(p.type); removePlacement(id); }
  }, [placements, refund, removePlacement]);

  const handleUndo = useCallback(() => {
    if (placements.length > 0) refund(placements[placements.length - 1].type);
    undoLast();
  }, [placements, refund, undoLast]);

  const handleCursorMove = useCallback((latlng) => {
    if (!latlng) { setCursorPos(null); setCursorEnvData(null); return; }
    setCursorPos(latlng);
    setCursorEnvData(getEnvironmentalData(latlng.lat, latlng.lng));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (currentMode === 'build1') handleGridUndo();
        else handleUndo();
      }
      if (e.key === 'Escape') setActiveTool(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentMode, handleGridUndo, handleUndo]);

  if (currentMode === 'landing') return <LandingPage />;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopNav />
      <Toast message={toastMsg} visible={!!toastMsg} onHide={() => setToastMsg(null)} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ─── SCOUT ─── */}
        {currentMode === 'scout' && (
          <>
            <ScoutPanel />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <RealMap
                center={mapCenter} zoom={mapZoom}
                placements={[]} activeOverlays={activeOverlays}
                onCursorMove={handleCursorMove}
              />
              <EnvironmentBar cursorPos={cursorPos} envData={cursorEnvData} />
            </div>
          </>
        )}

        {/* ─── BUILD 1: SANDBOX GRID ─── */}
        {currentMode === 'build1' && (
          <>
            <Toolbox
              budget={gridBudget} totalBudget={gridTotal}
              activeTool={activeTool} onSelectTool={setActiveTool}
              onBudgetChange={changeGridBudget}
            />
            <MapGrid
              cells={cells}
              overlays={activeOverlays}
              hoveredCell={gridHovered}
              onCellHover={setGridHovered}
              onCellLeave={() => setGridHovered(null)}
              onCellDrop={handleCellDrop}
              interactive
            />
            <BuildSidebar
              scores={gridScores}
              placements={gridPlacements}
              onUndo={handleGridUndo}
              onRemove={(id) => {
                const cell = cells.find(c => c.placedInfra?.id === id);
                if (cell) { gridRefund(cell.placedInfra.type); removeInfrastructure(cell.x, cell.y); }
              }}
              onClear={handleGridClear}
              onNavigateReport={() => navigateTo('report')}
              gridMode
            />
          </>
        )}

        {/* ─── BUILD 2: REAL MAP ─── */}
        {currentMode === 'build2' && (
          <>
            <Toolbox
              budget={budget} totalBudget={totalBudget}
              activeTool={activeTool} onSelectTool={setActiveTool}
              onBudgetChange={changeTotalBudget}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <RealMap
                center={mapCenter} zoom={mapZoom}
                placements={placements} activeOverlays={activeOverlays}
                activeTool={activeTool}
                onMapClick={handleMapClick}
                onRemovePlacement={handleRemove}
                onCursorMove={handleCursorMove}
              />
              <EnvironmentBar cursorPos={cursorPos} envData={cursorEnvData} activeTool={activeTool} />
            </div>
            <BuildSidebar
              scores={mapScores}
              placements={placements}
              onUndo={handleUndo}
              onRemove={handleRemove}
              onClear={() => { clearAll(); resetBudget(); }}
              onNavigateReport={() => navigateTo('report')}
            />
          </>
        )}

        {/* ─── REPORT ─── */}
        {currentMode === 'report' && (
          <>
            <div style={{ width: '45%', position: 'relative' }}>
              <RealMap
                center={mapCenter} zoom={mapZoom}
                placements={placements} activeOverlays={[]}
                interactive={false}
              />
              <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
                <GhostButton onClick={() => navigateTo('build2')} style={{ width: 'auto' }}>
                  ← Back to Build
                </GhostButton>
              </div>
            </div>
            <ReportPanel scores={mapScores} placements={placements} budget={budget} totalBudget={totalBudget} />
          </>
        )}

      </div>
    </div>
  );
}

/* ─── Environment bar ─── */
function EnvironmentBar({ cursorPos, envData, activeTool }) {
  return (
    <div style={{
      height: 44, width: '100%',
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--glass-border)',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', flexShrink: 0, gap: 16,
    }}>
      {cursorPos && envData ? (
        <>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
            {cursorPos.lat.toFixed(5)}°S, {cursorPos.lng.toFixed(5)}°W
          </span>
          <span style={{ color: 'var(--glass-border)' }}>│</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#9AA0A6' }}>⛰️ {envData.elevation}m</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#FFD54F' }}>☀️ {envData.solarGHI} kWh/m²/d ({envData.solarIndex}%)</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#4FC3F7' }}>💨 {envData.windSpeed} m/s ({envData.windIndex}%)</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#FF7043' }}>🌡️ {envData.temperature}°C</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#EF5350' }}>🌊 Flood: {envData.floodRisk}%</span>
          {activeTool && (
            <>
              <span style={{ color: 'var(--glass-border)' }}>│</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#00E676' }}>
                Click to place {getInfraDefinition(activeTool)?.name}
              </span>
            </>
          )}
        </>
      ) : (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-dim)' }}>
          Hover over map to see environmental data · Scroll to zoom · Drag to pan
        </span>
      )}
    </div>
  );
}

/* ─── Build sidebar ─── */
function BuildSidebar({ scores, placements, onUndo, onRemove, onClear, onNavigateReport, gridMode = false }) {
  const scoreColor = getScoreColor(scores.overall);

  return (
    <div style={{
      width: 300, height: '100%',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(16px)',
      borderLeft: '1px solid var(--glass-border)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0, overflowY: 'auto',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 6 }}>
          FEASIBILITY SCORE
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: scoreColor }}>
          {scores.overall}<span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/100</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: 10 }}>
          <MiniStat label="Solar Eff"  value={`${scores.solarEff}%`}        color="#FFD54F" />
          <MiniStat label="Wind Eff"   value={`${scores.windEff}%`}         color="#4FC3F7" />
          <MiniStat label="Connected"  value={`${scores.connectivity}%`}    color="#00E676" />
          <MiniStat label="Flood Safe" value={`${scores.floodSafety}%`}     color="#EF5350" />
          <MiniStat label="Total MW"   value={`${scores.totalMW}`}          color="#AB47BC" />
          <MiniStat label="CO₂ Saved"  value={`${scores.co2Avoided}t/yr`}  color="#66BB6A" />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8 }}>
          PLACEMENTS ({placements.length})
        </div>
        {placements.length === 0 ? (
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif", padding: 12, textAlign: 'center' }}>
            Select infrastructure from the toolbox, then click on the map to place it
          </div>
        ) : placements.map(p => {
          const def = getInfraDefinition(p.type);
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 8px', marginBottom: 3, borderRadius: 6,
              background: 'var(--bg-tertiary)',
              border: `1px solid ${p.isConnected ? 'rgba(0,230,118,0.2)' : 'rgba(255,23,68,0.2)'}`,
            }}>
              <span style={{ fontSize: 16 }}>{def.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'white' }}>
                  {def.name}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
                  {gridMode
                    ? `Grid (${p.gridX}, ${p.gridY}) · Eff: ${p.efficiency}%`
                    : `${p.lat?.toFixed(4)}°, ${p.lng?.toFixed(4)}°`}
                </div>
              </div>
              <button onClick={() => onRemove(p.id)} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: 14, padding: '2px 4px',
              }}>✕</button>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {placements.length > 0 && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onUndo} style={{
              flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
              borderRadius: 6, padding: '8px', color: 'var(--text-secondary)', fontSize: 11,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>⟲ Undo</button>
            <button onClick={onClear} style={{
              flex: 1, background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.2)',
              borderRadius: 6, padding: '8px', color: '#FF1744', fontSize: 11,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Clear All</button>
          </div>
        )}
        <button onClick={onNavigateReport} style={{
          width: '100%',
          background: 'linear-gradient(135deg, rgba(0,230,118,0.2), rgba(68,138,255,0.2))',
          border: '1px solid rgba(0,230,118,0.3)', borderRadius: 8, padding: '10px',
          color: '#00E676', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'Space Mono', monospace", letterSpacing: 1,
        }}>📊 GENERATE REPORT</button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 6, padding: '6px 10px' }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
