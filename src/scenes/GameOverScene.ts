import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
	playerLevel: number | null;
	lastScene: string | null;
	restartButton: Phaser.GameObjects.Text | null;
	loadCheckpointButton: Phaser.GameObjects.Text | null;
	mainMenuButton: Phaser.GameObjects.Text | null;
	gameOverText: Phaser.GameObjects.Text | null;

	constructor() {
		super({
			key: 'GameOverScene',
		});
		this.playerLevel = null;
		this.lastScene = null;
		this.restartButton = null;
		this.loadCheckpointButton = null;
		this.mainMenuButton = null;
		this.gameOverText = null;
	}

	init(data: { playerLevel?: number; lastScene?: string }): void {
		this.playerLevel = data.playerLevel || null;
		this.lastScene = data.lastScene || 'MainScene';
	}

	create(): void {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		// Semi-transparent black background
		const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
		overlay.setScrollFactor(0);
		overlay.setDepth(1000);

		// Game Over title
		this.gameOverText = this.add
			.text(width / 2, height / 3, 'GAME OVER', {
				fontSize: '64px',
				color: '#ff0000',
				fontFamily: 'Arial',
				stroke: '#000000',
				strokeThickness: 6,
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(1001);

		// Player level display
		if (this.playerLevel !== null) {
			this.add
				.text(width / 2, height / 2 - 40, `You reached Level ${this.playerLevel}`, {
					fontSize: '24px',
					color: '#ffffff',
					fontFamily: 'Arial',
				})
				.setOrigin(0.5)
				.setScrollFactor(0)
				.setDepth(1001);
		}

		// Restart button
		this.restartButton = this.add
			.text(width / 2, height / 2 + 20, '[R] RESTART GAME', {
				fontSize: '28px',
				color: '#ffffff',
				fontFamily: 'Arial',
				backgroundColor: '#333333',
				padding: { x: 20, y: 10 },
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(1001)
			.setInteractive({ useHandCursor: true });

		// Load checkpoint button
		this.loadCheckpointButton = this.add
			.text(width / 2, height / 2 + 80, '[C] LOAD CHECKPOINT', {
				fontSize: '28px',
				color: '#ffffff',
				fontFamily: 'Arial',
				backgroundColor: '#333333',
				padding: { x: 20, y: 10 },
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(1001)
			.setInteractive({ useHandCursor: true });

		// Main menu button
		this.mainMenuButton = this.add
			.text(width / 2, height / 2 + 140, '[ESC] MAIN MENU', {
				fontSize: '28px',
				color: '#ffffff',
				fontFamily: 'Arial',
				backgroundColor: '#333333',
				padding: { x: 20, y: 10 },
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(1001)
			.setInteractive({ useHandCursor: true });

		// Button hover effects
		this.restartButton.on('pointerover', () => {
			this.restartButton!.setStyle({ backgroundColor: '#555555' });
		});

		this.restartButton.on('pointerout', () => {
			this.restartButton!.setStyle({ backgroundColor: '#333333' });
		});

		this.loadCheckpointButton.on('pointerover', () => {
			this.loadCheckpointButton!.setStyle({ backgroundColor: '#555555' });
		});

		this.loadCheckpointButton.on('pointerout', () => {
			this.loadCheckpointButton!.setStyle({ backgroundColor: '#333333' });
		});

		this.mainMenuButton.on('pointerover', () => {
			this.mainMenuButton!.setStyle({ backgroundColor: '#555555' });
		});

		this.mainMenuButton.on('pointerout', () => {
			this.mainMenuButton!.setStyle({ backgroundColor: '#333333' });
		});

		// Button click handlers
		this.restartButton.on('pointerdown', () => {
			this.restartGame();
		});

		this.loadCheckpointButton.on('pointerdown', () => {
			this.loadCheckpoint();
		});

		this.mainMenuButton.on('pointerdown', () => {
			this.returnToMainMenu();
		});

		// Keyboard controls
		this.input.keyboard?.on('keydown-R', () => {
			this.restartGame();
		});

		this.input.keyboard?.on('keydown-C', () => {
			this.loadCheckpoint();
		});

		this.input.keyboard?.on('keydown-ESC', () => {
			this.returnToMainMenu();
		});

		// Animate the game over text
		this.tweens.add({
			targets: this.gameOverText,
			alpha: { from: 0, to: 1 },
			scale: { from: 0.5, to: 1 },
			duration: 1000,
			ease: 'Back.easeOut',
		});

		// Pulsing effect for game over text
		this.tweens.add({
			targets: this.gameOverText,
			scale: { from: 1, to: 1.1 },
			duration: 1000,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});
	}

	restartGame(): void {
		console.log('[GameOverScene] Restarting game...');

		// Stop this scene
		this.scene.stop('GameOverScene');

		// Stop and restart the game scene
		if (this.lastScene) {
			this.scene.stop(this.lastScene);
		}

		// Stop all other running scenes
		this.scene.stop('DialogScene');
		this.scene.stop('HUDScene');
		this.scene.stop('JoystickScene');
		this.scene.stop('InventoryScene');
		this.scene.stop('AttributeScene');

		// Restart the main scene
		// Wait a frame to ensure everything is stopped
		this.time.delayedCall(100, () => {
			this.scene.start('MainScene');
		});
	}

	loadCheckpoint(): void {
		console.log('[GameOverScene] Loading checkpoint...');

		// Get the save manager from the game registry
		const saveManager = this.game.registry.get('saveManager');

		if (saveManager && saveManager.hasCheckpoint()) {
			// Stop this scene
			this.scene.stop('GameOverScene');

			// Stop the last scene
			if (this.lastScene) {
				this.scene.stop(this.lastScene);
			}

			// Stop all other running scenes
			this.scene.stop('DialogScene');
			this.scene.stop('HUDScene');
			this.scene.stop('JoystickScene');
			this.scene.stop('InventoryScene');
			this.scene.stop('AttributeScene');

			// Load the checkpoint
			this.time.delayedCall(100, () => {
				saveManager.loadCheckpoint();
			});
		} else {
			console.warn('[GameOverScene] No checkpoint available');
			// Show a message to the user
			const noCheckpointText = this.add
				.text(this.cameras.main.width / 2, this.cameras.main.height - 100, 'No checkpoint available!', {
					fontSize: '24px',
					color: '#ff6666',
					fontFamily: 'Arial',
				})
				.setOrigin(0.5)
				.setScrollFactor(0)
				.setDepth(1002);

			// Fade out the message after 2 seconds
			this.tweens.add({
				targets: noCheckpointText,
				alpha: 0,
				duration: 500,
				delay: 2000,
				onComplete: () => {
					noCheckpointText.destroy();
				},
			});
		}
	}

	returnToMainMenu(): void {
		console.log('[GameOverScene] Returning to main menu...');

		// Stop this scene
		this.scene.stop('GameOverScene');

		// Stop the last scene
		if (this.lastScene) {
			this.scene.stop(this.lastScene);
		}

		// Stop all other running scenes
		this.scene.stop('DialogScene');
		this.scene.stop('HUDScene');
		this.scene.stop('JoystickScene');
		this.scene.stop('InventoryScene');
		this.scene.stop('AttributeScene');
		this.scene.stop('MainScene');

		// Go to main menu
		this.time.delayedCall(100, () => {
			this.scene.start('MainMenuScene');
		});
	}
}
