import Phaser from 'phaser';
import { LuminusWarp } from '../plugins/LuminusWarp';
import { LuminusObjectMarker } from '../plugins/LuminusObjectMarker';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { LuminusEnvironmentParticles } from '../plugins/LuminusEnvironmentParticles';
import { LuminusEnemyZones } from '../plugins/LuminusEnemyZones';
import { LuminusMapCreator } from '../plugins/LuminusMapCreator';
import { LuminusSaveManager } from '../plugins/LuminusSaveManager';
import { Player } from '../entities/Player';
import { IGameScene } from '../types/SceneTypes';

export class CaveScene extends Phaser.Scene implements IGameScene {
	public player: Player | null = null;
	public map?: Phaser.Tilemaps.Tilemap;
	public mapCreator?: LuminusMapCreator;
	public joystickScene: any;
	public particles!: LuminusEnvironmentParticles;
	public themeSound!: Phaser.Sound.BaseSound;
	public enemies: any[] = [];
	public luminusEnemyZones!: LuminusEnemyZones;
	public saveManager!: LuminusSaveManager;

	constructor() {
		super({
			key: 'CaveScene',
		});
	}

	preload(): void {
		this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
	}

	create(): void {
		this.cameras.main.setZoom(2.5);

		this.mapCreator = new LuminusMapCreator(this, 'cave_dungeon');
		this.mapCreator.create();

		// Store map reference for other systems
		this.map = this.mapCreator.map;

		const camera = this.cameras.main;
		camera.startFollow(this.player!.container);

		// Set camera bounds to match the map size so camera doesn't go beyond the map edges
		camera.setBounds(0, 0, this.map!.widthInPixels, this.map!.heightInPixels);

		const luminusWarp = new LuminusWarp(this as any, this.player! as any, this.mapCreator.map);
		luminusWarp.createWarps();
		const interactiveMarkers = new LuminusObjectMarker(this, this.mapCreator.map);
		interactiveMarkers.create();

		this.scene.launch('DialogScene', {
			player: this.player,
			map: this.mapCreator.map,
			scene: this,
		});

		this.joystickScene = this.scene.get('JoystickScene');

		this.scene.launch('HUDScene', { player: this.player, map: this.mapCreator!.map });

		(this.sys as any).animatedTiles.init(this.mapCreator.map);
		this.particles = new LuminusEnvironmentParticles(this, this.mapCreator.map);
		this.particles.create();

		this.sound.volume = 0.35;
		this.themeSound = this.sound.add('dungeon_ambient', {
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
				this.saveManager.saveGame(false);
			}
			if (event.ctrlKey && event.key === 'l') {
				event.preventDefault();
				const saveData = this.saveManager.loadGame(false);
				if (saveData) {
					this.saveManager.applySaveData(saveData);
				}
			}
			if (event.key === 'F5') {
				event.preventDefault();
				const saveData = this.saveManager.loadGame(true);
				if (saveData) {
					this.saveManager.applySaveData(saveData);
				} else {
					this.saveManager.showSaveNotification('No checkpoint found', true);
				}
			}
		});
	}

	stopSceneMusic(): void {
		this.themeSound.stop();
	}

	update(): void {
		// Cave-specific update logic can be added here
	}
}
