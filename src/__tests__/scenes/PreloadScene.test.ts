import { PreloadScene } from '../../scenes/PreloadScene';
import { Images, TilemapConfig, LuminusAudios, AtlasConfig, ASEPRITE_CONFIG } from '../../consts/GameAssets';
import { Animations } from '../../consts/Animations';

describe('PreloadScene', () => {
	let scene: PreloadScene;
	let mockLoad: any;
	let mockAdd: any;
	let mockScale: any;
	let mockAnims: any;
	let mockScene: any;

	beforeEach(() => {
		// Create mock graphics objects
		const mockGraphics = {
			fillStyle: jest.fn().mockReturnThis(),
			fillRect: jest.fn().mockReturnThis(),
			clear: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		// Create mock text objects
		const mockText = {
			setText: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setPosition: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		// Mock load manager
		mockLoad = {
			image: jest.fn(),
			tilemapTiledJSON: jest.fn(),
			script: jest.fn(),
			audio: jest.fn(),
			atlas: jest.fn(),
			aseprite: jest.fn(),
			on: jest.fn(),
		};

		// Mock add (GameObjectFactory)
		mockAdd = {
			graphics: jest.fn(() => ({ ...mockGraphics })),
		};

		// Mock make (GameObjectCreator)
		const mockMake = {
			text: jest.fn(() => ({ ...mockText })),
		};

		// Mock scale manager
		mockScale = {
			on: jest.fn(),
		};

		// Mock animations manager
		mockAnims = {
			create: jest.fn(),
			createFromAseprite: jest.fn(),
			generateFrameNames: jest.fn((atlas: string, config: any) => {
				return Array.from({ length: config.end - config.start + 1 }, (_, i) => ({
					key: atlas,
					frame: `${config.prefix}${(config.start + i).toString().padStart(config.zeroPad || 0, '0')}`,
				}));
			}),
		};

		// Mock scene manager
		mockScene = {
			start: jest.fn(),
		};

		// Mock cameras
		const mockCameras = {
			main: {
				width: 800,
				height: 600,
			},
		};

		// Create scene instance with mocked Phaser scene
		scene = new PreloadScene();
		(scene as any).load = mockLoad;
		(scene as any).add = mockAdd;
		(scene as any).make = mockMake;
		(scene as any).cameras = mockCameras;
		(scene as any).scale = mockScale;
		(scene as any).anims = mockAnims;
		(scene as any).scene = mockScene;

		// Mock window.WebFont
		(window as any).WebFont = {
			load: jest.fn(),
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
		delete (window as any).WebFont;
	});

	describe('Constructor', () => {
		it('should create scene with correct key', () => {
			expect(scene.constructor.name).toBe('PreloadScene');
		});

		it('should initialize with null graphics properties', () => {
			expect(scene.progressBar).toBeNull();
			expect(scene.progressBox).toBeNull();
			expect(scene.loadingText).toBeNull();
			expect(scene.percentText).toBeNull();
		});

		it('should initialize with zero dimensions', () => {
			expect(scene.cameraWidth).toBe(0);
			expect(scene.cameraHeight).toBe(0);
			expect(scene.currentValue).toBe(0);
		});
	});

	describe('preload()', () => {
		beforeEach(() => {
			scene.preload();
		});

		describe('Asset Loading', () => {
			it('should load all images from config', () => {
				expect(mockLoad.image).toHaveBeenCalledTimes(Images.length);
				Images.forEach((img: any) => {
					expect(mockLoad.image).toHaveBeenCalledWith(img.name, img.image);
				});
			});

			it('should load all tilemaps from config', () => {
				expect(mockLoad.tilemapTiledJSON).toHaveBeenCalledTimes(TilemapConfig.length);
				TilemapConfig.forEach((tilemap: any) => {
					expect(mockLoad.tilemapTiledJSON).toHaveBeenCalledWith(tilemap.name, tilemap.json);
				});
			});

			it('should load WebFont script', () => {
				expect(mockLoad.script).toHaveBeenCalledWith(
					'webfont',
					'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'
				);
			});

			it('should load all audio from config', () => {
				expect(mockLoad.audio).toHaveBeenCalledTimes(LuminusAudios.length);
				LuminusAudios.forEach((audio: any) => {
					expect(mockLoad.audio).toHaveBeenCalledWith(audio.name, audio.audio);
				});
			});

			it('should load all atlases from config', () => {
				expect(mockLoad.atlas).toHaveBeenCalledTimes(AtlasConfig.length);
				AtlasConfig.forEach((atlas: any) => {
					expect(mockLoad.atlas).toHaveBeenCalledWith(atlas.name, atlas.image, atlas.json);
				});
			});

			it('should load all aseprite files from config', () => {
				expect(mockLoad.aseprite).toHaveBeenCalledTimes(ASEPRITE_CONFIG.length);
				ASEPRITE_CONFIG.forEach((aseprite: any) => {
					expect(mockLoad.aseprite).toHaveBeenCalledWith(aseprite.name, aseprite.image, aseprite.json);
				});
			});
		});

		describe('Progress UI Creation', () => {
			it('should create progress bar graphics', () => {
				expect(mockAdd.graphics).toHaveBeenCalled();
				expect(scene.progressBar).not.toBeNull();
			});

			it('should create progress box graphics', () => {
				expect(mockAdd.graphics).toHaveBeenCalled();
				expect(scene.progressBox).not.toBeNull();
			});

			it('should create loading text with correct properties', () => {
				const mockMake = (scene as any).make;
				expect(mockMake.text).toHaveBeenCalledWith(
					expect.objectContaining({
						x: expect.any(Number),
						y: expect.any(Number),
						text: 'Loading...',
						style: expect.objectContaining({
							font: '20px monospace',
							color: '#ffffff',
						}),
					})
				);
				expect(scene.loadingText).not.toBeNull();
			});

			it('should create percent text with correct properties', () => {
				const mockMake = (scene as any).make;
				expect(mockMake.text).toHaveBeenCalledWith(
					expect.objectContaining({
						x: expect.any(Number),
						y: expect.any(Number),
						text: '0%',
						style: expect.objectContaining({
							font: '18px monospace',
							color: '#ffffff',
						}),
					})
				);
				expect(scene.percentText).not.toBeNull();
			});

			it('should draw progress box with correct style', () => {
				const progressBox = scene.progressBox;
				expect(progressBox?.fillStyle).toHaveBeenCalledWith(0x222222, 0.8);
				expect(progressBox?.fillRect).toHaveBeenCalled();
			});
		});

		describe('Event Listeners', () => {
			it('should register progress event listener', () => {
				expect(mockLoad.on).toHaveBeenCalledWith('progress', expect.any(Function));
			});

			it('should register complete event listener', () => {
				expect(mockLoad.on).toHaveBeenCalledWith('complete', expect.any(Function));
			});

			it('should register resize event listener', () => {
				expect(mockScale.on).toHaveBeenCalledWith('resize', expect.any(Function));
			});
		});

		describe('Progress Event Handler', () => {
			let progressCallback: (value: number) => void;

			beforeEach(() => {
				const progressCall = mockLoad.on.mock.calls.find((call: any) => call[0] === 'progress');
				progressCallback = progressCall[1];
			});

			it('should update currentValue on progress', () => {
				progressCallback(0.5);
				expect(scene.currentValue).toBe(0.5);
			});

			it('should update percent text on progress', () => {
				const mockPercentText = scene.percentText as any;
				progressCallback(0.5);
				expect(mockPercentText.setText).toHaveBeenCalledWith('50%');
			});

			it('should handle progress at 0%', () => {
				const mockPercentText = scene.percentText as any;
				progressCallback(0);
				expect(mockPercentText.setText).toHaveBeenCalledWith('0%');
			});

			it('should handle progress at 100%', () => {
				const mockPercentText = scene.percentText as any;
				progressCallback(1);
				expect(mockPercentText.setText).toHaveBeenCalledWith('100%');
			});

			it('should clear and redraw progress bar on each update', () => {
				const mockProgressBar = scene.progressBar as any;
				progressCallback(0.5);
				expect(mockProgressBar.clear).toHaveBeenCalled();
				expect(mockProgressBar.fillStyle).toHaveBeenCalledWith(0xffffff, 1);
				expect(mockProgressBar.fillRect).toHaveBeenCalled();
			});

			it('should handle decimal progress values correctly', () => {
				const mockPercentText = scene.percentText as any;
				progressCallback(0.337);
				expect(mockPercentText.setText).toHaveBeenCalledWith('33%');
			});
		});

		describe('Complete Event Handler', () => {
			let completeCallback: () => void;

			beforeEach(() => {
				const completeCall = mockLoad.on.mock.calls.find((call: any) => call[0] === 'complete');
				completeCallback = completeCall[1];
			});

			it('should destroy progress bar on complete', () => {
				const mockProgressBar = scene.progressBar as any;
				completeCallback();
				expect(mockProgressBar.destroy).toHaveBeenCalled();
			});

			it('should destroy progress box on complete', () => {
				const mockProgressBox = scene.progressBox as any;
				completeCallback();
				expect(mockProgressBox.destroy).toHaveBeenCalled();
			});

			it('should destroy loading text on complete', () => {
				const mockLoadingText = scene.loadingText as any;
				completeCallback();
				expect(mockLoadingText.destroy).toHaveBeenCalled();
			});

			it('should destroy percent text on complete', () => {
				const mockPercentText = scene.percentText as any;
				completeCallback();
				expect(mockPercentText.destroy).toHaveBeenCalled();
			});
		});

		describe('Resize Event Handler', () => {
			let resizeCallback: (size: any) => void;

			beforeEach(() => {
				const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
				resizeCallback = resizeCall[1];
			});

			it('should call resize method on resize event', () => {
				const spyResize = jest.spyOn(scene, 'resize');
				const mockSize = { width: 1024, height: 768 };
				resizeCallback(mockSize);
				expect(spyResize).toHaveBeenCalledWith(mockSize);
			});
		});
	});

	describe('resize()', () => {
		beforeEach(() => {
			scene.preload();
		});

		it('should update camera dimensions', () => {
			const size = { width: 1024, height: 768 };
			scene.resize(size);
			expect(scene.cameraWidth).toBe(1024);
			expect(scene.cameraHeight).toBe(768);
		});

		it('should update camera dimensions', () => {
			const size = { width: 1024, height: 768 };
			scene.resize(size);

			expect(scene.cameraWidth).toBe(1024);
			expect(scene.cameraHeight).toBe(768);
		});

		it('should reposition progress box', () => {
			const size = { width: 1024, height: 768 };
			const mockProgressBox = scene.progressBox as any;
			scene.resize(size);

			expect(mockProgressBox.clear).toHaveBeenCalled();
			expect(mockProgressBox.fillStyle).toHaveBeenCalledWith(0x222222, 0.8);
			expect(mockProgressBox.fillRect).toHaveBeenCalledWith(
				scene.boxStartingX,
				scene.cameraHeight / 2 + scene.boxMargin,
				scene.cameraWidth - scene.boxPadding,
				scene.boxHeight
			);
		});

		it('should reposition loading text', () => {
			const size = { width: 1024, height: 768 };
			const mockLoadingText = scene.loadingText as any;
			scene.resize(size);

			expect(mockLoadingText.setPosition).toHaveBeenCalledWith(
				scene.cameraWidth / 2,
				scene.cameraHeight / 2 - scene.boxHeight
			);
		});

		it('should reposition percent text', () => {
			const size = { width: 1024, height: 768 };
			const mockPercentText = scene.percentText as any;
			scene.resize(size);

			expect(mockPercentText.setPosition).toHaveBeenCalledWith(scene.cameraWidth / 2, scene.cameraHeight / 2 - 5);
		});

		it('should redraw progress bar with current value', () => {
			scene.currentValue = 0.75;
			const size = { width: 1024, height: 768 };
			const mockProgressBar = scene.progressBar as any;

			scene.resize(size);

			expect(mockProgressBar.clear).toHaveBeenCalled();
			expect(mockProgressBar.fillStyle).toHaveBeenCalledWith(0xffffff, 1);
			expect(mockProgressBar.fillRect).toHaveBeenCalledWith(
				scene.barStartingX,
				scene.cameraHeight / 2 + scene.barMargin,
				(scene.cameraWidth - scene.boxHeight) * 0.75,
				scene.barHeight
			);
		});

		it('should handle small screen sizes', () => {
			const size = { width: 320, height: 240 };
			scene.resize(size);

			expect(scene.cameraWidth).toBe(320);
			expect(scene.cameraHeight).toBe(240);
		});

		it('should handle large screen sizes', () => {
			const size = { width: 2560, height: 1440 };
			scene.resize(size);

			expect(scene.cameraWidth).toBe(2560);
			expect(scene.cameraHeight).toBe(1440);
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			scene.create();
		});

		describe('Animation Creation', () => {
			it('should create all animations from config', () => {
				expect(mockAnims.create).toHaveBeenCalledTimes(Animations.length);
			});

			it('should create animations with correct parameters', () => {
				Animations.forEach((animation: any) => {
					expect(mockAnims.create).toHaveBeenCalledWith(
						expect.objectContaining({
							key: animation.key,
							frameRate: animation.frameRate,
							repeat: animation.repeat,
							frames: expect.any(Array),
						})
					);
				});
			});

			it('should create animations from all aseprite files', () => {
				expect(mockAnims.createFromAseprite).toHaveBeenCalledTimes(ASEPRITE_CONFIG.length);
			});

			it('should create aseprite animations with correct names', () => {
				ASEPRITE_CONFIG.forEach((aseprite: any) => {
					expect(mockAnims.createFromAseprite).toHaveBeenCalledWith(aseprite.name);
				});
			});
		});

		describe('WebFont Loading', () => {
			it('should load WebFont with correct configuration', () => {
				expect((window as any).WebFont.load).toHaveBeenCalledWith(
					expect.objectContaining({
						google: { families: ['Press Start 2P'] },
						active: expect.any(Function),
					})
				);
			});

			it('should start IntroScene when font loads', () => {
				const webFontConfig = (window as any).WebFont.load.mock.calls[0][0];
				webFontConfig.active();
				expect(mockScene.start).toHaveBeenCalledWith('IntroScene');
			});
		});
	});

	describe('Edge Cases', () => {
		it('should handle missing WebFont gracefully', () => {
			delete (window as any).WebFont;
			expect(() => scene.create()).toThrow();
		});

		it('should handle zero-dimension resize', () => {
			scene.preload();
			scene.resize({ width: 0, height: 0 });

			expect(scene.cameraWidth).toBe(0);
			expect(scene.cameraHeight).toBe(0);
		});

		it('should handle negative progress values', () => {
			scene.preload();
			const mockPercentText = scene.percentText as any;

			const progressCall = mockLoad.on.mock.calls.find((call: any) => call[0] === 'progress');
			const progressCallback = progressCall[1];

			progressCallback(-0.5);
			expect(scene.currentValue).toBe(-0.5);
			expect(mockPercentText.setText).toHaveBeenCalledWith('-50%');
		});

		it('should handle progress values greater than 1', () => {
			scene.preload();
			const mockPercentText = scene.percentText as any;

			const progressCall = mockLoad.on.mock.calls.find((call: any) => call[0] === 'progress');
			const progressCallback = progressCall[1];

			progressCallback(1.5);
			expect(scene.currentValue).toBe(1.5);
			expect(mockPercentText.setText).toHaveBeenCalledWith('150%');
		});
	});

	describe('Integration', () => {
		it('should handle full preload-create lifecycle', () => {
			scene.preload();

			// Simulate progress updates
			const progressCall = mockLoad.on.mock.calls.find((call: any) => call[0] === 'progress');
			const progressCallback = progressCall[1];
			progressCallback(0.25);
			progressCallback(0.5);
			progressCallback(0.75);
			progressCallback(1);

			// Simulate load complete
			const completeCall = mockLoad.on.mock.calls.find((call: any) => call[0] === 'complete');
			const completeCallback = completeCall[1];
			completeCallback();

			// Create animations and load fonts
			scene.create();

			// Trigger font loaded callback
			const webFontConfig = (window as any).WebFont.load.mock.calls[0][0];
			webFontConfig.active();

			// Verify scene transition
			expect(mockScene.start).toHaveBeenCalledWith('IntroScene');
		});

		it('should handle resize during loading', () => {
			scene.preload();

			// Resize before any progress
			scene.resize({ width: 800, height: 600 });

			// Simulate progress
			const progressCall = mockLoad.on.mock.calls.find((call: any) => call[0] === 'progress');
			const progressCallback = progressCall[1];
			progressCallback(0.5);

			// Resize during loading
			scene.resize({ width: 1024, height: 768 });

			// Continue progress
			progressCallback(1);

			expect(scene.cameraWidth).toBe(1024);
			expect(scene.cameraHeight).toBe(768);
		});

		it('should handle multiple resize events', () => {
			scene.preload();

			scene.resize({ width: 640, height: 480 });
			scene.resize({ width: 800, height: 600 });
			scene.resize({ width: 1024, height: 768 });
			scene.resize({ width: 1920, height: 1080 });

			expect(scene.cameraWidth).toBe(1920);
			expect(scene.cameraHeight).toBe(1080);
		});
	});
});
