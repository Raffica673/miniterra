// Flat grid tile dimensions
export const TILE_WIDTH = 40;
export const TILE_HEIGHT = 40;
export const HEIGHT_SCALE = 0; // No elevation in flat mode

export function gridToScreen(gridX, gridY, elevation = 0) {
  const screenX = gridX * TILE_WIDTH;
  const screenY = gridY * TILE_HEIGHT;
  return { screenX, screenY };
}

export function screenToGrid(screenX, screenY) {
  return {
    gridX: Math.round(screenX / TILE_WIDTH),
    gridY: Math.round(screenY / TILE_HEIGHT),
  };
}

// For flat mode the "top face" is just the square
export function getTopFacePoints(elevation) {
  return [
    { x: 0, y: 0 },
    { x: TILE_WIDTH, y: 0 },
    { x: TILE_WIDTH, y: TILE_HEIGHT },
    { x: 0, y: TILE_HEIGHT },
  ];
}

export function getLeftFacePoints() { return []; }
export function getRightFacePoints() { return []; }

export function pointsToSvg(points) {
  return points.map(p => `${p.x},${p.y}`).join(' ');
}

export function getViewBox(cols, rows) {
  const pad = TILE_WIDTH;
  return {
    x: -pad,
    y: -pad,
    width: cols * TILE_WIDTH + pad * 2,
    height: rows * TILE_HEIGHT + pad * 2,
  };
}
