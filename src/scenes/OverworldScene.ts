import Phaser from 'phaser';
import { LuminusWarp } from '../plugins/LuminusWarp';
import { LuminusObjectMarker } from '../plugins/LuminusObjectMarker';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { LuminusEnvironmentParticles } from '../plugins/LuminusEnvironmentParticles';
import { LuminusEnemyZones } from '../plugins/LuminusEnemyZones';
import { LuminusMapCreator } from '../plugins/LuminusMapCreator';
import { LuminusSaveManager } from '../plugins/LuminusSaveManager';

export class OverworldScene extends Phaser.Scene {
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
			key: 'OverworldScene',
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
		this.cameras.main.setZoom(2.5);

		this.mapCreator = new LuminusMapCreator(this, 'overworld');
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

		this.sound.volume = 0.35;
		this.themeSound = this.sound.add('forest', {
			loop: true,
		});
		this.themeSound.play();

		this.enemies = [];

		this.luminusEnemyZones = new LuminusEnemyZones(this, this.mapCreator.map);
		this.luminusEnemyZones.create();

		this.saveManager = new LuminusSaveManager(this);
		this.saveManager.create();
		this.setupSaveKeybinds();
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
		});
	}

	stopSceneMusic(): void {
		this.themeSound!.stop();
	}

	update(): void {
		// Overworld-specific update logic can be added here
	}
}
