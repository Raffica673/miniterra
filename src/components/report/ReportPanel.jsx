import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { getInfraDefinition } from '../../data/infrastructure';
import { getClassification } from '../../utils/scoring';
import Toast from '../shared/Toast';

export default function ReportPanel({ scores, placements, budget, totalBudget }) {
  const { selectedRegion } = useApp();
  const [showToast, setShowToast] = useState(false);

  const classification = getClassification(scores.overall);
  const solarCount = placements.filter(p => p.type === 'solar').length;
  const windCount = placements.filter(p => p.type === 'wind').length;
  const batteryCount = placements.filter(p => p.type === 'battery').length;
  const disconnected = placements.filter(p => !p.isConnected);
  const highFlood = placements.filter(p => p.envData.floodRisk > 50);
  const hasWeather = placements.some(p => p.type === 'weatherStation');
  const totalCost = totalBudget - budget;

  // Environmental averages
  const avgSolarGHI = placements.length > 0
    ? (placements.reduce((s, p) => s + p.envData.solarGHI, 0) / placements.length).toFixed(2)
    : '0';
  const avgWind = placements.length > 0
    ? (placements.reduce((s, p) => s + p.envData.windSpeed, 0) / placements.length).toFixed(1)
    : '0';
  const avgFlood = placements.length > 0
    ? Math.round(placements.reduce((s, p) => s + p.envData.floodRisk, 0) / placements.length)
    : 0;
  const tempRange = placements.length > 0
    ? `${Math.min(...placements.map(p => p.envData.temperature)).toFixed(1)}°C – ${Math.max(...placements.map(p => p.envData.temperature)).toFixed(1)}°C`
    : 'N/A';
  const elevRange = placements.length > 0
    ? `${Math.min(...placements.map(p => p.envData.elevation))}m – ${Math.max(...placements.map(p => p.envData.elevation))}m`
    : 'N/A';

  // Build risk flags
  const flags = [];
  highFlood.forEach(p => {
    const def = getInfraDefinition(p.type);
    flags.push({ severity: 'critical', text: `⚠ ${def.name} at ${p.lat.toFixed(4)}°S is in a high flood risk zone (${p.envData.floodRisk}%)` });
  });
  disconnected.forEach(p => {
    const def = getInfraDefinition(p.type);
    flags.push({ severity: 'critical', text: `⚠ ${def.name} at ${p.lat.toFixed(4)}°S is not connected to the grid` });
  });
  placements.filter(p => p.type === 'solar' && p.envData.temperature > 25).forEach(p => {
    flags.push({ severity: 'advisory', text: `⚡ Solar at ${p.lat.toFixed(4)}°S faces thermal derating (${p.envData.temperature}°C > 25°C threshold)` });
  });
  placements.filter(p => p.type === 'wind' && p.envData.windSpeed < 4).forEach(p => {
    flags.push({ severity: 'advisory', text: `💨 Wind turbine at ${p.lat.toFixed(4)}°S is below cut-in speed threshold (${p.envData.windSpeed} m/s)` });
  });
  if (!hasWeather && placements.length > 0) {
    flags.push({ severity: 'info', text: '📡 No monitoring stations deployed — field validation data unavailable' });
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.4 + i * 0.2, duration: 0.5 } }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      style={{
        flex: 1, overflowY: 'auto',
        background: '#FAFAFA',
        borderTopLeftRadius: 12, borderBottomLeftRadius: 12,
        padding: '32px 40px',
        position: 'relative', color: '#374151',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #00E676, #448AFF, #AB47BC)', borderTopLeftRadius: 12 }} />
      <Toast message="Export functionality available in full release" visible={showToast} onHide={() => setShowToast(false)} />

      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
        <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>
          GRIDSCOPE SITE FEASIBILITY REPORT
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#6B7280', marginTop: 8 }}>
          Region: {selectedRegion?.name || 'Santiago Metropolitan'} · Coordinates: {selectedRegion?.center ? `${selectedRegion.center[0].toFixed(4)}°S, ${Math.abs(selectedRegion.center[1]).toFixed(4)}°W` : 'N/A'} · Classification: {classification}
        </p>
        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '16px 0 24px' }} />
      </motion.div>

      {/* Section 1: Executive Summary */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
        <SectionTitle>1. Executive Summary</SectionTitle>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 24 }}>
          The proposed renewable energy installation in {selectedRegion?.name || 'the Santiago metropolitan area'} achieves 
          a feasibility score of <strong>{scores.overall}/100</strong> ('{classification}'). 
          The configuration features {solarCount} solar installation(s) totaling {scores.solarMW} MW and {windCount} wind 
          turbine cluster(s) totaling {scores.windMW} MW, for a combined capacity of <strong>{scores.totalMW} MW</strong>.
          {batteryCount > 0 && ` Grid-scale storage of ${scores.storageMWh} MWh has been provisioned.`}
          {scores.co2Avoided > 0 && ` Estimated annual CO₂ avoidance: ${scores.co2Avoided.toLocaleString()} tonnes (based on Chile's grid emission factor of 0.4 tCO₂/MWh).`}
          {disconnected.length > 0 && ` ${disconnected.length} installation(s) remain disconnected from grid infrastructure.`}
          {highFlood.length > 0 && ` ${highFlood.length} installation(s) are in elevated flood risk zones.`}
        </p>
      </motion.div>

      {/* Section 2: Environmental Analysis */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
        <SectionTitle>2. Environmental Site Analysis</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          <EnvCard title="Solar GHI" value={`${avgSolarGHI}`} unit="kWh/m²/d" color="#FFD54F" source="Explorador Solar / Global Solar Atlas" />
          <EnvCard title="Wind Speed (80m)" value={avgWind} unit="m/s" color="#4FC3F7" source="Explorador Eólico" />
          <EnvCard title="Flood Risk" value={`${avgFlood}`} unit="%" color="#EF5350" source="SRTM / JRC Surface Water" />
          <EnvCard title="Temperature" value={tempRange} unit="" color="#FF7043" source="WorldClim 2.1 / NASA POWER" />
          <EnvCard title="Elevation" value={elevRange} unit="" color="#7E57C2" source="SRTM 30m DEM" />
          <EnvCard title="Grid Connect" value={`${scores.connectivity}`} unit="%" color="#00E676" source="Connectivity analysis" />
        </div>
      </motion.div>

      {/* Section 3: Infrastructure Inventory */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
        <SectionTitle>3. Infrastructure Inventory</SectionTitle>
        {placements.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No infrastructure placed yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                {['Type', 'Location', 'GHI/Wind', 'Efficiency', 'Status', 'Cost'].map(h => (
                  <th key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 8px', textAlign: 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {placements.map((p, i) => {
                const def = getInfraDefinition(p.type);
                return (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? 'white' : '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px', fontFamily: "'DM Sans',sans-serif" }}>
                      <span style={{ marginRight: 6 }}>{def.icon}</span>{def.name}
                    </td>
                    <td style={{ padding: '8px', fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>
                      {p.lat.toFixed(4)}°, {p.lng.toFixed(4)}°
                    </td>
                    <td style={{ padding: '8px', fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>
                      {p.type === 'solar' ? `${p.envData.solarGHI} kWh` : p.type === 'wind' ? `${p.envData.windSpeed} m/s` : '—'}
                    </td>
                    <td style={{ padding: '8px', fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>
                      {p.type === 'solar' || p.type === 'wind' ? `${p.efficiency}%` : '—'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {p.isConnected
                        ? <span style={{ color: '#16a34a', fontSize: 11 }}>Connected ✓</span>
                        : <span style={{ color: '#FF1744', fontSize: 11 }}>Disconnected ✗</span>}
                    </td>
                    <td style={{ padding: '8px', fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>
                      ◆{def.cost}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #E5E7EB' }}>
                <td colSpan={6} style={{ padding: '10px 8px', textAlign: 'right', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600 }}>
                  Total: ◆{totalCost} / ◆{totalBudget}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </motion.div>

      {/* Section 4: Risk Flags */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
        <SectionTitle>4. Risk Assessment</SectionTitle>
        {flags.length === 0 ? (
          <FlagCard severity="success" text="✅ No risk flags detected. All infrastructure is optimally positioned." />
        ) : (
          flags.map((f, i) => <FlagCard key={i} severity={f.severity} text={f.text} />)
        )}
      </motion.div>

      {/* Section 5: Data Sources */}
      <motion.div custom={5} initial="hidden" animate="visible" variants={sectionVariants} style={{ marginTop: 24 }}>
        <SectionTitle>5. Data Sources & Methodology</SectionTitle>
        <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif" }}>
          <p>Solar irradiance data derived from <strong>Explorador Solar</strong> (Chilean Ministry of Energy / GIZ) and 
          <strong> Global Solar Atlas</strong> (World Bank / ESMAP). Wind speed estimates at 80m hub height from 
          <strong> Explorador Eólico</strong> (Ministry of Energy). Temperature profiles from <strong>WorldClim 2.1</strong> and 
          <strong> NASA POWER</strong> surface meteorology. Elevation from <strong>SRTM 30m DEM</strong>. 
          Flood risk assessment incorporates <strong>JRC Global Surface Water</strong> extent data and SRTM-derived drainage analysis.</p>
          <p style={{ marginTop: 8 }}>CO₂ avoidance calculated using Chile's 2024 grid emission factor of 0.4 tCO₂/MWh 
          (Coordinador Eléctrico Nacional) with assumed 25% average capacity factor.</p>
        </div>
      </motion.div>

      {/* Export */}
      <motion.div custom={6} initial="hidden" animate="visible" variants={sectionVariants} style={{ marginTop: 24, marginBottom: 32 }}>
        <button
          onClick={() => setShowToast(true)}
          style={{
            background: 'transparent', border: '1px solid #D1D5DB', borderRadius: 8,
            padding: '10px 20px', fontFamily: "'DM Sans',sans-serif", fontSize: 13,
            color: '#374151', cursor: 'pointer', transition: 'all 200ms',
          }}
          onMouseEnter={e => { e.target.style.background = '#F3F4F6'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; }}
        >
          📄 Export as PDF
        </button>
      </motion.div>
    </motion.div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700, color: '#1A1A2E', marginBottom: 12, marginTop: 8 }}>
      {children}
    </h2>
  );
}

function EnvCard({ title, value, unit, color, source }) {
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 14 }}>
      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>{title}</div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: '#1A1A2E' }}>
        {value} <span style={{ fontSize: 12, color: '#9CA3AF' }}>{unit}</span>
      </div>
      {source && <div style={{ fontSize: 8, color: '#D1D5DB', marginTop: 4 }}>{source}</div>}
    </div>
  );
}

function FlagCard({ severity, text }) {
  const colors = {
    critical: { bg: '#FEF2F2', border: '#FF1744' },
    advisory: { bg: '#FFFBEB', border: '#FFC107' },
    info: { bg: '#EFF6FF', border: '#448AFF' },
    success: { bg: '#F0FDF4', border: '#00E676' },
  };
  const c = colors[severity] || colors.info;
  return (
    <div style={{
      borderLeft: `3px solid ${c.border}`, background: c.bg,
      borderRadius: '0 8px 8px 0', padding: '10px 14px', marginBottom: 8,
      fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#374151',
    }}>
      {text}
    </div>
  );
}
