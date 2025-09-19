/**
 * Map Configuration Constants
 * Defines all available maps and their properties
 */

export interface MapConfig {
  id: string;
  name: string;
  type: 'city' | 'forest' | 'cave' | 'custom';
  description: string;
  tileset: string;
  width: number;
  height: number;
  spawnPoint: {
    x: number;
    y: number;
  };
  objects?: Array<{
    name: string;
    x: number;
    y: number;
    properties?: Record<string, string | number | boolean>;
  }>;
}

export const MAP_TYPES = {
  CITY: 'city',
  FOREST: 'forest',
  CAVE: 'cave',
  CUSTOM: 'custom',
} as const;

export const AVAILABLE_MAPS: MapConfig[] = [
  {
    id: 'tuxemon-town',
    name: 'Tuxemon Town',
    type: MAP_TYPES.CITY,
    description: 'The starting town with shops and houses',
    tileset: 'tuxemon-sample-32px-extruded',
    width: 40,
    height: 40,
    spawnPoint: { x: 640, y: 640 },
  },
  {
    id: 'greenwood-city',
    name: 'Greenwood City',
    type: MAP_TYPES.CITY,
    description: 'A vibrant city with tuxemon theme',
    tileset: 'tuxemon',
    width: 40,
    height: 40,
    spawnPoint: { x: 640, y: 640 },
  },
  {
    id: 'medieval-castle',
    name: 'Medieval Castle',
    type: MAP_TYPES.CITY,
    description: 'A medieval castle town with stone buildings',
    tileset: 'medieval',
    width: 40,
    height: 40,
    spawnPoint: { x: 640, y: 640 },
  },
  {
    id: 'mystic-forest',
    name: 'Mystic Forest',
    type: MAP_TYPES.FOREST,
    description: 'A dense forest with natural elements',
    tileset: 'nature',
    width: 40,
    height: 40,
    spawnPoint: { x: 640, y: 640 },
  },
  {
    id: 'dark-dungeon',
    name: 'Dark Dungeon',
    type: MAP_TYPES.CAVE,
    description: 'A dark underground dungeon',
    tileset: 'dungeon',
    width: 40,
    height: 40,
    spawnPoint: { x: 640, y: 640 },
  },
  {
    id: 'sci-fi-station',
    name: 'Sci-Fi Station',
    type: MAP_TYPES.CITY,
    description: 'A futuristic space station',
    tileset: 'scifi',
    width: 40,
    height: 40,
    spawnPoint: { x: 640, y: 640 },
  },
];

export const getMapById = (id: string): MapConfig | undefined => {
  return AVAILABLE_MAPS.find((map) => map.id === id);
};

export const getMapsByType = (type: string): MapConfig[] => {
  return AVAILABLE_MAPS.filter((map) => map.type === type);
};

export const getRandomMap = (): MapConfig => {
  const randomIndex = Math.floor(Math.random() * AVAILABLE_MAPS.length);
  return AVAILABLE_MAPS[randomIndex];
};
