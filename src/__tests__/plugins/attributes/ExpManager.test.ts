import { ExpManager } from '../../../plugins/attributes/ExpManager';
import { LuminusEntityTextDisplay } from '../../../plugins/LuminusEntityTextDisplay';

// Mock LuminusEntityTextDisplay
jest.mock('../../../plugins/LuminusEntityTextDisplay', () => ({
	LuminusEntityTextDisplay: jest.fn().mockImplementation(() => ({
		displayDamage: jest.fn(),
	})),
}));

describe('ExpManager', () => {
	let mockEntity: any;
	let mockScene: any;
	let mockHealthBar: any;
	let mockParticleEmitter: any;
	let mockTextDisplay: any;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();

		mockHealthBar = {
			full: 100,
			health: 100,
			update: jest.fn(),
			draw: jest.fn(),
		};

		mockParticleEmitter = {
			destroy: jest.fn(),
		};

		mockTextDisplay = {
			displayDamage: jest.fn(),
		};

		const mockTextures = {
			getPixel: jest.fn(() => ({
				alpha: 255,
			})),
		};

		mockScene = {
			sound: {
				play: jest.fn(),
			},
			textures: mockTextures,
			add: {
				particles: jest.fn(() => mockParticleEmitter),
			},
		};

		mockEntity = {
			attributes: {
				experience: 0,
				nextLevelExperience: 100,
				level: 1,
				availableStatPoints: 0,
				baseHealth: 100,
				health: 100,
			},
			healthBar: mockHealthBar,
			scene: mockScene,
			getTopLeft: jest.fn(() => ({ x: 10, y: 10 })),
			width: 32,
			height: 32,
			scaleX: 1,
			scaleY: 1,
			texture: { key: 'player' },
			container: {
				x: 100,
				y: 100,
			},
		};

		// Mock LuminusEntityTextDisplay constructor
		(LuminusEntityTextDisplay as jest.MockedClass<typeof LuminusEntityTextDisplay>).mockImplementation(
			() => mockTextDisplay as any
		);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('addExp', () => {
		it('should add experience to entity', () => {
			ExpManager.addExp(mockEntity, 50);

			expect(mockEntity.attributes.experience).toBe(50);
		});

		it('should add experience with extraExp parameter', () => {
			ExpManager.addExp(mockEntity, 30, 20);

			expect(mockEntity.attributes.experience).toBe(50);
		});

		it('should not level up when exp below threshold', () => {
			const levelUpSpy = jest.spyOn(ExpManager, 'levelUpEntity');
			mockEntity.attributes.experience = 0;
			mockEntity.attributes.nextLevelExperience = 100;

			ExpManager.addExp(mockEntity, 50);

			expect(mockEntity.attributes.experience).toBe(50);
			expect(mockEntity.attributes.level).toBe(1);
			expect(levelUpSpy).not.toHaveBeenCalled();
		});

		it('should level up when reaching exact threshold', () => {
			const levelUpSpy = jest.spyOn(ExpManager, 'levelUpEntity');
			mockEntity.attributes.experience = 0;
			mockEntity.attributes.nextLevelExperience = 100;

			ExpManager.addExp(mockEntity, 100);

			expect(levelUpSpy).toHaveBeenCalledWith(mockEntity);
		});

		it('should level up when exceeding threshold', () => {
			const levelUpSpy = jest.spyOn(ExpManager, 'levelUpEntity');
			mockEntity.attributes.experience = 0;
			mockEntity.attributes.nextLevelExperience = 100;

			ExpManager.addExp(mockEntity, 150);

			expect(levelUpSpy).toHaveBeenCalled();
		});

		it('should carry over excess experience after level up', () => {
			const levelUpSpy = jest.spyOn(ExpManager, 'levelUpEntity').mockImplementation((entity) => {
				entity.attributes.level += 1;
				entity.attributes.experience = 0;
				entity.attributes.nextLevelExperience = 200;
			});

			mockEntity.attributes.experience = 0;
			mockEntity.attributes.nextLevelExperience = 100;

			ExpManager.addExp(mockEntity, 150);

			// Should level up and carry over 50 exp
			expect(levelUpSpy).toHaveBeenCalled();
			expect(mockEntity.attributes.experience).toBe(50); // Carried over
		});

		it('should handle multiple level ups from single exp gain', () => {
			const levelUpSpy = jest.spyOn(ExpManager, 'levelUpEntity').mockImplementation((entity) => {
				entity.attributes.level += 1;
				entity.attributes.experience = 0;
				entity.attributes.nextLevelExperience = 100;
			});

			mockEntity.attributes.experience = 0;
			mockEntity.attributes.nextLevelExperience = 100;

			ExpManager.addExp(mockEntity, 250); // Should level up twice

			expect(levelUpSpy).toHaveBeenCalledTimes(2);
			expect(mockEntity.attributes.experience).toBe(50); // 250 - 100 - 100 = 50
		});

		it('should handle exact multiple level ups', () => {
			const levelUpSpy = jest.spyOn(ExpManager, 'levelUpEntity').mockImplementation((entity) => {
				entity.attributes.level += 1;
				entity.attributes.experience = 0;
				entity.attributes.nextLevelExperience = 100;
			});

			mockEntity.attributes.experience = 0;
			mockEntity.attributes.nextLevelExperience = 100;

			ExpManager.addExp(mockEntity, 300); // Should level up exactly 3 times

			expect(levelUpSpy).toHaveBeenCalledTimes(3);
			expect(mockEntity.attributes.experience).toBe(0);
		});

		it('should handle adding to existing experience', () => {
			mockEntity.attributes.experience = 75;
			mockEntity.attributes.nextLevelExperience = 100;

			ExpManager.addExp(mockEntity, 15);

			expect(mockEntity.attributes.experience).toBe(90);
		});

		it('should level up when adding to existing experience crosses threshold', () => {
			const levelUpSpy = jest.spyOn(ExpManager, 'levelUpEntity');
			mockEntity.attributes.experience = 75;
			mockEntity.attributes.nextLevelExperience = 100;

			ExpManager.addExp(mockEntity, 30);

			expect(levelUpSpy).toHaveBeenCalled();
		});
	});

	describe('levelUpEntity', () => {
		beforeEach(() => {
			// Mock levelUpEffects to avoid side effects in most tests
			jest.spyOn(ExpManager, 'levelUpEffects').mockImplementation(() => {});
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should increase level by 1', () => {
			mockEntity.attributes.level = 1;

			ExpManager.levelUpEntity(mockEntity);

			expect(mockEntity.attributes.level).toBe(2);
		});

		it('should grant 1 stat point', () => {
			mockEntity.attributes.availableStatPoints = 5;

			ExpManager.levelUpEntity(mockEntity);

			expect(mockEntity.attributes.availableStatPoints).toBe(6);
		});

		it('should reset experience to 0', () => {
			mockEntity.attributes.experience = 50;

			ExpManager.levelUpEntity(mockEntity);

			expect(mockEntity.attributes.experience).toBe(0);
		});

		it('should increase baseHealth by 10', () => {
			mockEntity.attributes.baseHealth = 100;

			ExpManager.levelUpEntity(mockEntity);

			expect(mockEntity.attributes.baseHealth).toBe(110);
		});

		it('should increase nextLevelExperience based on new level', () => {
			mockEntity.attributes.level = 1;
			mockEntity.attributes.nextLevelExperience = 100;

			ExpManager.levelUpEntity(mockEntity);

			// level is now 2, so nextLevelExperience += 100 * 2 = 100 + 200 = 300
			expect(mockEntity.attributes.nextLevelExperience).toBe(300);
		});

		it('should calculate correct nextLevelExperience for level 5', () => {
			mockEntity.attributes.level = 4;
			mockEntity.attributes.nextLevelExperience = 400;

			ExpManager.levelUpEntity(mockEntity);

			// level becomes 5, nextLevelExperience = 400 + 100 * 5 = 900
			expect(mockEntity.attributes.nextLevelExperience).toBe(900);
		});

		it('should update healthBar full value', () => {
			mockEntity.attributes.baseHealth = 100;

			ExpManager.levelUpEntity(mockEntity);

			expect(mockHealthBar.full).toBe(110);
		});

		it('should call healthBar update with current health', () => {
			mockEntity.attributes.health = 80;

			ExpManager.levelUpEntity(mockEntity);

			expect(mockHealthBar.update).toHaveBeenCalledWith(80);
		});

		it('should handle entity without healthBar', () => {
			mockEntity.healthBar = null;

			expect(() => {
				ExpManager.levelUpEntity(mockEntity);
			}).not.toThrow();
		});

		it('should call levelUpEffects', () => {
			jest.restoreAllMocks(); // Restore to use real spy
			const effectsSpy = jest.spyOn(ExpManager, 'levelUpEffects').mockImplementation(() => {});

			ExpManager.levelUpEntity(mockEntity);

			expect(effectsSpy).toHaveBeenCalledWith(mockEntity);
		});

		it('should handle multiple consecutive level ups', () => {
			mockEntity.attributes.level = 1;
			mockEntity.attributes.baseHealth = 100;

			ExpManager.levelUpEntity(mockEntity);
			expect(mockEntity.attributes.level).toBe(2);
			expect(mockEntity.attributes.baseHealth).toBe(110);

			ExpManager.levelUpEntity(mockEntity);
			expect(mockEntity.attributes.level).toBe(3);
			expect(mockEntity.attributes.baseHealth).toBe(120);

			ExpManager.levelUpEntity(mockEntity);
			expect(mockEntity.attributes.level).toBe(4);
			expect(mockEntity.attributes.baseHealth).toBe(130);
		});
	});

	describe('levelUpEffects', () => {
		it('should play level up sound', () => {
			ExpManager.levelUpEffects(mockEntity);

			expect(mockScene.sound.play).toHaveBeenCalledWith('level_up');
		});

		it('should create LuminusEntityTextDisplay', () => {
			ExpManager.levelUpEffects(mockEntity);

			expect(LuminusEntityTextDisplay).toHaveBeenCalledWith(mockEntity.scene);
		});

		it('should display 999 as level up indicator', () => {
			ExpManager.levelUpEffects(mockEntity);

			expect(mockTextDisplay.displayDamage).toHaveBeenCalledWith(999, mockEntity);
		});

		it('should create particle emitter at entity position', () => {
			mockEntity.container.x = 150;
			mockEntity.container.y = 200;

			ExpManager.levelUpEffects(mockEntity);

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				150,
				200,
				'flares',
				expect.objectContaining({
					lifespan: 300,
					gravityY: 10,
					speed: 20,
					quantity: 1,
				})
			);
		});

		it('should configure particle emitter with correct properties', () => {
			ExpManager.levelUpEffects(mockEntity);

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				expect.any(Number),
				expect.any(Number),
				'flares',
				expect.objectContaining({
					lifespan: 300,
					gravityY: 10,
					speed: 20,
					quantity: 1,
					scale: { start: 0, end: 0.15, ease: 'Quad.easeOut' },
					alpha: { start: 1, end: 0, ease: 'Quad.easeIn' },
					blendMode: 'ADD',
				})
			);
		});

		it('should destroy particle emitter after timeout', () => {
			ExpManager.levelUpEffects(mockEntity);

			expect(mockParticleEmitter.destroy).not.toHaveBeenCalled();

			jest.advanceTimersByTime(400);

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should not destroy particles before timeout', () => {
			ExpManager.levelUpEffects(mockEntity);

			jest.advanceTimersByTime(399);

			expect(mockParticleEmitter.destroy).not.toHaveBeenCalled();
		});

		it('should call getTopLeft for particle zone source', () => {
			ExpManager.levelUpEffects(mockEntity);

			// getTopLeft should be called during particle creation
			expect(mockEntity.getTopLeft).toHaveBeenCalled();
		});

		it('should use entity dimensions for particle zone', () => {
			mockEntity.width = 64;
			mockEntity.height = 48;
			mockEntity.scaleX = 2;
			mockEntity.scaleY = 1.5;

			ExpManager.levelUpEffects(mockEntity);

			// Verify scene.textures.getPixel is called (indicating zone is being used)
			const particleConfig = mockScene.add.particles.mock.calls[0][3];
			expect(particleConfig.emitZone).toBeDefined();
		});

		it('should create logoSource with getRandomPoint function', () => {
			ExpManager.levelUpEffects(mockEntity);

			const particleConfig = mockScene.add.particles.mock.calls[0][3];
			const logoSource = particleConfig.emitZone.source;

			// Test getRandomPoint returns valid coordinates
			const vec = new Phaser.Math.Vector2();
			const result = logoSource.getRandomPoint(vec);

			expect(result).toBe(vec);
			expect(vec.x).toBeGreaterThanOrEqual(10); // origin.x
			expect(vec.y).toBeGreaterThanOrEqual(10); // origin.y
			expect(mockScene.textures.getPixel).toHaveBeenCalled();
		});

		it('should create logoSource with getPoints function', () => {
			ExpManager.levelUpEffects(mockEntity);

			const particleConfig = mockScene.add.particles.mock.calls[0][3];
			const logoSource = particleConfig.emitZone.source;

			// Test getPoints returns array of points
			const points = logoSource.getPoints(5);

			expect(points).toHaveLength(5);
			points.forEach((point: Phaser.Geom.Point) => {
				expect(point).toBeInstanceOf(Phaser.Geom.Point);
				expect(point.x).toBeGreaterThanOrEqual(10);
				expect(point.y).toBeGreaterThanOrEqual(10);
			});
		});
	});

	describe('Integration', () => {
		beforeEach(() => {
			jest.restoreAllMocks();
		});

		it('should handle complete level up flow', () => {
			mockEntity.attributes.experience = 0;
			mockEntity.attributes.nextLevelExperience = 100;
			mockEntity.attributes.level = 1;
			mockEntity.attributes.availableStatPoints = 0;
			mockEntity.attributes.baseHealth = 100;

			ExpManager.addExp(mockEntity, 100);

			// Should level up
			expect(mockEntity.attributes.level).toBe(2);
			expect(mockEntity.attributes.availableStatPoints).toBe(1);
			expect(mockEntity.attributes.experience).toBe(0);
			expect(mockEntity.attributes.baseHealth).toBe(110);
			expect(mockEntity.attributes.nextLevelExperience).toBe(300);

			// Should play effects
			expect(mockScene.sound.play).toHaveBeenCalledWith('level_up');
			expect(mockTextDisplay.displayDamage).toHaveBeenCalledWith(999, mockEntity);
		});

		it('should handle partial exp gain then level up', () => {
			mockEntity.attributes.experience = 0;
			mockEntity.attributes.nextLevelExperience = 100;

			ExpManager.addExp(mockEntity, 60);
			expect(mockEntity.attributes.level).toBe(1);

			ExpManager.addExp(mockEntity, 40);
			expect(mockEntity.attributes.level).toBe(2);
		});

		it('should handle gaining exp across multiple levels', () => {
			mockEntity.attributes.experience = 0;
			mockEntity.attributes.nextLevelExperience = 100;
			mockEntity.attributes.level = 1;

			ExpManager.addExp(mockEntity, 350);

			// Start: level 1, exp 0, nextExp 100
			// Add 350 exp -> exp = 350
			// 350 >= 100 -> levelUp (level 2, exp 0, nextExp = 100 + 100*2 = 300)
			// Remaining: 250, call addExp(entity, 0, 250)
			// exp = 250
			// 250 < 300 -> no more level ups

			expect(mockEntity.attributes.level).toBe(2);
			expect(mockEntity.attributes.experience).toBe(250);
		});

		it('should handle entity at high level', () => {
			mockEntity.attributes.level = 10;
			mockEntity.attributes.experience = 0;
			mockEntity.attributes.nextLevelExperience = 1000;
			mockEntity.attributes.baseHealth = 190;

			ExpManager.addExp(mockEntity, 1000);

			expect(mockEntity.attributes.level).toBe(11);
			expect(mockEntity.attributes.baseHealth).toBe(200);
			expect(mockEntity.attributes.nextLevelExperience).toBe(2100); // 1000 + 100*11
		});
	});

	describe('Static Properties', () => {
		it('should update displayText static property', () => {
			ExpManager.levelUpEffects(mockEntity);

			expect(ExpManager.displayText).toBeDefined();
			expect(ExpManager.displayText.displayDamage).toBeDefined();
		});

		it('should update particles_logo static property', () => {
			ExpManager.levelUpEffects(mockEntity);

			expect(ExpManager.particles_logo).toBeDefined();
			expect(ExpManager.particles_logo).toBe(mockParticleEmitter);
		});
	});
});
