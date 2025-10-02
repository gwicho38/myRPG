import { Item } from '../entities/Item';

interface PlayerDrops {
	id: number;
	chance: number;
}

interface EntityWithDrops extends Phaser.GameObjects.Sprite {
	id: number;
	drops: PlayerDrops[];
	container: Phaser.GameObjects.Container;
}

/**
 * This class is responsible for dropping items from a given entity.
 * @class
 */
export class LuminusDropSystem {
	/**
	 * The game scene that the player is playing.
	 */
	scene: Phaser.Scene;

	/**
	 * The id of the entity that will drop something.
	 */
	entityId: number;

	/**
	 * The Entity that will drop the items.
	 */
	entity: EntityWithDrops;

	/**
	 * The items that the entity will drop.
	 */
	drops: PlayerDrops[];

	/**
	 * Drops the items from an entity.
	 */
	dropItems: () => void;

	constructor(scene: Phaser.Scene, entity: EntityWithDrops) {
		this.scene = scene;
		this.entityId = entity.id;
		this.entity = entity;
		this.drops = entity.drops;

		/**
		 * Drops the items from an entity.
		 */
		this.dropItems = (): void => {
			const rect = new Phaser.Geom.Rectangle(this.entity.container.x - 8, this.entity.container.y - 8, 16, 16);
			const spriteBounds = Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(rect), 0, 0);

			this.drops.forEach((drop) => {
				const chance = Math.random() * 100;
				if (drop.chance - chance >= 0 || drop.chance === 100) {
					const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const item = new Item(this.scene, pos.x, pos.y - 20, drop.id);
					this.scene.tweens.add({
						targets: item,
						props: {
							y: {
								value: item.y - 4,
							},
						},
						duration: 2000,
						loop: -1,
						yoyo: true,
					});
				}
			});
		};
	}
}
