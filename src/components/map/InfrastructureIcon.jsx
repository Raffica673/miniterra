import { memo, useEffect, useState } from 'react';
import { TILE_WIDTH, TILE_HEIGHT } from '../../utils/isometric';

const InfrastructureIcon = memo(function InfrastructureIcon({ type, cell, animateIn = false }) {
  const [visible, setVisible] = useState(!animateIn);
  const [scale, setScale] = useState(animateIn ? 0 : 1);

  useEffect(() => {
    if (animateIn) {
      setVisible(true);
      requestAnimationFrame(() => {
        setScale(1.15);
        setTimeout(() => setScale(1), 200);
      });
    }
  }, [animateIn]);

  if (!visible) return null;

  const style = {
    transform: `scale(${scale})`,
    transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  };

  switch (type) {
    case 'solar': return <SolarIcon style={style} />;
    case 'wind': return <WindIcon windIndex={cell?.windIndex || 50} style={style} />;
    case 'substation': return <SubstationIcon style={style} />;
    case 'transmission': return <TransmissionIcon style={style} />;
    case 'floodBarrier': return <FloodBarrierIcon style={style} />;
    case 'weatherStation': return <WeatherStationIcon style={style} />;
    case 'battery': return <BatteryIcon style={style} />;
    default: return null;
  }
});

// Solar farm - large, spans across tile with realistic panel rows
function SolarIcon({ style }) {
  const hw = TILE_WIDTH / 2;
  const hh = TILE_HEIGHT / 2;
  return (
    <g style={style}>
      {/* Shadow underneath */}
      <ellipse cx={0} cy={2} rx={hw * 0.85} ry={hh * 0.4} fill="rgba(0,0,0,0.2)" />
      {/* Solar panel rows - realistic array layout spanning most of the tile */}
      {[-1, 0, 1].map(row =>
        [-1.5, -0.5, 0.5, 1.5].map(col => (
          <g key={`${row}-${col}`} transform={`translate(${col * 8}, ${row * 7 - 4})`}>
            {/* Panel frame */}
            <rect
              x={-3.5} y={-2.5}
              width={7} height={5}
              fill="#1A237E"
              stroke="#0D47A1"
              strokeWidth={0.4}
              rx={0.3}
            />
            {/* Panel cells grid */}
            <line x1={-3.5} y1={0} x2={3.5} y2={0} stroke="#283593" strokeWidth={0.3} />
            <line x1={0} y1={-2.5} x2={0} y2={2.5} stroke="#283593" strokeWidth={0.3} />
            {/* Reflective highlight */}
            <rect x={-3.2} y={-2.2} width={3} height={2} fill="rgba(100,180,255,0.15)" rx={0.2} />
          </g>
        ))
      )}
      {/* Accent glow */}
      <ellipse cx={0} cy={-2} rx={hw * 0.7} ry={hh * 0.3} fill="rgba(255,213,79,0.08)" />
      {/* Label */}
      <rect x={-12} y={hh - 6} width={24} height={8} rx={2} fill="rgba(255,213,79,0.2)" />
      <text x={0} y={hh} textAnchor="middle" style={{ fontSize: 5, fill: '#FFD54F', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
        50 MW
      </text>
    </g>
  );
}

// Wind turbine - top-down view with rotating blades
function WindIcon({ windIndex, style }) {
  const speed = windIndex > 70 ? 2.5 : windIndex < 30 ? 7 : 4;

  return (
    <g style={style}>
      {/* Shadow */}
      <ellipse cx={2} cy={3} rx={10} ry={4} fill="rgba(0,0,0,0.15)" />
      {/* Tower base (top-down circle) */}
      <circle cx={0} cy={0} r={3} fill="#78909C" stroke="#546E7A" strokeWidth={0.8} />
      {/* Nacelle */}
      <circle cx={0} cy={0} r={2} fill="#B0BEC5" />
      {/* Blades - top-down rotating */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur={`${speed}s`}
          repeatCount="indefinite"
        />
        <line x1={0} y1={0} x2={0} y2={-14} stroke="#ECEFF1" strokeWidth={2} strokeLinecap="round" opacity={0.9} />
        <line x1={0} y1={0} x2={12.12} y2={7} stroke="#ECEFF1" strokeWidth={2} strokeLinecap="round" opacity={0.9} />
        <line x1={0} y1={0} x2={-12.12} y2={7} stroke="#ECEFF1" strokeWidth={2} strokeLinecap="round" opacity={0.9} />
        {/* Blade tips */}
        <circle cx={0} cy={-14} r={1} fill="#CFD8DC" />
        <circle cx={12.12} cy={7} r={1} fill="#CFD8DC" />
        <circle cx={-12.12} cy={7} r={1} fill="#CFD8DC" />
      </g>
      {/* Center hub */}
      <circle cx={0} cy={0} r={1.2} fill="#ECEFF1" />
      {/* Label */}
      <rect x={-10} y={8} width={20} height={7} rx={2} fill="rgba(79,195,247,0.2)" />
      <text x={0} y={13} textAnchor="middle" style={{ fontSize: 5, fill: '#4FC3F7', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
        30 MW
      </text>
    </g>
  );
}

// Substation - realistic building with equipment
function SubstationIcon({ style }) {
  return (
    <g style={style}>
      {/* Pulsing connection radius */}
      <circle cx={0} cy={0} r={6} fill="none" stroke="#00E676" strokeWidth={0.8} opacity={0.3}>
        <animate attributeName="r" values="6;20;6" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
      </circle>
      {/* Building footprint */}
      <rect x={-10} y={-8} width={20} height={16} fill="#1B2631" stroke="#00E676" strokeWidth={0.6} rx={1} />
      {/* Equipment blocks inside */}
      <rect x={-8} y={-6} width={6} height={5} fill="#263238" rx={0.5} />
      <rect x={2} y={-6} width={6} height={5} fill="#263238" rx={0.5} />
      <rect x={-4} y={2} width={8} height={4} fill="#263238" rx={0.5} />
      {/* Transformer coils */}
      <circle cx={-5} cy={-3.5} r={1.5} fill="none" stroke="#00E676" strokeWidth={0.5} opacity={0.6} />
      <circle cx={5} cy={-3.5} r={1.5} fill="none" stroke="#00E676" strokeWidth={0.5} opacity={0.6} />
      {/* Lightning bolt */}
      <polygon points="-1,-1 1,-1 0,1.5 2,1.5 -1,5 0,2.5 -2,2.5" fill="#00E676" opacity={0.8} />
      {/* Roof accent */}
      <rect x={-10} y={-8} width={20} height={2} fill="#00E676" opacity={0.3} rx={1} />
    </g>
  );
}

// Transmission line - top-down view with pylons
function TransmissionIcon({ style }) {
  return (
    <g style={style}>
      {/* Pylon shadows */}
      <ellipse cx={-10} cy={1} rx={3} ry={1.5} fill="rgba(0,0,0,0.12)" />
      <ellipse cx={10} cy={1} rx={3} ry={1.5} fill="rgba(0,0,0,0.12)" />
      {/* Pylon bases (top-down) */}
      <rect x={-12} y={-2} width={4} height={4} fill="#546E7A" rx={0.5} />
      <rect x={8} y={-2} width={4} height={4} fill="#546E7A" rx={0.5} />
      {/* Cross-arm indicators */}
      <line x1={-14} y1={0} x2={-8} y2={0} stroke="#78909C" strokeWidth={1.5} />
      <line x1={6} y1={0} x2={14} y2={0} stroke="#78909C" strokeWidth={1.5} />
      {/* Cable line */}
      <line x1={-8} y1={0} x2={8} y2={0} stroke="#00E676" strokeWidth={1} opacity={0.6} />
      {/* Energy dots flowing */}
      <circle r={1.5} fill="#00E676" opacity={0.8}>
        <animateMotion dur="1.5s" repeatCount="indefinite" path="M-8,0 L8,0" />
      </circle>
      <circle r={1.5} fill="#00E676" opacity={0.8}>
        <animateMotion dur="1.5s" repeatCount="indefinite" path="M8,0 L-8,0" />
      </circle>
    </g>
  );
}

// Flood barrier - wall structure
function FloodBarrierIcon({ style }) {
  return (
    <g style={style}>
      {/* Wall footprint - top-down view */}
      <rect x={-16} y={-3} width={32} height={6} fill="#455A64" stroke="#78909C" strokeWidth={0.5} rx={1} />
      {/* Barrier segments */}
      {[-12, -4, 4, 12].map(xPos => (
        <rect key={xPos} x={xPos - 2} y={-2} width={4} height={4} fill="#546E7A" rx={0.5} />
      ))}
      {/* Water-side indicator */}
      <line x1={-16} y1={4} x2={16} y2={4} stroke="#4FC3F7" strokeWidth={1} opacity={0.4} />
      {/* Ripple lines */}
      <line x1={-12} y1={6} x2={12} y2={6} stroke="#4FC3F7" strokeWidth={0.5} opacity={0.2}>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,2;0,0" dur="3s" repeatCount="indefinite" />
      </line>
    </g>
  );
}

// Weather station - realistic mast and instruments
function WeatherStationIcon({ style }) {
  return (
    <g style={style}>
      {/* Base platform (top-down) */}
      <rect x={-5} y={-5} width={10} height={10} fill="#37474F" stroke="#546E7A" strokeWidth={0.5} rx={1} />
      {/* Mast dot (center) */}
      <circle cx={0} cy={0} r={2} fill="#E8EAED" />
      {/* Instrument arms */}
      <line x1={0} y1={0} x2={-7} y2={-5} stroke="#E8EAED" strokeWidth={0.8} />
      <line x1={0} y1={0} x2={7} y2={-3} stroke="#E8EAED" strokeWidth={0.8} />
      <line x1={0} y1={0} x2={0} y2={7} stroke="#E8EAED" strokeWidth={0.8} />
      {/* Anemometer cups */}
      <circle cx={-7} cy={-5} r={1.5} fill="#448AFF" opacity={0.7}>
        <animateTransform attributeName="transform" type="rotate" from="0 -7 -5" to="360 -7 -5" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Wind vane */}
      <circle cx={7} cy={-3} r={1} fill="#448AFF" opacity={0.5} />
      {/* Rain gauge */}
      <circle cx={0} cy={7} r={1.5} fill="#448AFF" opacity={0.4} />
      {/* Signal pulses */}
      <circle cx={0} cy={0} r={4} fill="none" stroke="#448AFF" strokeWidth={0.6} opacity={0.3}>
        <animate attributeName="r" values="4;16;4" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

// Battery storage - container units
function BatteryIcon({ style }) {
  return (
    <g style={style}>
      {/* Container body (top-down) */}
      <rect x={-12} y={-6} width={24} height={12} fill="#4A148C" stroke="#7B1FA2" strokeWidth={0.6} rx={1.5} />
      {/* Container segments */}
      <line x1={-4} y1={-6} x2={-4} y2={6} stroke="#6A1B9A" strokeWidth={0.4} />
      <line x1={4} y1={-6} x2={4} y2={6} stroke="#6A1B9A" strokeWidth={0.4} />
      {/* Charge indicators */}
      <rect x={-10} y={-3} width={6} height={2} fill="#CE93D8" opacity={0.5} rx={0.5} />
      <rect x={-2} y={-3} width={6} height={2} fill="#CE93D8" opacity={0.5} rx={0.5} />
      <rect x={6} y={-3} width={6} height={2} fill="#CE93D8" opacity={0.4} rx={0.5} />
      {/* Status lights */}
      <circle cx={-8} cy={3} r={1} fill="#00E676" opacity={0.6}>
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={0} cy={3} r={1} fill="#00E676" opacity={0.6}>
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" begin="0.7s" />
      </circle>
      <circle cx={8} cy={3} r={1} fill="#FFC107" opacity={0.5}>
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" begin="1.4s" />
      </circle>
      {/* Glow */}
      <ellipse cx={0} cy={0} rx={14} ry={8} fill="rgba(171,71,188,0.08)" />
      {/* Label */}
      <text x={0} y={10} textAnchor="middle" style={{ fontSize: 4.5, fill: '#AB47BC', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
        200 MWh
      </text>
    </g>
  );
}

export default InfrastructureIcon;
