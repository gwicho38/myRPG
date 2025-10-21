import Phaser from 'phaser';

/**
 * @class
 */
export class NeverquestHealthBar extends Phaser.GameObjects.Sprite {
	/**
	 * The height of the health bar.
	 * @default
	 */
	height: number = 3;

	/**
	 * Current Health of the entity.
	 */
	health: number;

	/**
	 * The Maximum Health of the entity.
	 */
	full: number;

	/**
	 * X-Axis Offset.
	 */
	offX: number;

	/**
	 * Y-Axis offset.
	 */
	offY: number;

	/**
	 * The size / width of the health bar.
	 */
	size: number;

	/**
	 * Created a Dynamic health bar.
	 * @param scene The Phaser Scene that the health bar will be displayed.
	 * @param x X-Axis Positon.
	 * @param y Y-Axis Position.
	 * @param width Width of the sprite.
	 * @param health Max Health of the entity.
	 * @param offX X-Axis Offset.
	 * @param offY Y-Axis offset.
	 */
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		width: number,
		health: number,
		offX: number = 0,
		offY: number = 0
	) {
		super(scene, x, y, 'health');

		this.health = health;
		this.full = health;
		this.offX = offX;
		this.offY = offY;
		this.size = width * 0.43;
		this.x = x + offX;
		this.y = y + offY;
		this.alpha = 0.8;
		this.setOrigin(0, 0);
		this.setDepth(2);

		scene.add.existing(this);
		this.draw();
	}

	/**
	 * Decreases the health bar.
	 * @param dano Damage to deal in the entity.
	 * @returns returns true if the health is zero or less.
	 */
	decrease(dano: number): boolean {
		this.health -= dano;

		if (this.health <= 0) {
			this.health = 0;
		}
		this.draw();
		return this.health <= 0;
	}

	/**
	 * Updated the Health Points of the entity.
	 * @param hp The new HP
	 */
	update(hp: number): void {
		this.health = hp;
		this.draw();
	}

	/**
	 * Changes the color of the Health bar based on the current entity's health.
	 */
	draw(): void {
		const d = (this.health * 100) / this.full / 100;
		const x = (this.health / this.full) * 100;

		const color = this.rgbToHex(
			(x > 50 ? 1 - (2 * (x - 50)) / 100.0 : 1.0) * 255,
			(x > 50 ? 1.0 : (2 * x) / 100.0) * 255,
			0
		);

		this.tint = color;
		this.scaleX = (d * this.size) / this.width;
	}

	/**
	 * Gets the correct color, based on the red and green values, so the bar goes from Green (Full health) to RED (Low Health).
	 * @param r red value.
	 * @param g green value.
	 * @param b blue value.
	 * @returns The new RGB Value
	 */
	rgbToHex(r: number, g: number, b: number): number {
		const hex = '0x' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		return parseInt(hex, 16);
	}
}
