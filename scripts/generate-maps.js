/**
 * Simple Map Generation Script (JavaScript)
 * Generates sample tilemaps for the RPG game
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import tileset configurations
import { getCollisionTileIds, TILESETS } from '../src/constants/tilesets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple tilemap generator
class SimpleTilemapGenerator {
  static generateCity(name, width = 40, height = 40, tilesetId = 'tuxemon') {
    const totalTiles = width * height;

    // Generate grass background
    // const grassData = new Array(totalTiles).fill(126);

    // Generate city layer with some structures
    const cityData = [];
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

        cityData.push(tileId);
      }
    }

    // Empty above layer
    // const aboveData = new Array(totalTiles).fill(0);

    return {
      compressionlevel: -1,
      height: height,
      infinite: false,
      layers: [
        {
          data: new Array(totalTiles).fill(126),
          height: height,
          id: 1,
          name: 'Below Player',
          opacity: 1,
          type: 'tilelayer',
          visible: true,
          width: width,
          x: 0,
          y: 0,
        },
        {
          data: cityData,
          height: height,
          id: 2,
          name: 'World',
          opacity: 1,
          type: 'tilelayer',
          visible: true,
          width: width,
          x: 0,
          y: 0,
        },
        {
          data: new Array(totalTiles).fill(0),
          height: height,
          id: 3,
          name: 'Above Player',
          opacity: 1,
          type: 'tilelayer',
          visible: true,
          width: width,
          x: 0,
          y: 0,
        },
        {
          draworder: 'topdown',
          id: 4,
          name: 'Objects',
          objects: [
            {
              height: 0,
              id: 1,
              name: 'Spawn Point',
              properties: [],
              rotation: 0,
              type: '',
              visible: true,
              width: 0,
              x: width * 16,
              y: height * 16,
            },
            {
              height: 28,
              id: 2,
              name: 'Sign',
              properties: [
                {
                  name: 'text',
                  type: 'string',
                  value: `Welcome to ${name}!`,
                },
              ],
              rotation: 0,
              type: '',
              visible: true,
              width: 24,
              x: width * 16 - 12,
              y: height * 16 - 20,
            },
          ],
          opacity: 1,
          type: 'objectgroup',
          visible: true,
          x: 0,
          y: 0,
        },
      ],
      nextlayerid: 5,
      nextobjectid: 3,
      orientation: 'orthogonal',
      renderorder: 'right-down',
      tiledversion: '1.10.2',
      tileheight: 32,
      tilewidth: 32,
      tilesets: [SimpleTilemapGenerator.getTilesetConfig(tilesetId)],
      type: 'map',
      version: '1.10',
      width: width,
      properties: [
        {
          name: 'edges',
          type: 'string',
          value: 'clamped',
        },
      ],
    };
  }

  static generateForest(name, width = 40, height = 40, tilesetId = 'tuxemon') {
    // const totalTiles = width * height;

    // Generate grass background
    // const grassData = new Array(totalTiles).fill(126);

    // Generate forest layer with trees
    const forestData = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let tileId = 126; // Default grass

        // Add trees randomly
        if (Math.random() < 0.3) {
          tileId = 200; // Tree tile
        }

        forestData.push(tileId);
      }
    }

    // Empty above layer
    // const aboveData = new Array(totalTiles).fill(0);

    const tilemap = SimpleTilemapGenerator.generateCity(
      name,
      width,
      height,
      tilesetId,
    );
    tilemap.layers[1].data = forestData;
    tilemap.layers[3].objects[1].properties[0].value = `Deep ${name} Forest`;

    return tilemap;
  }

  static generateCave(name, width = 40, height = 40, tilesetId = 'tuxemon') {
    const totalTiles = width * height;

    // Generate stone background
    const stoneData = new Array(totalTiles).fill(50);

    // Generate cave layer
    const caveData = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let tileId = 50; // Default stone

        // Add cave features
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          tileId = 100; // Cave wall
        } else if (Math.random() < 0.1) {
          tileId = 150; // Cave feature
        }

        caveData.push(tileId);
      }
    }

    // Empty above layer
    // const aboveData = new Array(totalTiles).fill(0);

    const tilemap = SimpleTilemapGenerator.generateCity(
      name,
      width,
      height,
      tilesetId,
    );
    tilemap.layers[0].data = stoneData;
    tilemap.layers[1].data = caveData;
    tilemap.layers[3].objects[1].properties[0].value = `${name} Cave Entrance`;

    return tilemap;
  }

  static getTilesetConfig(tilesetId) {
    const tileset = TILESETS[tilesetId];
    if (!tileset) {
      throw new Error(`Tileset '${tilesetId}' not found`);
    }

    const collisionTileIds = getCollisionTileIds(tilesetId);
    const tiles = collisionTileIds.map((id) => ({
      id: id - 1, // Tiled uses 0-based indexing internally
      properties: [{ name: 'collides', type: 'bool', value: true }],
    }));

    return {
      columns: tileset.columns,
      firstgid: 1,
      grid: {
        height: 16,
        orientation: 'orthogonal',
        width: 16,
      },
      image: `../tilesets/${tileset.filename}`,
      imageheight:
        tileset.rows * tileset.tileHeight +
        (tileset.rows - 1) * tileset.spacing +
        2 * tileset.margin,
      imagewidth:
        tileset.columns * tileset.tileWidth +
        (tileset.columns - 1) * tileset.spacing +
        2 * tileset.margin,
      margin: tileset.margin,
      name: tileset.id,
      spacing: tileset.spacing,
      tilecount: tileset.totalTiles,
      tileheight: tileset.tileHeight,
      tiles: tiles,
      tilewidth: tileset.tileWidth,
    };
  }
}

// Main execution
async function main() {
  const outputDir = path.join(__dirname, '../src/assets/tilemaps/generated');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // console.log('🎮 Generating sample tilemaps...\n');

  // Generate sample maps with different tilesets
  const maps = [
    {
      name: 'Greenwood City',
      type: 'city',
      generator: SimpleTilemapGenerator.generateCity,
      tileset: 'tuxemon',
    },
    {
      name: 'Medieval Castle',
      type: 'city',
      generator: SimpleTilemapGenerator.generateCity,
      tileset: 'medieval',
    },
    {
      name: 'Mystic Forest',
      type: 'forest',
      generator: SimpleTilemapGenerator.generateForest,
      tileset: 'nature',
    },
    {
      name: 'Dark Dungeon',
      type: 'cave',
      generator: SimpleTilemapGenerator.generateCave,
      tileset: 'dungeon',
    },
    {
      name: 'Sci-Fi Station',
      type: 'city',
      generator: SimpleTilemapGenerator.generateCity,
      tileset: 'scifi',
    },
  ];

  for (const map of maps) {
    // console.log(`🗺️  Generating ${map.name} with ${map.tileset} tileset...`);

    const tilemap = map.generator(map.name, 40, 40, map.tileset);
    const filename = `${map.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(tilemap, null, 2));
    // console.log(`   ✅ Saved to: ${filepath}`);
  }

  // console.log('\n✅ All maps generated successfully!');
  // console.log('\n📖 Usage Instructions:');
  // console.log('1. Press "M" in-game to open the map selector');
  // console.log('2. Use the navigation buttons or click on maps to switch');
  // console.log('3. Each map has different terrain and objects');
  // console.log(
  //   '4. Generated maps are stored in: src/assets/tilemaps/generated/',
  // );
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(() => {
    // console.error(error);
    process.exit(1);
  });
}

export { SimpleTilemapGenerator };
