# Tilemap System Documentation

This document explains the comprehensive tilemap system implemented in the RPG game, including map generation, selection, and management.

## Overview

The tilemap system provides:
- **Automatic map generation** using configurable templates
- **Map selection UI** for easy switching between locations
- **Compatible tilemap format** using the existing Tuxemon tileset
- **Extensible architecture** for adding new map types and tilesets

## System Components

### 1. Tilemap Generator (`src/utils/tilemapGenerator.ts`)

The core generator that creates compatible tilemaps from configuration.

**Key Features:**
- Generates city, forest, and cave maps
- Uses the existing `tuxemon-sample-32px-extruded` tileset
- Creates proper layer structure (Below Player, World, Above Player, Objects)
- Adds spawn points and interactive objects

**Usage:**
```typescript
import { TilemapGenerator } from '../utils/tilemapGenerator';

// Generate a city map
const cityMap = TilemapGenerator.generateCity('New City', 40, 40);

// Generate a forest map
const forestMap = TilemapGenerator.generateForest('Dark Forest', 50, 50);

// Generate a cave map
const caveMap = TilemapGenerator.generateCave('Crystal Cave', 30, 30);
```

### 2. Map Manager (`src/managers/MapManager.ts`)

Manages map loading, switching, and state.

**Key Features:**
- Loads maps dynamically
- Handles map switching
- Manages Phaser scene integration
- Provides spawn point information

**Usage:**
```typescript
import { MapManager } from '../managers/MapManager';

const mapManager = new MapManager(phaserScene);
await mapManager.loadMap('greenwood-city');
await mapManager.nextMap();
await mapManager.loadRandomMap();
```

### 3. Map Selector UI (`src/components/MapSelector.tsx`)

React component for map selection interface.

**Key Features:**
- Visual map selection
- Navigation controls (Previous/Next/Random)
- Map type indicators
- Loading states

**Usage:**
```tsx
import { MapSelector } from '../components/MapSelector';

<MapSelector 
  mapManager={mapManager}
  onMapChange={(mapConfig) => console.log('Map changed:', mapConfig)}
/>
```

### 4. Map Configuration (`src/constants/maps.ts`)

Defines all available maps and their properties.

**Map Types:**
- `city`: Urban areas with buildings and paths
- `forest`: Natural areas with trees and vegetation
- `cave`: Underground areas with stone and cave features

**Adding New Maps:**
```typescript
export const AVAILABLE_MAPS: MapConfig[] = [
  {
    id: 'new-location',
    name: 'New Location',
    type: 'city',
    description: 'A new city to explore',
    tileset: 'tuxemon-sample-32px-extruded',
    width: 40,
    height: 40,
    spawnPoint: { x: 640, y: 640 },
    objects: [
      {
        name: 'Sign',
        x: 628,
        y: 620,
        properties: { text: 'Welcome to New Location!' }
      }
    ]
  }
];
```

## Generated Maps

The system includes several pre-generated maps:

### 🏙️ Greenwood City
- **Type**: City
- **Description**: A bustling city with tall buildings
- **Features**: Urban layout with paths and structures

### 🌲 Mystic Forest
- **Type**: Forest
- **Description**: A mysterious forest filled with ancient trees
- **Features**: Dense tree coverage with natural paths

### 🕳️ Crystal Cave
- **Type**: Cave
- **Description**: A dark cave filled with glowing crystals
- **Features**: Stone walls and cave formations

### 🏜️ Desert Oasis
- **Type**: City
- **Description**: A peaceful oasis in the middle of the desert
- **Features**: Unique desert-themed city layout

## Usage Instructions

### In-Game Controls
- **M Key**: Toggle map selector UI
- **ESC Key**: Open main menu
- **WASD/Arrow Keys**: Move player

### Map Selection
1. Press **M** to open the map selector
2. Use navigation buttons or click on maps to switch
3. Each map has different terrain and objects
4. Player spawns at the designated spawn point

### Generating New Maps

#### Using the Script
```bash
# Generate all predefined maps
npm run generate-maps

# Generate a custom map
node scripts/generate-maps.js custom "Ice City" city 50 50
```

#### Programmatically
```typescript
import { TilemapGenerator } from './src/utils/tilemapGenerator';

// Generate and save a custom map
const customMap = TilemapGenerator.generateCity('Custom City', 60, 40);
// Save to file or use directly
```

## File Structure

```
src/
├── assets/
│   ├── tilemaps/
│   │   ├── generated/          # Auto-generated maps
│   │   │   ├── greenwood-city.json
│   │   │   ├── mystic-forest.json
│   │   │   ├── crystal-cave.json
│   │   │   ├── desert-oasis.json
│   │   │   └── index.ts
│   │   ├── tuxemon-town.json   # Original map
│   │   └── index.ts
│   └── tilesets/
│       ├── new/               # Additional tilesets
│       └── tuxemon-sample-32px-extruded.png
├── components/
│   └── MapSelector.tsx        # Map selection UI
├── constants/
│   ├── maps.ts               # Map configurations
│   └── tilesets.ts           # Tileset configurations
├── managers/
│   └── MapManager.ts         # Map management logic
├── utils/
│   └── tilemapGenerator.ts   # Core generator
└── scripts/
    └── generate-maps.js       # Generation script
```

## Adding New Tilesets

### 1. Download Compatible Tileset
- **Tile Size**: 32x32 pixels
- **Format**: PNG with transparency
- **Grid Layout**: Organized in rows/columns
- **Spacing**: 2 pixels between tiles (recommended)

### 2. Add to Project
```typescript
// In src/constants/tilesets.ts
export const TILESETS: Record<string, TilesetConfig> = {
  tuxemon: { /* existing config */ },
  newTileset: {
    id: 'new-tileset',
    name: 'New Tileset',
    filename: 'new-tileset.png',
    tileWidth: 32,
    tileHeight: 32,
    columns: 24,
    rows: 30,
    totalTiles: 720,
    spacing: 2,
    margin: 1,
    description: 'A new tileset for the game',
    source: 'OpenGameArt',
    license: 'CC0'
  }
};
```

### 3. Update Generator
```typescript
// In src/utils/tilemapGenerator.ts
private static readonly NEW_TILESET_CONFIG = {
  // ... tileset configuration
  image: "../tilesets/new-tileset.png",
  name: "new-tileset",
  // ... other properties
};
```

## Troubleshooting

### Common Issues

1. **Maps not loading**
   - Check that maps are preloaded in `Boot.ts`
   - Verify map keys match between loading and usage

2. **Player not spawning**
   - Ensure spawn point exists in map objects
   - Check spawn point coordinates

3. **Collision not working**
   - Verify tileset has collision properties
   - Check layer collision setup

4. **UI not appearing**
   - Press **M** key to toggle map selector
   - Check browser console for errors

### Debug Mode

Enable debug mode to see collision boundaries:
```typescript
// In Main.tsx
render(<TilemapDebug tilemapLayer={this.worldLayer} />, this);
```

## Future Enhancements

### Planned Features
- **Custom map editor** integrated into the game
- **Map sharing** system for community maps
- **Dynamic weather** effects per map
- **Map transitions** with smooth loading
- **Save/load** player position per map

### Extensibility
- **Plugin system** for custom map types
- **Scripting support** for interactive objects
- **Multiplayer** map synchronization
- **Procedural generation** algorithms

## Contributing

To contribute to the tilemap system:

1. **Fork the repository**
2. **Create a feature branch**
3. **Add your maps/tilesets**
4. **Update documentation**
5. **Submit a pull request**

### Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure compatibility with existing maps

## License

The tilemap system is part of the RPG game template and follows the same MIT license. Generated maps use the Tuxemon tileset under GPL-3.0 license.

## Resources

### Recommended Tileset Sources
- **OpenGameArt.org**: Free tilesets with various licenses
- **Itch.io**: Indie game assets and tilesets
- **GitHub**: Open-source game projects with assets

### Tools
- **Tiled Map Editor**: For creating and editing tilemaps
- **Aseprite**: For creating custom tilesets
- **GIMP/Photoshop**: For image editing

### Documentation
- **Phaser 3 Tilemap API**: Official Phaser documentation
- **Tiled Map Editor**: Map creation tool documentation
- **Tuxemon Project**: Original tileset source