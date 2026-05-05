// Terrain base colors (flat view - richer, more distinct)
export const TERRAIN_COLORS = {
  water: { base: '#1A4468', left: '#0E2A3C', right: '#0A1F2E' },
  land: { base: '#2E5240', left: '#1E3828', right: '#162A1E' },
  forest: { base: '#1F4430', left: '#142B1E', right: '#0F2016' },
  mountain: { base: '#52526A', left: '#3A3A48', right: '#2A2A36' },
  urban: { base: '#353548', left: '#222232', right: '#1A1A28' },
};

// Overlay color mapping (choropleth bands)
export function getOverlayColor(type, value) {
  if (type === 'solar') {
    if (value <= 33) return 'rgba(141, 110, 99, 0.40)';
    if (value <= 66) return 'rgba(255, 183, 77, 0.40)';
    return 'rgba(255, 213, 79, 0.50)';
  }
  if (type === 'wind') {
    if (value <= 33) return 'rgba(179, 229, 252, 0.40)';
    if (value <= 66) return 'rgba(129, 212, 250, 0.40)';
    return 'rgba(79, 195, 247, 0.50)';
  }
  if (type === 'flood') {
    if (value <= 33) return 'rgba(102, 187, 106, 0.40)';
    if (value <= 66) return 'rgba(255, 138, 101, 0.40)';
    return 'rgba(239, 83, 80, 0.50)';
  }
  if (type === 'temp') {
    if (value <= 15) return 'rgba(126, 87, 194, 0.40)';
    if (value <= 30) return 'rgba(38, 166, 154, 0.40)';
    return 'rgba(255, 112, 67, 0.50)';
  }
  return 'transparent';
}

export function darken(hex, amount) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const factor = 1 - amount;
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
}

export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
