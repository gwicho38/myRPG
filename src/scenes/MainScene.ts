import Phaser from 'phaser';
import { LuminusWarp } from '../plugins/LuminusWarp';
import { LuminusObjectMarker } from '../plugins/LuminusObjectMarker';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { LuminusEnvironmentParticles } from '../plugins/LuminusEnvironmentParticles';
import { LuminusEnemyZones } from '../plugins/LuminusEnemyZones';
import { LuminusMapCreator } from '../plugins/LuminusMapCreator';
import { LuminusSaveManager } from '../plugins/LuminusSaveManager';

export class MainScene extends Phaser.Scene {
	player: any;
	mapCreator: LuminusMapCreator | null;
	map: Phaser.Tilemaps.Tilemap | null;
	joystickScene: Phaser.Scene | null;
	particles: LuminusEnvironmentParticles | null;
	themeSound: Phaser.Sound.BaseSound | null;
	enemies: any[];
	luminusEnemyZones: LuminusEnemyZones | null;
	saveManager: LuminusSaveManager | null;

	constructor() {
		super({
			key: 'MainScene',
		});
		this.player = null;
		this.mapCreator = null;
		this.map = null;
		this.joystickScene = null;
		this.particles = null;
		this.themeSound = null;
		this.enemies = [];
		this.luminusEnemyZones = null;
		this.saveManager = null;
	}

	preload(): void {
		this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
	}

	create(): void {
		// if (
		//     !this.scale.isFullscreen && !this.sys.game.device.os.desktop
		//         ? true
		//         : false
		// ) {
		//     this.scale.startFullscreen();
		// }

		this.cameras.main.setZoom(2.5);

		this.mapCreator = new LuminusMapCreator(this);
		this.mapCreator.create();

		// Store map reference for other systems
		this.map = this.mapCreator.map;

		const camera = this.cameras.main;
		camera.startFollow(this.player.container);

		const luminusWarp = new LuminusWarp(this, this.player, this.mapCreator.map);
		luminusWarp.createWarps();
		const interactiveMarkers = new LuminusObjectMarker(this, this.mapCreator.map);
		interactiveMarkers.create();

		this.scene.launch('DialogScene', {
			player: this.player,
			map: this.mapCreator.map,
			scene: this,
		});

		this.joystickScene = this.scene.get('JoystickScene');

		this.scene.launch('HUDScene', { player: this.player, map: this.mapCreator.map });

		(this.sys as any).animatedTiles.init(this.mapCreator.map);
		this.particles = new LuminusEnvironmentParticles(this, this.mapCreator.map);
		this.particles.create();

		// this.outlineEffect = new LuminusOutlineEffect(this);

		this.sound.volume = 0.35;
		this.themeSound = this.sound.add('path_to_lake_land', {
			loop: true,
		});
		this.themeSound.play();

		this.enemies = [];

		this.luminusEnemyZones = new LuminusEnemyZones(this, this.mapCreator.map);
		this.luminusEnemyZones.create();

		this.saveManager = new LuminusSaveManager(this);
		this.saveManager.create();

		this.setupSaveKeybinds();

		// new Item(this, this.player.container.x, this.player.container.y - 40, 2);
		// new Item(this, this.player.container.x, this.player.container.y - 50, 2);
		// new Item(this, this.player.container.x, this.player.container.y - 60, 1);
	}

	stopSceneMusic(): void {
		this.themeSound!.stop();
	}

	setupSaveKeybinds(): void {
		this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
			if (event.ctrlKey && event.key === 's') {
				event.preventDefault();
				this.saveManager!.saveGame(false);
			}
			if (event.ctrlKey && event.key === 'l') {
				event.preventDefault();
				const saveData = this.saveManager!.loadGame(false);
				if (saveData) {
					this.saveManager!.applySaveData(saveData);
				}
			}
			if (event.key === 'F5') {
				event.preventDefault();
				const saveData = this.saveManager!.loadGame(true);
				if (saveData) {
					this.saveManager!.applySaveData(saveData);
				} else {
					this.saveManager!.showSaveNotification('No checkpoint found', true);
				}
			}
			// Debug: Manual auto-save trigger with F6
			if (event.key === 'F6') {
				event.preventDefault();
				this.saveManager!.createCheckpoint();
			}
		});
	}

	update(): void {
		// this.outlineEffect.removeEffect(this.player.container);
		// this.physics.overlap(
		//     this.player,
		//     this.overplayer_layer,
		//     () => {
		//         this.outlineEffect.applyEffect(this.player.container);
		//     },
		//     (hitZone, tile) => tile.index > -1
		// );
	}
}
