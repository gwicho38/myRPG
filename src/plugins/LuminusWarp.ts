interface WarpPoint extends Phaser.GameObjects.Zone {
	warp: any;
}

interface PlayerWithMovement extends Phaser.GameObjects.GameObject {
	container: Phaser.GameObjects.Container & { body: Phaser.Physics.Arcade.Body };
	luminusMovement: any;
	destroy(): void;
}

interface SceneWithPlayer extends Phaser.Scene {
	player?: PlayerWithMovement;
	stopSceneMusic?: () => void;
}

/**
 * @class
 */
export class LuminusWarp {
	/**
	 * Scene Context.
	 */
	scene: SceneWithPlayer;

	/**
	 * Player Game Object.
	 */
	player: PlayerWithMovement;

	/**
	 * Tile Map to get the object from.
	 */
	map: Phaser.Tilemaps.Tilemap;

	/**
	 * Duration of the fade time of the camera.
	 */
	defaultFadeTime: number = 300;

	/**
	 * Duration of the fade out time of the camera.
	 */
	fadeOutTime: number;

	/**
	 * Duration of the fade in time of the camera.
	 */
	fadeInTime: number;

	/**
	 * Name of the object defined in the Tiled Software to pull the Warps from.
	 */
	warpObjectName: string = 'warps';

	/**
	 * Name of property of the object defined in the Tiled Software to pull the destination position from.
	 */
	propertyWarpName: string = 'goto';

	/**
	 * The name of the property to check when the warp should actually change the player to a new Scene. Like a Dungeon Scene.
	 */
	propertyChangeScene: string = 'scene';

	/**
	 * Maximum speed that the player can move. Used only for caching the value in this class.
	 */
	private maxSpeed: number;

	/**
	 * Particles configuration for the warp effect.
	 */
	particlesConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig | null = null;

	/**
	 * Creates a portal at the Tiled object Specified position.
	 * @param scene Phaser scene that it will control.
	 * @param player The game object that will be teleported to a certain spot.
	 * @param map The tilemap containing warp objects.
	 */
	constructor(scene: SceneWithPlayer, player: PlayerWithMovement, map: Phaser.Tilemaps.Tilemap) {
		this.scene = scene;
		this.player = player;
		this.map = map;
		this.fadeOutTime = this.defaultFadeTime;
		this.fadeInTime = this.defaultFadeTime;
		this.maxSpeed = this.player.container.body.maxSpeed;
	}

	/**
	 * Creates all warps of the game.
	 */
	createWarps(): void {
		const warps = this.map.getObjectLayer(this.warpObjectName);
		const warp_array = warps.objects.filter((obj) => obj.properties);
		const destinations = warps.objects.filter((obj) => !obj.properties);
		const warp_points: WarpPoint[] = [];

		warp_array.forEach((warp) => {
			// For logging purpposes
			// let rect = this.add.rectangle(
			//     warp.x,
			//     warp.y,
			//     warp.width,
			//     warp.height,
			//     0xffff00,
			//     0.5
			// );
			const zone = this.scene.add.zone(warp.x, warp.y, warp.width, warp.height);

			this.particlesConfig = {
				angle: -90,
				frequency: 300,
				speed: 1,
				// accelerationY: -1,
				x: { min: -(warp.width! / 2), max: warp.width! / 2 },
				y: { min: -(warp.height! / 2), max: warp.height! / 2 },
				lifespan: { min: 500, max: 2000 },
				scale: { start: 1.3, end: 0.8 },
				alpha: { start: 1, end: 0.7 },
				// radial: true,
				// rotation: 180, // Not a valid ParticleEmitterConfig property
			};
			this.scene.add.particles(
				warp.x! + warp.width! / 2,
				warp.y! + warp.height! / 2,
				'particle_warp',
				this.particlesConfig
			);
			this.scene.physics.add.existing(zone);
			(zone.body as Phaser.Physics.Arcade.Body).immovable = true; // Prevents it from moving on collision.
			zone.setOrigin(0, 0);
			warp_points.push({ ...zone, warp } as WarpPoint);
		});

		this.scene.cameras.main.on('camerafadeoutstart', (_fade: any) => {
			// Stop moving.
			this.player.container.body.maxSpeed = 0;
		});
		this.scene.cameras.main.on('camerafadeincomplete', (_fade: any) => {
			this.player.container.body.maxSpeed = this.maxSpeed;
		});

		// Sets the collision between the player and the warp points.
		this.scene.physics.add.collider(warp_points, this.player.container, (warp_point, _player) => {
			const warpPointTyped = warp_point as WarpPoint;
			const dest = destinations.find(
				(d) => d.id === warpPointTyped.warp.properties.find((f: any) => f.name === this.propertyWarpName).value
			);
			const isScene = warpPointTyped.warp.properties.find((f: any) => f.name === this.propertyChangeScene);

			if (dest && isScene === undefined) {
				this.scene.cameras.main.fade(this.fadeOutTime);
				this.player.container.x = dest.x!;
				this.player.container.y = dest.y!;
				this.scene.cameras.main.fadeIn(this.fadeInTime);
			} else if (isScene) {
				const scene = warpPointTyped.warp.properties.find((f: any) => f.name === this.propertyWarpName).value;
				this.scene.scene.switch(scene);
				if (this.scene.player) {
					this.scene.player.luminusMovement = null;
					this.scene.player.destroy();
				}
				if (this.scene.stopSceneMusic) {
					this.scene.stopSceneMusic();
				}
				// this.scene.scene.launch(scene);
			}
		});
	}
}
