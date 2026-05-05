import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, visible, onHide }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 3000);
      return () => clearTimeout(t);
    }
  }, [visible, onHide]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'white',
            color: '#374151',
            padding: '12px 16px',
            borderRadius: 8,
            borderLeft: '3px solid #00E676',
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100,
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
