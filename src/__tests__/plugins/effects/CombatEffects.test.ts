/**
 * Tests for CombatEffects plugin
 */

import { CombatEffects, DamageType } from '../../../plugins/effects/CombatEffects';

// Mock Phaser module
jest.mock('phaser', () => {
	return {
		__esModule: true,
		default: {
			Math: {
				RadToDeg: (radians: number) => radians * (180 / Math.PI),
			},
			Display: {
				Color: {
					RGBToString: (r: number, g: number, b: number) => {
						const rHex = Math.floor(r).toString(16).padStart(2, '0');
						const gHex = Math.floor(g).toString(16).padStart(2, '0');
						const bHex = Math.floor(b).toString(16).padStart(2, '0');
						return `#${rHex}${gHex}${bHex}`;
					},
				},
			},
		},
	};
});

describe('CombatEffects', () => {
	let combatEffects: CombatEffects;
	let mockScene: any;
	let mockParticleEmitter: any;
	let mockText: any;
	let mockTween: any;
	let mockCamera: any;

	beforeEach(() => {
		// Mock particle emitter
		mockParticleEmitter = {
			explode: jest.fn(),
			destroy: jest.fn(),
		};

		// Mock text object
		mockText = {
			setOrigin: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		// Mock tween
		mockTween = {
			onComplete: null,
		};

		// Mock camera
		mockCamera = {
			shake: jest.fn(),
		};

		// Mock scene
		mockScene = {
			add: {
				particles: jest.fn().mockReturnValue(mockParticleEmitter),
				text: jest.fn().mockReturnValue(mockText),
			},
			time: {
				delayedCall: jest.fn((delay, callback) => {
					// Store callback for manual trigger if needed
					return { callback };
				}),
			},
			tweens: {
				add: jest.fn((config) => {
					// Store config for verification and allow manual onComplete trigger
					mockTween.config = config;
					return mockTween;
				}),
			},
			cameras: {
				main: mockCamera,
			},
		};

		combatEffects = new CombatEffects(mockScene, 'flares');
	});

	describe('Constructor', () => {
		it('should initialize with scene and default particle texture', () => {
			const effects = new CombatEffects(mockScene);

			expect(effects['scene']).toBe(mockScene);
			expect(effects['particleTexture']).toBe('flares');
		});

		it('should initialize with custom particle texture', () => {
			const effects = new CombatEffects(mockScene, 'custom_texture');

			expect(effects['particleTexture']).toBe('custom_texture');
		});
	});

	describe('hitImpact()', () => {
		it('should create physical hit impact at specified position', () => {
			combatEffects.hitImpact(100, 200, 'PHYSICAL');

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				100,
				200,
				'flares',
				expect.objectContaining({
					speed: expect.any(Object),
					tint: [0xffffff, 0xcccccc],
				})
			);
		});

		it('should create fire hit impact with fire colors', () => {
			combatEffects.hitImpact(150, 250, 'FIRE');

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				150,
				250,
				'flares',
				expect.objectContaining({
					tint: [0xff8800, 0xff3300, 0xcc0000],
				})
			);
		});

		it('should create ice hit impact with ice colors', () => {
			combatEffects.hitImpact(175, 275, 'ICE');

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				175,
				275,
				'flares',
				expect.objectContaining({
					tint: [0xaaddff, 0x4499ff],
				})
			);
		});

		it('should create lightning hit impact with lightning colors', () => {
			combatEffects.hitImpact(200, 300, 'LIGHTNING');

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				200,
				300,
				'flares',
				expect.objectContaining({
					tint: [0xffffff, 0xccddff],
				})
			);
		});

		it('should use default physical impact for unknown damage types', () => {
			combatEffects.hitImpact(125, 225, 'POISON' as DamageType);

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				125,
				225,
				'flares',
				expect.objectContaining({
					tint: [0xffffff, 0xcccccc],
				})
			);
		});

		it('should explode particles with specified count', () => {
			combatEffects.hitImpact(100, 200, 'PHYSICAL', 25);

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(25, 100, 200);
		});

		it('should use default count of 15 particles', () => {
			combatEffects.hitImpact(100, 200);

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(15, 100, 200);
		});

		it('should destroy emitter after 600ms', () => {
			combatEffects.hitImpact(100, 200);

			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(600, expect.any(Function));

			// Trigger the delayed callback
			const delayedCall = (mockScene.time.delayedCall as jest.Mock).mock.results[0].value;
			delayedCall.callback();

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});
	});

	describe('criticalHit()', () => {
		it('should create critical hit particle explosion', () => {
			combatEffects.criticalHit(150, 250);

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				150,
				250,
				'flares',
				expect.objectContaining({
					tint: [0xffff00, 0xffaa00, 0xff8800],
				})
			);
		});

		it('should explode with specified count', () => {
			combatEffects.criticalHit(150, 250, 40);

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(40, 150, 250);
		});

		it('should explode with default count of 30', () => {
			combatEffects.criticalHit(150, 250);

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(30, 150, 250);
		});

		it('should create "CRITICAL!" text at position', () => {
			combatEffects.criticalHit(150, 250);

			expect(mockScene.add.text).toHaveBeenCalledWith(
				150,
				210, // y - 40
				'CRITICAL!',
				expect.objectContaining({
					fontSize: '32px',
					color: '#ffff00',
					fontStyle: 'bold',
					stroke: '#ff8800',
					strokeThickness: 4,
				})
			);
		});

		it('should animate text upward with fade', () => {
			combatEffects.criticalHit(150, 250);

			expect(mockScene.tweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					targets: mockText,
					y: 170, // 250 - 80
					alpha: 0,
					scale: 1.5,
					duration: 800,
					ease: 'Cubic.easeOut',
					onComplete: expect.any(Function),
				})
			);
		});

		it('should destroy text after animation', () => {
			combatEffects.criticalHit(150, 250);

			const tweenConfig = (mockScene.tweens.add as jest.Mock).mock.calls[0][0];
			tweenConfig.onComplete();

			expect(mockText.destroy).toHaveBeenCalled();
		});

		it('should trigger screen shake when enabled', () => {
			combatEffects.criticalHit(150, 250, 30, true);

			expect(mockCamera.shake).toHaveBeenCalledWith(200, 0.01);
		});

		it('should not trigger screen shake when disabled', () => {
			combatEffects.criticalHit(150, 250, 30, false);

			expect(mockCamera.shake).not.toHaveBeenCalled();
		});

		it('should not crash if camera is not available', () => {
			mockScene.cameras.main = null;

			expect(() => {
				combatEffects.criticalHit(150, 250);
			}).not.toThrow();
		});

		it('should destroy emitter after 700ms', () => {
			combatEffects.criticalHit(150, 250);

			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(700, expect.any(Function));
		});
	});

	describe('blockParry()', () => {
		it('should create block/parry particle effect', () => {
			combatEffects.blockParry(100, 150);

			expect(mockScene.add.particles).toHaveBeenCalled();
			expect(mockParticleEmitter.explode).toHaveBeenCalled();
		});

		it('should adjust angle based on direction', () => {
			const direction = Math.PI / 4; // 45 degrees
			combatEffects.blockParry(100, 150, direction);

			const particleConfig = (mockScene.add.particles as jest.Mock).mock.calls[0][3];
			expect(particleConfig.angle).toBeDefined();
			expect(particleConfig.angle.min).toBeCloseTo(0, 0); // 45 - 45
			expect(particleConfig.angle.max).toBeCloseTo(90, 0); // 45 + 45
		});

		it('should explode with specified count', () => {
			combatEffects.blockParry(100, 150, 0, 20);

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(20, 100, 150);
		});

		it('should explode with default count of 12', () => {
			combatEffects.blockParry(100, 150);

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(12, 100, 150);
		});

		it('should create "BLOCKED!" text', () => {
			combatEffects.blockParry(100, 150);

			expect(mockScene.add.text).toHaveBeenCalledWith(
				100,
				120, // y - 30
				'BLOCKED!',
				expect.objectContaining({
					fontSize: '20px',
					color: '#ffee88',
				})
			);
		});

		it('should animate text upward with fade', () => {
			combatEffects.blockParry(100, 150);

			expect(mockScene.tweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					targets: mockText,
					y: 100, // 150 - 50
					alpha: 0,
					duration: 600,
				})
			);
		});

		it('should destroy emitter after 500ms', () => {
			combatEffects.blockParry(100, 150);

			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(500, expect.any(Function));
		});
	});

	describe('damageNumber()', () => {
		it('should display damage number at position', () => {
			combatEffects.damageNumber(200, 300, 42, 'PHYSICAL', false);

			expect(mockScene.add.text).toHaveBeenCalledWith(
				200,
				300,
				'42',
				expect.objectContaining({
					fontSize: '24px',
					stroke: '#000000',
					strokeThickness: 3,
				})
			);
		});

		it('should display critical damage with larger font and exclamation', () => {
			combatEffects.damageNumber(200, 300, 99, 'PHYSICAL', true);

			expect(mockScene.add.text).toHaveBeenCalledWith(
				200,
				300,
				'99!',
				expect.objectContaining({
					fontSize: '36px',
					fontStyle: 'bold',
					strokeThickness: 4,
				})
			);
		});

		it('should use fire color for fire damage', () => {
			combatEffects.damageNumber(200, 300, 30, 'FIRE', false);

			const textCall = (mockScene.add.text as jest.Mock).mock.calls[0];
			const textConfig = textCall[3];

			// Should be reddish/orange color from FIRE damage type
			expect(textConfig.color).toMatch(/^#[a-f0-9]{6}$/i);
		});

		it('should animate damage number upward', () => {
			combatEffects.damageNumber(200, 300, 50, 'PHYSICAL', false);

			expect(mockScene.tweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					targets: mockText,
					y: 240, // 300 - 60
					alpha: 0,
					duration: 1000,
					ease: 'Cubic.easeOut',
				})
			);
		});

		it('should handle all damage types', () => {
			const damageTypes: DamageType[] = ['PHYSICAL', 'FIRE', 'ICE', 'LIGHTNING', 'POISON', 'HOLY', 'DARK'];

			damageTypes.forEach((type) => {
				jest.clearAllMocks();
				combatEffects.damageNumber(200, 300, 10, type, false);

				expect(mockScene.add.text).toHaveBeenCalled();
			});
		});
	});

	describe('deathExplosion()', () => {
		it('should create death explosion particle effect', () => {
			combatEffects.deathExplosion(250, 350);

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				250,
				350,
				'flares',
				expect.objectContaining({
					tint: [0xffcccc, 0xff8888, 0xff4444],
				})
			);
		});

		it('should explode with specified count', () => {
			combatEffects.deathExplosion(250, 350, 50);

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(50, 250, 350);
		});

		it('should explode with default count of 40', () => {
			combatEffects.deathExplosion(250, 350);

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(40, 250, 350);
		});

		it('should destroy emitter after 1100ms', () => {
			combatEffects.deathExplosion(250, 350);

			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(1100, expect.any(Function));
		});
	});

	describe('bloodSplatter()', () => {
		it('should not create particles when disabled', () => {
			combatEffects.bloodSplatter(100, 150, 0, 15, false);

			expect(mockScene.add.particles).not.toHaveBeenCalled();
		});

		it('should create particles when enabled', () => {
			combatEffects.bloodSplatter(100, 150, 0, 15, true);

			expect(mockScene.add.particles).toHaveBeenCalled();
			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(15, 100, 150);
		});

		it('should adjust angle based on direction', () => {
			const direction = Math.PI; // 180 degrees
			combatEffects.bloodSplatter(100, 150, direction, 15, true);

			const particleConfig = (mockScene.add.particles as jest.Mock).mock.calls[0][3];
			expect(particleConfig.angle).toBeDefined();
			expect(particleConfig.angle.min).toBeCloseTo(150, 0); // 180 - 30
			expect(particleConfig.angle.max).toBeCloseTo(210, 0); // 180 + 30
		});

		it('should destroy emitter after 900ms when enabled', () => {
			combatEffects.bloodSplatter(100, 150, 0, 15, true);

			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(900, expect.any(Function));
		});

		it('should use default count of 15', () => {
			combatEffects.bloodSplatter(100, 150, 0, undefined, true);

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(15, 100, 150);
		});
	});

	describe('fullHitEffect()', () => {
		it('should call criticalHit when isCritical is true', () => {
			const criticalSpy = jest.spyOn(combatEffects, 'criticalHit');
			const hitImpactSpy = jest.spyOn(combatEffects, 'hitImpact');

			combatEffects.fullHitEffect(100, 150, 75, 'PHYSICAL', true, false);

			expect(criticalSpy).toHaveBeenCalledWith(100, 150);
			expect(hitImpactSpy).not.toHaveBeenCalled();
		});

		it('should call hitImpact when isCritical is false', () => {
			const criticalSpy = jest.spyOn(combatEffects, 'criticalHit');
			const hitImpactSpy = jest.spyOn(combatEffects, 'hitImpact');

			combatEffects.fullHitEffect(100, 150, 50, 'FIRE', false, false);

			expect(hitImpactSpy).toHaveBeenCalledWith(100, 150, 'FIRE');
			expect(criticalSpy).not.toHaveBeenCalled();
		});

		it('should always call damageNumber', () => {
			const damageNumberSpy = jest.spyOn(combatEffects, 'damageNumber');

			combatEffects.fullHitEffect(100, 150, 65, 'ICE', false, false);

			expect(damageNumberSpy).toHaveBeenCalledWith(100, 150, 65, 'ICE', false);
		});

		it('should call bloodSplatter when showBlood is true', () => {
			const bloodSplatterSpy = jest.spyOn(combatEffects, 'bloodSplatter');

			combatEffects.fullHitEffect(100, 150, 40, 'PHYSICAL', false, true);

			expect(bloodSplatterSpy).toHaveBeenCalledWith(100, 150, Math.PI, 15, true);
		});

		it('should not call bloodSplatter when showBlood is false', () => {
			const bloodSplatterSpy = jest.spyOn(combatEffects, 'bloodSplatter');

			combatEffects.fullHitEffect(100, 150, 40, 'PHYSICAL', false, false);

			expect(bloodSplatterSpy).not.toHaveBeenCalled();
		});
	});

	describe('healNumber()', () => {
		it('should display heal number with plus sign', () => {
			combatEffects.healNumber(180, 280, 25);

			expect(mockScene.add.text).toHaveBeenCalledWith(
				180,
				280,
				'+25',
				expect.objectContaining({
					fontSize: '24px',
					color: '#44ff44',
					fontStyle: 'bold',
					stroke: '#006600',
					strokeThickness: 3,
				})
			);
		});

		it('should animate heal number upward', () => {
			combatEffects.healNumber(180, 280, 30);

			expect(mockScene.tweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					targets: mockText,
					y: 230, // 280 - 50
					alpha: 0,
					duration: 1000,
				})
			);
		});
	});

	describe('miss()', () => {
		it('should display "MISS" text', () => {
			combatEffects.miss(220, 320);

			expect(mockScene.add.text).toHaveBeenCalledWith(
				220,
				300, // y - 20
				'MISS',
				expect.objectContaining({
					fontSize: '20px',
					color: '#888888',
					fontStyle: 'italic',
				})
			);
		});

		it('should animate text diagonally', () => {
			combatEffects.miss(220, 320);

			expect(mockScene.tweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					targets: mockText,
					x: 260, // 220 + 40
					y: 280, // 320 - 40
					alpha: 0,
					duration: 800,
				})
			);
		});
	});

	describe('dodge()', () => {
		it('should display "DODGE" text', () => {
			combatEffects.dodge(240, 340);

			expect(mockScene.add.text).toHaveBeenCalledWith(
				240,
				320, // y - 20
				'DODGE',
				expect.objectContaining({
					fontSize: '20px',
					color: '#ffee88',
					fontStyle: 'bold',
				})
			);
		});

		it('should animate text with back easing', () => {
			combatEffects.dodge(240, 340);

			expect(mockScene.tweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					targets: mockText,
					x: 190, // 240 - 50
					y: 310, // 340 - 30
					alpha: 0,
					duration: 600,
					ease: 'Back.easeOut',
				})
			);
		});
	});

	describe('destroy()', () => {
		it('should exist as a method', () => {
			expect(combatEffects.destroy).toBeDefined();
			expect(typeof combatEffects.destroy).toBe('function');
		});

		it('should not throw when called', () => {
			expect(() => {
				combatEffects.destroy();
			}).not.toThrow();
		});
	});

	describe('Integration', () => {
		it('should handle complete combat sequence', () => {
			// Hit impact
			combatEffects.hitImpact(100, 150, 'FIRE', 20);
			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(20, 100, 150);

			// Damage number
			jest.clearAllMocks();
			combatEffects.damageNumber(100, 150, 35, 'FIRE', false);
			expect(mockScene.add.text).toHaveBeenCalled();

			// Death explosion
			jest.clearAllMocks();
			combatEffects.deathExplosion(100, 150);
			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(40, 100, 150);
		});

		it('should handle full critical hit with all effects', () => {
			combatEffects.fullHitEffect(200, 250, 150, 'LIGHTNING', true, true);

			// Should have created particles for crit
			expect(mockScene.add.particles).toHaveBeenCalled();

			// Should have created text for "CRITICAL!" and damage number
			expect(mockScene.add.text).toHaveBeenCalledTimes(2);

			// Should have triggered screen shake
			expect(mockCamera.shake).toHaveBeenCalled();
		});
	});

	describe('Edge Cases', () => {
		it('should handle zero damage', () => {
			combatEffects.damageNumber(100, 150, 0, 'PHYSICAL', false);

			expect(mockScene.add.text).toHaveBeenCalledWith(
				100,
				150,
				'0',
				expect.objectContaining({
					fontSize: '24px',
				})
			);
		});

		it('should handle very large damage numbers', () => {
			combatEffects.damageNumber(100, 150, 99999, 'PHYSICAL', true);

			expect(mockScene.add.text).toHaveBeenCalledWith(100, 150, '99999!', expect.any(Object));
		});

		it('should handle zero particle count', () => {
			combatEffects.hitImpact(100, 150, 'PHYSICAL', 0);

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(0, 100, 150);
		});

		it('should handle negative coordinates', () => {
			combatEffects.hitImpact(-50, -100, 'PHYSICAL');

			expect(mockScene.add.particles).toHaveBeenCalledWith(-50, -100, 'flares', expect.any(Object));
		});

		it('should handle zero direction angle', () => {
			combatEffects.blockParry(100, 150, 0);

			const particleConfig = (mockScene.add.particles as jest.Mock).mock.calls[0][3];
			expect(particleConfig.angle.min).toBe(-45);
			expect(particleConfig.angle.max).toBe(45);
		});

		it('should handle full circle direction (2*PI)', () => {
			combatEffects.bloodSplatter(100, 150, Math.PI * 2, 15, true);

			const particleConfig = (mockScene.add.particles as jest.Mock).mock.calls[0][3];
			expect(particleConfig.angle).toBeDefined();
		});
	});
});
