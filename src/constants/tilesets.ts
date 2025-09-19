/**
 * Tileset Configuration
 * Defines all available tilesets and their properties
 */

export interface TileCollisionMap {
  [tileId: number]: boolean;
}

export interface TilesetConfig {
  id: string;
  name: string;
  filename: string;
  tileWidth: number;
  tileHeight: number;
  columns: number;
  rows: number;
  totalTiles: number;
  spacing: number;
  margin: number;
  description: string;
  source: string;
  license: string;
  collisionMap?: TileCollisionMap;
  theme: 'fantasy' | 'modern' | 'sci-fi' | 'medieval' | 'nature' | 'dungeon';
}

export const TILESETS: Record<string, TilesetConfig> = {
  tuxemon: {
    id: 'tuxemon',
    name: 'Tuxemon Sample Tileset',
    filename: 'tuxemon-sample-32px-extruded.png',
    tileWidth: 32,
    tileHeight: 32,
    columns: 24,
    rows: 30,
    totalTiles: 720,
    spacing: 2,
    margin: 1,
    description: 'Original Tuxemon tileset with RPG elements',
    source: 'Tuxemon Project',
    license: 'GPL-3.0',
    theme: 'fantasy',
    collisionMap: {
      100: true, // Cave entrance
      150: true, // Rock wall
      168: true, // Building corner
      169: true, // Building wall
      172: true, // Building top-left
      173: true, // Building top-right
      174: true, // Building bottom-left
      175: true, // Building bottom-right
      200: true, // Tree top-left
      201: true, // Tree top-right
      202: true, // Tree bottom
    },
  },
  medieval: {
    id: 'medieval',
    name: 'Medieval Castle Tileset',
    filename: 'medieval-castle-32px.png',
    tileWidth: 32,
    tileHeight: 32,
    columns: 16,
    rows: 16,
    totalTiles: 256,
    spacing: 0,
    margin: 0,
    description: 'Medieval castle and town tileset with stone buildings',
    source: 'OpenGameArt.org',
    license: 'CC0',
    theme: 'medieval',
    collisionMap: {
      1: true, // Stone wall
      2: true, // Castle wall
      16: true, // Tower
      17: true, // Gate
      32: true, // House wall
      48: true, // Tree
    },
  },
  nature: {
    id: 'nature',
    name: 'Forest & Nature Tileset',
    filename: 'forest-nature-32px.png',
    tileWidth: 32,
    tileHeight: 32,
    columns: 20,
    rows: 15,
    totalTiles: 300,
    spacing: 0,
    margin: 0,
    description: 'Lush forest with trees, rocks, and natural elements',
    source: 'CraftPix',
    license: 'Commercial',
    theme: 'nature',
    collisionMap: {
      5: true, // Large tree
      6: true, // Pine tree
      25: true, // Rock formation
      26: true, // Boulder
      45: true, // Dense bush
    },
  },
  dungeon: {
    id: 'dungeon',
    name: 'Dark Dungeon Tileset',
    filename: 'dark-dungeon-32px.png',
    tileWidth: 32,
    tileHeight: 32,
    columns: 12,
    rows: 20,
    totalTiles: 240,
    spacing: 0,
    margin: 0,
    description: 'Dark underground dungeon with stone walls and torches',
    source: 'Pipoya RPG Tileset',
    license: 'Commercial',
    theme: 'dungeon',
    collisionMap: {
      0: true, // Wall top
      1: true, // Wall side
      12: true, // Pillar
      24: true, // Door closed
    },
  },
  scifi: {
    id: 'scifi',
    name: 'Sci-Fi Station Tileset',
    filename: 'scifi-station-32px.png',
    tileWidth: 32,
    tileHeight: 32,
    columns: 18,
    rows: 12,
    totalTiles: 216,
    spacing: 0,
    margin: 0,
    description: 'Futuristic space station with metal panels and tech elements',
    source: 'Itch.io',
    license: 'Commercial',
    theme: 'sci-fi',
    collisionMap: {
      0: true, // Metal wall
      1: true, // Control panel
      18: true, // Machine
      36: true, // Terminal
    },
  },
};

export const getTilesetById = (id: string): TilesetConfig | undefined => {
  return TILESETS[id];
};

export const getAllTilesets = (): TilesetConfig[] => {
  return Object.values(TILESETS);
};

export const addTileset = (config: TilesetConfig): void => {
  TILESETS[config.id] = config;
};

export const removeTileset = (id: string): boolean => {
  if (TILESETS[id]) {
    delete TILESETS[id];
    return true;
  }
  return false;
};

export const getTilesetsByTheme = (theme: string): TilesetConfig[] => {
  return Object.values(TILESETS).filter((tileset) => tileset.theme === theme);
};

export const getCollisionTileIds = (tilesetId: string): number[] => {
  const tileset = getTilesetById(tilesetId);
  if (!tileset?.collisionMap) return [];
  return Object.keys(tileset.collisionMap)
    .filter((tileId) => tileset.collisionMap![parseInt(tileId)])
    .map((tileId) => parseInt(tileId));
};
