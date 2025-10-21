import Phaser from 'phaser';
import { NeverquestWarp } from '../plugins/NeverquestWarp';
import { NeverquestObjectMarker } from '../plugins/NeverquestObjectMarker';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { NeverquestEnvironmentParticles } from '../plugins/NeverquestEnvironmentParticles';
import { NeverquestEnemyZones } from '../plugins/NeverquestEnemyZones';
import { NeverquestMapCreator } from '../plugins/NeverquestMapCreator';
import { NeverquestSaveManager } from '../plugins/NeverquestSaveManager';

export class MainScene extends Phaser.Scene {
	player: any;
	mapCreator: NeverquestMapCreator | null;
	map: Phaser.Tilemaps.Tilemap | null;
	joystickScene: Phaser.Scene | null;
	particles: NeverquestEnvironmentParticles | null;
	themeSound: Phaser.Sound.BaseSound | null;
	enemies: any[];
	neverquestEnemyZones: NeverquestEnemyZones | null;
	saveManager: NeverquestSaveManager | null;

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
		this.neverquestEnemyZones = null;
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

		this.mapCreator = new NeverquestMapCreator(this);
		this.mapCreator.create();

		// Store map reference for other systems
		this.map = this.mapCreator.map;

		const camera = this.cameras.main;
		camera.startFollow(this.player.container);

		// Note: Do not set camera bounds for infinite maps (larus uses infinite: true)
		// Infinite maps have negative coordinate chunks and setting bounds would break movement

		const neverquestWarp = new NeverquestWarp(this, this.player, this.mapCreator.map);
		neverquestWarp.createWarps();
		const interactiveMarkers = new NeverquestObjectMarker(this, this.mapCreator.map);
		interactiveMarkers.create();

		this.scene.launch('DialogScene', {
			player: this.player,
			map: this.mapCreator.map,
			scene: this,
		});

		this.joystickScene = this.scene.get('JoystickScene');

		this.scene.launch('HUDScene', { player: this.player, map: this.mapCreator.map });

		(this.sys as any).animatedTiles.init(this.mapCreator.map);
		this.particles = new NeverquestEnvironmentParticles(this, this.mapCreator.map);
		this.particles.create();

		// this.outlineEffect = new NeverquestOutlineEffect(this);

		this.sound.volume = 0.35;
		this.themeSound = this.sound.add('path_to_lake_land', {
			loop: true,
		});
		this.themeSound.play();

		this.enemies = [];

		this.neverquestEnemyZones = new NeverquestEnemyZones(this, this.mapCreator.map);
		this.neverquestEnemyZones.create();

		this.saveManager = new NeverquestSaveManager(this);
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
