import Phaser from 'phaser';
import { AnimationNames } from '../consts/AnimationNames';
import { EnemiesSeedConfig } from '../consts/enemies/EnemiesSeedConfig';
import { Enemy } from '../entities/Enemy';

/**
 * @class
 */
export class LuminusEnemyZones {
	/**
	 * Scene Context where it will create the markers.
	 */
	scene: Phaser.Scene;

	/**
	 * Tile Map to get the object from.
	 */
	map: Phaser.Tilemaps.Tilemap;

	/**
	 * The name of the object layer defined on the Tiled Map Editor.
	 */
	tiledObjectLayer: string = 'enemies';

	/**
	 * Array of zones that will be created after it's
	 */
	zones: Phaser.GameObjects.Zone[] = [];

	/**
	 * Defines if the class should create the enemies in the creation method.
	 */
	createFromProperties: boolean = true;

	/**
	 * The propertie name that the game will look for the number of enemies. This is defined in the Tiled Software.
	 */
	numberPropertyName: string = 'number';

	/**
	 * The texture that will be applyed to the enemy.
	 */
	texturePropertyName: string = 'texture';

	/**
	 * The id that will be used to create the enemy.
	 */
	idPropertyName: string = 'id';

	/**
	 * Animation prefix for idle animations.
	 */
	idlePrefixAnimation: string;

	/**
	 * Animation suffix for down direction.
	 */
	downAnimationSufix: string;

	/**
	 * Sets a zone to create enemies within that Range.
	 * @param scene Parent Scene.
	 * @param map Tile Map to get the zones from.
	 */
	constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap) {
		Object.assign(this, new AnimationNames());
		this.scene = scene;
		this.map = map;
	}

	/**
	 * Creates all enemy zones.
	 */
	create(): void {
		const objectZones = this.map.getObjectLayer(this.tiledObjectLayer);
		if (objectZones && objectZones.objects && objectZones.objects.length > 0) {
			objectZones.objects.forEach((infoObj) => {
				const zone = this.scene.add.zone(infoObj.x, infoObj.y, infoObj.width, infoObj.height);
				// Create a proper Rectangle from the zone dimensions
				const spriteBounds = new Phaser.Geom.Rectangle(
					infoObj.x || 0,
					infoObj.y || 0,
					infoObj.width || 0,
					infoObj.height || 0
				);
				if (this.createFromProperties && infoObj.properties) {
					let number = infoObj.properties.find((f: any) => f.name === this.numberPropertyName);

					if (number) {
						number = number.value;
					}

					let texture = infoObj.properties.find((f: any) => f.name === this.texturePropertyName);

					const id = infoObj.properties.find((f: any) => f.name === this.idPropertyName);

					const enemyConfig = EnemiesSeedConfig.find((e) => e.id === parseInt(id.value));

					if (enemyConfig) {
						texture = enemyConfig.texture;
					}
					for (let i = 0; i < number; i++) {
						const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
						const enemy = new Enemy(
							this.scene,
							pos.x,
							pos.y,
							texture ? texture : 'bat',
							parseInt(id.value)
						);
						const idleDown = `${this.idlePrefixAnimation}-${this.downAnimationSufix}`;
						const idleAnimation = texture ? `${texture}-${idleDown}` : `bat-${idleDown}`;
						enemy.anims.play(idleAnimation);
						enemy.body.setSize(enemy.width, enemy.height);
						(this.scene as any).enemies.push(enemy);
					}
				}
				this.zones.push(zone);
			});
			(this.scene.physics.add.collider as any)((this.scene as any).enemies, null);
		}
	}
}
