import Phaser from 'phaser';
import { AnimationNames } from '../consts/AnimationNames';
import { LuminusAnimationManager } from './LuminusAnimationManager';
import { LuminusGamePadController } from './LuminusGamePadController';

/**
 * @class
 */
export class LuminusMovement extends AnimationNames {
	/**
	 * Creates cursors to move the player in the given direction.
	 * @param { Phaser.Scene } scene Phaser Scene.
	 * @param { Phaser.Physics.Arcade.Sprite } player the player that the cursors will move.
	 * @param { Phaser.Scene } joystickScene
	 */
	constructor(scene, player, joystickScene) {
		super(null);
		/**
		 * Scene Context.
		 * @type { Phaser.Scene }  */
		this.scene = scene;

		/**
		 * player Player Game Object.
		 * @type { Phaser.Physics.Arcade.Sprite }  */
		this.player = player;

		/**
		 * Keyboard cursors that will control the character.
		 * @type { any }
		 */
		this.cursors = this.scene.input.keyboard.createCursorKeys();

		/**
		 * WASD keys for alternative movement controls.
		 * @type { object }
		 */
		this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D');

		/**
		 * Shift key for running mode.
		 * @type { Phaser.Input.Keyboard.Key }
		 */
		this.shiftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

		/**
		 * Virtual joystick plugin
		 * @type { VirtualJoystickPlugin }
		 * @default
		 */
		this.stick = null;

		/**
		 * The JoystickScene. If it's available, use the joystick to move the Player.
		 * @type { Phaser.Scene }
		 */
		this.joystickScene = joystickScene;

		/**
		 * The luminus animation manager.
		 * @type { LuminusAnimationManager }
		 */
		this.luminusAnimationManager = new LuminusAnimationManager(this.player);

		this.luminusGamepadController = new LuminusGamePadController(this.scene, this.player);

		this.luminusGamepadController.create();

		if (this.joystickScene) {
			this.joystickScene.events.on('setStick', (payload) => {
				this.stick = payload; // Sets the Stick pad for movement.
			});
		}

		// Debug: Log WASD key presses to verify they're working
		this.scene.input.keyboard.on('keydown', (event) => {
			if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
				console.log(`WASD Control: ${event.code} pressed`);
			}
		});

		this.scene.input.addPointer(3);
	}

	/**
	 * Checks if the player is moving.
	 * @returns { boolean }
	 */
	isMoving() {
		return this.player.container.body.velocity.x !== 0 || this.player.container.body.velocity.y !== 0;
	}

	/**
	 * Checks if there is any cursor or WASD key pressed.
	 * @returns { boolean }
	 */
	isAnyKeyDown() {
		return (
			this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown ||
			this.wasd.A.isDown || this.wasd.D.isDown || this.wasd.W.isDown || this.wasd.S.isDown
		);
	}

	/**
	 * Checks if the player is currently standing on water tiles.
	 * @returns { boolean }
	 */
	isOnWater() {
		if (!this.scene.map || !this.player || !this.player.container) return false;

		const playerX = this.player.container.x;
		const playerY = this.player.container.y;

		// Convert world coordinates to tile coordinates
		const tileX = this.scene.map.worldToTileX(playerX);
		const tileY = this.scene.map.worldToTileY(playerY);

		// Get the ground layer (first layer contains terrain tiles)
		const groundLayer = this.scene.map.getLayer(0);
		if (!groundLayer) return false;

		const tile = this.scene.map.getTileAt(tileX, tileY, false, groundLayer.name);
		if (!tile) return false;

		// Water tile IDs: 734 (deep water), 653 (regular water), 482 (shallow water/shore)
		const waterTileIds = [734, 653, 482];
		return waterTileIds.includes(tile.index);
	}

	/**
	 * Updates the player's swimming state based on current position.
	 */
	updateSwimmingState() {
		if (!this.player || !this.player.canSwim) return;

		const wasSwimming = this.player.isSwimming;
		const shouldBeSwimming = this.isOnWater();

		if (shouldBeSwimming && !wasSwimming) {
			// Enter swimming mode
			this.player.isSwimming = true;
			this.player.isRunning = false; // Can't run while swimming
			this.player.speed = this.player.swimSpeed || 100;
			this.player.setTint(0x87CEEB); // Light blue tint for swimming
		} else if (!shouldBeSwimming && wasSwimming) {
			// Exit swimming mode
			this.player.isSwimming = false;
			this.updateRunningSpeed(); // Update speed based on running state
			this.player.clearTint();
		}
	}

	/**
	 * Updates the player's running state based on Shift key.
	 */
	updateRunningState() {
		if (!this.player || this.player.isSwimming) return;

		const wasRunning = this.player.isRunning;
		const shouldBeRunning = this.shiftKey.isDown;

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
	 * Updates the player's speed based on current running state (used when exiting swimming).
	 */
	updateRunningSpeed() {
		if (!this.player || this.player.isSwimming) return;

		if (this.shiftKey.isDown) {
			this.player.isRunning = true;
			this.player.speed = this.player.runSpeed || 300;
		} else {
			this.player.isRunning = false;
			this.player.speed = this.player.baseSpeed || 200;
		}
	}

	move() {
		if (this.player && this.player.container && this.player.container.body && this.player.canMove) {
			this.player.container.body.setVelocity(0);

			// Update swimming and running states
			this.updateSwimmingState();
			this.updateRunningState();

			if (!this.player.isAtacking) {
				const texture = this.player.texture.key;
				if (this.scene.input.isActive) {
					// Stop any previous movement from the last frame

					// Horizontal movement
					if (
						this.cursors.left.isDown || this.wasd.A.isDown ||
						(this.cursors.left.isDown && this.cursors.down.isDown) || (this.wasd.A.isDown && this.wasd.S.isDown) ||
						(this.cursors.left.isDown && this.cursors.up.isDown && this.player.container.body.maxSpeed > 0) ||
						(this.wasd.A.isDown && this.wasd.W.isDown && this.player.container.body.maxSpeed > 0)
					) {
						this.player.container.body.setVelocityX(-this.player.speed);
						this.player.anims.play(texture + '-' + this.walkLeftAnimationName, true);
					} else if (
						this.cursors.right.isDown || this.wasd.D.isDown ||
						(this.cursors.right.isDown && this.cursors.down.isDown) || (this.wasd.D.isDown && this.wasd.S.isDown) ||
						(this.cursors.right.isDown && this.cursors.up.isDown && this.player.container.body.maxSpeed > 0) ||
						(this.wasd.D.isDown && this.wasd.W.isDown && this.player.container.body.maxSpeed > 0)
					) {
						this.player.anims.play(texture + '-' + this.walkRightAnimationName, true);
						this.player.container.body.setVelocityX(this.player.speed);
					}

					// Vertical movement
					if ((this.cursors.up.isDown || this.wasd.W.isDown) && this.player.container.body.maxSpeed > 0) {
						this.player.container.body.setVelocityY(-this.player.speed);
						if (!this.cursors.left.isDown && !this.cursors.right.isDown && !this.wasd.A.isDown && !this.wasd.D.isDown)
							this.player.anims.play(texture + '-' + this.walkUpAnimationName, true);
					}
					if ((this.cursors.down.isDown || this.wasd.S.isDown) && this.player.container.body.maxSpeed > 0) {
						if (!this.cursors.left.isDown && !this.cursors.right.isDown && !this.wasd.A.isDown && !this.wasd.D.isDown)
							this.player.anims.play(texture + '-' + this.walkDownAnimationName, true);
						this.player.container.body.setVelocityY(this.player.speed);
					}

					// Normalize and scale the velocity so that player can't move faster along a diagonal
					this.player.container.body.velocity.normalize().scale(this.player.speed);
				} else {
					// Stops the movement if there is no pressed key.
					this.player.container.body.setVelocityY(0);
					this.player.container.body.setVelocityX(0);
				}

				if (
					this.stick &&
					this.stick.isDown &&
					this.player.container.body.maxSpeed > 0 &&
					this.stick.force > 0 &&
					this.scene.input.pointer1.isDown &&
					this.player.container.body.maxSpeed > 0
				) {
					const texture = this.player.texture.key;
					this.luminusAnimationManager.animateWithAngle(
						`${texture}-${this.walkPrefixAnimation}`,
						this.stick.rotation
					);
					this.scene.physics.velocityFromRotation(
						this.stick.rotation,
						this.stick.force * this.player.speed,
						this.player.container.body.velocity
					);
				}
				this.luminusGamepadController.sendInputs();

				if (!this.isMoving()) {
					this.luminusAnimationManager.setIdleAnimation();
					if (this.player.walkDust) this.player.walkDust.on = false;
				} else {
					if (this.player.walkDust) this.player.walkDust.on = true;
				}
			}
		} else {
			if (this.player && this.player.walkDust) this.player.walkDust.on = false;
			if (this.player && this.player.container && this.player.container.body) {
				this.player.container.body.setVelocity(0);
				this.luminusAnimationManager.setIdleAnimation();
			}
		}
	}
}
