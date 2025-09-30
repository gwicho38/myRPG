import Phaser from 'phaser';
import { AnimationNames } from '../consts/AnimationNames';
import { AttributeSceneName } from '../scenes/AttributeScene';
import { InventorySceneName } from '../scenes/InventoryScene';
import { SceneToggleWatcher } from '../scenes/watchers/SceneToggleWatcher';
import { LuminusAnimationManager } from './LuminusAnimationManager';
import { LuminusBattleManager } from './LuminusBattleManager';

/**
 * @class
 */
export class LuminusGamePadController extends AnimationNames {
	/**
	 * The phaser scene that the gamepad will use to make update controls.
	 */
	scene: Phaser.Scene;

	/**
	 * The player that the controler will send inputs.
	 */
	player: any;

	/**
	 * The Name of the Inventory Scene.
	 */
	inventorySceneName: string;

	/**
	 * The name of the Attribute Scene.
	 */
	attributeSceneName: string;

	/**
	 * The luminus animation manager.
	 */
	luminusAnimationManager: LuminusAnimationManager;

	/**
	 * The gamepad that will control the player. The default value is null.
	 */
	gamepad: Phaser.Input.Gamepad.Gamepad | null;

	/**
	 * The Luminus Battle Manager.
	 */
	luminusBattleManager: LuminusBattleManager | null;

	/**
	 * This class is ment to control the player when a game controler is available.
	 * this will only work if the player presses a button on the controler.
	 * @param scene the scene which the player has to control the player.
	 * @param player the player object
	 */
	constructor(scene: Phaser.Scene, player: any) {
		super(null);
		this.scene = scene;
		this.player = player;
		this.inventorySceneName = InventorySceneName;
		this.attributeSceneName = AttributeSceneName;
		this.luminusAnimationManager = new LuminusAnimationManager(this.player);
		this.gamepad = this.scene.input.gamepad.pad1;
		this.luminusBattleManager = null;
	}

	/**
	 * Inicializes the PLugin.
	 */
	create(): void {
		this.luminusBattleManager = new LuminusBattleManager();
		this.scene.input.gamepad.on(
			'connected',
			(pad: Phaser.Input.Gamepad.Gamepad, _button: any, _index: number) => {
				if (!this.gamepad) {
					this.gamepad = pad;
				}
			},
			this
		);

		this.scene.input.gamepad.on('down', (pad: Phaser.Input.Gamepad.Gamepad) => {
			if (!this.gamepad) {
				this.gamepad = pad;
			}
			if (this.gamepad && this.gamepad.buttons[8].value === 1) {
				SceneToggleWatcher.toggleScene(this.scene, this.inventorySceneName, this.player);
			}
			if (this.gamepad && this.gamepad.buttons[9].value === 1) {
				SceneToggleWatcher.toggleScene(this.scene, this.attributeSceneName, this.player);
			}
			if (pad.A && this.player && this.player.active) {
				this.luminusBattleManager!.atack(this.player);
			}
		});
	}

	/**
	 * Performs the movement action to the player using the GamePad.
	 */
	sendInputs(): void {
		const texture = this.player.texture.key;
		if (this.gamepad) {
			if (
				this.gamepad.left ||
				(this.gamepad.left && this.gamepad.down) ||
				(this.gamepad.left && this.gamepad.up)
			) {
				this.player.container.body.setVelocityX(-this.player.speed);
				this.player.anims.play(texture + '-' + this.walkLeftAnimationName, true);
			} else if (
				this.gamepad.right ||
				(this.gamepad.right && this.gamepad.down) ||
				(this.gamepad.right && this.gamepad.up)
			) {
				this.player.anims.play(texture + '-' + this.walkRightAnimationName, true);
				this.player.container.body.setVelocityX(this.player.speed);
			}

			if (this.gamepad.up) {
				this.player.container.body.setVelocityY(-this.player.speed);
				if (!this.gamepad.left && !this.gamepad.right)
					this.player.anims.play(texture + '-' + this.walkUpAnimationName, true);
			} else if (this.gamepad.down) {
				this.player.container.body.setVelocityY(this.player.speed);
				if (!this.gamepad.left && !this.gamepad.right)
					this.player.anims.play(texture + '-' + this.walkDownAnimationName, true);
			}

			if (
				(this.gamepad.leftStick.x !== 0 || this.gamepad.leftStick.y !== 0) &&
				this.player.container.body.maxSpeed > 0
			) {
				this.luminusAnimationManager.animateWithAngle(
					`${texture}-${this.walkPrefixAnimation}`,
					Phaser.Math.Angle.Wrap(this.gamepad.leftStick.angle())
				);
				this.scene.physics.velocityFromRotation(
					this.gamepad.leftStick.angle(),
					this.player.speed,
					this.player.container.body.velocity
				);
			}

			this.player.container.body.velocity.normalize().scale(this.player.speed);
		}
	}
}
