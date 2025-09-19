/**
 * Map Generation Script
 * Generates sample tilemaps for the RPG game
 */

import * as fs from 'fs';
import * as path from 'path';

import { AVAILABLE_MAPS, MapConfig } from '../constants/maps';
import { TilemapGenerator } from '../utils/tilemapGenerator';

class MapGeneratorScript {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(
      __dirname,
      '../../src/assets/tilemaps/generated',
    );
    this.ensureOutputDir();
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate all predefined maps
   */
  async generateAllMaps(): Promise<void> {
    console.log('🎮 Generating tilemaps for RPG game...\n');

    for (const mapConfig of AVAILABLE_MAPS) {
      if (mapConfig.id === 'tuxemon-town') {
        console.log(`⏭️  Skipping ${mapConfig.name} (using original)`);
        continue;
      }

      await this.generateMap(mapConfig);
    }

    console.log('\n✅ All maps generated successfully!');
    this.printUsageInstructions();
  }

  /**
   * Generate a single map
   */
  private async generateMap(mapConfig: MapConfig): Promise<void> {
    console.log(`🗺️  Generating ${mapConfig.name}...`);

    let generatedMap;

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
        console.log(`❌ Unknown map type: ${mapConfig.type}`);
        return;
    }

    // Add custom objects if specified
    if (mapConfig.objects) {
      const objectsLayer = generatedMap.layers.find(
        (layer) => layer.name === 'Objects',
      );
      if (objectsLayer && 'objects' in objectsLayer) {
        objectsLayer.objects = mapConfig.objects.map((obj, index) => ({
          height: (obj as any).height || 0,
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
          width: (obj as any).width || 0,
          x: obj.x,
          y: obj.y,
        }));
      }
    }

    // Save to file
    const filename = `${mapConfig.id}.json`;
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(generatedMap, null, 2));
    console.log(`   ✅ Saved to: ${filepath}`);
  }

  /**
   * Generate a custom map
   */
  async generateCustomMap(
    name: string,
    type: 'city' | 'forest' | 'cave',
    width: number = 40,
    height: number = 40,
  ): Promise<void> {
    console.log(`🎨 Generating custom ${type} map: ${name}...`);

    let generatedMap;

    switch (type) {
      case 'city':
        generatedMap = TilemapGenerator.generateCity(name, width, height);
        break;
      case 'forest':
        generatedMap = TilemapGenerator.generateForest(name, width, height);
        break;
      case 'cave':
        generatedMap = TilemapGenerator.generateCave(name, width, height);
        break;
    }

    const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(generatedMap, null, 2));
    console.log(`✅ Custom map saved to: ${filepath}`);
  }

  /**
   * Print usage instructions
   */
  private printUsageInstructions(): void {
    console.log('\n📖 Usage Instructions:');
    console.log('1. Press "M" in-game to open the map selector');
    console.log('2. Use the navigation buttons or click on maps to switch');
    console.log('3. Each map has different terrain and objects');
    console.log(
      '4. Generated maps are stored in: src/assets/tilemaps/generated/',
    );
    console.log('\n🎮 Available Maps:');
    AVAILABLE_MAPS.forEach((map) => {
      const icon =
        map.type === 'city' ? '🏙️' : map.type === 'forest' ? '🌲' : '🕳️';
      console.log(`   ${icon} ${map.name} - ${map.description}`);
    });
  }

  /**
   * List generated maps
   */
  listGeneratedMaps(): void {
    console.log('📁 Generated Maps:');

    if (!fs.existsSync(this.outputDir)) {
      console.log('   No generated maps found.');
      return;
    }

    const files = fs.readdirSync(this.outputDir);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.log('   No generated maps found.');
      return;
    }

    jsonFiles.forEach((file) => {
      const filepath = path.join(this.outputDir, file);
      const stats = fs.statSync(filepath);
      console.log(`   📄 ${file} (${this.formatFileSize(stats.size)})`);
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

// CLI interface
async function main() {
  const generator = new MapGeneratorScript();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await generator.generateAllMaps();
  } else if (args[0] === 'list') {
    generator.listGeneratedMaps();
  } else if (args[0] === 'custom' && args.length >= 3) {
    const name = args[1];
    const type = args[2] as 'city' | 'forest' | 'cave';
    const width = args[3] ? parseInt(args[3]) : 40;
    const height = args[4] ? parseInt(args[4]) : 40;

    await generator.generateCustomMap(name, type, width, height);
  } else {
    console.log('Usage:');
    console.log(
      '  npm run generate-maps              # Generate all predefined maps',
    );
    console.log('  npm run generate-maps list         # List generated maps');
    console.log(
      '  npm run generate-maps custom <name> <type> [width] [height]  # Generate custom map',
    );
    console.log('');
    console.log('Examples:');
    console.log('  npm run generate-maps custom "Ice City" city 50 50');
    console.log('  npm run generate-maps custom "Dark Forest" forest 60 40');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { MapGeneratorScript };
