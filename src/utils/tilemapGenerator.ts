/**
 * Tilemap Generator for RPG Game
 * Generates compatible tilemaps using the tuxemon-sample-32px-extruded tileset
 */

export interface TilemapConfig {
  width: number;
  height: number;
  name: string;
  tileset: string;
  layers: {
    belowPlayer: number[];
    world: number[];
    abovePlayer: number[];
  };
  objects: Array<{
    name: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    properties?: Record<string, any>;
  }>;
}

interface TileLayer {
  data: number[];
  height: number;
  id: number;
  name: string;
  opacity: number;
  type: 'tilelayer';
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

interface ObjectLayer {
  draworder: string;
  id: number;
  name: string;
  objects: Array<{
    height: number;
    id: number;
    name: string;
    properties: Array<{
      name: string;
      type: string;
      value: any;
    }>;
    rotation: number;
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
  }>;
  opacity: number;
  type: 'objectgroup';
  visible: boolean;
  x: number;
  y: number;
}

export interface GeneratedTilemap {
  compressionlevel: number;
  height: number;
  infinite: boolean;
  layers: Array<TileLayer | ObjectLayer>;
  nextlayerid: number;
  nextobjectid: number;
  orientation: string;
  renderorder: string;
  tiledversion: string;
  tileheight: number;
  tilewidth: number;
  tilesets: Array<{
    columns: number;
    firstgid: number;
    grid: {
      height: number;
      orientation: string;
      width: number;
    };
    image: string;
    imageheight: number;
    imagewidth: number;
    margin: number;
    name: string;
    spacing: number;
    tilecount: number;
    tileheight: number;
    tilewidth: number;
  }>;
  type: string;
  version: string;
  width: number;
  properties?: Array<{
    name: string;
    type: string;
    value: string;
  }>;
}

export class TilemapGenerator {
  private static readonly TILESET_CONFIG = {
    columns: 24,
    firstgid: 1,
    grid: {
      height: 16,
      orientation: 'orthogonal',
      width: 16,
    },
    image: '../tilesets/tuxemon-sample-32px-extruded.png',
    imageheight: 1020,
    imagewidth: 816,
    margin: 1,
    name: 'tuxemon-sample-32px-extruded',
    spacing: 2,
    tilecount: 720,
    tileheight: 32,
    tilewidth: 32,
  };

  /**
   * Generate a tilemap from configuration
   */
  static generateTilemap(config: TilemapConfig): GeneratedTilemap {
    const totalTiles = config.width * config.height;

    // Ensure all layer data arrays have the correct length
    const belowPlayerData = this.padArray(
      config.layers.belowPlayer,
      totalTiles,
      0,
    );
    const worldData = this.padArray(config.layers.world, totalTiles, 0);
    const abovePlayerData = this.padArray(
      config.layers.abovePlayer,
      totalTiles,
      0,
    );

    const layers: Array<TileLayer | ObjectLayer> = [
      {
        data: belowPlayerData,
        height: config.height,
        id: 1,
        name: 'Below Player',
        opacity: 1,
        type: 'tilelayer' as const,
        visible: true,
        width: config.width,
        x: 0,
        y: 0,
      },
      {
        data: worldData,
        height: config.height,
        id: 2,
        name: 'World',
        opacity: 1,
        type: 'tilelayer' as const,
        visible: true,
        width: config.width,
        x: 0,
        y: 0,
      },
      {
        data: abovePlayerData,
        height: config.height,
        id: 3,
        name: 'Above Player',
        opacity: 1,
        type: 'tilelayer' as const,
        visible: true,
        width: config.width,
        x: 0,
        y: 0,
      },
      {
        draworder: 'topdown',
        id: 4,
        name: 'Objects',
        objects: config.objects.map((obj, index) => ({
          height: obj.height || 0,
          id: index + 1,
          name: obj.name,
          properties: Object.entries(obj.properties || {}).map(
            ([key, value]) => ({
              name: key,
              type: typeof value === 'boolean' ? 'bool' : 'string',
              value: value,
            }),
          ),
          rotation: 0,
          type: '',
          visible: true,
          width: obj.width || 0,
          x: obj.x,
          y: obj.y,
        })),
        opacity: 1,
        type: 'objectgroup' as const,
        visible: true,
        x: 0,
        y: 0,
      },
    ];

    return {
      compressionlevel: -1,
      height: config.height,
      infinite: false,
      layers,
      nextlayerid: 5,
      nextobjectid: config.objects.length + 1,
      orientation: 'orthogonal',
      renderorder: 'right-down',
      tiledversion: '1.10.2',
      tileheight: 32,
      tilewidth: 32,
      tilesets: [this.TILESET_CONFIG],
      type: 'map',
      version: '1.10',
      width: config.width,
      properties: [
        {
          name: 'edges',
          type: 'string',
          value: 'clamped',
        },
      ],
    };
  }

  /**
   * Generate a simple city tilemap
   */
  static generateCity(
    name: string,
    width: number = 40,
    height: number = 40,
  ): GeneratedTilemap {
    const config: TilemapConfig = {
      width,
      height,
      name,
      tileset: 'tuxemon-sample-32px-extruded',
      layers: {
        belowPlayer: this.generateGrassLayer(width, height),
        world: this.generateCityLayer(width, height),
        abovePlayer: this.generateEmptyLayer(width, height),
      },
      objects: [
        {
          name: 'Spawn Point',
          x: width * 16, // Center of map
          y: height * 16,
          properties: {},
        },
        {
          name: 'Sign',
          x: width * 16 - 12,
          y: height * 16 - 20,
          width: 24,
          height: 28,
          properties: {
            text: `Welcome to ${name}!`,
          },
        },
      ],
    };

    return this.generateTilemap(config);
  }

  /**
   * Generate a forest tilemap
   */
  static generateForest(
    name: string,
    width: number = 40,
    height: number = 40,
  ): GeneratedTilemap {
    const config: TilemapConfig = {
      width,
      height,
      name,
      tileset: 'tuxemon-sample-32px-extruded',
      layers: {
        belowPlayer: this.generateGrassLayer(width, height),
        world: this.generateForestLayer(width, height),
        abovePlayer: this.generateEmptyLayer(width, height),
      },
      objects: [
        {
          name: 'Spawn Point',
          x: width * 16,
          y: height * 16,
          properties: {},
        },
        {
          name: 'Sign',
          x: width * 16 - 12,
          y: height * 16 - 20,
          width: 24,
          height: 28,
          properties: {
            text: `Deep ${name} Forest`,
          },
        },
      ],
    };

    return this.generateTilemap(config);
  }

  /**
   * Generate a cave tilemap
   */
  static generateCave(
    name: string,
    width: number = 40,
    height: number = 40,
  ): GeneratedTilemap {
    const config: TilemapConfig = {
      width,
      height,
      name,
      tileset: 'tuxemon-sample-32px-extruded',
      layers: {
        belowPlayer: this.generateStoneLayer(width, height),
        world: this.generateCaveLayer(width, height),
        abovePlayer: this.generateEmptyLayer(width, height),
      },
      objects: [
        {
          name: 'Spawn Point',
          x: width * 16,
          y: height * 16,
          properties: {},
        },
        {
          name: 'Sign',
          x: width * 16 - 12,
          y: height * 16 - 20,
          width: 24,
          height: 28,
          properties: {
            text: `${name} Cave Entrance`,
          },
        },
      ],
    };

    return this.generateTilemap(config);
  }

  // Helper methods for generating different tile patterns
  private static generateGrassLayer(width: number, height: number): number[] {
    const data: number[] = [];
    for (let i = 0; i < width * height; i++) {
      // Use grass tiles (around tile ID 126 based on the original)
      data.push(126);
    }
    return data;
  }

  private static generateCityLayer(width: number, height: number): number[] {
    const data: number[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let tileId = 126; // Default grass

        // Create some city structures
        if (x > 5 && x < width - 5 && y > 5 && y < height - 5) {
          // Inner city area
          if ((x + y) % 3 === 0) {
            tileId = 149; // Path tile
          } else if ((x * y) % 7 === 0) {
            tileId = 173; // Building tile
          }
        }

        data.push(tileId);
      }
    }
    return data;
  }

  private static generateForestLayer(width: number, height: number): number[] {
    const data: number[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let tileId = 126; // Default grass

        // Add trees randomly
        if (Math.random() < 0.3) {
          tileId = 200; // Tree tile (adjust based on actual tileset)
        }

        data.push(tileId);
      }
    }
    return data;
  }

  private static generateStoneLayer(width: number, height: number): number[] {
    const data: number[] = [];
    for (let i = 0; i < width * height; i++) {
      data.push(50); // Stone tile (adjust based on actual tileset)
    }
    return data;
  }

  private static generateCaveLayer(width: number, height: number): number[] {
    const data: number[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let tileId = 50; // Default stone

        // Add cave features
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          tileId = 100; // Cave wall
        } else if (Math.random() < 0.1) {
          tileId = 150; // Cave feature
        }

        data.push(tileId);
      }
    }
    return data;
  }

  private static generateEmptyLayer(width: number, height: number): number[] {
    return new Array(width * height).fill(0);
  }

  private static padArray(
    arr: number[],
    length: number,
    fillValue: number = 0,
  ): number[] {
    if (arr.length >= length) {
      return arr.slice(0, length);
    }
    return [...arr, ...new Array(length - arr.length).fill(fillValue)];
  }

  /**
   * Save tilemap to file
   */
  static async saveTilemap(
    tilemap: GeneratedTilemap,
    filename: string,
  ): Promise<void> {
    const jsonString = JSON.stringify(tilemap, null, 2);
    // In a real implementation, you'd write to file system
    console.log(`Generated tilemap for ${filename}:`);
    console.log(JSON.stringify(tilemap, null, 2));
  }
}
