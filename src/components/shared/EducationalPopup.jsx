import { motion, AnimatePresence } from 'framer-motion';

/**
 * Educational popup that shows energy type definitions for G4 students
 * Appears when clicking on infrastructure for the first time
 */
export default function EducationalPopup({ infraType, onClose }) {
  if (!infraType) return null;

  const { educationalInfo, icon, themeColor } = infraType;
  if (!educationalInfo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: 20,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
            borderRadius: 20,
            padding: '32px 40px',
            maxWidth: 500,
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '3px solid #81C784',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(255, 255, 255, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 18,
              color: '#2E7D32',
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>

          {/* Icon */}
          <div style={{
            fontSize: 64,
            textAlign: 'center',
            marginBottom: 16,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
          }}>
            {icon}
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: '#1B5E20',
            textAlign: 'center',
            marginBottom: 16,
          }}>
            {educationalInfo.title}
          </h2>

          {/* Definition */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 16,
            border: '2px solid #A5D6A7',
          }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: '#2E7D32',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}>
              What is it?
            </div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              lineHeight: 1.6,
              color: '#1B5E20',
              margin: 0,
            }}>
              {educationalInfo.definition}
            </p>
          </div>

          {/* Fun Fact */}
          {educationalInfo.funFact && (
            <div style={{
              background: 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)',
              borderRadius: 12,
              padding: '14px 18px',
              border: '2px solid #FDD835',
              marginBottom: 20,
            }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: '#F57F17',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 6,
              }}>
                💡 Fun Fact
              </div>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                lineHeight: 1.5,
                color: '#F57F17',
                margin: 0,
              }}>
                {educationalInfo.funFact}
              </p>
            </div>
          )}

          {/* Got it button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #66BB6A 0%, #43A047 100%)',
              border: 'none',
              borderRadius: 12,
              padding: '14px 24px',
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 12px rgba(67, 160, 71, 0.4)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Got it! Let's build! 🚀
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
