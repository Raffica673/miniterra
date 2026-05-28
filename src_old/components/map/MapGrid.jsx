import { memo, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GRID_COLS, GRID_ROWS, getSettlements } from '../../utils/gridGenerator';
import { getViewBox, TILE_WIDTH, TILE_HEIGHT, gridToScreen } from '../../utils/isometric';
import { useApp } from '../../contexts/AppContext';
import IsometricTile from './IsometricTile';
import ConnectionLines from './ConnectionLines';
import DataAttribution from './DataAttribution';
import HoverTooltip from './HoverTooltip';

let hasAnimatedOnce = false;

const MapGrid = memo(function MapGrid({
  cells,
  overlays = [],
  compareMode = false,
  hoveredCell,
  onCellHover,
  onCellLeave,
  onCellDrop,
  interactive = true,
  style = {},
}) {
  const { selectedRegion } = useApp();
  const vb = useMemo(() => getViewBox(GRID_COLS, GRID_ROWS), []);
  const [loadPhase, setLoadPhase] = useState(() =>
    cells.length > 0 && hasAnimatedOnce ? 'done' : 'idle'
  );
  const prevCellCount = useRef(cells.length > 0 && hasAnimatedOnce ? cells.length : 0);

  // 3D perspective toggle
  const [is3D, setIs3D] = useState(false);

  // Zoom & pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef(null);

  // Tooltip position
  const [tooltipPos, setTooltipPos] = useState(null);

  // Settlement labels for current region
  const settlements = useMemo(() => {
    if (!selectedRegion) return [];
    return getSettlements(selectedRegion.id || selectedRegion);
  }, [selectedRegion]);

  // Cascade animation
  useEffect(() => {
    if (cells.length > 0 && prevCellCount.current === 0 && !hasAnimatedOnce) {
      hasAnimatedOnce = true;
      setLoadPhase('cascade');
      const t1 = setTimeout(() => setLoadPhase('done'), 1200);
      prevCellCount.current = cells.length;
      return () => { clearTimeout(t1); };
    }
    if (cells.length > 0 && hasAnimatedOnce) {
      setLoadPhase('done');
      prevCellCount.current = cells.length;
    }
    if (cells.length === 0) {
      prevCellCount.current = 0;
      hasAnimatedOnce = false;
      setLoadPhase('idle');
    }
  }, [cells.length]);

  const sortedCells = useMemo(() => {
    return [...cells].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
  }, [cells]);

  const showTiles = loadPhase !== 'idle';

  // Zoom on wheel
  const handleWheel = useCallback((e) => {
    if (!interactive) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setZoom(prev => Math.max(0.3, Math.min(5, prev * delta)));
  }, [interactive]);

  // Pan handlers
  const handlePanStart = useCallback((e) => {
    if (!interactive) return;
    if (e.target.tagName === 'svg' || e.target.tagName === 'DIV') {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    }
  }, [interactive, pan]);

  const handlePanMove = useCallback((e) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
  }, [isPanning]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Track mouse for tooltip
  const handleMouseMove = useCallback((e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('pointerup', handlePanEnd);
    window.addEventListener('pointermove', handlePanMove);
    return () => {
      window.removeEventListener('pointerup', handlePanEnd);
      window.removeEventListener('pointermove', handlePanMove);
    };
  }, [handlePanEnd, handlePanMove]);

  const zoomPct = Math.round(zoom * 100);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePanStart}
      onMouseMove={interactive ? handleMouseMove : undefined}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: isPanning ? 'grabbing' : 'grab',
        ...style,
      }}
    >
      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 60%, var(--bg-primary) 100%)',
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* Hover tooltip */}
      {interactive && hoveredCell && tooltipPos && (
        <HoverTooltip cell={hoveredCell} pos={tooltipPos} />
      )}

      <div
        style={{
          transform: is3D
            ? `perspective(1200px) rotateX(50deg) rotateZ(-45deg) translate(${pan.x}px, ${pan.y}px) scale(${zoom * 0.75})`
            : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)',
        }}
      >
        <svg
          viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`}
          style={{
            width: vb.width * 1.2,
            height: vb.height * 1.2,
          }}
        >
          <ConnectionLines cells={cells} />

          {showTiles && sortedCells.map((cell) => {
            const rowDelay = (cell.y + cell.x) * 30;
            return (
              <g
                key={`${cell.x}-${cell.y}`}
                style={{
                  animation: loadPhase === 'cascade'
                    ? `tileAppear 200ms ease-out ${rowDelay}ms both`
                    : undefined,
                }}
              >
                <IsometricTile
                  cell={cell}
                  overlays={overlays}
                  showCompare={compareMode && overlays.length === 2}
                  isHovered={hoveredCell?.x === cell.x && hoveredCell?.y === cell.y}
                  onPointerEnter={interactive ? () => onCellHover?.(cell) : undefined}
                  onPointerLeave={interactive ? () => onCellLeave?.() : undefined}
                  onPointerUp={interactive ? () => onCellDrop?.(cell) : undefined}
                />
              </g>
            );
          })}

          {/* Settlement labels */}
          {showTiles && settlements.map((s) => {
            const { screenX, screenY } = gridToScreen(s.x, s.y, 0);
            return (
              <g key={s.name} transform={`translate(${screenX + TILE_WIDTH / 2}, ${screenY - 6})`}>
                {/* Label background */}
                <rect
                  x={-30} y={-10}
                  width={60} height={14}
                  rx={3}
                  fill="rgba(11, 15, 20, 0.75)"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={0.5}
                />
                {/* Settlement dot */}
                <circle cx={-22} cy={-3} r={2} fill="#FFD54F" opacity={0.8} />
                {/* Label text */}
                <text
                  x={0}
                  y={-1}
                  textAnchor="middle"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 7,
                    fontWeight: 600,
                    fill: 'rgba(255,255,255,0.85)',
                    letterSpacing: 0.5,
                  }}
                >
                  {s.name}
                </text>
              </g>
            );
          })}

          <g transform={`translate(${vb.x + vb.width - 50}, ${vb.y + vb.height - 30})`}>
            <DataAttribution />
          </g>
        </svg>
      </div>

      {/* Side controls panel */}
      {interactive && (
        <div style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          zIndex: 5,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 10,
          padding: '8px 4px',
        }}>
          {/* Zoom In */}
          <ZoomBtn label="+" onClick={() => setZoom(z => Math.min(5, z * 1.25))} />

          {/* Zoom slider */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: 120,
            padding: '4px 0',
          }}>
            <input
              type="range"
              min={30}
              max={500}
              value={zoomPct}
              onChange={(e) => setZoom(parseInt(e.target.value) / 100)}
              style={{
                writingMode: 'vertical-lr',
                direction: 'rtl',
                width: 20,
                height: 110,
                appearance: 'none',
                WebkitAppearance: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
              className="zoom-slider"
            />
          </div>

          {/* Zoom Out */}
          <ZoomBtn label="−" onClick={() => setZoom(z => Math.max(0.3, z * 0.8))} />

          {/* Zoom level indicator */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            color: 'var(--text-muted)',
            marginTop: 2,
          }}>
            {zoomPct}%
          </div>

          {/* Separator */}
          <div style={{ width: 16, height: 1, background: 'var(--glass-border)', margin: '4px 0' }} />

          {/* Reset */}
          <ZoomBtn label="⟲" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} />

          {/* Fit to view */}
          <ZoomBtn label="⊞" onClick={() => { setZoom(0.85); setPan({ x: 0, y: 0 }); }} />

          {/* Separator */}
          <div style={{ width: 16, height: 1, background: 'var(--glass-border)', margin: '4px 0' }} />

          {/* 3D Toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setIs3D(prev => !prev); }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: `1px solid ${is3D ? '#00E676' : 'var(--glass-border)'}`,
              background: is3D ? 'rgba(0,230,118,0.15)' : 'transparent',
              color: is3D ? '#00E676' : 'var(--text-secondary)',
              fontSize: 9,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              transition: 'all 200ms',
            }}
            title={is3D ? 'Switch to 2D flat view' : 'Switch to 3D perspective'}
          >
            3D
          </button>
        </div>
      )}

      <style>{`
        @keyframes tileAppear {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .zoom-slider::-webkit-slider-track {
          width: 3px;
          background: var(--bg-surface);
          border-radius: 2px;
        }
        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #00E676;
          cursor: pointer;
          border: 2px solid var(--bg-primary);
          box-shadow: 0 0 6px rgba(0,230,118,0.4);
        }
        .zoom-slider::-moz-range-track {
          width: 3px;
          background: var(--bg-surface);
          border-radius: 2px;
        }
        .zoom-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #00E676;
          cursor: pointer;
          border: 2px solid var(--bg-primary);
        }
      `}</style>
    </div>
  );
});

function ZoomBtn({ label, onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: '1px solid var(--glass-border)',
        background: 'transparent',
        color: 'var(--text-secondary)',
        fontSize: 16,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Space Mono', monospace",
        transition: 'all 150ms',
      }}
      onMouseEnter={e => { e.target.style.background = 'var(--bg-tertiary)'; e.target.style.color = 'white'; }}
      onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-secondary)'; }}
    >
      {label}
    </button>
  );
}

export default MapGrid;
