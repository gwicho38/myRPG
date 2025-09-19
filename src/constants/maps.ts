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
    properties?: Record<string, any>;
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
    description: 'A bustling city with tall buildings',
    tileset: 'tuxemon-sample-32px-extruded',
    width: 40,
    height: 40,
    spawnPoint: { x: 640, y: 640 },
    objects: [
      {
        name: 'Sign',
        x: 628,
        y: 620,
        properties: { text: 'Welcome to Greenwood City!' },
      },
    ],
  },
  {
    id: 'mystic-forest',
    name: 'Mystic Forest',
    type: MAP_TYPES.FOREST,
    description: 'A mysterious forest filled with ancient trees',
    tileset: 'tuxemon-sample-32px-extruded',
    width: 40,
    height: 40,
    spawnPoint: { x: 640, y: 640 },
    objects: [
      {
        name: 'Sign',
        x: 628,
        y: 620,
        properties: { text: 'Enter the Mystic Forest at your own risk!' },
      },
    ],
  },
  {
    id: 'crystal-cave',
    name: 'Crystal Cave',
    type: MAP_TYPES.CAVE,
    description: 'A dark cave filled with glowing crystals',
    tileset: 'tuxemon-sample-32px-extruded',
    width: 40,
    height: 40,
    spawnPoint: { x: 640, y: 640 },
    objects: [
      {
        name: 'Sign',
        x: 628,
        y: 620,
        properties: { text: 'Crystal Cave - Watch your step!' },
      },
    ],
  },
  {
    id: 'desert-oasis',
    name: 'Desert Oasis',
    type: MAP_TYPES.CITY,
    description: 'A peaceful oasis in the middle of the desert',
    tileset: 'tuxemon-sample-32px-extruded',
    width: 40,
    height: 40,
    spawnPoint: { x: 640, y: 640 },
    objects: [
      {
        name: 'Sign',
        x: 628,
        y: 620,
        properties: { text: 'Welcome to the Desert Oasis!' },
      },
    ],
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
