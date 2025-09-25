import Phaser from 'phaser';
import { AnimationNames } from '../consts/AnimationNames';
import { LuminusAnimationManager } from './LuminusAnimationManager';
import { LuminusGamePadController } from './LuminusGamePadController';
import { Player } from '../entities/Player';

/**
 * Movement controller for the player character with support for keyboard, gamepad, and virtual joystick input
 */
export class LuminusMovement extends AnimationNames {
	public scene: Phaser.Scene;
	public player: Player;
	public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	public wasd: { [key: string]: Phaser.Input.Keyboard.Key };
	public shiftKey: Phaser.Input.Keyboard.Key;
	public stick: any | null;
	public joystickScene: Phaser.Scene | null;
	public luminusAnimationManager: LuminusAnimationManager;
	public luminusGamePadController: LuminusGamePadController;

	/**
	 * Creates cursors to move the player in the given direction.
	 * @param scene Phaser Scene.
	 * @param player the player that the cursors will move.
	 * @param joystickScene Virtual joystick scene
	 */
	constructor(scene: Phaser.Scene, player: Player, joystickScene?: Phaser.Scene) {
		super();

		/**
		 * Scene Context.
		 */
		this.scene = scene;

		/**
		 * player Player Game Object.
		 */
		this.player = player;

		/**
		 * Keyboard cursors that will control the character.
		 */
		this.cursors = this.scene.input.keyboard!.createCursorKeys();

		/**
		 * WASD keys for alternative movement controls.
		 */
		this.wasd = this.scene.input.keyboard!.addKeys('W,S,A,D') as { [key: string]: Phaser.Input.Keyboard.Key };

		/**
		 * Shift key for running mode.
		 */
		this.shiftKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

		/**
		 * Virtual joystick plugin
		 */
		this.stick = null;

		/**
		 * Joystick scene for mobile controls
		 */
		this.joystickScene = joystickScene || null;

		/**
		 * Animation manager for the player
		 */
		this.luminusAnimationManager = new LuminusAnimationManager(this.scene, this.player);

		/**
		 * GamePad controller
		 */
		this.luminusGamePadController = new LuminusGamePadController(this.scene, this.player);

		// Set up joystick events if available
		if (this.joystickScene) {
			this.joystickScene.events.on('setStick', (payload: any) => {
				this.stick = payload; // Sets the Stick pad for movement.
			});
		}

		// Add keyboard event listener for WASD logging
		this.scene.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
			if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
				console.log(`WASD Control: ${event.code} pressed`);
			}
		});
	}

	/**
	 * Check if the player is currently moving
	 */
	isMoving(): boolean {
		return this.player.container.body!.velocity.x !== 0 || this.player.container.body!.velocity.y !== 0;
	}

	/**
	 * Check if any movement key is currently pressed
	 */
	isAnyKeyDown(): boolean {
		return (
			this.cursors.left!.isDown ||
			this.cursors.right!.isDown ||
			this.cursors.up!.isDown ||
			this.cursors.down!.isDown ||
			this.wasd.W?.isDown ||
			this.wasd.A?.isDown ||
			this.wasd.S?.isDown ||
			this.wasd.D?.isDown
		);
	}

	/**
	 * Check if the player is currently on water tiles
	 */
	isOnWater(): boolean {
		if (!this.scene.data || !this.player || !this.player.container) return false;

		const map = this.scene.data.get('map');
		if (!map) return false;

		const playerX = this.player.container.x;
		const playerY = this.player.container.y;
		const tileSize = map.tileWidth;

		// Convert world coordinates to tile coordinates
		const tileX = Math.floor(playerX / tileSize);
		const tileY = Math.floor(playerY / tileSize);

		// Check if the tile at player position is water
		const waterLayer = map.getLayer('water') || map.getLayer('Water');
		if (waterLayer) {
			const tile = map.getTileAt(tileX, tileY, false, waterLayer);
			return tile !== null;
		}

		return false;
	}

	/**
	 * Update the player's swimming state based on current position
	 */
	updateSwimmingState(): void {
		if (!this.player || !this.player.canSwim) return;

		const wasSwimming = this.player.isSwimming;
		const shouldBeSwimming = this.isOnWater();

		if (shouldBeSwimming && !wasSwimming) {
			// Enter swimming mode
			this.player.isSwimming = true;
			this.player.isRunning = false; // Can't run while swimming
			this.player.speed = this.player.swimSpeed || 100;
			console.log('Player entered water - swimming mode activated');
		} else if (!shouldBeSwimming && wasSwimming) {
			// Exit swimming mode
			this.player.isSwimming = false;
			this.player.speed = this.player.baseSpeed || 200;
			console.log('Player left water - swimming mode deactivated');
		}
	}

	/**
	 * Update the player's running state based on shift key
	 */
	updateRunningState(): void {
		if (!this.player || this.player.isSwimming) return;

		const wasRunning = this.player.isRunning;
		const shouldBeRunning = this.shiftKey.isDown && this.isAnyKeyDown();

		if (shouldBeRunning && !wasRunning) {
			// Enter running mode
			this.player.isRunning = true;
			this.player.speed = this.player.runSpeed || 300;
		} else if (!shouldBeRunning && wasRunning) {
			// Exit running mode
			this.player.isRunning = false;
			this.player.speed = this.player.baseSpeed || 200;
		}
	}

	/**
	 * Update running speed based on shift key state
	 */
	updateRunningSpeed(): void {
		if (!this.player || this.player.isSwimming) return;

		if (this.shiftKey.isDown) {
			this.player.isRunning = true;
			this.player.speed = this.player.runSpeed || 300;
		} else {
			this.player.isRunning = false;
			this.player.speed = this.player.baseSpeed || 200;
		}
	}

	/**
	 * Main movement method - handles all player movement logic
	 */
	move(): void {
		if (this.player && this.player.container && this.player.container.body && this.player.canMove) {
			const body = this.player.container.body as Phaser.Physics.Arcade.Body;
			body.setVelocity(0);

			// Update swimming and running states
			this.updateSwimmingState();
			this.updateRunningState();

			if (!this.player.isAtacking) {
				const texture = this.player.texture.key;
				if (this.scene.input.isActive) {
					// Stop any previous movement from the last frame

					// Horizontal movement
					if ((this.cursors.left!.isDown || this.wasd.A?.isDown) && body.maxSpeed > 0) {
						body.setVelocityX(-this.player.speed);
						if (
							!this.cursors.up!.isDown &&
							!this.cursors.down!.isDown &&
							!this.wasd.W?.isDown &&
							!this.wasd.S?.isDown
						) {
							this.luminusAnimationManager.setLeftAnimation();
						}
					}
					if ((this.cursors.right!.isDown || this.wasd.D?.isDown) && body.maxSpeed > 0) {
						body.setVelocityX(this.player.speed);
						if (
							!this.cursors.up!.isDown &&
							!this.cursors.down!.isDown &&
							!this.wasd.W?.isDown &&
							!this.wasd.S?.isDown
						) {
							this.luminusAnimationManager.setRightAnimation();
						}
					}

					// Vertical movement
					if ((this.cursors.up!.isDown || this.wasd.W?.isDown) && body.maxSpeed > 0) {
						body.setVelocityY(-this.player.speed);
						if (
							!this.cursors.left!.isDown &&
							!this.cursors.right!.isDown &&
							!this.wasd.A?.isDown &&
							!this.wasd.D?.isDown
						) {
							this.luminusAnimationManager.setUpAnimation();
						}
					}
					if ((this.cursors.down!.isDown || this.wasd.S?.isDown) && body.maxSpeed > 0) {
						if (
							!this.cursors.left!.isDown &&
							!this.cursors.right!.isDown &&
							!this.wasd.A?.isDown &&
							!this.wasd.D?.isDown
						) {
							this.luminusAnimationManager.setDownAnimation();
						}
						body.setVelocityY(this.player.speed);
					}

					// Virtual joystick movement
					if (this.stick && this.stick.isDown) {
						const force = this.stick.force;
						const angle = this.stick.angle;

						if (force > 0.1) {
							const velocityX = Math.cos(angle) * this.player.speed * force;
							const velocityY = Math.sin(angle) * this.player.speed * force;

							body.setVelocity(velocityX, velocityY);

							// Set appropriate animation based on primary direction
							if (Math.abs(velocityX) > Math.abs(velocityY)) {
								if (velocityX > 0) {
									this.luminusAnimationManager.setRightAnimation();
								} else {
									this.luminusAnimationManager.setLeftAnimation();
								}
							} else {
								if (velocityY > 0) {
									this.luminusAnimationManager.setDownAnimation();
								} else {
									this.luminusAnimationManager.setUpAnimation();
								}
							}
						}
					}

					// GamePad movement
					this.luminusGamePadController.sendInputs();
				}

				// Handle idle animation and particle effects
				if (!this.isMoving()) {
					this.luminusAnimationManager.setIdleAnimation();
					if (this.player.walkDust) this.player.walkDust.on = false;
				} else {
					if (this.player.walkDust) this.player.walkDust.on = true;
				}
			}
		} else {
			// Player cannot move - stop all movement
			if (this.player && this.player.container && this.player.container.body) {
				const body = this.player.container.body as Phaser.Physics.Arcade.Body;
				body.setVelocity(0);
				this.luminusAnimationManager.setIdleAnimation();
			}
		}
	}
}
