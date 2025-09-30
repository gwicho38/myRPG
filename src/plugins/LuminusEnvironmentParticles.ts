/**
 * Interface for Tiled object properties
 */
interface TiledProperty {
	name: string;
	value: string | number | boolean;
}

/**
 * Interface for Tiled objects
 */
interface TiledObject {
	x: number;
	y: number;
	width: number;
	height: number;
	properties: TiledProperty[];
}

/**
 * @class
 */
export class LuminusEnvironmentParticles {
	/**
	 * The Phaser Scene
	 */
	private scene: Phaser.Scene;

	/**
	 * The map where the class will get the zone to emit the particles.
	 */
	private map: Phaser.Tilemaps.Tilemap;

	/**
	 * The particles object.
	 */
	private particles: Phaser.GameObjects.Particles.ParticleEmitter | null;

	/**
	 * The dust particles object.
	 */
	private dustParticles?: Phaser.GameObjects.Particles.ParticleEmitter;

	/**
	 * The particles objects layer name that you defined on the Tiled Software.
	 */
	private particlesObjectLayerName: string;

	/**
	 * The name of the clouds particles, should be the name of the image that you gave on phaser.
	 */
	private cloudParticleName: string;

	/**
	 * The name of the Sprite used for creating the dust particles.
	 */
	private dustParticleSprite: string;

	/**
	 * This class is responsible for creating the environment particles of the game.
	 * @param scene The parent Phaser scene
	 * @param map The tilemap containing particle zone definitions
	 */
	constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap) {
		this.scene = scene;
		this.map = map;
		this.particles = null;
		this.particlesObjectLayerName = 'particles';
		this.cloudParticleName = 'cloud';
		this.dustParticleSprite = 'leaves';
	}

	/**
	 * Get the zone from the map to emit the particles just inside that zone, so you can use less memory.
	 */
	create(): void {
		const zones = this.map.getObjectLayer(this.particlesObjectLayerName);
		if (zones && zones.objects && zones.objects.length > 0) {
			zones.objects.forEach((zone: TiledObject) => {
				zone.properties.forEach((property: TiledProperty) => {
					if (property.value === this.dustParticleSprite) {
						this.makeDust(zone.width, zone.height, zone.x, zone.y);
					} else if (property.value === this.cloudParticleName) {
						this.makeClouds(zone.width, zone.height, zone.x, zone.y);
					} else {
						// If nothing is specified, then create the basic particle system.
						this.makeDust(zone.width, zone.height, zone.x, zone.y);
					}
				});
			});
		}
	}

	/**
	 * Creates the clouds particles.
	 * @param width Map Width in pixels.
	 * @param height Map Height in Pixels.
	 * @param originX Origin of the clouds.
	 * @param originY Origin of the clouds.
	 */
	makeClouds(width: number, height: number, originX: number, originY: number): void {
		// Sets the bounds of the particles so they do not leave the respective zone.
		const deathZone = new Phaser.Geom.Rectangle(originX, originY, width, height);
		this.particles = this.scene.add.particles(originX + width / 2, originY + height / 2, this.cloudParticleName, {
			angle: { min: 0, max: 360 },
			deathZone: { source: deathZone, type: 'onLeave' },
			frequency: 15000,
			speedX: { min: 5, max: 15 },
			speedY: { min: 5, max: 15 },
			x: { min: -(width / 2), max: width / 2 },
			y: { min: -(height / 2), max: height / 2 },
			lifespan: 300000,
			scale: 0.8,
			alpha: { start: 0.5, end: 0.7 },
			radial: true,
			rotation: 180,
		});

		// Clouds should always cast shadows above everything else in the map.
		this.particles.depth = 9999999999999;
	}

	/**
	 * Creates a Dust like Particle.
	 * @param width Map Width in pixels.
	 * @param height Map Height in Pixels.
	 * @param originX Origin of the particles
	 * @param originY Origin of the particles
	 */
	makeDust(width: number, height: number, originX: number, originY: number): void {
		// Sets the bounds of the particles so they do not leave the respective zone.
		const deathZone = new Phaser.Geom.Rectangle(originX, originY, width, height);
		this.particles = this.scene.add.particles(originX + width / 2, originY + height / 2, this.dustParticleSprite, {
			angle: { min: 0, max: 360 },
			// emitZone: { source: offscreen },
			deathZone: { source: deathZone, type: 'onLeave' },
			frequency: 5,
			speedX: { min: 5, max: 20 },
			speedY: { min: 5, max: 20 },
			x: { min: -(width / 2), max: width / 2 },
			y: { min: -(height / 2), max: height / 2 },
			lifespan: 10000,
			scale: { start: 1.3, end: 0.7 },
			alpha: { start: 0.4, end: 1 },
			radial: true,
			rotation: 180,
		});
		this.dustParticles = this.scene.add.particles(originX + width / 2, originY + height / 2, 'dust', {
			angle: { min: 0, max: 360 },
			// emitZone: { source: offscreen },
			deathZone: { source: deathZone, type: 'onLeave' },
			frequency: 5,
			speedX: { min: 5, max: 20 },
			speedY: { min: 0, max: 20 },
			x: { min: -(width / 2), max: width / 2 },
			y: { min: -(height / 2), max: height / 2 },
			lifespan: 7000,
			scale: { start: 1.3, end: 0.7 },
			alpha: { start: 0.4, end: 1 },
			radial: true,
			rotation: 180,
		});
	}
}
