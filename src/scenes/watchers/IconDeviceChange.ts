import Phaser from 'phaser';

/**
 * This class is responsible for changing the icon, based on the current Device
 * @class
 */
export class IconDeviceChange {
	/**
	 * Changes the texture of a game object based on the current device
	 * @param { Phaser.GameObjects.Image } gameObject - The game object whose texture will be changed
	 */
	static changeTexture(gameObject: Phaser.GameObjects.Image): void {
		gameObject.setTexture();
	}
}
