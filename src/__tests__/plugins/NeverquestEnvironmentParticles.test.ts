import Phaser from 'phaser';
import { NeverquestEnvironmentParticles } from '../../plugins/NeverquestEnvironmentParticles';

// Mock Phaser.Geom.Rectangle
Phaser.Geom = Phaser.Geom || ({} as any);
Phaser.Geom.Rectangle = jest.fn((x, y, width, height) => ({ x, y, width, height })) as any;

describe('NeverquestEnvironmentParticles', () => {
	let particles: NeverquestEnvironmentParticles;
	let mockScene: any;
	let mockMap: any;
	let mockParticleEmitter: any;

	beforeEach(() => {
		mockParticleEmitter = {
			depth: 0,
		};

		mockScene = {
			add: {
				particles: jest.fn(() => mockParticleEmitter),
			},
		};

		mockMap = {
			getObjectLayer: jest.fn(),
		};

		particles = new NeverquestEnvironmentParticles(mockScene, mockMap);
	});

	describe('Constructor', () => {
		it('should initialize with correct scene', () => {
			expect(particles['scene']).toBe(mockScene);
		});

		it('should initialize with correct map', () => {
			expect(particles['map']).toBe(mockMap);
		});

		it('should initialize particles as null', () => {
			expect(particles['particles']).toBeNull();
		});

		it('should set default particlesObjectLayerName to "particles"', () => {
			expect(particles['particlesObjectLayerName']).toBe('particles');
		});

		it('should set default cloudParticleName to "cloud"', () => {
			expect(particles['cloudParticleName']).toBe('cloud');
		});

		it('should set default dustParticleSprite to "leaves"', () => {
			expect(particles['dustParticleSprite']).toBe('leaves');
		});
	});

	describe('create', () => {
		it('should get object layer from map', () => {
			mockMap.getObjectLayer.mockReturnValue({ objects: [] });

			particles.create();

			expect(mockMap.getObjectLayer).toHaveBeenCalledWith('particles');
		});

		it('should not create particles when no zones exist', () => {
			mockMap.getObjectLayer.mockReturnValue(null);

			particles.create();

			expect(mockScene.add.particles).not.toHaveBeenCalled();
		});

		it('should not create particles when zones object is empty', () => {
			mockMap.getObjectLayer.mockReturnValue({ objects: [] });

			particles.create();

			expect(mockScene.add.particles).not.toHaveBeenCalled();
		});

		it('should create dust particles for leaves property', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						properties: [{ name: 'type', value: 'leaves' }],
					},
				],
			});

			particles.create();

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				50,
				50,
				'leaves',
				expect.objectContaining({
					frequency: 5,
					lifespan: 3000,
				})
			);
		});

		it('should create cloud particles for cloud property', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						properties: [{ name: 'type', value: 'cloud' }],
					},
				],
			});

			particles.create();

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				50,
				50,
				'cloud',
				expect.objectContaining({
					frequency: 15000,
					lifespan: 300000,
				})
			);
		});

		it('should create dust particles for unknown property values', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						properties: [{ name: 'type', value: 'unknown' }],
					},
				],
			});

			particles.create();

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				50,
				50,
				'leaves',
				expect.objectContaining({
					frequency: 5,
					lifespan: 3000,
				})
			);
		});

		it('should process multiple zones', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						properties: [{ name: 'type', value: 'cloud' }],
					},
					{
						x: 200,
						y: 200,
						width: 150,
						height: 150,
						properties: [{ name: 'type', value: 'leaves' }],
					},
				],
			});

			particles.create();

			// Each zone creates particles (cloud=1 emitter, leaves=2 emitters)
			expect(mockScene.add.particles).toHaveBeenCalledTimes(3);
		});

		it('should process multiple properties per zone', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						properties: [
							{ name: 'type', value: 'cloud' },
							{ name: 'intensity', value: 'high' },
						],
					},
				],
			});

			particles.create();

			// First property triggers cloud, second triggers dust (unknown value)
			expect(mockScene.add.particles).toHaveBeenCalledTimes(3);
		});
	});

	describe('makeClouds', () => {
		it('should create cloud particle emitter at correct position', () => {
			particles.makeClouds(200, 100, 50, 25);

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				150, // originX + width/2
				75, // originY + height/2
				'cloud',
				expect.any(Object)
			);
		});

		it('should configure cloud particles with correct properties', () => {
			particles.makeClouds(200, 100, 0, 0);

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				100,
				50,
				'cloud',
				expect.objectContaining({
					frequency: 15000,
					lifespan: 300000,
					scale: 0.8,
					alpha: { start: 0.5, end: 0.7 },
					radial: true,
				})
			);
		});

		it('should set deathZone for clouds', () => {
			particles.makeClouds(200, 100, 50, 25);

			const config = mockScene.add.particles.mock.calls[0][3];
			expect(config.deathZone).toBeDefined();
			expect(config.deathZone.type).toBe('onLeave');
		});

		it('should set cloud depth to high value', () => {
			particles.makeClouds(100, 100, 0, 0);

			expect(mockParticleEmitter.depth).toBe(9999999999999);
		});

		it('should configure speed ranges for clouds', () => {
			particles.makeClouds(200, 100, 0, 0);

			const config = mockScene.add.particles.mock.calls[0][3];
			expect(config.speedX).toEqual({ min: 5, max: 15 });
			expect(config.speedY).toEqual({ min: 5, max: 15 });
		});

		it('should configure angle range for clouds', () => {
			particles.makeClouds(200, 100, 0, 0);

			const config = mockScene.add.particles.mock.calls[0][3];
			expect(config.angle).toEqual({ min: 0, max: 360 });
		});

		it('should configure spawn area relative to zone size', () => {
			particles.makeClouds(400, 200, 0, 0);

			const config = mockScene.add.particles.mock.calls[0][3];
			expect(config.x).toEqual({ min: -200, max: 200 }); // -width/2 to width/2
			expect(config.y).toEqual({ min: -100, max: 100 }); // -height/2 to height/2
		});
	});

	describe('makeDust', () => {
		it('should create two particle emitters for dust', () => {
			particles.makeDust(100, 100, 0, 0);

			expect(mockScene.add.particles).toHaveBeenCalledTimes(2);
		});

		it('should create leaves particle emitter at correct position', () => {
			particles.makeDust(200, 100, 50, 25);

			expect(mockScene.add.particles).toHaveBeenNthCalledWith(
				1,
				150, // originX + width/2
				75, // originY + height/2
				'leaves',
				expect.any(Object)
			);
		});

		it('should create dust particle emitter at correct position', () => {
			particles.makeDust(200, 100, 50, 25);

			expect(mockScene.add.particles).toHaveBeenNthCalledWith(2, 150, 75, 'dust', expect.any(Object));
		});

		it('should configure leaves particles with correct frequency', () => {
			particles.makeDust(100, 100, 0, 0);

			const config = mockScene.add.particles.mock.calls[0][3];
			expect(config.frequency).toBe(5);
			expect(config.lifespan).toBe(3000);
		});

		it('should configure dust particles with correct frequency', () => {
			particles.makeDust(100, 100, 0, 0);

			const config = mockScene.add.particles.mock.calls[1][3];
			expect(config.frequency).toBe(5);
			expect(config.lifespan).toBe(7000);
		});

		it('should configure scale animation for leaves', () => {
			particles.makeDust(100, 100, 0, 0);

			const config = mockScene.add.particles.mock.calls[0][3];
			expect(config.scale).toEqual({ start: 1.3, end: 0.7 });
		});

		it('should configure alpha animation for dust', () => {
			particles.makeDust(100, 100, 0, 0);

			const config = mockScene.add.particles.mock.calls[1][3];
			expect(config.alpha).toEqual({ start: 0.4, end: 1 });
		});

		it('should set deathZone for both emitters', () => {
			particles.makeDust(100, 100, 0, 0);

			const leavesConfig = mockScene.add.particles.mock.calls[0][3];
			const dustConfig = mockScene.add.particles.mock.calls[1][3];

			expect(leavesConfig.deathZone).toBeDefined();
			expect(leavesConfig.deathZone.type).toBe('onLeave');
			expect(dustConfig.deathZone).toBeDefined();
			expect(dustConfig.deathZone.type).toBe('onLeave');
		});

		it('should configure speed ranges for leaves', () => {
			particles.makeDust(100, 100, 0, 0);

			const config = mockScene.add.particles.mock.calls[0][3];
			expect(config.speedX).toEqual({ min: 5, max: 20 });
			expect(config.speedY).toEqual({ min: 5, max: 20 });
		});

		it('should configure different speedY range for dust', () => {
			particles.makeDust(100, 100, 0, 0);

			const config = mockScene.add.particles.mock.calls[1][3];
			expect(config.speedX).toEqual({ min: 5, max: 20 });
			expect(config.speedY).toEqual({ min: 0, max: 20 }); // Starts at 0
		});

		it('should store dust particle emitter reference', () => {
			particles.makeDust(100, 100, 0, 0);

			expect(particles['dustParticles']).toBe(mockParticleEmitter);
		});
	});

	describe('Integration', () => {
		it('should create complete particle system from map', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 0,
						y: 0,
						width: 800,
						height: 600,
						properties: [{ name: 'type', value: 'cloud' }],
					},
					{
						x: 100,
						y: 100,
						width: 200,
						height: 200,
						properties: [{ name: 'type', value: 'leaves' }],
					},
				],
			});

			particles.create();

			// Cloud zone creates 1 emitter, leaves zone creates 2 emitters
			expect(mockScene.add.particles).toHaveBeenCalledTimes(3);
		});

		it('should handle zone with no properties', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						properties: [],
					},
				],
			});

			particles.create();

			expect(mockScene.add.particles).not.toHaveBeenCalled();
		});

		it('should handle different zone sizes', () => {
			particles.makeClouds(1000, 500, 0, 0);

			const config = mockScene.add.particles.mock.calls[0][3];
			expect(config.x).toEqual({ min: -500, max: 500 });
			expect(config.y).toEqual({ min: -250, max: 250 });
		});

		it('should handle offset zone positions', () => {
			particles.makeDust(100, 100, 500, 300);

			// Center should be at originX + width/2, originY + height/2
			expect(mockScene.add.particles).toHaveBeenCalledWith(550, 350, 'leaves', expect.any(Object));
		});
	});

	describe('Edge Cases', () => {
		it('should handle undefined object layer', () => {
			mockMap.getObjectLayer.mockReturnValue(undefined);

			expect(() => particles.create()).not.toThrow();
		});

		it('should handle null objects array', () => {
			mockMap.getObjectLayer.mockReturnValue({ objects: null });

			expect(() => particles.create()).not.toThrow();
		});

		it('should handle zone with very small dimensions', () => {
			particles.makeDust(1, 1, 0, 0);

			const config = mockScene.add.particles.mock.calls[0][3];
			expect(config.x).toEqual({ min: -0.5, max: 0.5 });
			expect(config.y).toEqual({ min: -0.5, max: 0.5 });
		});

		it('should handle zone with very large dimensions', () => {
			particles.makeClouds(10000, 5000, 0, 0);

			expect(mockScene.add.particles).toHaveBeenCalledWith(5000, 2500, 'cloud', expect.any(Object));
		});

		it('should handle property value as number', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						properties: [{ name: 'type', value: 123 }],
					},
				],
			});

			particles.create();

			// Number value won't match 'leaves' or 'cloud', so creates dust
			expect(mockScene.add.particles).toHaveBeenCalled();
		});

		it('should handle property value as boolean', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						properties: [{ name: 'type', value: true }],
					},
				],
			});

			particles.create();

			expect(mockScene.add.particles).toHaveBeenCalled();
		});
	});
});
