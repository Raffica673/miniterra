# GridScope — Renewable Energy Infrastructure Planning Sandbox

An interactive educational tool for exploring renewable energy infrastructure placement. Built for Hackathon 2026 · Theme: Getting There.

Addresses **SDG 7** (Clean Energy), **SDG 9** (Infrastructure), and **SDG 11** (Sustainable Cities).

---

## Overview

GridScope takes users through a three-stage workflow:

1. **Scout** — Explore real Chilean regions on a Leaflet map. Toggle data overlays (solar irradiance, wind speed, temperature, flood risk) to identify candidate sites.
2. **Build 1 (Sandbox)** — Place infrastructure on a stylized 2D tile grid representing a scouted region. Each tile has terrain type, elevation, solar/wind/flood data, and visual props (trees, water, urban blocks). Budget-constrained placement with real-time feasibility scoring.
3. **Build 2 (Real Map)** — Place the same infrastructure on the actual Leaflet map, with placement validation against real environmental models.
4. **Report** — View a feasibility score summary with energy output, CO₂ avoided, connectivity, and flood safety metrics.

---

## Infrastructure Types

| Type | Category | Cost | Description |
|------|----------|------|-------------|
| Solar Farm | Generation | 120 | Photovoltaic array · 50 MW peak |
| Wind Turbine | Generation | 90 | Turbine cluster · 30 MW |
| Substation | Grid | 80 | Power distribution hub · 220kV |
| Transmission Line | Grid | 30 | High-voltage link · 220kV |
| Battery Storage | Storage | 150 | Grid-scale Li-ion · 200 MWh |
| Weather Station | Monitoring | 15 | Environmental monitor · IoT |
| Flood Barrier | Protection | 60 | Flood defense infrastructure |

---

## Tech Stack

- **React 18** + **Vite**
- **Framer Motion** — landing page and tile animations
- **Leaflet / React-Leaflet** — real map in Scout and Build 2 modes
- **SVG tile renderer** — custom flat 2D grid in Build 1 (MapGrid + IsometricTile)
- All styling via inline styles with a shared CSS variable theme (`index.css`)

---

## Project Structure

```
src/
├── App.jsx                  # Top-level layout, mode routing, state wiring
├── index.css                # Global theme (dark blue-gray, CSS variables)
├── contexts/
│   └── AppContext.jsx        # currentMode, selectedRegion, overlays, compareMode
├── hooks/
│   ├── useGridState.js       # Grid cell state, placement, undo for Build 1
│   ├── useInfraPlacement.js  # Lat/lng placement state for Build 2
│   └── useBudget.js          # Budget tracking (separate instance per build mode)
├── data/
│   ├── infrastructure.js     # 7 infrastructure type definitions (canPlace, getEfficiency)
│   ├── environmentalModels.js# Santiago-region elevation, solar, wind, flood models
│   └── regions.js            # Scout region definitions (Atacama, Patagonia, Central Valley, Nido)
├── utils/
│   ├── gridGenerator.js      # Deterministic per-region cell grid generation (32×22)
│   ├── isometric.js          # Flat tile coordinate math (40×40px tiles)
│   ├── scoring.js            # Feasibility score calculation
│   ├── connections.js        # Grid connectivity (substation BFS)
│   └── colors.js             # Terrain color palettes and overlay color scales
├── components/
│   ├── map/
│   │   ├── MapGrid.jsx        # SVG tile grid renderer for Build 1
│   │   ├── IsometricTile.jsx  # Individual tile (terrain, overlays, infra icon, hover)
│   │   ├── TerrainProps.jsx   # Decorative SVG props (trees, rocks, urban blocks)
│   │   ├── InfrastructureIcon.jsx # Infrastructure SVG icons per type
│   │   ├── ConnectionLines.jsx    # Power line SVG overlaid on grid
│   │   ├── HoverTooltip.jsx       # Tile data tooltip
│   │   └── RealMap.jsx        # Leaflet map for Scout and Build 2
│   ├── build/
│   │   └── Toolbox.jsx        # Infrastructure picker with budget bar
│   ├── scout/
│   │   ├── ScoutPanel.jsx     # Region list + overlay toggles
│   │   └── DataLayerToggles.jsx
│   ├── report/
│   │   └── ReportPanel.jsx    # Feasibility report with score breakdown
│   └── shared/
│       ├── GlassPanel.jsx
│       ├── Button.jsx
│       ├── Toast.jsx
│       └── AnimatedNumber.jsx
```

---

## Regions (Build 1 Grid Maps)

Three deterministic grid maps are generated from seed:

- **Atacama** — High-altitude desert; excellent solar, low wind, low flood risk
- **Patagonia** — Coastal/fjord terrain; strong wind, poor solar, high coastal flood risk
- **Central Valley** — River valley; balanced solar/wind, moderate flood risk near water

The active region in Scout mode is automatically loaded into Build 1.

---

## Scoring

The feasibility score (0–100) weights:
- Solar efficiency of placed solar farms (20%)
- Wind efficiency of placed wind turbines (20%)
- Flood safety across all placements (15%)
- Grid connectivity via substations/transmission (25%)
- Budget efficiency (remaining / total) (10%)
- Coverage (number of placements) (10%)

---

## Development

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` by default.
