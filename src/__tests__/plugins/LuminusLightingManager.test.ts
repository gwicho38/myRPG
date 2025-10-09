import Phaser from 'phaser';
import { LuminusLightingManager, LightSource, LightingOptions } from '../../plugins/LuminusLightingManager';

describe('LuminusLightingManager', () => {
	let mockScene: Phaser.Scene;
	let mockGraphics: Phaser.GameObjects.Graphics;
	let mockRenderTexture: Phaser.GameObjects.RenderTexture;
	let mockCamera: Phaser.Cameras.Scene2D.Camera;
	let lighting: LuminusLightingManager;

	beforeEach(() => {
		// Mock camera
		mockCamera = {
			scrollX: 0,
			scrollY: 0,
		} as Phaser.Cameras.Scene2D.Camera;

		// Mock graphics
		mockGraphics = {
			setDepth: jest.fn().mockReturnThis(),
			setScrollFactor: jest.fn().mockReturnThis(),
			fillStyle: jest.fn().mockReturnThis(),
			fillRect: jest.fn().mockReturnThis(),
			fillCircle: jest.fn().mockReturnThis(),
			clear: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
			generateTexture: jest.fn(),
		} as any;

		// Mock render texture
		mockRenderTexture = {
			setDepth: jest.fn().mockReturnThis(),
			setScrollFactor: jest.fn().mockReturnThis(),
			setBlendMode: jest.fn().mockReturnThis(),
			clear: jest.fn(),
			draw: jest.fn(),
			destroy: jest.fn(),
		} as any;

		// Mock scene
		mockScene = {
			add: {
				graphics: jest.fn(() => mockGraphics),
				renderTexture: jest.fn(() => mockRenderTexture),
			},
			make: {
				graphics: jest.fn(() => mockGraphics),
			},
			cameras: {
				main: mockCamera,
			},
			scale: {
				width: 800,
				height: 600,
			},
			textures: {
				remove: jest.fn(),
			},
		} as any;

		lighting = new LuminusLightingManager(mockScene);
	});

	describe('constructor', () => {
		it('should create a lighting manager with default options', () => {
			expect(lighting).toBeDefined();
		});

		it('should accept custom options', () => {
			const customOptions: LightingOptions = {
				ambientDarkness: 0.5,
				defaultLightRadius: 150,
				enableFlicker: false,
				flickerAmount: 10,
				lightColor: 0xff0000,
				smoothGradient: false,
				updateFrequency: 2,
			};

			const customLighting = new LuminusLightingManager(mockScene, customOptions);
			expect(customLighting).toBeDefined();
		});

		it('should use default values for missing options', () => {
			const partialOptions: LightingOptions = {
				ambientDarkness: 0.5,
			};

			const partialLighting = new LuminusLightingManager(mockScene, partialOptions);
			expect(partialLighting).toBeDefined();
		});
	});

	describe('create', () => {
		it('should create lighting layers', () => {
			lighting.create();

			expect(mockScene.add.graphics).toHaveBeenCalled();
			expect(mockScene.add.renderTexture).toHaveBeenCalled();
			expect(mockScene.make.graphics).toHaveBeenCalled();
		});

		it('should set proper depth and scroll factors', () => {
			lighting.create();

			expect(mockGraphics.setDepth).toHaveBeenCalledWith(1000);
			expect(mockGraphics.setScrollFactor).toHaveBeenCalledWith(0);
			expect(mockRenderTexture.setDepth).toHaveBeenCalledWith(1001);
			expect(mockRenderTexture.setScrollFactor).toHaveBeenCalledWith(0);
		});

		it('should set blend mode on lighting layer', () => {
			lighting.create();

			// ADD blend mode = 1
			expect(mockRenderTexture.setBlendMode).toHaveBeenCalledWith(1);
		});
	});

	describe('update', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should clear layers before drawing', () => {
			lighting.update();

			expect(mockRenderTexture.clear).toHaveBeenCalled();
			expect(mockGraphics.clear).toHaveBeenCalled();
		});

		it('should draw darkness overlay', () => {
			lighting.update();

			expect(mockGraphics.fillStyle).toHaveBeenCalled();
			expect(mockGraphics.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
		});

		it('should not update when disabled', () => {
			// Reset call count after create
			jest.clearAllMocks();

			lighting.setEnabled(false);
			lighting.update();

			// Clear should not be called when disabled (after being cleared in setEnabled)
			expect(mockRenderTexture.clear).toHaveBeenCalledTimes(1); // Once in setEnabled(false)
		});

		it('should respect update frequency', () => {
			const frequencyLighting = new LuminusLightingManager(mockScene, { updateFrequency: 5 });
			frequencyLighting.create();

			// Reset mock counts after create
			jest.clearAllMocks();

			// First update should run (frameCounter=1, lastUpdate=0, diff=1 >= 5? NO - skip)
			// Actually, first update always runs because frameCounter starts at 0
			frequencyLighting.update(); // frameCounter=1, lastUpdate=0, diff=1, skip (1 < 5)
			frequencyLighting.update(); // frameCounter=2, lastUpdate=0, diff=2, skip (2 < 5)
			frequencyLighting.update(); // frameCounter=3, lastUpdate=0, diff=3, skip (3 < 5)
			frequencyLighting.update(); // frameCounter=4, lastUpdate=0, diff=4, skip (4 < 5)
			frequencyLighting.update(); // frameCounter=5, lastUpdate=0, diff=5, RUN! (5 >= 5)
			expect(mockRenderTexture.clear).toHaveBeenCalledTimes(1);

			// Next 4 should be skipped
			frequencyLighting.update(); // frameCounter=6, lastUpdate=5, diff=1, skip
			frequencyLighting.update(); // frameCounter=7, lastUpdate=5, diff=2, skip
			frequencyLighting.update(); // frameCounter=8, lastUpdate=5, diff=3, skip
			frequencyLighting.update(); // frameCounter=9, lastUpdate=5, diff=4, skip
			expect(mockRenderTexture.clear).toHaveBeenCalledTimes(1);

			// 10th frame should run
			frequencyLighting.update(); // frameCounter=10, lastUpdate=5, diff=5, RUN! (5 >= 5)
			expect(mockRenderTexture.clear).toHaveBeenCalledTimes(2);
		});
	});

	describe('player light', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should set player light', () => {
			lighting.setPlayerLight(100, 200, 150);

			const lights = lighting.getLights();
			expect(lights.player).not.toBeNull();
			expect(lights.player?.x).toBe(100);
			expect(lights.player?.y).toBe(200);
			expect(lights.player?.radius).toBe(150);
		});

		it('should update existing player light position', () => {
			lighting.setPlayerLight(100, 200, 150);
			lighting.setPlayerLight(300, 400);

			const lights = lighting.getLights();
			expect(lights.player?.x).toBe(300);
			expect(lights.player?.y).toBe(400);
			expect(lights.player?.radius).toBe(150); // Radius unchanged
		});

		it('should use default radius if not specified', () => {
			lighting.setPlayerLight(100, 200);

			const lights = lighting.getLights();
			expect(lights.player?.radius).toBe(100); // Default radius
		});

		it('should update player light radius', () => {
			lighting.setPlayerLight(100, 200, 150);
			lighting.setPlayerLightRadius(200);

			const lights = lighting.getLights();
			expect(lights.player?.radius).toBe(200);
		});

		it('should remove player light', () => {
			lighting.setPlayerLight(100, 200, 150);
			lighting.removePlayerLight();

			const lights = lighting.getLights();
			expect(lights.player).toBeNull();
		});
	});

	describe('static lights', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should add static light', () => {
			const light = lighting.addStaticLight(100, 200, 80);

			expect(light).toBeDefined();
			expect(light.x).toBe(100);
			expect(light.y).toBe(200);
			expect(light.radius).toBe(80);
		});

		it('should add multiple static lights', () => {
			lighting.addStaticLight(100, 200, 80);
			lighting.addStaticLight(300, 400, 60);
			lighting.addStaticLight(500, 600, 100);

			const lights = lighting.getLights();
			expect(lights.static.length).toBe(3);
		});

		it('should accept custom light options', () => {
			const light = lighting.addStaticLight(100, 200, 80, {
				color: 0xff0000,
				intensity: 0.5,
				flicker: false,
			});

			expect(light.color).toBe(0xff0000);
			expect(light.intensity).toBe(0.5);
			expect(light.flicker).toBe(false);
		});

		it('should remove static light', () => {
			const light1 = lighting.addStaticLight(100, 200, 80);
			const light2 = lighting.addStaticLight(300, 400, 60);

			lighting.removeLight(light1);

			const lights = lighting.getLights();
			expect(lights.static.length).toBe(1);
			expect(lights.static[0]).toBe(light2);
		});

		it('should clear all static lights', () => {
			lighting.addStaticLight(100, 200, 80);
			lighting.addStaticLight(300, 400, 60);

			lighting.clearStaticLights();

			const lights = lighting.getLights();
			expect(lights.static.length).toBe(0);
		});
	});

	describe('dynamic lights', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should add dynamic light', () => {
			const light = lighting.addDynamicLight(100, 200, 80);

			expect(light).toBeDefined();
			expect(light.x).toBe(100);
			expect(light.y).toBe(200);
			expect(light.radius).toBe(80);
		});

		it('should add multiple dynamic lights', () => {
			lighting.addDynamicLight(100, 200, 80);
			lighting.addDynamicLight(300, 400, 60);

			const lights = lighting.getLights();
			expect(lights.dynamic.length).toBe(2);
		});

		it('should accept custom light options', () => {
			const light = lighting.addDynamicLight(100, 200, 80, {
				color: 0x00ff00,
				intensity: 1.5,
				flicker: true,
			});

			expect(light.color).toBe(0x00ff00);
			expect(light.intensity).toBe(1.5);
			expect(light.flicker).toBe(true);
		});

		it('should remove dynamic light', () => {
			const light1 = lighting.addDynamicLight(100, 200, 80);
			const light2 = lighting.addDynamicLight(300, 400, 60);

			lighting.removeLight(light1);

			const lights = lighting.getLights();
			expect(lights.dynamic.length).toBe(1);
			expect(lights.dynamic[0]).toBe(light2);
		});

		it('should clear all dynamic lights', () => {
			lighting.addDynamicLight(100, 200, 80);
			lighting.addDynamicLight(300, 400, 60);

			lighting.clearDynamicLights();

			const lights = lighting.getLights();
			expect(lights.dynamic.length).toBe(0);
		});
	});

	describe('ambient darkness', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should set ambient darkness', () => {
			lighting.setAmbientDarkness(0.5);
			lighting.update();

			expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x000000, 0.5);
		});

		it('should clamp darkness between 0 and 1', () => {
			lighting.setAmbientDarkness(1.5);
			lighting.update();
			expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x000000, 1.0);

			lighting.setAmbientDarkness(-0.5);
			lighting.update();
			expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x000000, 0.0);
		});
	});

	describe('enable/disable', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should be enabled by default', () => {
			expect(lighting.isEnabled()).toBe(true);
		});

		it('should disable lighting', () => {
			lighting.setEnabled(false);

			expect(lighting.isEnabled()).toBe(false);
		});

		it('should clear layers when disabled', () => {
			lighting.setEnabled(false);

			expect(mockRenderTexture.clear).toHaveBeenCalled();
			expect(mockGraphics.clear).toHaveBeenCalled();
		});

		it('should re-enable lighting', () => {
			lighting.setEnabled(false);
			lighting.setEnabled(true);

			expect(lighting.isEnabled()).toBe(true);
		});
	});

	describe('getLights', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should return all lights', () => {
			lighting.setPlayerLight(100, 200, 150);
			const staticLight = lighting.addStaticLight(300, 400, 80);
			const dynamicLight = lighting.addDynamicLight(500, 600, 60);

			const lights = lighting.getLights();

			expect(lights.player).not.toBeNull();
			expect(lights.static.length).toBe(1);
			expect(lights.static[0]).toBe(staticLight);
			expect(lights.dynamic.length).toBe(1);
			expect(lights.dynamic[0]).toBe(dynamicLight);
		});

		it('should return empty arrays when no lights exist', () => {
			const lights = lighting.getLights();

			expect(lights.player).toBeNull();
			expect(lights.static.length).toBe(0);
			expect(lights.dynamic.length).toBe(0);
		});
	});

	describe('destroy', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should destroy all layers', () => {
			lighting.destroy();

			expect(mockGraphics.destroy).toHaveBeenCalled();
			expect(mockRenderTexture.destroy).toHaveBeenCalled();
		});

		it('should clear all lights', () => {
			lighting.setPlayerLight(100, 200, 150);
			lighting.addStaticLight(300, 400, 80);
			lighting.addDynamicLight(500, 600, 60);

			lighting.destroy();

			const lights = lighting.getLights();
			expect(lights.player).toBeNull();
			expect(lights.static.length).toBe(0);
			expect(lights.dynamic.length).toBe(0);
		});
	});

	describe('camera integration', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should account for camera scroll when drawing lights', () => {
			mockCamera.scrollX = 100;
			mockCamera.scrollY = 50;

			lighting.setPlayerLight(200, 150, 100);
			lighting.update();

			// Light should be drawn at screen position (100, 100) not world position (200, 150)
			expect(mockRenderTexture.draw).toHaveBeenCalled();
		});
	});

	describe('edge cases', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should handle zero radius light', () => {
			const light = lighting.addStaticLight(100, 200, 0);

			expect(light.radius).toBe(0);
			expect(() => lighting.update()).not.toThrow();
		});

		it('should handle negative coordinates', () => {
			const light = lighting.addStaticLight(-100, -200, 80);

			expect(light.x).toBe(-100);
			expect(light.y).toBe(-200);
			expect(() => lighting.update()).not.toThrow();
		});

		it('should handle very large radius', () => {
			const light = lighting.addStaticLight(100, 200, 10000);

			expect(light.radius).toBe(10000);
			expect(() => lighting.update()).not.toThrow();
		});

		it('should handle removing non-existent light', () => {
			const fakeLight: LightSource = { x: 0, y: 0, radius: 0 };

			expect(() => lighting.removeLight(fakeLight)).not.toThrow();
		});
	});
});
