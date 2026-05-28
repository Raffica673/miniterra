import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

const SDG_DATA = [
  { num: 7, color: '#FCC30B', title: 'CLEAN ENERGY', subtitle: 'Affordable & Clean Energy' },
  { num: 9, color: '#F36D25', title: 'INFRASTRUCTURE', subtitle: 'Industry, Innovation & Infrastructure' },
  { num: 11, color: '#F99D26', title: 'SUSTAINABLE CITIES', subtitle: 'Sustainable Cities & Communities' },
];

export default function LandingPage() {
  const { navigateTo } = useApp();

  return (
    <motion.div
      className="landing-bg"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 48, color: 'white' }}>
          GRID
        </span>
        <span style={{
          width: 12, height: 12, borderRadius: '50%', background: '#00E676',
          display: 'inline-block',
          boxShadow: '0 0 20px rgba(0, 230, 118, 0.5)',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 48, color: 'var(--text-secondary)' }}>
          SCOPE
        </span>
      </motion.div>

      {/* Separator line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ width: 120, height: 1, background: 'var(--glass-border)', margin: '16px 0 24px' }}
      />

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          color: 'var(--text-secondary)',
          letterSpacing: 1,
        }}
      >
        Renewable Energy Infrastructure Planning Sandbox
      </motion.p>

      {/* SDG Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{ display: 'flex', gap: 16, marginTop: 48 }}
      >
        {SDG_DATA.map((sdg, i) => (
          <SDGCard key={sdg.num} sdg={sdg} delay={0.7 + i * 0.1} />
        ))}
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        style={{
          maxWidth: 640,
          textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.8,
          marginTop: 40,
          padding: '0 20px',
        }}
      >
        GridScope analyzes satellite imagery, topographic data, and climate studies to identify
        optimal sites for renewable energy infrastructure. Scout terrain, build energy networks,
        and generate feasibility reports — all in one interactive sandbox.
      </motion.p>

      {/* Enter button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.4 }}
        onClick={() => navigateTo('scout')}
        style={{
          marginTop: 40,
          background: '#00E676',
          color: '#0B0F14',
          fontFamily: "'Space Mono', monospace",
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: 0.5,
          padding: '14px 36px',
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          transition: 'all 200ms',
        }}
        whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(0, 230, 118, 0.35)' }}
        whileTap={{ scale: 0.98 }}
      >
        Launch GridScope →
      </motion.button>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        color: 'var(--text-dim)',
      }}>
        Built for Hackathon 2026 · Theme: Getting There
      </div>
    </motion.div>
  );
}

function SDGCard({ sdg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel"
      style={{
        width: 180,
        height: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default',
        transition: 'transform 200ms, box-shadow 200ms',
        overflow: 'hidden',
      }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
    >
      <div style={{ flex: '1 1 60%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: 56,
          color: sdg.color,
          textShadow: `0 0 30px ${sdg.color}40`,
        }}>
          {sdg.num}
        </span>
      </div>
      <div style={{ flex: '1 1 40%', textAlign: 'center', padding: '0 12px' }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color: 'white',
          marginBottom: 4,
        }}>
          {sdg.title}
        </div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
        }}>
          {sdg.subtitle}
        </div>
      </div>
    </motion.div>
  );
}
