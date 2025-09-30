import { AttributeSceneName } from '../scenes/AttributeScene';
import { InventorySceneName } from '../scenes/InventoryScene';
import { SceneToggleWatcher } from '../scenes/watchers/SceneToggleWatcher';
import { LuminusBattleManager } from './LuminusBattleManager';

/**
 * @class
 */
export class LuminusKeyboardMouseController {
	/**
	 * This class is responsible for managing all keyboard and mouse inputs.
	 * This class should be imported only once in your Scene, and should not be active in multiple scenes, so you can better manage the player inputs.
	 * @param { Phaser.Scene } scene The Scene which this class is a child.
	 * @param { Phaser.Physics.Arcade.Sprite } player The player to manage the input.
	 */
	constructor(scene, player) {
		/**
		 * The scene.
		 * @type { Phaser.Scene }
		 */
		this.scene = scene;

		/**
		 * The Player that will receive the inputs and interactions.
		 * @type { Phaser.Physics.Arcade.Sprite }
		 */
		this.player = player;

		/**
		 * The Luminus Battle Manager.
		 * @type { LuminusBattleManager }
		 */
		this.luminusBattleManager = null;

		/**
		 * The name of the inventory Scene. It should match the Scene name so the player is able to open the inventory.
		 * @type { string }
		 * @default
		 */
		this.inventorySceneName = InventorySceneName;

		/**
		 * The name of the Attribute Management/Info Scene.
		 * @type { string }
		 * @default
		 */
		this.attributeSceneName = AttributeSceneName;
	}

	/**
	 * Created all logic for keyboard and mouse.
	 */
	create() {
		const isMobile = !this.scene.sys.game.device.os.desktop ? true : false;
		this.scene.input.mouse.disableContextMenu();
		this.luminusBattleManager = new LuminusBattleManager();
		this.scene.input.on('pointerdown', (pointer) => {
			if (pointer.leftButtonDown() && !isMobile && this.player && this.player.active && !this.player.isSwimming) {
				this.luminusBattleManager.atack(this.player);
			}
		});

		this.scene.input.keyboard.on('keydown', (keydown) => {
			// J key (74) or Space (32) - Attack
			if (
				(keydown.keyCode === 32 || keydown.keyCode === 74) &&
				this.player &&
				this.player.active &&
				this.player.canAtack &&
				this.player.canMove &&
				!this.player.isSwimming
			) {
				this.luminusBattleManager.atack(this.player);
			}
			// K key (75) - Block
			if (
				keydown.keyCode === 75 &&
				this.player &&
				this.player.active &&
				this.player.canBlock &&
				this.player.canMove &&
				!this.player.isSwimming
			) {
				this.luminusBattleManager.block(this.player);
			}
			// I key (73) - Inventory (only block if canMove is false)
			if (keydown.keyCode === 73 && this.player && this.player.active && this.player.canMove) {
				SceneToggleWatcher.toggleScene(this.scene, this.inventorySceneName, this.player);
			}
			// U key (85) - Attributes (only block if canMove is false)
			if (keydown.keyCode === 85 && this.player && this.player.active && this.player.canMove) {
				SceneToggleWatcher.toggleScene(this.scene, this.attributeSceneName, this.player);
			}
		});

		this.scene.input.keyboard.on('keyup', (keyup) => {
			// K key (75) - Stop Block
			if (keyup.keyCode === 75 && this.player && this.player.active && !this.player.isSwimming) {
				this.luminusBattleManager.stopBlock(this.player);
			}
		});
	}
}
