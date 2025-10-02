import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
	playerLevel: number | null;
	lastScene: string | null;
	restartButton: Phaser.GameObjects.Text | null;
	gameOverText: Phaser.GameObjects.Text | null;

	constructor() {
		super({
			key: 'GameOverScene',
		});
		this.playerLevel = null;
		this.lastScene = null;
		this.restartButton = null;
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
			.text(width / 2, height / 2 + 40, 'RESTART GAME', {
				fontSize: '32px',
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

		// Restart game on click
		this.restartButton.on('pointerdown', () => {
			this.restartGame();
		});

		// Also allow restart with Enter/Space key
		this.input.keyboard?.once('keydown-ENTER', () => {
			this.restartGame();
		});

		this.input.keyboard?.once('keydown-SPACE', () => {
			this.restartGame();
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
}
