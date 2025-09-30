import { AnimationNames } from '../consts/AnimationNames';
import PhaserJuice from 'phaser3-juice-plugin';
import Phaser from 'phaser';
import { ENTITIES } from '../consts/Entities';
import { LuminusEntityTextDisplay } from './LuminusEntityTextDisplay';
import { CRITICAL_MULTIPLIER } from '../consts/Battle';
import { ExpManager } from './attributes/ExpManager';

/**
 * @class
 */
export class LuminusBattleManager extends AnimationNames {
	/**
	 * The name of the variables that the battle scene will look for to do overlaps and deal damage to the Enemy.
	 */
	enemiesVariableName: string;

	/**
	 * The name of the variables that the battle scene will look for to do overlaps and deal damage to the Player.
	 */
	playerVariableName: string;

	/**
	 * The name of the SFX of the atack being performed.
	 */
	atackSoundAnimationNames: string[];

	/**
	 * The name of the SFX of a damage being done.
	 */
	damageSoundNames: string[];

	/**
	 * The name of the default attack direction frame name.
	 */
	atackDirectionFrameName: {
		up: string;
		right: string;
		down: string;
		left: string;
	};

	/**
	 * The velocity that the hitbox will assume as soon as it's created.
	 */
	hitboxVelocity: number;

	/**
	 * This is the amount that the hitbox will be farther from the player. The greater the closer, for it's dividing the body height of the atacker
	 */
	hitboxOffsetDividerY: number;

	/**
	 * This is how much the hitbox atack body should be offset from it's original position.
	 */
	hitboxOffsetBody: number;

	/**
	 * The name of the hitbox Sprite.
	 */
	hitboxSpriteName: string;

	/**
	 * The plugin that will make the hit effect to the player and enemy.
	 */
	phaserJuice: PhaserJuice | null;

	/**
	 * The atack variation. This number represents a percentage of variation of the damage.
	 * The damage can be higher than the base damage, or lower than the base damage.
	 */
	variation: number;

	/**
	 * The lifetime of the Enemy Hitbox.
	 * This defines how long the Hitbox will keep moving towards the enemy.
	 */
	enemyHitboxLifetime: number;

	/**
	 * The name of the Enemy Constructor Class.
	 */
	enemyConstructorName: string;

	/**
	 * The name of the Player Constructor Class.
	 */
	PlayerConstructorName: string;

	/**
	 * The LuminusEntityTextDisplay class, responsible for showing the player the damage dealt to a given Entity / Enemy.
	 */
	luminusEntityTextDisplay: LuminusEntityTextDisplay | null;

	/**
	 * This class is responsible for managing all the battle in the game.
	 */
	constructor() {
		super();

		this.enemiesVariableName = 'enemies';
		this.playerVariableName = 'player';
		this.atackSoundAnimationNames = ['atack01', 'atack02', 'atack03'];
		this.damageSoundNames = ['damage01', 'damage02', 'damage03'];
		this.atackDirectionFrameName = {
			up: 'up',
			right: 'right',
			down: 'down',
			left: 'left',
		};
		this.hitboxVelocity = 10;
		this.hitboxOffsetDividerY = 1.5;
		this.hitboxOffsetBody = 4;
		this.hitboxSpriteName = 'slash';
		this.phaserJuice = null;
		this.variation = 10;
		this.enemyHitboxLifetime = 200;
		this.enemyConstructorName = ENTITIES.Enemy;
		this.PlayerConstructorName = ENTITIES.Player;
		this.luminusEntityTextDisplay = null;
	}

	/**
	 * This function creates the hitbox. You should be aware that every hitbox will be different based on your game. This
	 * template uses a 16x16 hitbox sprite.
	 * @param atacker The atacker
	 */
	createHitBox(atacker: any): Phaser.Physics.Arcade.Sprite {
		const hitbox = atacker.scene.physics.add.sprite(
			atacker.container.x,
			atacker.container.y,
			this.hitboxSpriteName,
			0
		);

		hitbox.body.debugBodyColor = 0xff00ff;

		hitbox.alpha = 0.3;
		hitbox.depth = 50;
		if (atacker.frame.name.includes(this.atackDirectionFrameName.up)) {
			hitbox.body.setOffset(0, 4);
			const rotation = -1.57;
			this.setHitboxRotation(
				hitbox,
				rotation,
				{
					x: atacker.container.x,
					y: atacker.container.y - atacker.hitZone.body.height / this.hitboxOffsetDividerY,
				},
				atacker
			);
		} else if (atacker.frame.name.includes(this.atackDirectionFrameName.right) && !atacker.flipX) {
			hitbox.body.setOffset(-4, 0);
			const rotation = 0;
			this.setHitboxRotation(
				hitbox,
				rotation,
				{
					x: atacker.container.x + atacker.hitZone.body.width,
					y: atacker.container.y,
				},
				atacker
			);
		} else if (atacker.frame.name.includes(this.atackDirectionFrameName.down)) {
			hitbox.body.setOffset(0, -4);
			const rotation = 1.57;
			this.setHitboxRotation(
				hitbox,
				rotation,
				{
					x: atacker.container.x,
					y: atacker.container.y + atacker.hitZone.body.height / this.hitboxOffsetDividerY,
				},
				atacker
			);
		} else if (atacker.frame.name.includes(this.atackDirectionFrameName.left) || atacker.flipX) {
			hitbox.body.setOffset(4, 0);
			const rotation = -3.14;
			this.setHitboxRotation(
				hitbox,
				rotation,
				{
					x: atacker.container.x - atacker.hitZone.body.width,
					y: atacker.container.y,
				},
				atacker
			);
		}
		return hitbox;
	}

	/**
	 * Sets position of the sprite for a given rotation. The rotation should match the atack direction that you want.
	 * @param hitbox The hitbox sprite that will be changed.
	 * @param rotation The rotation in radians.
	 * @param position The new position of the hitbox.
	 * @param _atacker The atacker to get the scene from.
	 */
	setHitboxRotation(
		hitbox: Phaser.Physics.Arcade.Sprite,
		rotation: number,
		position: { x: number; y: number },
		_atacker: any
	): void {
		hitbox.setRotation(rotation);
		hitbox.setPosition(position.x, position.y);
		// atacker.scene.physics.velocityFromRotation(rotation, this.hitboxVelocity, hitbox.body.velocity);
	}

	/**
	 * Damages the target and manages any dependencies like decreasing the health, killing the target and any other thing needed.
	 * @param atacker Usually the atacker is the player.
	 * @param target  Usually the target is the enemy.
	 */
	takeDamage(atacker: any, target: any): void {
		// Randomizes the name of the damage sound.
		let damageName = this.damageSoundNames[Math.floor(Math.random() * this.damageSoundNames.length)];
		let damage = this.randomDamage(atacker.attributes.atack - target.attributes.defense);
		const isCritical = this.checkAtackIsCritial(atacker.attributes.critical);
		const hit = this.checkAtackHit(atacker.attributes.hit, target.attributes.flee);
		if (isCritical) {
			damage = Math.ceil(atacker.attributes.atack * CRITICAL_MULTIPLIER);
			damageName = 'critical';
		}
		if (hit || isCritical) {
			if (damage > 0) {
				if (target.healthBar) target.healthBar.decrease(damage);
				target.attributes.health -= damage;
			} else {
				target.attributes.health -= 1;
				target.healthBar.decrease(1);
			}

			if (target.luminusHUDProgressBar) {
				target.luminusHUDProgressBar.updateHealth();
			}
			this.phaserJuice!.add(target).flash();
			atacker.scene.sound.add(damageName).play();
			if (target.attributes.health <= 0) {
				if (atacker.entityName === ENTITIES.Player) {
					ExpManager.addExp(atacker, target.exp);
				}
				setTimeout((_t) => {
					if (target.entityName === this.enemyConstructorName) target.dropItems();
					target.anims.stop();
					target.destroyAll();
				}, 100);
			}
			// Not very Optimized.
			this.luminusEntityTextDisplay = new LuminusEntityTextDisplay(target.scene);
			this.luminusEntityTextDisplay.displayDamage(damage, target, isCritical);
		} else {
			this.luminusEntityTextDisplay = new LuminusEntityTextDisplay(target.scene);
			this.luminusEntityTextDisplay.displayDamage('MISS', target);
		}

		/**
		 * Makes random damage.
		 * Decreses the health based on the target defense.
		 * Updates the Health Bar.
		 * Kills the target if it reaches the 0 or less hit points.
		 */
	}

	/**
	 * Checks if the atacker hit the target.
	 * @param hit the atacker's hit.
	 * @param flee the target's flee rate.
	 * @returns Returns if the atacker hit the target.
	 */
	checkAtackHit(hit: number, flee: number): boolean {
		const random = Math.random() * 100;
		if (isFinite((hit * 100) / flee)) {
			return (hit * 100) / flee >= random;
		} else {
			return true;
		}
	}

	/**
	 * Checks if it is a critical hit.
	 * PS: Critical hits ignore flee. Therefore, a critical hit should not miss.
	 * @param critChance atacker critical chance.
	 * @returns If it's a critical hit or not.
	 */
	checkAtackIsCritial(critChance: number): boolean {
		const random = Math.random() * 100;
		return critChance >= random;
	}

	/**
	 * Generates a random damage to deal to the target.
	 * @param damage
	 */
	randomDamage(damage: number): number {
		let variationDamage = damage * (this.variation / 100);

		if (Math.random() > 0.5) {
			variationDamage = damage + variationDamage;
		} else {
			variationDamage = damage - variationDamage;
		}

		return Math.floor(variationDamage);
	}

	/**
	 * This method will perform the block routine, reducing incoming damage.
	 * @param blocker the entity that will block.
	 */
	block(blocker: any): void {
		if (blocker.canBlock && blocker.canMove && !blocker.isAtacking) {
			blocker.isBlocking = true;
			blocker.canMove = false;
			blocker.canAtack = false;

			const texture = blocker.texture.key;

			// Play block animation if it exists, otherwise just set blocking state
			const blockAnimKey = `${texture}-block-down`;
			if (blocker.anims.exists(blockAnimKey)) {
				blocker.anims.play(blockAnimKey, true);
			}

			// Add visual feedback - darker tint while blocking
			blocker.setTint(0x888888);
		}
	}

	/**
	 * This method will stop the block routine.
	 * @param blocker the entity that will stop blocking.
	 */
	stopBlock(blocker: any): void {
		if (blocker.isBlocking) {
			blocker.isBlocking = false;
			blocker.canMove = true;
			blocker.canAtack = true;

			// Remove visual feedback
			blocker.clearTint();

			// Return to idle animation
			const texture = blocker.texture.key;
			const idleAnimKey = `${texture}-idle-down`;
			if (blocker.anims.exists(idleAnimKey)) {
				blocker.anims.play(idleAnimKey, true);
			}
		}
	}

	/**
	 * This method will perform the atack routine, checking for enemies within range.
	 * The atacker should have a body in order to stop him from walking as the movement is expected to be done with Velocity.
	 * @param atacker the atacker.
	 */
	atack(atacker: any): void {
		if (atacker.canAtack && atacker.canMove) {
			this.phaserJuice = new PhaserJuice(atacker.scene, atacker.scene.plugins);
			atacker.isAtacking = true;
			atacker.canAtack = false;
			if (atacker.walkDust) atacker.walkDust.on = false;
			atacker.container.body.maxSpeed = 0;
			const texture = atacker.texture.key;
			const currrentAnimation = atacker.anims.currentAnim.key;
			const atackAnimation = currrentAnimation.split('-');
			// Randomizes the name of the atack sound.
			const animationName =
				this.atackSoundAnimationNames[Math.floor(Math.random() * this.atackSoundAnimationNames.length)];

			let hitBoxSprite: Phaser.Physics.Arcade.Sprite | undefined;
			if (atacker.entityName === this.PlayerConstructorName) {
				hitBoxSprite = this.createHitBox(atacker);
				hitBoxSprite.anims.play(this.hitboxSpriteName);
			}

			// Stores the enemies that where atacked on the current animation.
			const atackedEnemies: any[] = [];
			// Destroys the slash atack if the atacker dies.
			atacker.scene.events.on('update', (_update: any) => {
				if (hitBoxSprite && hitBoxSprite.active && atacker && !atacker.active) {
					hitBoxSprite.destroy();
				}

				if (
					hitBoxSprite &&
					hitBoxSprite.active &&
					atacker &&
					atacker.active &&
					atacker.entityName === this.PlayerConstructorName
				) {
					atacker.scene.physics.overlap(
						hitBoxSprite,
						atacker.scene[this.enemiesVariableName],

						(_h: any, enemy: any) => {
							this.takeDamage(atacker, enemy);
							enemy.canTakeDamage = false;
							atacker.canAtack = false;
							atackedEnemies.push(enemy);
						},
						(_h: any, enemy: any) => {
							return enemy.canTakeDamage;
						}
					);
				} else if (
					hitBoxSprite &&
					hitBoxSprite.active &&
					atacker &&
					atacker.active &&
					atacker.entityName === this.enemyConstructorName
				) {
					atacker.scene.physics.overlap(
						hitBoxSprite,
						atacker.scene[this.playerVariableName].hitZone,
						(_h: any, _e: any) => {
							const enemy = atacker.scene[this.playerVariableName];
							this.takeDamage(atacker, enemy);
							enemy.canTakeDamage = false;
							atackedEnemies.push(enemy);
							atacker.canAtack = false;
							// if (atacker.anims.getProgress() === 1) {
							// }
						},
						(_h: any, _e: any) => {
							const enemy = atacker.scene[this.playerVariableName];
							return enemy.canTakeDamage;
						}
					);
				}
			});
			// Animations events have to come before the animation is played, they are triggered propperly.
			atacker.once(Phaser.Animations.Events.ANIMATION_START, (start: any) => {
				if (
					start.key === `${texture}-${this.atkPrefixAnimation}-${atackAnimation[2]}` &&
					atacker.entityName === this.PlayerConstructorName
				) {
					atacker.scene.sound.add(animationName).play();
				}
			});

			atacker.once(
				Phaser.Animations.Events.ANIMATION_COMPLETE,
				(animationState: any) => {
					if (animationState.key === `${texture}-${this.atkPrefixAnimation}-${atackAnimation[2]}`) {
						atacker.isAtacking = false;
						atacker.container.body.maxSpeed = atacker.speed;
						atacker.canAtack = true; // Enables the atack once the player finishes the animation
						if (atacker.entityName === this.enemyConstructorName) {
							hitBoxSprite = this.createHitBox(atacker);
							hitBoxSprite.anims.play(this.hitboxSpriteName);
							setTimeout((_time) => {
								this.resetEnemyState(atackedEnemies);
								hitBoxSprite!.destroy();
							}, this.enemyHitboxLifetime);
						}

						if (hitBoxSprite && hitBoxSprite.active && atacker.entityName !== this.enemyConstructorName)
							hitBoxSprite.destroy();

						this.resetEnemyState(atackedEnemies);
					}
				},
				this
			);

			atacker.anims.play(`${texture}-${this.atkPrefixAnimation}-${atackAnimation[2]}`, true);
		}
	}

	/**
	 * Resets the 'canTakeDamage' state to true.
	 * @param atackedEnemies
	 */
	resetEnemyState(atackedEnemies: any[]): void {
		if (atackedEnemies && atackedEnemies.length) {
			atackedEnemies.forEach((e) => {
				e.canTakeDamage = true;
			});
		}
	}
}
