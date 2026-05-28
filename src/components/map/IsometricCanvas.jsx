import { useEffect, useRef, useState } from 'react';

/**
 * Isometric Canvas Renderer for GridScope
 * Renders a 3D isometric terrain with animated water, infrastructure models, and terrain features
 */

// Isometric tile dimensions
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const TILE_DEPTH = 16; // Height per elevation level

// Terrain types
const TERRAIN = {
  GRASS_LOW: 'grass_low',
  GRASS_MID: 'grass_mid',
  ROCKY: 'rocky',
  STONE: 'stone',
  WATER: 'water',
  FOREST: 'forest',
  SETTLEMENT: 'settlement',
};

// Simple noise function for terrain generation
function noise2D(x, y, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

// Generate heightmap with smooth interpolation
function generateHeightmap(gridSize, seed = 42) {
  const heightmap = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
  
  // Place peak and valley seeds
  const peaks = [
    { x: Math.floor(gridSize * 0.2), y: Math.floor(gridSize * 0.3), h: 4 },
    { x: Math.floor(gridSize * 0.7), y: Math.floor(gridSize * 0.2), h: 4 },
    { x: Math.floor(gridSize * 0.5), y: Math.floor(gridSize * 0.8), h: 4 },
  ];
  
  const valleys = [
    { x: Math.floor(gridSize * 0.1), y: Math.floor(gridSize * 0.1), h: 0 },
    { x: Math.floor(gridSize * 0.9), y: Math.floor(gridSize * 0.9), h: 0 },
  ];
  
  const seeds = [...peaks, ...valleys];
  
  // Bilinear interpolation from seeds
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      let totalWeight = 0;
      let weightedHeight = 0;
      
      seeds.forEach(seed => {
        const dist = Math.sqrt((x - seed.x) ** 2 + (y - seed.y) ** 2);
        const weight = 1 / (dist + 1);
        totalWeight += weight;
        weightedHeight += seed.h * weight;
      });
      
      heightmap[y][x] = Math.round(weightedHeight / totalWeight);
    }
  }
  
  return heightmap;
}

// Generate terrain types based on heightmap
function generateTerrain(gridSize, heightmap) {
  const terrain = [];
  
  // Generate river as a winding path
  const waterPath = new Set();
  let riverX = Math.floor(gridSize * 0.75); // Start from right edge
  let riverY = Math.floor(gridSize * 0.5); // Middle height
  
  for (let step = 0; step < gridSize * 1.5; step++) {
    waterPath.add(`${riverX},${riverY}`);
    
    // Move toward bottom-center
    if (riverY < gridSize - 1) riverY++;
    
    // 30% chance of lateral drift
    if (Math.random() < 0.3) {
      if (riverX > gridSize * 0.4) riverX--;
      else if (riverX < gridSize * 0.6) riverX++;
    }
    
    if (riverY >= gridSize) break;
  }
  
  // Add lake
  for (let y = 5; y <= 7; y++) {
    for (let x = 15; x <= 17; x++) {
      waterPath.add(`${x},${y}`);
    }
  }
  
  // Lock water tiles to elevation 0
  waterPath.forEach(key => {
    const [x, y] = key.split(',').map(Number);
    if (y < gridSize && x < gridSize) {
      heightmap[y][x] = 0;
    }
  });
  
  // Smooth elevation - max 1 unit change between neighbors
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const neighbors = [
          [x-1, y], [x+1, y], [x, y-1], [x, y+1],
          [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
        ];
        
        neighbors.forEach(([nx, ny]) => {
          if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
            const diff = Math.abs(heightmap[y][x] - heightmap[ny][nx]);
            if (diff > 1) {
              if (heightmap[y][x] > heightmap[ny][nx]) {
                heightmap[y][x] = heightmap[ny][nx] + 1;
              }
            }
          }
        });
      }
    }
  }
  
  for (let y = 0; y < gridSize; y++) {
    terrain[y] = [];
    for (let x = 0; x < gridSize; x++) {
      const key = `${x},${y}`;
      const height = heightmap[y][x];
      
      if (waterPath.has(key)) {
        terrain[y][x] = { type: TERRAIN.WATER, height: 0 };
      } else if (height === 0 || height === 1) {
        // Low elevation - grass or forest
        const isForest = noise2D(x * 0.3, y * 0.3, 100) > 0.7;
        terrain[y][x] = { 
          type: isForest ? TERRAIN.FOREST : TERRAIN.GRASS_LOW, 
          height 
        };
      } else if (height === 2 || height === 3) {
        // Mid elevation - rocky or settlement
        const isSettlement = noise2D(x * 0.5, y * 0.5, 200) > 0.85;
        terrain[y][x] = { 
          type: isSettlement ? TERRAIN.SETTLEMENT : TERRAIN.ROCKY, 
          height 
        };
      } else {
        // High elevation - stone
        terrain[y][x] = { type: TERRAIN.STONE, height };
      }
    }
  }
  
  return terrain;
}

// Convert grid coordinates to isometric screen coordinates
function gridToIso(gridX, gridY, height = 0) {
  const isoX = (gridX - gridY) * (TILE_WIDTH / 2);
  const isoY = (gridX + gridY) * (TILE_HEIGHT / 2) - height * TILE_DEPTH;
  return { x: isoX, y: isoY };
}

// Get terrain color
function getTerrainColor(terrainType, variant = 0) {
  const colors = {
    [TERRAIN.GRASS_LOW]: ['#4a7c3f', '#4d8042', '#507d45'],
    [TERRAIN.GRASS_MID]: ['#4a7c3f', '#4d8042', '#507d45'],
    [TERRAIN.ROCKY]: ['#7a8c6a', '#7d8f6d', '#808c70'],
    [TERRAIN.STONE]: ['#9a9a8a', '#9d9d8d', '#a0a090'],
    [TERRAIN.WATER]: ['#1a6b9a', '#2a8fbf'],
    [TERRAIN.FOREST]: ['#4a7c3f', '#4d8042', '#507d45'],
    [TERRAIN.SETTLEMENT]: ['#4a7c3f', '#4d8042', '#507d45'],
  };
  
  const colorSet = colors[terrainType] || colors[TERRAIN.GRASS_LOW];
  return colorSet[variant % colorSet.length];
}

// Darken color for side faces
function darkenColor(color, factor) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const newR = Math.floor(r * factor);
  const newG = Math.floor(g * factor);
  const newB = Math.floor(b * factor);
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

export default function IsometricCanvas({ 
  gridSize = 20,
  placements = [],
  activeTool = null,
  onGridClick,
  onRemovePlacement,
  activeOverlays = []
}) {
  const canvasRef = useRef(null);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [terrain, setTerrain] = useState(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);

  // Initialize terrain on mount
  useEffect(() => {
    const heightmap = generateHeightmap(gridSize);
    const terrainData = generateTerrain(gridSize, heightmap);
    setTerrain(terrainData);
  }, [gridSize]);

  // Main render loop
  useEffect(() => {
    if (!terrain) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    const width = 1200;
    const height = 800;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    
    // Center offset
    const offsetX = width / 2;
    const offsetY = 100;
    
    function render(timestamp) {
      timeRef.current = timestamp / 1000; // Convert to seconds
      
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(offsetX, offsetY);
      
      // Collect all drawable objects with painter's algorithm sorting
      const drawables = [];
      
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const tile = terrain[y][x];
          const isHovered = hoveredTile && hoveredTile.x === x && hoveredTile.y === y;
          
          // Find placement for this tile
          const placement = placements.find(p => {
            const pX = Math.round((p.lat + 33.4489) / 0.001 + gridSize / 2);
            const pY = Math.round((p.lng + 70.6693) / 0.001 + gridSize / 2);
            return pX === x && pY === y;
          });
          
          drawables.push({
            isoRow: y,
            isoCol: x,
            elevation: tile.height,
            drawFn: (ctx) => {
              drawTile(ctx, x, y, tile, isHovered, timeRef.current);
              
              // Draw terrain features immediately after tile
              if (tile.type === TERRAIN.FOREST) {
                drawTree(ctx, x, y, tile.height);
              } else if (tile.type === TERRAIN.SETTLEMENT) {
                drawHouse(ctx, x, y, tile.height);
              }
              
              // Draw infrastructure immediately after terrain features
              if (placement) {
                drawInfrastructure(ctx, x, y, tile.height, placement.type, timeRef.current);
              }
            }
          });
        }
      }
      
      // Sort by painter's algorithm: back-to-front
      drawables.sort((a, b) => {
        const sumA = a.isoRow + a.isoCol;
        const sumB = b.isoRow + b.isoCol;
        if (sumA !== sumB) return sumA - sumB;
        return a.elevation - b.elevation;
      });
      
      // Execute all draw functions in sorted order
      drawables.forEach(drawable => drawable.drawFn(ctx));
      
      ctx.restore();
      animationRef.current = requestAnimationFrame(render);
    }
    
    animationRef.current = requestAnimationFrame(render);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [terrain, hoveredTile, placements, gridSize]);

  // Draw a single isometric tile
  function drawTile(ctx, gridX, gridY, tile, isHovered, time) {
    const pos = gridToIso(gridX, gridY, tile.height);
    const topColor = getTerrainColor(tile.type, gridX + gridY);
    const leftColor = darkenColor(topColor, 0.7);
    const rightColor = darkenColor(topColor, 0.55);
    
    // Draw column sides
    if (tile.height > 0 && tile.type !== TERRAIN.WATER) {
      // Left face
      ctx.fillStyle = leftColor;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y + TILE_HEIGHT / 2);
      ctx.lineTo(pos.x - TILE_WIDTH / 2, pos.y);
      ctx.lineTo(pos.x - TILE_WIDTH / 2, pos.y + tile.height * TILE_DEPTH);
      ctx.lineTo(pos.x, pos.y + TILE_HEIGHT / 2 + tile.height * TILE_DEPTH);
      ctx.closePath();
      ctx.fill();
      
      // Right face
      ctx.fillStyle = rightColor;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y + TILE_HEIGHT / 2);
      ctx.lineTo(pos.x + TILE_WIDTH / 2, pos.y);
      ctx.lineTo(pos.x + TILE_WIDTH / 2, pos.y + tile.height * TILE_DEPTH);
      ctx.lineTo(pos.x, pos.y + TILE_HEIGHT / 2 + tile.height * TILE_DEPTH);
      ctx.closePath();
      ctx.fill();
    }
    
    // Draw top face
    ctx.fillStyle = topColor;
    if (isHovered) {
      ctx.fillStyle = lightenColor(topColor, 1.3);
    }
    
    // Animate water
    if (tile.type === TERRAIN.WATER) {
      const wave = Math.sin(time * 0.8 + gridX * 0.5 + gridY * 0.3) * 0.5 + 0.5;
      const color1 = '#1a6b9a';
      const color2 = '#2a8fbf';
      ctx.fillStyle = wave > 0.5 ? color1 : color2;
    }
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
    ctx.lineTo(pos.x, pos.y + TILE_HEIGHT);
    ctx.lineTo(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
    ctx.closePath();
    ctx.fill();
    
    // Hover outline
    if (isHovered) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Draw tree with layered isometric canopy
  function drawTree(ctx, gridX, gridY, height) {
    const pos = gridToIso(gridX, gridY, height);
    const offsetX = (gridX + gridY) % 2 === 0 ? -8 : 8;
    
    const x = pos.x + offsetX;
    const y = pos.y;
    
    // Trunk (isometric column)
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x - 3, y - 14, 6, 14);
    
    // Layered canopy - 3 stacked ellipses
    const canopyLayers = [
      { y: y - 20, rx: 8, ry: 5, color: '#3a7a2a' },
      { y: y - 24, rx: 6, ry: 4, color: '#2d5a1b' },
      { y: y - 27, rx: 4, ry: 3, color: '#1e3d12' },
    ];
    
    canopyLayers.forEach(layer => {
      ctx.fillStyle = layer.color;
      ctx.beginPath();
      ctx.ellipse(x, layer.y, layer.rx, layer.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Draw house with proper 3D isometric geometry
  function drawHouse(ctx, gridX, gridY, height) {
    const pos = gridToIso(gridX, gridY, height);
    const offsetX = (gridX * 7 + gridY * 11) % 16 - 8;
    const offsetY = (gridX * 11 + gridY * 7) % 8 - 4;
    
    const houseW = TILE_WIDTH * 0.4;
    const houseD = TILE_HEIGHT * 0.3;
    const bodyHeight = 20;
    const roofHeight = 10;
    
    const x = pos.x + offsetX;
    const y = pos.y + offsetY;
    
    // House base corners (isometric diamond)
    const topFront = { x: x, y: y - bodyHeight };
    const topRight = { x: x + houseW / 2, y: y - bodyHeight + houseD / 2 };
    const topBack = { x: x, y: y - bodyHeight + houseD };
    const topLeft = { x: x - houseW / 2, y: y - bodyHeight + houseD / 2 };
    
    const bottomFront = { x: x, y: y };
    const bottomRight = { x: x + houseW / 2, y: y + houseD / 2 };
    const bottomBack = { x: x, y: y + houseD };
    const bottomLeft = { x: x - houseW / 2, y: y + houseD / 2 };
    
    // Right wall (darkest)
    ctx.fillStyle = '#7a5c3a';
    ctx.beginPath();
    ctx.moveTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomFront.x, bottomFront.y);
    ctx.lineTo(topFront.x, topFront.y);
    ctx.closePath();
    ctx.fill();
    
    // Left wall (lighter)
    ctx.fillStyle = '#9a7a52';
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.lineTo(bottomFront.x, bottomFront.y);
    ctx.lineTo(topFront.x, topFront.y);
    ctx.closePath();
    ctx.fill();
    
    // Roof ridge apex
    const roofApex = { x: x, y: y - bodyHeight - roofHeight };
    
    // Left roof face
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.moveTo(roofApex.x, roofApex.y);
    ctx.lineTo(topLeft.x, topLeft.y);
    ctx.lineTo(topBack.x, topBack.y);
    ctx.closePath();
    ctx.fill();
    
    // Right roof face (darker)
    ctx.fillStyle = '#6b3510';
    ctx.beginPath();
    ctx.moveTo(roofApex.x, roofApex.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(topBack.x, topBack.y);
    ctx.closePath();
    ctx.fill();
    
    // Door on front wall
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(x - 3, y - 10, 6, 10);
  }

  // Draw infrastructure
  function drawInfrastructure(ctx, gridX, gridY, height, type, time) {
    const pos = gridToIso(gridX, gridY, height);
    
    switch (type) {
      case 'solar':
        drawSolarPlant(ctx, pos.x, pos.y, time);
        break;
      case 'wind':
        drawWindTurbine(ctx, pos.x, pos.y, time);
        break;
      case 'hydro':
        drawHydroDam(ctx, pos.x, pos.y, time);
        break;
      case 'geothermal':
        drawGeothermalPlant(ctx, pos.x, pos.y, time);
        break;
      case 'transmission':
        // Handled separately as lines between tiles
        break;
    }
  }

  function drawSolarPlant(ctx, x, y, time) {
    // Solar panels
    ctx.fillStyle = '#1a3a5c';
    for (let i = 0; i < 6; i++) {
      const px = x - 12 + (i % 3) * 8;
      const py = y - 8 + Math.floor(i / 3) * 6;
      ctx.fillRect(px, py, 6, 4);
      
      // Glint animation
      const glint = (time * 0.33 + i * 0.1) % 1;
      if (glint > 0.6 && glint < 0.7) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(px, py, 6, 4);
        ctx.fillStyle = '#1a3a5c';
      }
    }
  }

  function drawWindTurbine(ctx, x, y, time) {
    // Pole
    ctx.fillStyle = '#888888';
    ctx.fillRect(x - 1, y - 30, 2, 30);
    
    // Rotor
    const rotation = time * Math.PI; // 1 rev per 2 seconds
    ctx.save();
    ctx.translate(x, y - 30);
    ctx.rotate(rotation);
    
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const angle = (i * 120 * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 12, Math.sin(angle) * 12);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  function drawHydroDam(ctx, x, y, time) {
    // Dam wall
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(x - 20, y - 8, 40, 12);
    
    // Water ripples
    const ripple = Math.sin(time * 0.67) * 0.5 + 0.5;
    ctx.strokeStyle = `rgba(255, 255, 255, ${ripple * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 20, y + 4);
    ctx.lineTo(x + 20, y + 4);
    ctx.stroke();
  }

  function drawGeothermalPlant(ctx, x, y, time) {
    // Building
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x - 10, y - 12, 20, 12);
    
    // Chimney
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 6, y - 20, 4, 8);
    
    // Steam puffs
    for (let i = 0; i < 3; i++) {
      const puffTime = (time + i * 0.5) % 1.5;
      const puffY = y - 20 - puffTime * 15;
      const puffAlpha = 1 - puffTime / 1.5;
      
      ctx.fillStyle = `rgba(200, 200, 200, ${puffAlpha * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(x + 8, puffY, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function lightenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.min(255, Math.floor(r * factor));
    const newG = Math.min(255, Math.floor(g * factor));
    const newB = Math.min(255, Math.floor(b * factor));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  // Handle mouse move for hover
  const handleMouseMove = (e) => {
    if (!terrain) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - 600; // Offset to center
    const mouseY = e.clientY - rect.top - 100;
    
    // Convert screen to grid coordinates (approximate)
    const gridX = Math.floor((mouseX / (TILE_WIDTH / 2) + mouseY / (TILE_HEIGHT / 2)) / 2);
    const gridY = Math.floor((mouseY / (TILE_HEIGHT / 2) - mouseX / (TILE_WIDTH / 2)) / 2);
    
    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
      setHoveredTile({ x: gridX, y: gridY });
    } else {
      setHoveredTile(null);
    }
  };

  const handleClick = () => {
    if (hoveredTile && onGridClick) {
      const fakeLat = -33.4489 + (hoveredTile.x - gridSize / 2) * 0.001;
      const fakeLng = -70.6693 + (hoveredTile.y - gridSize / 2) * 0.001;
      onGridClick(fakeLat, fakeLng);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a2a1f 0%, #0f1a14 100%)',
      overflow: 'hidden',
    }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{
          cursor: activeTool ? 'crosshair' : 'default',
          imageRendering: 'crisp-edges',
        }}
      />
    </div>
  );
}
