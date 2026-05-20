import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup, Polyline, Circle, LayersControl } from 'react-leaflet';
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

/* ─── Infrastructure marker icons ─── */
function createInfraIcon(type, isConnected = false) {
  const def = getInfraDefinition(type);
  const color = def?.themeColor || '#fff';
  const icon = def?.icon || '📍';
  const borderColor = isConnected ? '#00E676' : '#FF1744';
  const glowColor = isConnected ? 'rgba(0,230,118,0.4)' : 'rgba(255,23,68,0.3)';

  return L.divIcon({
    className: 'infra-marker',
    html: `<div style="
      width:36px; height:36px; border-radius:50%;
      background: rgba(17,25,33,0.9);
      border: 2px solid ${borderColor};
      display:flex; align-items:center; justify-content:center;
      font-size:18px; cursor:pointer;
      box-shadow: 0 0 12px ${glowColor}, 0 2px 8px rgba(0,0,0,0.4);
      transition: all 0.3s ease;
      animation: markerPulse 2s ease-in-out infinite;
    ">${icon}</div>
    <div style="
      position:absolute; top:38px; left:50%; transform:translateX(-50%);
      white-space:nowrap; font-size:9px; font-family:'Space Mono',monospace;
      color:${color}; text-shadow:0 1px 3px rgba(0,0,0,0.8);
      background:rgba(0,0,0,0.6); padding:1px 5px; border-radius:3px;
    ">${def?.name || type}</div>`,
    iconSize: [36, 50],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

/* ─── Data overlay canvas layer ─── */
function DataOverlayLayer({ type, opacity = 0.35 }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    const canvas = L.DomUtil.create('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '350';
    canvas.style.opacity = String(opacity);
    canvas.style.mixBlendMode = 'screen';
    canvasRef.current = canvas;

    const pane = map.getPane('overlayPane');
    if (pane) pane.appendChild(canvas);

    const render = () => {
      const size = map.getSize();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size.x * dpr;
      canvas.height = size.y * dpr;
      canvas.style.width = size.x + 'px';
      canvas.style.height = size.y + 'px';

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size.x, size.y);

      const bounds = map.getBounds();
      const step = 8; // pixels per sample

      for (let px = 0; px < size.x; px += step) {
        for (let py = 0; py < size.y; py += step) {
          const point = map.containerPointToLatLng([px, py]);
          const lat = point.lat;
          const lng = point.lng;

          let color;
          if (type === 'solar') {
            const ghi = getSolarGHI(lat, lng);
            const t = Math.max(0, Math.min(1, (ghi - 3.5) / 3.0));
            const r = t < 0.5 ? 100 + 310 * t : 255;
            const g = t < 0.5 ? 150 + 210 * t : 255 - 240 * (t - 0.5);
            const b = t < 0.5 ? 255 - 360 * t : 75 - 150 * (t - 0.5);
            color = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(Math.max(0, b))},0.6)`;
          } else if (type === 'wind') {
            const speed = getWindSpeed(lat, lng);
            const t = Math.max(0, Math.min(1, (speed - 1.5) / 10.5));
            color = `rgba(${Math.round(40 + 60 * t)},${Math.round(180 + 75 * t)},${255},${0.3 + 0.5 * t})`;
          } else if (type === 'temperature') {
            const temp = getTemperature(lat, lng);
            const t = Math.max(0, Math.min(1, (temp + 5) / 40));
            const r = t > 0.5 ? 50 + 410 * (t - 0.5) : 0;
            const g = t < 0.5 ? 200 * t * 2 : 255 - 310 * (t - 0.5);
            const b = t < 0.5 ? 255 - 200 * t : 155 - 310 * (t - 0.5);
            color = `rgba(${Math.round(Math.max(0, r))},${Math.round(Math.max(0, g))},${Math.round(Math.max(0, b))},0.5)`;
          } else if (type === 'hydro') {
            // Hydro potential based on elevation (higher = better for hydro)
            const envData = getEnvironmentalData(lat, lng);
            const elevation = envData.elevation;
            const t = Math.max(0, Math.min(1, (elevation - 200) / 2000));
            color = `rgba(${Math.round(0 + 100 * t)},${Math.round(150 + 88 * t)},${Math.round(212 - 50 * t)},${0.2 + 0.5 * t})`;
          } else if (type === 'flood') {
            const risk = getFloodRisk(lat, lng);
            const t = risk / 100;
            color = `rgba(${Math.round(50 + 200 * t)},${Math.round(100 - 50 * t)},${Math.round(255 - 200 * t)},${0.15 + 0.6 * t})`;
          }

          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(px, py, step, step);
          }
        }
      }

      // Position canvas
      const topLeft = map.latLngToContainerPoint(bounds.getNorthWest());
      canvas.style.transform = `translate(${0}px, ${0}px)`;
    };

    render();
    map.on('moveend zoomend resize', render);

    return () => {
      map.off('moveend zoomend resize', render);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [map, type, opacity]);

  return null;
}

/* ─── Map click handler ─── */
function MapClickHandler({ activeTool, onMapClick, enabled }) {
  useMapEvents({
    click(e) {
      if (enabled && activeTool) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

/* ─── Cursor position tracker ─── */
function CursorTracker({ onMove }) {
  useMapEvents({
    mousemove(e) {
      onMove(e.latlng);
    },
    mouseout() {
      onMove(null);
    },
  });
  return null;
}

/* ─── Fly to region ─── */
function FlyToRegion({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 14, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

/* ─── Main Map Component ─── */
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
  const [mapReady, setMapReady] = useState(false);

  // Connection lines
  const connectionLines = useMemo(() => getConnectionLines(placements), [placements]);

  // Connection range circles (show range when placing grid infrastructure)
  const showRangeFor = activeTool === 'substation' || activeTool === 'transmission';

  return (
    <div style={{ flex: 1, position: 'relative', ...style }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%', background: '#0B0F14' }}
        zoomControl={false}
        attributionControl={true}
        whenReady={() => setMapReady(true)}
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
              attribution='&copy; OpenStreetMap contributors'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topographic">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenTopoMap contributors'
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Terrain (USGS)">
            <TileLayer
              url="https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}"
              attribution='USGS'
              maxZoom={16}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Elevation Contours">
            <TileLayer
              url="https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=YOUR_API_KEY"
              attribution='&copy; Thunderforest, &copy; OpenStreetMap contributors'
              maxZoom={18}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Street overlay on satellite */}
        <TileLayer
          url="https://stamen-tiles.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}.png"
          opacity={0.15}
          maxZoom={19}
        />

        {/* Fly to region */}
        <FlyToRegion center={center} zoom={zoom} />

        {/* Data overlays */}
        {activeOverlays.includes('solar') && <DataOverlayLayer type="solar" opacity={0.3} />}
        {activeOverlays.includes('wind') && <DataOverlayLayer type="wind" opacity={0.3} />}
        {activeOverlays.includes('temperature') && <DataOverlayLayer type="temperature" opacity={0.3} />}
        {activeOverlays.includes('hydro') && <DataOverlayLayer type="hydro" opacity={0.35} />}

        {/* Click handler */}
        {interactive && <MapClickHandler activeTool={activeTool} onMapClick={onMapClick} enabled={!!activeTool} />}
        
        {/* Cursor tracker */}
        {interactive && onCursorMove && <CursorTracker onMove={onCursorMove} />}

        {/* Connection range indicators for substations and transmission lines */}
        {showRangeFor && placements.filter(p => p.type === 'substation').map(p => (
          <Circle
            key={`range-${p.id}`}
            center={[p.lat, p.lng]}
            radius={890}
            pathOptions={{
              color: '#00E676',
              weight: 1,
              fillColor: '#00E676',
              fillOpacity: 0.05,
              dashArray: '6,4',
            }}
          />
        ))}
        {/* Transmission lines show EXTENDED range - they act as grid connectors */}
        {showRangeFor && placements.filter(p => p.type === 'transmission').map(p => (
          <Circle
            key={`range-${p.id}`}
            center={[p.lat, p.lng]}
            radius={1330}
            pathOptions={{
              color: '#4FC3F7',
              weight: 1,
              fillColor: '#4FC3F7',
              fillOpacity: 0.03,
              dashArray: '8,6',
            }}
          />
        ))}

        {/* Power lines */}
        {connectionLines.map((line, i) => (
          <Polyline
            key={`line-${i}`}
            positions={[[line.from.lat, line.from.lng], [line.to.lat, line.to.lng]]}
            pathOptions={{
              color: '#00E676',
              weight: 2,
              opacity: 0.7,
              dashArray: '8,6',
              className: 'power-line-animated',
            }}
          />
        ))}

        {/* Infrastructure markers */}
        {placements.map(p => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={createInfraIcon(p.type, p.isConnected)}
          >
            <Popup className="infra-popup" maxWidth={280}>
              <InfraPopupContent placement={p} onRemove={onRemovePlacement} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map legend for active overlay */}
      {activeOverlays.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: 12,
          zIndex: 1000,
          background: 'rgba(11,15,20,0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: '10px 14px',
          pointerEvents: 'none',
        }}>
          {activeOverlays.map(overlay => (
            <OverlayLegend key={overlay} type={overlay} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Popup content for infrastructure markers ─── */
function InfraPopupContent({ placement, onRemove }) {
  const def = getInfraDefinition(placement.type);
  const env = placement.envData;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: '#1a1a2e', minWidth: 220 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 24 }}>{def.icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{def.name}</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>{def.description}</div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 11, marginBottom: 8 }}>
        <div>📍 {placement.lat.toFixed(4)}°, {placement.lng.toFixed(4)}°</div>
        <div>⛰️ {env.elevation}m elevation</div>
        <div>☀️ GHI: {env.solarGHI} kWh/m²/d</div>
        <div>💨 Wind: {env.windSpeed} m/s</div>
        <div>🌡️ Temp: {env.temperature}°C</div>
        <div>🌊 Flood: {env.floodRisk}%</div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
        <span style={{ 
          background: placement.isConnected ? '#d4edda' : '#f8d7da',
          color: placement.isConnected ? '#155724' : '#721c24',
          padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
        }}>
          {placement.isConnected ? '✓ Connected' : '✗ Disconnected'}
        </span>
        {placement.efficiency !== 100 && (
          <span style={{ fontSize: 10, color: '#6B7280' }}>Efficiency: {placement.efficiency}%</span>
        )}
      </div>

      {placement.warnings.length > 0 && (
        <div style={{ background: '#FFF3E0', borderRadius: 4, padding: 6, marginBottom: 8, fontSize: 10 }}>
          {placement.warnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
        </div>
      )}

      {onRemove && (
        <button
          onClick={() => onRemove(placement.id)}
          style={{
            background: '#FF1744',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '4px 12px',
            fontSize: 11,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
          }}
        >
          Remove
        </button>
      )}
    </div>
  );
}

/* ─── Legend for data overlays ─── */
function OverlayLegend({ type }) {
  const configs = {
    solar: {
      label: 'Solar Irradiance (GHI)',
      unit: 'kWh/m²/day',
      gradient: 'linear-gradient(90deg, #6496FF, #FFD54F, #FF6B00)',
      min: '3.5',
      max: '6.5',
    },
    wind: {
      label: 'Wind Speed (80m)',
      unit: 'm/s',
      gradient: 'linear-gradient(90deg, #C8E6FF, #40B4FF, #2840FF)',
      min: '1.5',
      max: '12',
    },
    temperature: {
      label: 'Temperature',
      unit: '°C',
      gradient: 'linear-gradient(90deg, #4466FF, #44CC88, #FF4422)',
      min: '-5',
      max: '35',
    },
    flood: {
      label: 'Flood Risk',
      unit: '%',
      gradient: 'linear-gradient(90deg, rgba(50,100,255,0.1), rgba(250,50,55,0.8))',
      min: '0',
      max: '100',
    },
  };

  const c = configs[type];
  if (!c) return null;

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 10, color: 'white', fontFamily: "'Space Mono', monospace", marginBottom: 3, letterSpacing: 1 }}>
        {c.label}
      </div>
      <div style={{ width: 160, height: 8, borderRadius: 4, background: c.gradient }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#9AA0A6', marginTop: 2 }}>
        <span>{c.min} {c.unit}</span>
        <span>{c.max} {c.unit}</span>
      </div>
    </div>
  );
}
