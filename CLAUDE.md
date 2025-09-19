# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Development
npm start           # Start dev server at localhost:5173 with hot reload

# Build and Deploy
npm run build       # Build for production to dist/ folder
npm run bundle      # Build and package as Zip file for distribution
npm run preview     # Preview production build

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Auto-fix ESLint issues
npm run lint:tsc    # TypeScript type checking

# Map Generation
npm run generate-maps  # Generate sample tilemaps in src/assets/tilemaps/generated/
```

## Architecture Overview

### Framework and Stack
- **Phaser 3** (v3.90.0) for game engine
- **phaser-jsx** for React-like component syntax in Phaser scenes
- **TypeScript** with strict mode enabled
- **Vite** for bundling and development server
- **ESLint** with Prettier for code formatting

### Core Game Structure

The game follows Phaser's scene-based architecture with custom extensions:

1. **Scene Flow**: Boot → Main (gameplay) → Menu (pause screen)
2. **Map System**: Dynamic tilemap generation and switching system
3. **Component System**: React-like components using phaser-jsx for UI elements
4. **Asset Management**: Organized loading of sprites, tilesets, and tilemaps

### Key Systems

#### Tilemap System
- **MapManager** (`src/managers/MapManager.ts`): Handles map loading, switching, and state management
- **TilemapGenerator** (`src/utils/tilemapGenerator.ts`): Procedurally generates compatible tilemaps
- **Map configurations** in `src/constants/maps.ts`
- Generated maps stored in `src/assets/tilemaps/generated/`
- Maps use the Tuxemon tileset (32px tiles with 2px spacing)

#### Player System
- **Player sprite** (`src/sprites/Player.ts`) with WASD/arrow key movement
- Animation system with directional walking animations
- Collision detection with world layer
- Interactive selector for object interaction (Space key)

#### Component System
Components use phaser-jsx for declarative UI:
- `MapSelector`: Map switching UI (toggle with M key)
- `Typewriter`: Text animation for dialogues
- `TilemapDebug`: Shows collision boundaries in dev mode
- Components rendered via `render()` from phaser-jsx

### Scene Configuration

Scenes are registered in `src/index.ts`:
- Boot scene loads first for asset preloading
- Main scene handles gameplay
- Menu scene for pause functionality
- Physics uses Arcade physics with debug mode in development

## Development Guidelines

### Adding New Maps
1. Add configuration to `src/constants/maps.ts`
2. Generate using `TilemapGenerator` or `npm run generate-maps`
3. Ensure map is preloaded in `Boot.ts`
4. Maps must include spawn point and proper layer structure

### Creating UI Components
- Use phaser-jsx syntax in `.tsx` files
- Import `render` from `phaser-jsx`
- Components can access Phaser scene via props
- Place in `src/components/`

### Asset Organization
- Sprites: `src/assets/sprites/`
- Tilesets: `src/assets/tilesets/`
- Tilemaps: `src/assets/tilemaps/` (generated in `/generated` subfolder)
- Atlas files: `src/assets/atlas/`

### State Management
- Global state in `src/state/index.ts`
- Scene-specific state within scene classes
- Use TypeScript interfaces for type safety

## Important Constants

Key references defined in `src/constants/`:
- `key.ts`: Asset keys for images, sprites, scenes, tilemaps
- `depth.ts`: Z-index depths for layering
- `tilemap.ts`: Tilemap layer names and object types
- `env.ts`: Environment variables from Vite

## Testing Approach

No test framework is currently configured. To add testing:
1. Install test runner (Jest, Vitest recommended for Vite)
2. Configure test environment for Phaser/Canvas
3. Focus on utility functions and map generation logic