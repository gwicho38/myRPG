import Phaser from 'phaser';

/**
 * @class
 * Manages save/load functionality and automatic checkpoints for the game
 */
export class LuminusSaveManager {
	constructor(scene) {
		/**
		 * Scene Context.
		 * @type { Phaser.Scene }
		 */
		this.scene = scene;

		/**
		 * The key used for localStorage
		 * @type { string }
		 */
		this.saveKey = 'luminus_rpg_save';

		/**
		 * The key used for checkpoint saves
		 * @type { string }
		 */
		this.checkpointKey = 'luminus_rpg_checkpoint';

		/**
		 * Interval in milliseconds for automatic checkpoints (30 seconds for testing, change to 3*60*1000 for production)
		 * @type { number }
		 */
		this.checkpointInterval = 30 * 1000; // 30 seconds for easier testing

		/**
		 * Timer for automatic checkpoints
		 * @type { Phaser.Time.TimerEvent }
		 */
		this.checkpointTimer = null;

		/**
		 * Whether auto-save is enabled
		 * @type { boolean }
		 */
		this.autoSaveEnabled = true;
	}

	/**
	 * Initializes the save manager and starts the checkpoint timer
	 */
	create() {
		console.log('LuminusSaveManager initialized for scene:', this.scene.scene.key);
		console.log('Scene time system available:', !!this.scene.time);
		console.log('Auto-save enabled:', this.autoSaveEnabled);

		this.startCheckpointTimer();

		// Also create an immediate save to test functionality
		if (this.scene && this.scene.time) {
			this.scene.time.delayedCall(
				5000,
				() => {
					console.log('Testing auto-save after 5 seconds for scene:', this.scene.scene.key);
					this.createCheckpoint();
				},
				[],
				this
			);
		} else {
			console.error('Scene time system not available!');
		}
	}

	/**
	 * Starts the automatic checkpoint timer
	 */
	startCheckpointTimer() {
		if (this.checkpointTimer) {
			this.checkpointTimer.destroy();
		}

		if (!this.scene || !this.scene.time) {
			console.error('Cannot start timer - scene or time system not available');
			return;
		}

		console.log('Starting auto-save timer with interval:', this.checkpointInterval / 1000, 'seconds');

		try {
			this.checkpointTimer = this.scene.time.addEvent({
				delay: this.checkpointInterval,
				callback: this.createCheckpoint,
				callbackScope: this,
				loop: true,
			});

			// Log the timer status
			console.log('Auto-save timer created successfully');
			console.log('Timer details:', {
				delay: this.checkpointTimer.delay,
				loop: this.checkpointTimer.loop,
				paused: this.checkpointTimer.paused,
				hasDispatched: this.checkpointTimer.hasDispatched,
			});
		} catch (error) {
			console.error('Failed to create auto-save timer:', error);
		}
	}

	/**
	 * Stops the automatic checkpoint timer
	 */
	stopCheckpointTimer() {
		if (this.checkpointTimer) {
			this.checkpointTimer.destroy();
			this.checkpointTimer = null;
		}
	}

	/**
	 * Creates a save data object from the current game state
	 * @returns { object } The save data
	 */
	createSaveData() {
		const player = this.getPlayer();
		if (!player) {
			console.warn('No player found for saving');
			return null;
		}

		const saveData = {
			version: '1.0.0',
			timestamp: Date.now(),
			scene: this.scene.scene.key,
			player: {
				position: {
					x: player.container.x,
					y: player.container.y,
				},
				attributes: {
					...player.attributes,
				},
				items: [...player.items],
				level: player.attributes.level,
				experience: player.attributes.experience,
				health: player.attributes.health,
				rawAttributes: { ...player.attributes.rawAttributes },
				availableStatPoints: player.attributes.availableStatPoints,
			},
			gameState: {
				currentScene: this.scene.scene.key,
				playTime: this.getPlayTime(),
			},
		};

		return saveData;
	}

	/**
	 * Gets the player object from the current scene
	 * @returns { Player } The player object
	 */
	getPlayer() {
		return (
			this.scene.player ||
			this.scene.scene.get('MainScene')?.player ||
			this.scene.scene.get('TownScene')?.player ||
			this.scene.scene.get('CaveScene')?.player ||
			this.scene.scene.get('OverworldScene')?.player ||
			this.scene.scene.get('DungeonScene')?.player
		);
	}

	/**
	 * Gets the current play time (simplified version)
	 * @returns { number } Play time in milliseconds
	 */
	getPlayTime() {
		return this.scene.time.now;
	}

	/**
	 * Saves the current game state to localStorage
	 * @param { boolean } isCheckpoint Whether this is an automatic checkpoint
	 * @returns { boolean } Whether the save was successful
	 */
	saveGame(isCheckpoint = false) {
		try {
			const saveData = this.createSaveData();
			if (!saveData) {
				return false;
			}

			const key = isCheckpoint ? this.checkpointKey : this.saveKey;
			localStorage.setItem(key, JSON.stringify(saveData));

			if (!isCheckpoint) {
				this.showSaveNotification('Game Saved');
			}

			return true;
		} catch (error) {
			console.error('Failed to save game:', error);
			this.showSaveNotification('Save Failed', true);
			return false;
		}
	}

	/**
	 * Creates an automatic checkpoint
	 */
	createCheckpoint() {
		console.log('createCheckpoint called, autoSaveEnabled:', this.autoSaveEnabled);

		if (this.autoSaveEnabled) {
			const player = this.getPlayer();
			if (!player) {
				console.warn('Cannot auto-save: No player found');
				return;
			}

			const success = this.saveGame(true);
			if (success) {
				console.log('Auto-save checkpoint created at', new Date().toLocaleTimeString());
				this.showSaveNotification('Auto-Saved', false);
			} else {
				console.error('Auto-save failed');
			}
		}
	}

	/**
	 * Loads game data from localStorage
	 * @param { boolean } loadCheckpoint Whether to load the checkpoint instead of main save
	 * @returns { object|null } The loaded save data or null if failed
	 */
	loadGame(loadCheckpoint = false) {
		try {
			const key = loadCheckpoint ? this.checkpointKey : this.saveKey;
			const saveDataString = localStorage.getItem(key);

			if (!saveDataString) {
				console.log('No save data found');
				return null;
			}

			const saveData = JSON.parse(saveDataString);
			return saveData;
		} catch (error) {
			console.error('Failed to load game:', error);
			return null;
		}
	}

	/**
	 * Applies loaded save data to the current game state
	 * @param { object } saveData The save data to apply
	 */
	applySaveData(saveData) {
		if (!saveData || !saveData.player) {
			console.error('Invalid save data');
			return false;
		}

		try {
			const player = this.getPlayer();
			if (!player) {
				console.error('No player found to apply save data to');
				return false;
			}

			// Apply player position
			player.container.setPosition(saveData.player.position.x, saveData.player.position.y);

			// Apply player attributes
			Object.assign(player.attributes, saveData.player.attributes);

			// Apply items
			player.items = [...saveData.player.items];

			// Update health bar if it exists
			if (player.healthBar) {
				player.healthBar.setValue(player.attributes.health);
			}

			// Switch to the saved scene if different
			if (saveData.scene !== this.scene.scene.key) {
				this.scene.scene.start(saveData.scene);
			}

			this.showSaveNotification('Game Loaded');
			return true;
		} catch (error) {
			console.error('Failed to apply save data:', error);
			this.showSaveNotification('Load Failed', true);
			return false;
		}
	}

	/**
	 * Shows a save/load notification to the player
	 * @param { string } message The message to show
	 * @param { boolean } isError Whether this is an error message
	 */
	showSaveNotification(message, isError = false) {
		const color = isError ? '#ff4444' : '#44ff44';

		const notification = this.scene.add.text(this.scene.cameras.main.width / 2, 80, message, {
			fontSize: '20px',
			fontFamily: '"Press Start 2P"',
			color: color,
			backgroundColor: 'rgba(0, 0, 0, 0.9)',
			padding: { x: 15, y: 10 },
		});

		notification.setOrigin(0.5, 0.5);
		notification.setScrollFactor(0);
		notification.setDepth(999999);

		// Fade out after 2 seconds
		this.scene.tweens.add({
			targets: notification,
			alpha: 0,
			duration: 2000,
			delay: 1000,
			onComplete: () => {
				notification.destroy();
			},
		});
	}

	/**
	 * Checks if save data exists
	 * @param { boolean } checkCheckpoint Whether to check for checkpoint data
	 * @returns { boolean } Whether save data exists
	 */
	hasSaveData(checkCheckpoint = false) {
		const key = checkCheckpoint ? this.checkpointKey : this.saveKey;
		return localStorage.getItem(key) !== null;
	}

	/**
	 * Deletes save data
	 * @param { boolean } deleteCheckpoint Whether to delete checkpoint data
	 */
	deleteSave(deleteCheckpoint = false) {
		const key = deleteCheckpoint ? this.checkpointKey : this.saveKey;
		localStorage.removeItem(key);
	}

	/**
	 * Toggles auto-save functionality
	 * @param { boolean } enabled Whether to enable auto-save
	 */
	setAutoSave(enabled) {
		this.autoSaveEnabled = enabled;
		if (enabled) {
			this.startCheckpointTimer();
		} else {
			this.stopCheckpointTimer();
		}
	}

	/**
	 * Cleanup method
	 */
	destroy() {
		this.stopCheckpointTimer();
	}
}
