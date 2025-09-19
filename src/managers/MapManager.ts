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
      console.error(`Map with ID '${mapId}' not found`);
      return false;
    }

    try {
      // Generate the map if it's not already generated
      if (!this.generatedMaps.has(mapId)) {
        await this.generateMap(mapConfig);
      }

      this.currentMap = mapConfig;

      if (this.phaserScene) {
        await this.loadMapInPhaser(mapId);
      }

      console.log(`Loaded map: ${mapConfig.name}`);
      return true;
    } catch (error) {
      console.error(`Failed to load map '${mapId}':`, error);
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
    if ((this.phaserScene as any).tilemap) {
      (this.phaserScene as any).tilemap.destroy();
    }

    let tilemapKey: string;

    if (mapId === 'tuxemon-town') {
      tilemapKey = 'tuxemon';
    } else {
      tilemapKey = `generated-${mapId}`;
    }

    // Create new tilemap
    const tilemap = this.phaserScene.make.tilemap({ key: tilemapKey });

    // Add tileset
    const tileset = tilemap.addTilesetImage(
      'tuxemon-sample-32px-extruded',
      'tuxemon',
    );

    if (!tileset) {
      throw new Error('Failed to load tileset');
    }

    // Create layers
    tilemap.createLayer('Below Player', tileset, 0, 0);
    const worldLayer = tilemap.createLayer('World', tileset, 0, 0);
    tilemap.createLayer('Above Player', tileset, 0, 0);

    // Set collision properties
    if (worldLayer) {
      worldLayer.setCollisionByProperty({ collides: true });
    }

    // Store reference
    (this.phaserScene as any).tilemap = tilemap;
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
