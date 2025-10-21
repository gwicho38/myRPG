import { ENTITIES } from '../consts/Entities';

/**
 * This class is responsible for displaying the damage that an entity receives.
 * @class
 */
export class NeverquestEntityTextDisplay {
	/**
	 * Scene Context.
	 */
	scene: Phaser.Scene;

	/**
	 * The font size of the text.
	 * @default
	 */
	fontSize: string = '12px';

	/**
	 * Font family to be used. It has to be included in your Phaser project.
	 * @default
	 */
	fontFamily: string = '"Press Start 2P"';

	/**
	 * Color of the font.
	 * @default
	 */
	fontColor: string = 'white';

	/**
	 * Color of the font when an Enemy hits the Player.
	 * @default
	 */
	enemyDamageColor: string = 'yellow';

	/**
	 * Color of the font when it's a critial hit.
	 * @default
	 */
	criticalDamageColor: string = 'red';

	/**
	 * Color of the font when it's healing.
	 * @default
	 */
	heallingColor: string = 'green';

	/**
	 * The amount of pixels that the font will move in the Y-Axis
	 * @default
	 */
	fontVerticalMovement: number = 5;

	/**
	 * The amount of time that the vertical movement will take to finish.
	 * @default
	 */
	verticalMovementDuration: number = 300;

	/**
	 * Space between lines of the dialog text.
	 * @default
	 */
	letterSpacing: number = 0;

	/**
	 * This class is responsible for displaying the damage that an entity receives.
	 * @param scene Scene Context.
	 */
	constructor(scene: Phaser.Scene) {
		this.scene = scene;
	}

	/**
	 * Displays the damage dealth to a given game entity.
	 * @param damage The damage number that should be displayed
	 * @param target The sprite that the damage should be displayed on.
	 * @param isCritical Whether this is a critical hit
	 * @param isHealing Whether this is healing
	 */
	displayDamage(damage: number, target: any, isCritical: boolean = false, isHealing: boolean = false): void {
		console.log('[EntityTextDisplay] displayDamage called:', {
			damage,
			targetX: target.container?.x,
			targetY: target.container?.y,
			isCritical,
			isHealing,
			sceneActive: this.scene?.scene?.isActive(),
			sceneKey: this.scene?.scene?.key,
		});

		const position = {
			x: target.container.x,
			y: target.container.y - 10,
		};

		if (target.entityName === ENTITIES.Player) {
			this.fontColor = this.enemyDamageColor;
		}

		let criticalSprite: Phaser.GameObjects.Sprite | undefined;
		if (isCritical) {
			// this.fontColor = this.criticalDamageColor;
			criticalSprite = this.scene.add.sprite(position.x, position.y, 'critical_2x');
			criticalSprite.setDepth(3000); // Ensure it's on top
			console.log('[EntityTextDisplay] Critical sprite created:', {
				x: criticalSprite.x,
				y: criticalSprite.y,
				visible: criticalSprite.visible,
				active: criticalSprite.active,
				depth: criticalSprite.depth,
			});
		}

		if (isHealing) {
			this.fontColor = this.heallingColor;
		}

		const damageSprite = this.scene.add.text(position.x, position.y, damage.toString(), {
			fontSize: this.fontSize,
			letterSpacing: this.letterSpacing,
			fontFamily: this.fontFamily,
			color: this.fontColor,
		});

		damageSprite.setOrigin(0.5, 1);
		damageSprite.setDepth(3000); // Ensure it's on top

		console.log('[EntityTextDisplay] Damage text created:', {
			text: damageSprite.text,
			x: damageSprite.x,
			y: damageSprite.y,
			visible: damageSprite.visible,
			active: damageSprite.active,
			depth: damageSprite.depth,
			color: this.fontColor,
		});

		if (criticalSprite) {
			if (damage.toString().length < 3) {
				criticalSprite.setOrigin(0.55, 0.65);
				criticalSprite.setScale(0.7);
			} else {
				criticalSprite.setOrigin(0.55, 0.57);
			}
		}

		damageSprite.setScale(0.4);

		this.scene.add.tween({
			targets: [damageSprite, criticalSprite],
			y: position.y - this.fontVerticalMovement,
			alpha: 0,
			duration: this.verticalMovementDuration,
			onComplete: (_t: Phaser.Tweens.Tween) => {
				damageSprite.destroy();
				if (criticalSprite) criticalSprite.destroy();
			},
		});
	}
}
