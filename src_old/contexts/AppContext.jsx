import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentMode, setCurrentMode] = useState('landing');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [activeOverlays, setActiveOverlays] = useState([]);
  const [visitedModes, setVisitedModes] = useState(['landing']);

  const navigateTo = useCallback((mode) => {
    setCurrentMode(mode);
    setVisitedModes(prev => prev.includes(mode) ? prev : [...prev, mode]);
  }, []);

  const toggleOverlay = useCallback((overlay) => {
    setActiveOverlays(prev => {
      if (prev.includes(overlay)) {
        return prev.filter(o => o !== overlay);
      }
      return [...prev, overlay]; // Allow multiple overlays
    });
  }, []);

  return (
    <AppContext.Provider value={{
      currentMode, navigateTo,
      selectedRegion, setSelectedRegion,
      activeOverlays, toggleOverlay,
      visitedModes,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
