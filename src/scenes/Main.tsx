import Phaser from 'phaser';
import { render } from 'phaser-jsx';

import { MapSelector, TilemapDebug, Typewriter } from '../components';
import {
  Depth,
  key,
  TilemapLayer,
  TilemapObject,
  TILESET_NAME,
} from '../constants';
import { MapManager } from '../managers/MapManager';
import { Player } from '../sprites';
import { state } from '../state';

interface Sign extends Phaser.Physics.Arcade.StaticBody {
  text?: string;
}

export class Main extends Phaser.Scene {
  private player!: Player;
  private sign!: Sign;
  private tilemap!: Phaser.Tilemaps.Tilemap;
  private worldLayer!: Phaser.Tilemaps.TilemapLayer;
  private mapManager!: MapManager;
  private showMapSelector: boolean = false;
  private lastKeyPressTime: number = 0;
  private keyDebounceDelay: number = 300;
  private playerWorldCollider!: Phaser.Physics.Arcade.Collider;

  constructor() {
    super(key.scene.main);
  }

  create() {
    // Initialize map manager
    this.mapManager = new MapManager(this);

    // Load default map
    this.loadDefaultMap();

    // Set the default map in MapManager
    this.mapManager.setCurrentMap('tuxemon-town');

    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.pause(key.scene.main);
      this.scene.launch(key.scene.menu);
    });

    // Toggle map selector with 'M' key (with debouncing)
    this.input.keyboard!.on('keydown-M', () => {
      const currentTime = Date.now();
      if (currentTime - this.lastKeyPressTime < this.keyDebounceDelay) {
        return;
      }
      this.lastKeyPressTime = currentTime;

      this.showMapSelector = !this.showMapSelector;
      this.renderUI();
    });
  }

  private async loadDefaultMap() {
    // Load the original tuxemon town map
    this.tilemap = this.make.tilemap({ key: key.tilemap.tuxemon });

    // Parameters are the name you gave the tileset in Tiled and
    // the key of the tileset image in Phaser's cache (name used in preload)
    const tileset = this.tilemap.addTilesetImage(
      TILESET_NAME,
      key.image.tuxemon,
    )!;

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    this.tilemap.createLayer(TilemapLayer.BelowPlayer, tileset, 0, 0);
    this.worldLayer = this.tilemap.createLayer(
      TilemapLayer.World,
      tileset,
      0,
      0,
    )!;
    const aboveLayer = this.tilemap.createLayer(
      TilemapLayer.AbovePlayer,
      tileset,
      0,
      0,
    )!;

    this.worldLayer.setCollisionByProperty({ collides: true });
    this.physics.world.bounds.width = this.worldLayer.width;
    this.physics.world.bounds.height = this.worldLayer.height;

    // By default, everything gets depth sorted on the screen in the order we created things.
    // We want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(Depth.AbovePlayer);

    this.addPlayer();

    // Set the bounds of the camera
    this.cameras.main.setBounds(
      0,
      0,
      this.tilemap.widthInPixels,
      this.tilemap.heightInPixels,
    );

    this.renderUI();

    state.isTypewriting = true;
    render(
      <Typewriter
        text="WASD or arrow keys to move. Press 'M' to open map selector."
        onEnd={() => (state.isTypewriting = false)}
      />,
      this,
    );
  }

  private renderUI() {
    render(<TilemapDebug tilemapLayer={this.worldLayer} />, this);

    if (this.showMapSelector) {
      render(
        <MapSelector
          mapManager={this.mapManager}
          onMapChange={(mapConfig) => {
            this.updateMapAfterSwitch();
            // Hide map selector after successful map change
            this.showMapSelector = false;
            this.renderUI();
          }}
        />,
        this,
      );
    }
  }

  private addPlayer() {
    // Object layers in Tiled let you embed extra info into a map like a spawn point or custom collision shapes.
    // In the tmx file, there's an object layer with a point named 'Spawn Point'.
    const spawnPoint = this.tilemap.findObject(
      TilemapLayer.Objects,
      ({ name }) => name === TilemapObject.SpawnPoint,
    )!;

    this.player = new Player(this, spawnPoint.x!, spawnPoint.y!);
    this.addPlayerSignInteraction();

    // Watch the player and worldLayer for collisions
    this.playerWorldCollider = this.physics.add.collider(this.player, this.worldLayer);
  }

  private addPlayerSignInteraction() {
    const sign = this.tilemap.findObject(
      TilemapLayer.Objects,
      ({ name }) => name === TilemapObject.Sign,
    )!;

    this.sign = this.physics.add.staticBody(
      sign.x!,
      sign.y!,
      sign.width,
      sign.height,
    );
    this.sign.text = sign.properties[0].value;

    type ArcadeColliderType = Phaser.Types.Physics.Arcade.ArcadeColliderType;

    this.physics.add.overlap(
      this.sign as unknown as ArcadeColliderType,
      this.player.selector as unknown as ArcadeColliderType,
      (sign) => {
        if (this.player.cursors.space.isDown && !state.isTypewriting) {
          state.isTypewriting = true;

          render(
            <Typewriter
              text={(sign as unknown as Sign).text!}
              onEnd={() => (state.isTypewriting = false)}
            />,
            this,
          );
        }
      },
      undefined,
      this,
    );
  }

  private updateMapAfterSwitch() {
    // Get the new tilemap and worldLayer from the scene (set by MapManager)
    this.tilemap = (this as any).tilemap;
    this.worldLayer = (this as any).worldLayer;

    if (this.tilemap && this.worldLayer) {
      // Update camera bounds
      this.cameras.main.setBounds(
        0,
        0,
        this.tilemap.widthInPixels,
        this.tilemap.heightInPixels,
      );

      // Remove old collision
      if (this.playerWorldCollider) {
        this.playerWorldCollider.destroy();
      }

      // Add new collision with the new worldLayer
      this.playerWorldCollider = this.physics.add.collider(this.player, this.worldLayer);

      // Move player to spawn point
      const spawnPoint = this.mapManager.getSpawnPoint();
      if (spawnPoint && this.player) {
        this.player.setPosition(spawnPoint.x, spawnPoint.y);
      }

      // Update physics world bounds
      this.physics.world.bounds.width = this.worldLayer.width;
      this.physics.world.bounds.height = this.worldLayer.height;
    }
  }

  update() {
    this.player.update();
  }
}
