import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { LuminusDungeonGenerator } from '../plugins/LuminusDungeonGenerator';
import { LuminusFogWarManager } from '../plugins/LuminusFogWarManager';
import { LuminusSaveManager } from '../plugins/LuminusSaveManager';
import { Enemy } from '../entities/Enemy';
import { PlayerConfig } from '../consts/player/Player';

export class DungeonScene extends Phaser.Scene {
	dungeon!: LuminusDungeonGenerator;
	player!: Player;
	enemies: Enemy[];
	themeSong!: Phaser.Sound.BaseSound;
	ambientSound!: Phaser.Sound.BaseSound;
	fog!: LuminusFogWarManager;
	saveManager!: LuminusSaveManager;
	exitPortal!: Phaser.GameObjects.Zone;
	previousScene: string = 'MainScene'; // Track which scene to return to

	constructor() {
		super({
			key: 'DungeonScene',
		});
		this.enemies = [];
	}

	/**
	 * Initialize scene with data from previous scene
	 */
	init(data: { previousScene?: string }): void {
		if (data && data.previousScene) {
			this.previousScene = data.previousScene;
		}
	}

	/**
	 * Creates the Dungeon Scene
	 */
	create(): void {
		this.dungeon = new LuminusDungeonGenerator(this);
		this.dungeon.create();

		this.player = new Player(
			this,
			this.dungeon.map.widthInPixels / 2,
			this.dungeon.map.heightInPixels / 2,
			PlayerConfig.texture,
			this.dungeon.map
		);

		this.cameras.main.startFollow(this.player.container);
		this.cameras.main.setZoom(2.5);
		// camera.setBounds(
		//     0,
		//     0,
		//     this.dungeon.map.widthInPixels,
		//     this.dungeon.map.heightInPixels
		// );

		this.physics.add.collider(this.player.container, this.dungeon.groundLayer);
		// if (!this.scene.isActive('JoystickScene')) {
		//     this.scene.launch('JoystickScene', {
		//         player: this.player,
		//         map: this.dungeon.map,
		//     });
		// }
		this.scene.launch('DialogScene', {
			player: this.player,
			map: this.dungeon.map,
			scene: this,
		});

		this.scene.launch('HUDScene', { player: this.player });
		this.enemies = [];
		this.dungeon.dungeon.rooms.forEach((room) => {
			const spriteBounds = Phaser.Geom.Rectangle.Inflate(
				new Phaser.Geom.Rectangle(
					(room.x + 1) * this.dungeon.tileWidth,
					(room.y + 1) * this.dungeon.tileWidth,
					(room.width - 3) * this.dungeon.tileWidth,
					(room.height - 3) * this.dungeon.tileWidth
				),
				0,
				0
			);
			for (let i = 0; i < 5; i++) {
				const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
				const enemy = new Enemy(this, pos.x, pos.y, 'bat', 2);
				this.enemies.push(enemy);
			}
		});

		this.physics.add.collider(this.player.container, this.enemies);

		this.sound.volume = 0.4;

		this.themeSong = this.sound.add('dark_theme', {
			loop: true,
		});
		this.themeSong.play();

		this.ambientSound = this.sound.add('dungeon_ambient', {
			volume: 1,
			loop: true,
		});
		this.ambientSound.play();

		this.fog = new LuminusFogWarManager(this, this.dungeon.map, this.player);
		this.fog.createFog();

		this.saveManager = new LuminusSaveManager(this);
		this.saveManager.create();
		this.setupSaveKeybinds();

		// Create exit portal in the last room
		this.createExitPortal();
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

	createExitPortal(): void {
		// Place exit portal in the first room (starting room) for easy access
		// Players spawn in center, so offset the exit to the side
		const firstRoom = this.dungeon.dungeon.rooms[0];
		const exitTileX = firstRoom.left + 2; // Near the left wall
		const exitTileY = firstRoom.top + 2; // Near the top wall
		const exitX = (exitTileX + 0.5) * this.dungeon.tileWidth;
		const exitY = (exitTileY + 0.5) * this.dungeon.tileWidth;

		// Place stairs tile (tile index 81 from DungeonTiles STAIRS)
		this.dungeon.stuffLayer!.putTileAt(81, exitTileX, exitTileY);

		// Add animated particles around the stairs (green upward particles)
		const particlesConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
			angle: { min: -100, max: -80 }, // Upward angle
			frequency: 200,
			speed: { min: 30, max: 60 },
			x: { min: -12, max: 12 },
			y: { min: -12, max: 12 },
			lifespan: { min: 1000, max: 2000 },
			scale: { start: 1.2, end: 0.3 },
			alpha: { start: 0.9, end: 0 },
			tint: 0x00ff88, // Bright green-cyan for exit
		};

		this.add.particles(exitX, exitY, 'particle_warp', particlesConfig);

		// Add arrow indicators pointing up around the stairs
		this.createExitArrows(exitX, exitY);

		// Create a larger interactive zone for easier access
		this.exitPortal = this.add.zone(exitX, exitY, 64, 64);
		this.physics.add.existing(this.exitPortal);
		(this.exitPortal.body as Phaser.Physics.Arcade.Body).immovable = true;

		// Add collision with player to exit dungeon
		this.physics.add.overlap(this.player.container, this.exitPortal, () => {
			this.exitDungeon();
		});
	}

	createExitArrows(x: number, y: number): void {
		// Add "EXIT" text label above the stairs
		const exitLabel = this.add
			.text(x, y - 35, 'EXIT', {
				fontSize: '16px',
				color: '#00ff88',
				fontStyle: 'bold',
				stroke: '#000000',
				strokeThickness: 3,
			})
			.setOrigin(0.5)
			.setDepth(100);

		// Pulse the label
		this.tweens.add({
			targets: exitLabel,
			alpha: 0.5,
			scale: 1.1,
			duration: 800,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});

		// Create large arrow indicators using text (↑) positioned around the exit
		const arrowPositions = [
			{ x: x - 30, y: y - 30 },
			{ x: x + 30, y: y - 30 },
			{ x: x - 30, y: y + 30 },
			{ x: x + 30, y: y + 30 },
		];

		arrowPositions.forEach((pos) => {
			const arrow = this.add
				.text(pos.x, pos.y, '↑', {
					fontSize: '32px',
					color: '#00ff88',
					fontStyle: 'bold',
					stroke: '#000000',
					strokeThickness: 2,
				})
				.setOrigin(0.5)
				.setDepth(100);

			// Animate arrows bobbing up and down
			this.tweens.add({
				targets: arrow,
				y: pos.y - 10,
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut',
			});

			// Pulse alpha
			this.tweens.add({
				targets: arrow,
				alpha: 0.4,
				duration: 1000,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut',
			});
		});
	}

	exitDungeon(): void {
		// Fade out
		this.cameras.main.fade(300);
		this.cameras.main.once('camerafadeoutcomplete', () => {
			// Stop sounds
			if (this.themeSong) {
				this.themeSong.stop();
			}
			if (this.ambientSound) {
				this.ambientSound.stop();
			}

			// Clean up player
			if (this.player) {
				this.player.luminusMovement = null;
				this.player.destroy();
			}

			// Switch back to previous scene
			this.scene.start(this.previousScene);
		});
	}

	update(): void {
		this.fog.updateFog();
	}
}
