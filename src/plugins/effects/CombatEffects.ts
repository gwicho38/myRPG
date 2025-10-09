/**
 * CombatEffects Plugin
 * Handles visual particle effects for combat interactions (hits, blocks, deaths)
 */

import Phaser from 'phaser';
import {
	HIT_IMPACT_PHYSICAL,
	HIT_IMPACT_FIRE,
	HIT_IMPACT_ICE,
	HIT_IMPACT_LIGHTNING,
	CRITICAL_HIT_PARTICLE,
	BLOCK_PARRY_PARTICLE,
	DEATH_EXPLOSION_PARTICLE,
	BLOOD_SPLATTER_PARTICLE,
	DAMAGE_TYPE_COLORS,
} from '../../consts/ParticleConfigs';

export type DamageType = 'PHYSICAL' | 'FIRE' | 'ICE' | 'LIGHTNING' | 'POISON' | 'HOLY' | 'DARK';

export class CombatEffects {
	private scene: Phaser.Scene;
	private particleTexture: string;

	constructor(scene: Phaser.Scene, particleTexture: string = 'flares') {
		this.scene = scene;
		this.particleTexture = particleTexture;
	}

	/**
	 * Show hit impact effect based on damage type
	 */
	public hitImpact(x: number, y: number, damageType: DamageType = 'PHYSICAL', count: number = 15): void {
		let config;

		switch (damageType) {
			case 'FIRE':
				config = HIT_IMPACT_FIRE;
				break;
			case 'ICE':
				config = HIT_IMPACT_ICE;
				break;
			case 'LIGHTNING':
				config = HIT_IMPACT_LIGHTNING;
				break;
			default:
				config = HIT_IMPACT_PHYSICAL;
		}

		const emitter = this.scene.add.particles(x, y, this.particleTexture, config);
		emitter.explode(count, x, y);

		this.scene.time.delayedCall(600, () => {
			emitter.destroy();
		});
	}

	/**
	 * Show critical hit effect with screen shake
	 */
	public criticalHit(x: number, y: number, count: number = 30, shake: boolean = true): void {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, CRITICAL_HIT_PARTICLE);
		emitter.explode(count, x, y);

		// Add "CRITICAL!" text
		const critText = this.scene.add
			.text(x, y - 40, 'CRITICAL!', {
				fontSize: '32px',
				color: '#ffff00',
				fontStyle: 'bold',
				stroke: '#ff8800',
				strokeThickness: 4,
			})
			.setOrigin(0.5);

		// Animate text
		this.scene.tweens.add({
			targets: critText,
			y: y - 80,
			alpha: 0,
			scale: 1.5,
			duration: 800,
			ease: 'Cubic.easeOut',
			onComplete: () => {
				critText.destroy();
			},
		});

		// Screen shake
		if (shake && this.scene.cameras.main) {
			this.scene.cameras.main.shake(200, 0.01);
		}

		this.scene.time.delayedCall(700, () => {
			emitter.destroy();
		});
	}

	/**
	 * Show block/parry effect (deflection)
	 */
	public blockParry(x: number, y: number, direction: number = 0, count: number = 12): void {
		const config = { ...BLOCK_PARRY_PARTICLE };

		// Adjust angle based on deflection direction
		const directionDegrees = Phaser.Math.RadToDeg(direction);
		config.angle = { min: directionDegrees - 45, max: directionDegrees + 45 };

		const emitter = this.scene.add.particles(x, y, this.particleTexture, config);
		emitter.explode(count, x, y);

		// Add "BLOCKED!" text
		const blockText = this.scene.add
			.text(x, y - 30, 'BLOCKED!', {
				fontSize: '20px',
				color: '#ffee88',
				fontStyle: 'bold',
				stroke: '#aa8800',
				strokeThickness: 3,
			})
			.setOrigin(0.5);

		this.scene.tweens.add({
			targets: blockText,
			y: y - 50,
			alpha: 0,
			duration: 600,
			ease: 'Cubic.easeOut',
			onComplete: () => {
				blockText.destroy();
			},
		});

		this.scene.time.delayedCall(500, () => {
			emitter.destroy();
		});
	}

	/**
	 * Show damage number floating upward
	 */
	public damageNumber(
		x: number,
		y: number,
		damage: number,
		damageType: DamageType = 'PHYSICAL',
		isCritical: boolean = false
	): void {
		// Get color based on damage type
		const colors = DAMAGE_TYPE_COLORS[damageType] || DAMAGE_TYPE_COLORS.PHYSICAL;
		const color = Phaser.Display.Color.RGBToString(
			(colors[0] >> 16) & 0xff,
			(colors[0] >> 8) & 0xff,
			colors[0] & 0xff
		);

		const fontSize = isCritical ? '36px' : '24px';
		const text = isCritical ? `${damage}!` : `${damage}`;

		const damageText = this.scene.add
			.text(x, y, text, {
				fontSize,
				color,
				fontStyle: isCritical ? 'bold' : 'normal',
				stroke: '#000000',
				strokeThickness: isCritical ? 4 : 3,
			})
			.setOrigin(0.5);

		// Float upward and fade
		this.scene.tweens.add({
			targets: damageText,
			y: y - 60,
			alpha: 0,
			duration: 1000,
			ease: 'Cubic.easeOut',
			onComplete: () => {
				damageText.destroy();
			},
		});
	}

	/**
	 * Show death explosion effect
	 */
	public deathExplosion(x: number, y: number, count: number = 40): void {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, DEATH_EXPLOSION_PARTICLE);
		emitter.explode(count, x, y);

		this.scene.time.delayedCall(1100, () => {
			emitter.destroy();
		});
	}

	/**
	 * Show blood splatter effect (optional, can be disabled for less gore)
	 */
	public bloodSplatter(
		x: number,
		y: number,
		direction: number = 0,
		count: number = 15,
		enabled: boolean = false
	): void {
		if (!enabled) return;

		const config = { ...BLOOD_SPLATTER_PARTICLE };

		// Adjust angle based on hit direction
		const directionDegrees = Phaser.Math.RadToDeg(direction);
		config.angle = { min: directionDegrees - 30, max: directionDegrees + 30 };

		const emitter = this.scene.add.particles(x, y, this.particleTexture, config);
		emitter.explode(count, x, y);

		this.scene.time.delayedCall(900, () => {
			emitter.destroy();
		});
	}

	/**
	 * Combined hit effect with damage number
	 */
	public fullHitEffect(
		x: number,
		y: number,
		damage: number,
		damageType: DamageType = 'PHYSICAL',
		isCritical: boolean = false,
		showBlood: boolean = false
	): void {
		if (isCritical) {
			this.criticalHit(x, y);
		} else {
			this.hitImpact(x, y, damageType);
		}

		this.damageNumber(x, y, damage, damageType, isCritical);

		if (showBlood) {
			this.bloodSplatter(x, y, Math.PI, 15, true);
		}
	}

	/**
	 * Heal effect (green numbers floating up)
	 */
	public healNumber(x: number, y: number, healAmount: number): void {
		const healText = this.scene.add
			.text(x, y, `+${healAmount}`, {
				fontSize: '24px',
				color: '#44ff44',
				fontStyle: 'bold',
				stroke: '#006600',
				strokeThickness: 3,
			})
			.setOrigin(0.5);

		this.scene.tweens.add({
			targets: healText,
			y: y - 50,
			alpha: 0,
			duration: 1000,
			ease: 'Cubic.easeOut',
			onComplete: () => {
				healText.destroy();
			},
		});
	}

	/**
	 * Miss effect (show "MISS" text)
	 */
	public miss(x: number, y: number): void {
		const missText = this.scene.add
			.text(x, y - 20, 'MISS', {
				fontSize: '20px',
				color: '#888888',
				fontStyle: 'italic',
				stroke: '#000000',
				strokeThickness: 2,
			})
			.setOrigin(0.5);

		this.scene.tweens.add({
			targets: missText,
			x: x + 40,
			y: y - 40,
			alpha: 0,
			duration: 800,
			ease: 'Cubic.easeOut',
			onComplete: () => {
				missText.destroy();
			},
		});
	}

	/**
	 * Dodge effect (show "DODGE" text with quick movement)
	 */
	public dodge(x: number, y: number): void {
		const dodgeText = this.scene.add
			.text(x, y - 20, 'DODGE', {
				fontSize: '20px',
				color: '#ffee88',
				fontStyle: 'bold',
				stroke: '#996600',
				strokeThickness: 2,
			})
			.setOrigin(0.5);

		this.scene.tweens.add({
			targets: dodgeText,
			x: x - 50,
			y: y - 30,
			alpha: 0,
			duration: 600,
			ease: 'Back.easeOut',
			onComplete: () => {
				dodgeText.destroy();
			},
		});
	}

	/**
	 * Destroy method for cleanup
	 */
	public destroy(): void {
		// Cleanup handled by scene destroy
	}
}
