/**
 * Property interface for Tiled object properties
 */
interface TiledProperty {
	name: string;
	value: string | number | boolean;
}

/**
 * Class responsible to open a video.
 * @class
 */
export class LuminusVideoOpener {
	/**
	 * The Phaser Scene that this class will be a child.
	 */
	private scene: Phaser.Scene;

	/**
	 * Video id property to search for in the Tiled properties.
	 */
	private videoIdProperty: string;

	/**
	 * Gets the video link from the Tile object properties.
	 * @param scene Scene that this Instance will be a child.
	 */
	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.videoIdProperty = 'videoId';
	}

	/**
	 * Searches for a specific property on an array of properties from the Tiled Software.
	 * @param properties the properties array to check if there is a video link.
	 */
	checkHasVideo(properties: TiledProperty[]): void {
		const video = properties.find((p) => p.name === this.videoIdProperty);
		if (video && video.name) {
			this.scene.scene.launch('VideoPlayerScene', {
				player: this.scene.player,
				videoId: video.value,
			});
		}
	}
}
