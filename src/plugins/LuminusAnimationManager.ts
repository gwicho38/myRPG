import Phaser from 'phaser';
import { AnimationNames } from '../consts/AnimationNames';
import { PlayerConfig } from '../consts/player/Player';
import { Player } from '../entities/Player';

/**
 * Animation manager for game entities like Player, Enemy, etc.
 */
export class LuminusAnimationManager extends AnimationNames {
	public entity: Player | Phaser.GameObjects.Sprite;
	public lastAnimation: string;

	/**
	 * This class is responsible for animating game objects such as Player, Enemy and so on.
	 */
	constructor(scene: Phaser.Scene, entity: Player | Phaser.GameObjects.Sprite) {
		super();

		/**
		 * Entity that will be animated.
		 */
		this.entity = entity;

		/**
		 * The last animation that was played.
		 */
		this.lastAnimation = '';
	}

	/**
	 * Check if the given animation is the same as current animation
	 */
	isSameAnimation(animation: string): boolean {
		const currentAnimation = this.entity.anims?.currentAnim?.key || '';
		return !currentAnimation.includes(animation);
	}

	/**
	 * Play a specific animation
	 */
	animate(animation: string): void {
		if (this.entity.anims && animation) {
			this.entity.anims.play(animation, true);
			this.lastAnimation = animation;
		}
	}

	/**
	 * Checks if the entity is moving based on velocity
	 */
	isMoving(): boolean {
		if ('container' in this.entity && this.entity.container?.body) {
			const body = this.entity.container.body as Phaser.Physics.Arcade.Body;
			return body.velocity.x !== 0 || body.velocity.y !== 0;
		}
		if (this.entity.body) {
			const body = this.entity.body as Phaser.Physics.Arcade.Body;
			return body.velocity.x !== 0 || body.velocity.y !== 0;
		}
		return false;
	}

	/**
	 * Animate entity based on angle from virtual joystick
	 */
	animateWithAngle(animation: string, angle: number): void {
		if (!this.entity.anims) return;

		const texture = this.entity.texture.key;
		const formattedAngle = parseFloat(angle.toString()).toFixed(2);
		const numAngle = parseFloat(formattedAngle);

		if (numAngle > -0.66 && numAngle < 0.66) {
			// Right direction
			this.entity.anims.play(animation + this.rightAnimationSufix, true);
			this.entity.flipX = false;
		} else if (numAngle > -2.33 && numAngle < -0.66) {
			// Up direction
			this.entity.anims.play(animation + this.upAnimationSufix, true);
		} else if (
			(numAngle < -2.33 && numAngle >= -3.14) ||
			(numAngle <= 3.14 && numAngle > 2.33)
		) {
			// Left direction
			if (this.entity.anims.animationManager.exists(animation + this.leftAnimationSufix)) {
				this.entity.anims.play(animation + this.leftAnimationSufix, true);
			} else {
				this.entity.anims.play(animation + this.rightAnimationSufix, true);
				this.entity.flipX = true;
			}
		} else if (numAngle <= 2.33 && numAngle > 0.66) {
			// Down direction
			this.entity.anims.play(animation + this.downAnimationSufix, true);
		}

		if (this.entity.anims.currentAnim) {
			this.lastAnimation = this.entity.anims.currentAnim.key;
		}
	}

	/**
	 * Set idle animation while maintaining current direction
	 */
	setIdleAnimation(): void {
		if (!this.entity.anims?.currentAnim) return;

		const currentAnimation = this.entity.anims.currentAnim.key;
		if (!currentAnimation.includes('idle') && !('isAtacking' in this.entity && this.entity.isAtacking)) {
			const splitAnimation = currentAnimation.split('-');
			if (splitAnimation.length >= 3) {
				const changedAnimation = `${this.entity.texture.key}-${this.idlePrefixAnimation}-${splitAnimation[2]}`;
				this.entity.anims.play(changedAnimation);
			}
		}
	}

	/**
	 * Set left walking animation
	 */
	setLeftAnimation(): void {
		const texture = this.entity.texture.key;
		const animation = `${texture}-${this.walkPrefixAnimation}-${this.leftAnimationSufix}`;

		if (this.entity.anims?.animationManager.exists(animation)) {
			this.entity.anims.play(animation, true);
		} else {
			// Fallback to right animation with flip
			const rightAnimation = `${texture}-${this.walkPrefixAnimation}-${this.rightAnimationSufix}`;
			if (this.entity.anims?.animationManager.exists(rightAnimation)) {
				this.entity.anims.play(rightAnimation, true);
				this.entity.flipX = true;
			}
		}
	}

	/**
	 * Set right walking animation
	 */
	setRightAnimation(): void {
		const texture = this.entity.texture.key;
		const animation = `${texture}-${this.walkPrefixAnimation}-${this.rightAnimationSufix}`;

		if (this.entity.anims?.animationManager.exists(animation)) {
			this.entity.anims.play(animation, true);
			this.entity.flipX = false;
		}
	}

	/**
	 * Set up walking animation
	 */
	setUpAnimation(): void {
		const texture = this.entity.texture.key;
		const animation = `${texture}-${this.walkPrefixAnimation}-${this.upAnimationSufix}`;

		if (this.entity.anims?.animationManager.exists(animation)) {
			this.entity.anims.play(animation, true);
		}
	}

	/**
	 * Set down walking animation
	 */
	setDownAnimation(): void {
		const texture = this.entity.texture.key;
		const animation = `${texture}-${this.walkPrefixAnimation}-${this.downAnimationSufix}`;

		if (this.entity.anims?.animationManager.exists(animation)) {
			this.entity.anims.play(animation, true);
		}
	}
}