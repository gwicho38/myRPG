import { Scene } from 'phaser';

import * as assets from '../assets';
import { key } from '../constants';

export class Boot extends Scene {
  constructor() {
    super(key.scene.boot);
  }

  preload() {
    this.load.spritesheet(key.image.spaceman, assets.sprites.spaceman, {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image(key.image.tuxemon, assets.tilesets.tuxemon);
    this.load.tilemapTiledJSON(key.tilemap.tuxemon, assets.tilemaps.tuxemon);

    // Load generated maps
    this.load.tilemapTiledJSON(
      'generated-greenwood-city',
      assets.tilemaps.greenwoodCity,
    );
    this.load.tilemapTiledJSON(
      'generated-mystic-forest',
      assets.tilemaps.mysticForest,
    );
    this.load.tilemapTiledJSON(
      'generated-crystal-cave',
      assets.tilemaps.crystalCave,
    );
    this.load.tilemapTiledJSON(
      'generated-desert-oasis',
      assets.tilemaps.desertOasis,
    );

    this.load.atlas(key.atlas.player, assets.atlas.image, assets.atlas.data);
  }

  create() {
    this.scene.start(key.scene.main);
  }
}
