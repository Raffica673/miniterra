import { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup, Polyline, Circle, LayersControl, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import { getInfraDefinition } from '../../data/infrastructure';
import { getEnvironmentalData, getSolarGHI, getWindSpeed, getTemperature, getFloodRisk } from '../../data/environmentalModels';
import { getConnectionLines } from '../../hooks/useInfraPlacement';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ═══════════════════════════════════════════════════
   3D SVG Infrastructure Markers (from original design)
   ═══════════════════════════════════════════════════ */

const INFRA_SVGS = {
  solar: (() => {
    let panels = '';
    for (const r of [-1,0,1]) {
      for (const c of [-1.5,-0.5,0.5,1.5]) {
        panels += `<g transform="translate(${c*8},${r*7-4})"><rect x="-3.5" y="-2.5" width="7" height="5" fill="#1A237E" stroke="#0D47A1" stroke-width="0.4" rx="0.3"/><line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="#283593" stroke-width="0.3"/><line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="#283593" stroke-width="0.3"/><rect x="-3.2" y="-2.2" width="3" height="2" fill="rgba(100,180,255,0.15)" rx="0.2"/></g>`;
      }
    }
    return `<svg width="52" height="52" viewBox="-26 -26 52 52" xmlns="http://www.w3.org/2000/svg"><ellipse cx="0" cy="2" rx="22" ry="10" fill="rgba(0,0,0,0.2)"/>${panels}<ellipse cx="0" cy="-2" rx="18" ry="8" fill="rgba(255,213,79,0.08)"/><rect x="-12" y="14" width="24" height="8" rx="2" fill="rgba(255,213,79,0.25)"/><text x="0" y="20" text-anchor="middle" style="font-size:5px;fill:#FFD54F;font-family:sans-serif;font-weight:600">50 MW</text></svg>`;
  })(),
  wind: (windIndex = 50) => {
    const dur = windIndex > 70 ? 2.5 : windIndex < 30 ? 7 : 4;
    return `<svg width="52" height="52" viewBox="-26 -26 52 52" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="2" cy="3" rx="10" ry="4" fill="rgba(0,0,0,0.15)"/>
    <circle cx="0" cy="0" r="3" fill="#78909C" stroke="#546E7A" stroke-width="0.8"/>
    <circle cx="0" cy="0" r="2" fill="#B0BEC5"/>
    <g><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="${dur}s" repeatCount="indefinite"/>
      <line x1="0" y1="0" x2="0" y2="-14" stroke="#ECEFF1" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
      <line x1="0" y1="0" x2="12.12" y2="7" stroke="#ECEFF1" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
      <line x1="0" y1="0" x2="-12.12" y2="7" stroke="#ECEFF1" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
      <circle cx="0" cy="-14" r="1" fill="#CFD8DC"/><circle cx="12.12" cy="7" r="1" fill="#CFD8DC"/><circle cx="-12.12" cy="7" r="1" fill="#CFD8DC"/>
    </g>
    <circle cx="0" cy="0" r="1.2" fill="#ECEFF1"/>
    <rect x="-10" y="8" width="20" height="7" rx="2" fill="rgba(79,195,247,0.2)"/>
    <text x="0" y="13" text-anchor="middle" style="font-size:5px;fill:#4FC3F7;font-family:sans-serif;font-weight:600">30 MW</text>
  </svg>`;
  },
  substation: `<svg width="52" height="52" viewBox="-26 -26 52 52" xmlns="http://www.w3.org/2000/svg">
    <circle cx="0" cy="0" r="6" fill="none" stroke="#00E676" stroke-width="0.8" opacity="0.3">
      <animate attributeName="r" values="6;20;6" dur="2.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <rect x="-10" y="-8" width="20" height="16" fill="#1B2631" stroke="#00E676" stroke-width="0.6" rx="1"/>
    <rect x="-8" y="-6" width="6" height="5" fill="#263238" rx="0.5"/>
    <rect x="2" y="-6" width="6" height="5" fill="#263238" rx="0.5"/>
    <rect x="-4" y="2" width="8" height="4" fill="#263238" rx="0.5"/>
    <circle cx="-5" cy="-3.5" r="1.5" fill="none" stroke="#00E676" stroke-width="0.5" opacity="0.6"/>
    <circle cx="5" cy="-3.5" r="1.5" fill="none" stroke="#00E676" stroke-width="0.5" opacity="0.6"/>
    <polygon points="-1,-1 1,-1 0,1.5 2,1.5 -1,5 0,2.5 -2,2.5" fill="#00E676" opacity="0.8"/>
    <rect x="-10" y="-8" width="20" height="2" fill="#00E676" opacity="0.3" rx="1"/>
  </svg>`,
  transmission: `<svg width="52" height="52" viewBox="-26 -26 52 52" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="-10" cy="1" rx="3" ry="1.5" fill="rgba(0,0,0,0.12)"/>
    <ellipse cx="10" cy="1" rx="3" ry="1.5" fill="rgba(0,0,0,0.12)"/>
    <rect x="-12" y="-2" width="4" height="4" fill="#546E7A" rx="0.5"/>
    <rect x="8" y="-2" width="4" height="4" fill="#546E7A" rx="0.5"/>
    <line x1="-14" y1="0" x2="-8" y2="0" stroke="#78909C" stroke-width="1.5"/>
    <line x1="6" y1="0" x2="14" y2="0" stroke="#78909C" stroke-width="1.5"/>
    <line x1="-8" y1="0" x2="8" y2="0" stroke="#00E676" stroke-width="1" opacity="0.6"/>
    <circle r="1.5" fill="#00E676" opacity="0.8"><animateMotion dur="1.5s" repeatCount="indefinite" path="M-8,0 L8,0"/></circle>
    <circle r="1.5" fill="#00E676" opacity="0.8"><animateMotion dur="1.5s" repeatCount="indefinite" path="M8,0 L-8,0"/></circle>
  </svg>`,
  battery: `<svg width="52" height="52" viewBox="-26 -26 52 52" xmlns="http://www.w3.org/2000/svg">
    <rect x="-12" y="-6" width="24" height="12" fill="#4A148C" stroke="#7B1FA2" stroke-width="0.6" rx="1.5"/>
    <line x1="-4" y1="-6" x2="-4" y2="6" stroke="#6A1B9A" stroke-width="0.4"/>
    <line x1="4" y1="-6" x2="4" y2="6" stroke="#6A1B9A" stroke-width="0.4"/>
    <rect x="-10" y="-3" width="6" height="2" fill="#CE93D8" opacity="0.5" rx="0.5"/>
    <rect x="-2" y="-3" width="6" height="2" fill="#CE93D8" opacity="0.5" rx="0.5"/>
    <rect x="6" y="-3" width="6" height="2" fill="#CE93D8" opacity="0.4" rx="0.5"/>
    <circle cx="-8" cy="3" r="1" fill="#00E676" opacity="0.6"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/></circle>
    <circle cx="0" cy="3" r="1" fill="#00E676" opacity="0.6"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" begin="0.7s"/></circle>
    <circle cx="8" cy="3" r="1" fill="#FFC107" opacity="0.5"><animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" begin="1.4s"/></circle>
    <text x="0" y="12" text-anchor="middle" style="font-size:4.5px;fill:#AB47BC;font-family:sans-serif;font-weight:600">200 MWh</text>
  </svg>`,
  weatherStation: `<svg width="52" height="52" viewBox="-26 -26 52 52" xmlns="http://www.w3.org/2000/svg">
    <rect x="-5" y="-5" width="10" height="10" fill="#37474F" stroke="#546E7A" stroke-width="0.5" rx="1"/>
    <circle cx="0" cy="0" r="2" fill="#E8EAED"/>
    <line x1="0" y1="0" x2="-7" y2="-5" stroke="#E8EAED" stroke-width="0.8"/>
    <line x1="0" y1="0" x2="7" y2="-3" stroke="#E8EAED" stroke-width="0.8"/>
    <line x1="0" y1="0" x2="0" y2="7" stroke="#E8EAED" stroke-width="0.8"/>
    <circle cx="-7" cy="-5" r="1.5" fill="#448AFF" opacity="0.7"/>
    <circle cx="7" cy="-3" r="1" fill="#448AFF" opacity="0.5"/>
    <circle cx="0" cy="7" r="1.5" fill="#448AFF" opacity="0.4"/>
    <circle cx="0" cy="0" r="4" fill="none" stroke="#448AFF" stroke-width="0.6" opacity="0.3">
      <animate attributeName="r" values="4;16;4" dur="2.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite"/>
    </circle>
  </svg>`,
  floodBarrier: `<svg width="52" height="52" viewBox="-26 -26 52 52" xmlns="http://www.w3.org/2000/svg">
    <rect x="-16" y="-3" width="32" height="6" fill="#455A64" stroke="#78909C" stroke-width="0.5" rx="1"/>
    <rect x="-14" y="-2" width="4" height="4" fill="#546E7A" rx="0.5"/>
    <rect x="-6" y="-2" width="4" height="4" fill="#546E7A" rx="0.5"/>
    <rect x="2" y="-2" width="4" height="4" fill="#546E7A" rx="0.5"/>
    <rect x="10" y="-2" width="4" height="4" fill="#546E7A" rx="0.5"/>
    <line x1="-16" y1="4" x2="16" y2="4" stroke="#4FC3F7" stroke-width="1" opacity="0.4"/>
    <line x1="-12" y1="6" x2="12" y2="6" stroke="#4FC3F7" stroke-width="0.5" opacity="0.2">
      <animateTransform attributeName="transform" type="translate" values="0,0;0,2;0,0" dur="3s" repeatCount="indefinite"/>
    </line>
  </svg>`,
};

function createInfraIcon(type, placement) {
  const def = getInfraDefinition(type);
  const isConnected = placement?.isConnected;
  let svgStr = typeof INFRA_SVGS[type] === 'function'
    ? INFRA_SVGS[type](placement?.envData?.windIndex || 50)
    : INFRA_SVGS[type];

  if (!svgStr) svgStr = `<svg width="32" height="32"><circle cx="16" cy="16" r="14" fill="${def?.themeColor || '#888'}"/></svg>`;

  const borderColor = isConnected ? '#00E676' : '#FF1744';
  return L.divIcon({
    className: 'infra-marker-3d',
    html: `<div class="infra-icon-wrap" style="border-color:${borderColor}">${svgStr}</div>
      <div class="infra-label" style="color:${def?.themeColor || '#ccc'}">${def?.name || type}</div>`,
    iconSize: [52, 64],
    iconAnchor: [26, 26],
    popupAnchor: [0, -28],
  });
}

/* ═══════════════════════════════════════════════════
   Data overlay using Leaflet's L.GridLayer (tile-based)
   Tiles move properly with the map
   ═══════════════════════════════════════════════════ */

function DataTileLayer({ type, opacity = 0.35 }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const CanvasGridLayer = L.GridLayer.extend({
      createTile(coords) {
        const tile = document.createElement('canvas');
        const size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;
        const ctx = tile.getContext('2d');
        const step = 4;

        for (let px = 0; px < size.x; px += step) {
          for (let py = 0; py < size.y; py += step) {
            const point = L.point(coords.x * size.x + px, coords.y * size.y + py);
            const latlng = map.unproject(point, coords.z);
            const lat = latlng.lat;
            const lng = latlng.lng;

            let r = 0, g = 0, b = 0, a = 0;

            if (type === 'solar') {
              const ghi = getSolarGHI(lat, lng);
              const t = Math.max(0, Math.min(1, (ghi - 3.8) / 2.2));
              r = t < 0.5 ? 80 + 350 * t : 255;
              g = t < 0.5 ? 120 + 270 * t : 255 - 200 * (t - 0.5);
              b = t < 0.5 ? 220 - 380 * t : 55 - 110 * (t - 0.5);
              a = 0.45;
            } else if (type === 'wind') {
              const speed = getWindSpeed(lat, lng);
              const t = Math.max(0, Math.min(1, (speed - 1.5) / 8.5));
              r = 30 + 40 * t;
              g = 140 + 80 * t;
              b = 220 + 35 * t;
              a = 0.15 + 0.45 * t;
            } else if (type === 'temperature') {
              const temp = getTemperature(lat, lng);
              const t = Math.max(0, Math.min(1, (temp + 5) / 25));
              r = t > 0.5 ? 50 + 410 * (t - 0.5) : 20;
              g = t < 0.5 ? 100 + 310 * t : 255 - 310 * (t - 0.5);
              b = t < 0.5 ? 240 - 200 * t : 140 - 280 * (t - 0.5);
              a = 0.4;
            } else if (type === 'flood') {
              const risk = getFloodRisk(lat, lng);
              const t = risk / 100;
              r = 40 + 215 * t;
              g = 80 - 30 * t;
              b = 220 - 180 * t;
              a = 0.1 + 0.55 * t;
            }

            ctx.fillStyle = `rgba(${Math.round(Math.max(0, Math.min(255, r)))},${Math.round(Math.max(0, Math.min(255, g)))},${Math.round(Math.max(0, Math.min(255, b)))},${a})`;
            ctx.fillRect(px, py, step, step);
          }
        }
        return tile;
      },
    });

    const layer = new CanvasGridLayer({ opacity, tileSize: 256 });
    layer.addTo(map);

    return () => { map.removeLayer(layer); };
  }, [map, type, opacity]);

  return null;
}

/* ═══════════════════════════════════════════════════
   Animated wind gusts overlay
   ═══════════════════════════════════════════════════ */

function WindGustsLayer() {
  const map = useMap();
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:450;';
    map.getContainer().appendChild(canvas);
    canvasRef.current = canvas;

    const resize = () => {
      const s = map.getSize();
      canvas.width = s.x * (window.devicePixelRatio || 1);
      canvas.height = s.y * (window.devicePixelRatio || 1);
      canvas.style.width = s.x + 'px';
      canvas.style.height = s.y + 'px';
    };
    resize();
    map.on('resize', resize);

    // Initialize particles
    const initParticles = () => {
      const s = map.getSize();
      particlesRef.current = Array.from({ length: 120 }, () => ({
        x: Math.random() * s.x,
        y: Math.random() * s.y,
        speed: 0.5 + Math.random() * 2,
        length: 8 + Math.random() * 20,
        opacity: 0.1 + Math.random() * 0.3,
      }));
    };
    initParticles();

    const animate = () => {
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const s = map.getSize();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      for (const p of particlesRef.current) {
        // Get wind speed at particle position
        const latlng = map.containerPointToLatLng([p.x, p.y]);
        const speed = getWindSpeed(latlng.lat, latlng.lng);
        const baseSpeed = speed / 3;

        p.x += p.speed * baseSpeed;
        p.y += Math.sin(p.x * 0.02) * 0.3;

        if (p.x > s.x + 30) {
          p.x = -30;
          p.y = Math.random() * s.y;
        }

        const t = Math.min(1, speed / 8);
        ctx.strokeStyle = `rgba(${150 + 100 * t}, ${200 + 55 * t}, 255, ${p.opacity * (0.3 + 0.7 * t)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.length * baseSpeed * 0.5, p.y);
        ctx.stroke();
      }

      ctx.restore();
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      map.off('resize', resize);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [map]);

  return null;
}

/* ═══════════════════════════════════════════════════
   Map click handler & cursor tracker
   ═══════════════════════════════════════════════════ */

function MapClickHandler({ activeTool, onMapClick, enabled }) {
  useMapEvents({
    click(e) {
      if (enabled && activeTool) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function CursorTracker({ onMove }) {
  useMapEvents({
    mousemove(e) { onMove(e.latlng); },
    mouseout() { onMove(null); },
  });
  return null;
}

function FlyToRegion({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 14, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

/* ═══════════════════════════════════════════════════
   Main Map Component
   ═══════════════════════════════════════════════════ */

export default function RealMap({
  center = [-33.4489, -70.6693],
  zoom = 12,
  placements = [],
  activeOverlays = [],
  activeTool = null,
  onMapClick,
  onRemovePlacement,
  onCursorMove,
  interactive = true,
  style = {},
}) {
  const connectionLines = useMemo(() => getConnectionLines(placements), [placements]);
  const showRangeFor = activeTool === 'substation' || activeTool === 'transmission';

  return (
    <div style={{ flex: 1, position: 'relative', ...style }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%', background: '#0B0F14' }}
        zoomControl={true}
        attributionControl={true}
        maxBounds={[[-33.75, -71.15], [-33.10, -70.15]]}
        minZoom={10}
        maxZoom={19}
      >
        {/* Base layers */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Esri, Maxar, Earthstar"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Street Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topographic (Elevation)">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenTopoMap'
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Fly to region */}
        <FlyToRegion center={center} zoom={zoom} />

        {/* Data overlays (tile-based, move with map) */}
        {activeOverlays.includes('solar') && <DataTileLayer type="solar" opacity={0.55} />}
        {activeOverlays.includes('wind') && <DataTileLayer type="wind" opacity={0.5} />}
        {activeOverlays.includes('wind') && <WindGustsLayer />}
        {activeOverlays.includes('temperature') && <DataTileLayer type="temperature" opacity={0.5} />}
        {activeOverlays.includes('flood') && <DataTileLayer type="flood" opacity={0.55} />}

        {/* Click handler */}
        {interactive && <MapClickHandler activeTool={activeTool} onMapClick={onMapClick} enabled={!!activeTool} />}
        {interactive && onCursorMove && <CursorTracker onMove={onCursorMove} />}

        {/* Connection range circles */}
        {showRangeFor && placements.filter(p => p.type === 'substation').map(p => (
          <Circle
            key={`range-${p.id}`}
            center={[p.lat, p.lng]}
            radius={890}
            pathOptions={{ color: '#00E676', weight: 1, fillColor: '#00E676', fillOpacity: 0.04, dashArray: '6,4' }}
          />
        ))}

        {/* Power lines (animated) */}
        {connectionLines.map((line, i) => (
          <Polyline
            key={`line-${i}`}
            positions={[[line.from.lat, line.from.lng], [line.to.lat, line.to.lng]]}
            pathOptions={{ color: '#00E676', weight: 2.5, opacity: 0.7, dashArray: '8,6', className: 'power-line-animated' }}
          />
        ))}

        {/* 3D SVG Infrastructure markers */}
        {placements.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={createInfraIcon(p.type, p)}>
            <Popup className="infra-popup" maxWidth={280}>
              <InfraPopupContent placement={p} onRemove={onRemovePlacement} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      {activeOverlays.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 30, left: 12, zIndex: 1000,
          background: 'rgba(11,15,20,0.92)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
          padding: '10px 14px', pointerEvents: 'none',
        }}>
          {activeOverlays.map(o => <OverlayLegend key={o} type={o} />)}
        </div>
      )}
    </div>
  );
}

/* ─── Popup content ─── */
function InfraPopupContent({ placement, onRemove }) {
  const def = getInfraDefinition(placement.type);
  const env = placement.envData;
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: '#1a1a2e', minWidth: 220 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{def.icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{def.name}</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>{def.description}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 11, marginBottom: 8 }}>
        <div>📍 {placement.lat.toFixed(4)}°, {placement.lng.toFixed(4)}°</div>
        <div>⛰️ {env.elevation}m</div>
        <div>☀️ {env.solarGHI} kWh/m²/d</div>
        <div>💨 {env.windSpeed} m/s</div>
        <div>🌡️ {env.temperature}°C</div>
        <div>🌊 Flood: {env.floodRisk}%</div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
        <span style={{ background: placement.isConnected ? '#d4edda' : '#f8d7da', color: placement.isConnected ? '#155724' : '#721c24', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
          {placement.isConnected ? '✓ Connected' : '✗ Disconnected'}
        </span>
        {placement.efficiency !== 100 && <span style={{ fontSize: 10, color: '#6B7280' }}>Eff: {placement.efficiency}%</span>}
      </div>
      {placement.warnings.length > 0 && (
        <div style={{ background: '#FFF3E0', borderRadius: 4, padding: 6, marginBottom: 8, fontSize: 10 }}>
          {placement.warnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
        </div>
      )}
      {onRemove && (
        <button onClick={() => onRemove(placement.id)} style={{ background: '#FF1744', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
          Remove
        </button>
      )}
    </div>
  );
}

/* ─── Legend ─── */
function OverlayLegend({ type }) {
  const c = {
    solar: { label: 'Solar GHI', gradient: 'linear-gradient(90deg, #5080D0, #FFD54F, #FF6B00)', min: '3.8', max: '6.0', unit: 'kWh/m²/d' },
    wind: { label: 'Wind Speed (80m)', gradient: 'linear-gradient(90deg, rgba(170,220,255,0.3), #28A0FF, #1840FF)', min: '1.5', max: '10', unit: 'm/s' },
    temperature: { label: 'Temperature', gradient: 'linear-gradient(90deg, #3355FF, #44CC88, #FF4422)', min: '-5', max: '20', unit: '°C' },
    flood: { label: 'Flood Risk', gradient: 'linear-gradient(90deg, rgba(40,80,220,0.1), rgba(255,50,50,0.8))', min: '0', max: '100', unit: '%' },
  }[type];
  if (!c) return null;
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 10, color: 'white', fontFamily: "'Space Mono',monospace", marginBottom: 3, letterSpacing: 1 }}>{c.label}</div>
      <div style={{ width: 160, height: 8, borderRadius: 4, background: c.gradient }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#9AA0A6', marginTop: 2 }}>
        <span>{c.min} {c.unit}</span><span>{c.max} {c.unit}</span>
      </div>
    </div>
  );
}
