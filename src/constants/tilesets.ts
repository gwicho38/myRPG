/**
 * Tileset Configuration
 * Defines all available tilesets and their properties
 */

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
