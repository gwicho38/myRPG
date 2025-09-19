/**
 * Map Manager
 * Handles map loading, switching, and generation
 */

import { AVAILABLE_MAPS, getMapById, MapConfig } from '../constants/maps';
import { GeneratedTilemap, TilemapGenerator } from '../utils/tilemapGenerator';

export class MapManager {
  private currentMap: MapConfig | null = null;
  private generatedMaps: Map<string, GeneratedTilemap> = new Map();
  private phaserScene: Phaser.Scene | null = null;

  constructor(scene?: Phaser.Scene) {
    this.phaserScene = scene || null;
  }

  /**
   * Set the Phaser scene for map operations
   */
  setScene(scene: Phaser.Scene): void {
    this.phaserScene = scene;
  }

  /**
   * Get all available maps
   */
  getAvailableMaps(): MapConfig[] {
    return AVAILABLE_MAPS;
  }

  /**
   * Get current map
   */
  getCurrentMap(): MapConfig | null {
    return this.currentMap;
  }

  /**
   * Set current map (for initialization)
   */
  setCurrentMap(mapId: string): void {
    const mapConfig = getMapById(mapId);
    if (mapConfig) {
      this.currentMap = mapConfig;
    }
  }

  /**
   * Load a map by ID
   */
  async loadMap(mapId: string): Promise<boolean> {
    const mapConfig = getMapById(mapId);
    if (!mapConfig) {
      // Map not found
      return false;
    }

    try {
      this.currentMap = mapConfig;

      if (this.phaserScene) {
        await this.loadMapInPhaser(mapId);
      }

      // Map loaded successfully
      return true;
    } catch {
      // console.error(`Failed to load map ${mapId}:`, error);
      // Failed to load map
      return false;
    }
  }

  /**
   * Generate a map from configuration
   */
  private async generateMap(mapConfig: MapConfig): Promise<void> {
    let generatedMap: GeneratedTilemap;

    switch (mapConfig.type) {
      case 'city':
        generatedMap = TilemapGenerator.generateCity(
          mapConfig.name,
          mapConfig.width,
          mapConfig.height,
        );
        break;
      case 'forest':
        generatedMap = TilemapGenerator.generateForest(
          mapConfig.name,
          mapConfig.width,
          mapConfig.height,
        );
        break;
      case 'cave':
        generatedMap = TilemapGenerator.generateCave(
          mapConfig.name,
          mapConfig.width,
          mapConfig.height,
        );
        break;
      default:
        throw new Error(`Unknown map type: ${mapConfig.type}`);
    }

    // Add custom objects if specified
    if (mapConfig.objects) {
      const objectsLayer = generatedMap.layers.find(
        (layer) => layer.name === 'Objects',
      );
      if (objectsLayer && 'objects' in objectsLayer) {
        objectsLayer.objects = mapConfig.objects.map((obj, index) => ({
          height: 0,
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
          width: 0,
          x: obj.x,
          y: obj.y,
        }));
      }
    }

    this.generatedMaps.set(mapConfig.id, generatedMap);
  }

  /**
   * Load map in Phaser scene
   */
  private async loadMapInPhaser(mapId: string): Promise<void> {
    if (!this.phaserScene) {
      throw new Error('Phaser scene not set');
    }

    // Clear existing tilemap
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((this.phaserScene as any).tilemap) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.phaserScene as any).tilemap.destroy();
    }

    let tilemapKey: string;

    if (mapId === 'tuxemon-town') {
      tilemapKey = 'tuxemon';
    } else {
      tilemapKey = `generated-${mapId}`;
    }

    // console.log(`Loading tilemap with key: ${tilemapKey}`);

    // Create new tilemap
    const tilemap = this.phaserScene.make.tilemap({ key: tilemapKey });

    // Debug: Check what tileset the map expects
    // console.log('Tilemap info:', {
    //   format: tilemap.format,
    //   tileWidth: tilemap.tileWidth,
    //   tileHeight: tilemap.tileHeight,
    //   width: tilemap.width,
    //   height: tilemap.height
    // });

    // Check if tuxemon image is loaded in cache
    // console.log('Available images in cache:', this.phaserScene.textures.list);
    // console.log('Tuxemon texture exists:', this.phaserScene.textures.exists('tuxemon'));

    // For now, all maps use the tuxemon tileset since that's the only one we have loaded
    // const tilesetName = 'tuxemon-sample-32px-extruded';
    // const tilesetKey = 'tuxemon';
    // console.log(`Using tileset: ${tilesetName} with key: ${tilesetKey}`);

    // The generated maps have tileset name "tuxemon" which should match the texture key
    let tileset = tilemap.addTilesetImage('tuxemon', 'tuxemon');

    if (!tileset) {
      // console.log('Failed with name "tuxemon", trying full name...');
      tileset = tilemap.addTilesetImage(
        'tuxemon-sample-32px-extruded',
        'tuxemon',
      );
    }

    if (!tileset) {
      // console.log('Failed with full name, trying default approach...');
      tileset = tilemap.addTilesetImage('tuxemon-sample-32px-extruded');
    }

    if (!tileset) {
      // console.error('All tileset loading attempts failed');
      throw new Error('Failed to load tileset');
    }

    // console.log('Tileset loaded successfully:', tileset);

    // Create layers
    tilemap.createLayer('Below Player', tileset, 0, 0);
    const worldLayer = tilemap.createLayer('World', tileset, 0, 0);
    tilemap.createLayer('Above Player', tileset, 0, 0);

    // Set collision properties
    if (worldLayer) {
      worldLayer.setCollisionByProperty({ collides: true });
    }

    // Store reference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.phaserScene as any).tilemap = tilemap;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.phaserScene as any).worldLayer = worldLayer;
  }

  /**
   * Switch to next map in sequence
   */
  async nextMap(): Promise<boolean> {
    if (!this.currentMap) {
      return await this.loadMap(AVAILABLE_MAPS[0].id);
    }

    const currentIndex = AVAILABLE_MAPS.findIndex(
      (map) => map.id === this.currentMap!.id,
    );
    const nextIndex = (currentIndex + 1) % AVAILABLE_MAPS.length;

    return await this.loadMap(AVAILABLE_MAPS[nextIndex].id);
  }

  /**
   * Switch to previous map in sequence
   */
  async previousMap(): Promise<boolean> {
    if (!this.currentMap) {
      return await this.loadMap(AVAILABLE_MAPS[AVAILABLE_MAPS.length - 1].id);
    }

    const currentIndex = AVAILABLE_MAPS.findIndex(
      (map) => map.id === this.currentMap!.id,
    );
    const prevIndex =
      currentIndex === 0 ? AVAILABLE_MAPS.length - 1 : currentIndex - 1;

    return await this.loadMap(AVAILABLE_MAPS[prevIndex].id);
  }

  /**
   * Load random map
   */
  async loadRandomMap(): Promise<boolean> {
    const randomMap =
      AVAILABLE_MAPS[Math.floor(Math.random() * AVAILABLE_MAPS.length)];
    return await this.loadMap(randomMap.id);
  }

  /**
   * Get map spawn point
   */
  getSpawnPoint(): { x: number; y: number } | null {
    if (!this.currentMap) {
      return null;
    }
    return this.currentMap.spawnPoint;
  }

  /**
   * Export current map as JSON
   */
  exportCurrentMap(): string | null {
    if (!this.currentMap) {
      return null;
    }

    const generatedMap = this.generatedMaps.get(this.currentMap.id);
    if (!generatedMap) {
      return null;
    }

    return JSON.stringify(generatedMap, null, 2);
  }

  /**
   * Clear all generated maps (useful for memory management)
   */
  clearGeneratedMaps(): void {
    this.generatedMaps.clear();
  }
}
