import { MobileCheckScene } from '../../scenes/MobileCheckScene';

describe('MobileCheckScene', () => {
	let scene: MobileCheckScene;
	let mockAdd: any;
	let mockInput: any;
	let mockScale: any;
	let mockCameras: any;
	let mockSceneManager: any;
	let mockSys: any;
	let mockTweens: any;

	beforeEach(() => {
		// Mock image
		const mockImage = {
			x: 400,
			y: 300,
			width: 200,
			height: 150,
			alpha: 1,
			setPosition: jest.fn().mockReturnThis(),
		};

		// Mock text
		const mockText = {
			x: 400,
			y: 200,
			setOrigin: jest.fn().mockReturnThis(),
			setText: jest.fn().mockReturnThis(),
			setWordWrapWidth: jest.fn().mockReturnThis(),
			setPosition: jest.fn().mockReturnThis(),
		};

		// Mock add
		mockAdd = {
			image: jest.fn(() => ({ ...mockImage })),
			text: jest.fn(() => ({ ...mockText })),
		};

		// Mock input
		mockInput = {
			once: jest.fn(),
		};

		// Mock scale
		mockScale = {
			isLandscape: false,
			isFullscreen: false,
			startFullscreen: jest.fn(),
			on: jest.fn(),
		};

		// Mock cameras
		mockCameras = {
			main: {
				width: 800,
				height: 600,
			},
		};

		// Mock scene manager
		mockSceneManager = {
			start: jest.fn(),
			stop: jest.fn(),
			isVisible: jest.fn(() => true),
			key: 'MobileCheckScene',
		};

		// Mock sys with device info
		mockSys = {
			game: {
				device: {
					os: {
						desktop: false,
						iPhone: false,
					},
				},
			},
		};

		// Mock tweens
		mockTweens = {
			add: jest.fn(),
		};

		// Create scene instance
		scene = new MobileCheckScene();
		(scene as any).add = mockAdd;
		(scene as any).input = mockInput;
		(scene as any).scale = mockScale;
		(scene as any).cameras = mockCameras;
		(scene as any).scene = mockSceneManager;
		(scene as any).sys = mockSys;
		(scene as any).tweens = mockTweens;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should create scene with correct key', () => {
			expect(scene.constructor.name).toBe('MobileCheckScene');
		});

		it('should initialize with null values', () => {
			expect(scene.landscapeImage).toBeNull();
			expect(scene.helpText).toBeNull();
			expect(scene.isMobile).toBeNull();
		});

		it('should initialize landscape image name', () => {
			expect(scene.landscapeImageName).toBe('landscape_mobile');
		});

		it('should initialize text messages', () => {
			expect(scene.textOrientationFullscreen).toBe(
				'Please, touch the screen to enable Full Screen mode and rotate your device to Landscape mode.'
			);
			expect(scene.textOrientation).toBe('Please, rotate your device to landscape to have a better experience.');
			expect(scene.textFullscreen).toBe('Please, touch the screen to enable Full Screen mode.');
		});

		it('should initialize font properties', () => {
			expect(scene.fontSize).toBe('20px');
			expect(scene.fontFamily).toBe("'Press Start 2P'");
		});

		it('should initialize flags', () => {
			expect(scene.finishedChecks).toBe(false);
		});

		it('should initialize next scene', () => {
			expect(scene.nextScene).toBe('MainScene');
		});
	});

	describe('create() - Mobile', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			(scene as any).sys.game.device.os.iPhone = false;
			scene.create();
		});

		it('should detect mobile device', () => {
			expect(scene.isMobile).toBe(true);
		});

		it('should create landscape image', () => {
			expect(mockAdd.image).toHaveBeenCalledWith(400, 300, 'landscape_mobile');
			expect(scene.landscapeImage).toBeDefined();
		});

		it('should create help text with word wrap', () => {
			expect(mockAdd.text).toHaveBeenCalledWith(
				expect.any(Number),
				expect.any(Number),
				scene.textOrientationFullscreen,
				expect.objectContaining({
					wordWrap: expect.objectContaining({
						width: 750, // 800 - 50
					}),
					fontSize: '20px',
					fontFamily: "'Press Start 2P'",
				})
			);
		});

		it('should center help text', () => {
			expect(scene.helpText!.setOrigin).toHaveBeenCalledWith(0.5, 0.5);
		});

		it('should create rotation tween for landscape image', () => {
			expect(mockTweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					targets: scene.landscapeImage,
					angle: { from: 0, to: 90 },
					duration: 2000,
					yoyo: true,
					loop: -1,
				})
			);
		});

		it('should register pointerup event for fullscreen', () => {
			expect(mockInput.once).toHaveBeenCalledWith('pointerup', expect.any(Function));
		});

		it('should register resize event handler', () => {
			expect(mockScale.on).toHaveBeenCalledWith('resize', expect.any(Function));
		});
	});

	describe('create() - Desktop', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = true;
			scene.create();
		});

		it('should detect desktop device', () => {
			expect(scene.isMobile).toBe(false);
		});

		it('should skip to next scene on desktop', () => {
			expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene');
			expect(mockSceneManager.stop).toHaveBeenCalledWith('MobileCheckScene');
		});
	});

	describe('create() - iPhone', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			(scene as any).sys.game.device.os.iPhone = true;
			scene.create();
		});

		it('should skip to next scene on iPhone', () => {
			expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene');
			expect(mockSceneManager.stop).toHaveBeenCalledWith('MobileCheckScene');
		});
	});

	describe('pointerup event handler', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();
		});

		it('should start fullscreen on pointer up', () => {
			const pointerupCall = mockInput.once.mock.calls.find((call: any) => call[0] === 'pointerup');
			const handler = pointerupCall[1];

			handler();

			expect(mockScale.startFullscreen).toHaveBeenCalled();
		});
	});

	describe('resize event handler', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();
		});

		it('should reposition landscape image on resize', () => {
			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			const handler = resizeCall[1];

			(scene.landscapeImage!.setPosition as jest.Mock).mockClear();
			handler({ width: 1024, height: 768 });

			expect(scene.landscapeImage!.setPosition).toHaveBeenCalledWith(512, 384);
		});

		it('should reposition help text on resize', () => {
			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			const handler = resizeCall[1];

			(scene.helpText!.setPosition as jest.Mock).mockClear();
			handler({ width: 1024, height: 768 });

			expect(scene.helpText!.setPosition).toHaveBeenCalled();
		});

		it('should not reposition if scene not visible', () => {
			mockSceneManager.isVisible.mockReturnValue(false);

			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			const handler = resizeCall[1];

			(scene.landscapeImage!.setPosition as jest.Mock).mockClear();
			handler({ width: 1024, height: 768 });

			expect(scene.landscapeImage!.setPosition).not.toHaveBeenCalled();
		});
	});

	describe('goNextScene()', () => {
		it('should start next scene', () => {
			scene.goNextScene();
			expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene');
		});

		it('should stop current scene', () => {
			scene.goNextScene();
			expect(mockSceneManager.stop).toHaveBeenCalledWith('MobileCheckScene');
		});
	});

	describe('update() - State: Portrait + No Fullscreen', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();
			mockScale.isLandscape = false;
			mockScale.isFullscreen = false;
		});

		it('should show landscape image', () => {
			scene.update();
			expect(scene.landscapeImage!.alpha).toBe(1);
		});

		it('should show orientation and fullscreen text', () => {
			scene.update();
			expect(scene.helpText!.setText).toHaveBeenCalledWith(scene.textOrientationFullscreen);
		});

		it('should not finish checks', () => {
			scene.update();
			expect(scene.finishedChecks).toBe(false);
		});
	});

	describe('update() - State: Portrait + Fullscreen', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();
			mockScale.isLandscape = false;
			mockScale.isFullscreen = true;
		});

		it('should show landscape image', () => {
			scene.update();
			expect(scene.landscapeImage!.alpha).toBe(1);
		});

		it('should show orientation text only', () => {
			scene.update();
			expect(scene.helpText!.setText).toHaveBeenCalledWith(scene.textOrientation);
		});

		it('should not finish checks', () => {
			scene.update();
			expect(scene.finishedChecks).toBe(false);
		});
	});

	describe('update() - State: Landscape + No Fullscreen', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();
			mockScale.isLandscape = true;
			mockScale.isFullscreen = false;
		});

		it('should hide landscape image', () => {
			scene.update();
			expect(scene.landscapeImage!.alpha).toBe(0);
		});

		it('should show fullscreen text only', () => {
			scene.update();
			expect(scene.helpText!.setText).toHaveBeenCalledWith(scene.textFullscreen);
		});

		it('should not finish checks', () => {
			scene.update();
			expect(scene.finishedChecks).toBe(false);
		});
	});

	describe('update() - State: Landscape + Fullscreen (Complete)', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();
			mockScale.isLandscape = true;
			mockScale.isFullscreen = true;
		});

		it('should finish checks on first call', () => {
			scene.update();
			expect(scene.finishedChecks).toBe(true);
		});

		it('should go to next scene', () => {
			scene.update();
			expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene');
			expect(mockSceneManager.stop).toHaveBeenCalledWith('MobileCheckScene');
		});

		it('should not go to next scene on subsequent calls', () => {
			scene.update();
			mockSceneManager.start.mockClear();
			mockSceneManager.stop.mockClear();

			scene.update();
			expect(mockSceneManager.start).not.toHaveBeenCalled();
			expect(mockSceneManager.stop).not.toHaveBeenCalled();
		});
	});

	describe('update() - Word wrap', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();
		});

		it('should update word wrap width every frame', () => {
			scene.update();
			expect(scene.helpText!.setWordWrapWidth).toHaveBeenCalledWith(750); // 800 - 50
		});
	});

	describe('Integration', () => {
		it('should handle full mobile onboarding flow', () => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();

			// Initially portrait + no fullscreen
			mockScale.isLandscape = false;
			mockScale.isFullscreen = false;
			scene.update();
			expect(scene.landscapeImage!.alpha).toBe(1);
			expect(scene.finishedChecks).toBe(false);

			// User touches screen for fullscreen
			const pointerupCall = mockInput.once.mock.calls.find((call: any) => call[0] === 'pointerup');
			pointerupCall[1]();
			expect(mockScale.startFullscreen).toHaveBeenCalled();

			// Portrait + fullscreen
			mockScale.isFullscreen = true;
			scene.update();
			expect(scene.helpText!.setText).toHaveBeenCalledWith(scene.textOrientation);

			// User rotates to landscape
			mockScale.isLandscape = true;
			mockScale.isFullscreen = false;
			scene.update();
			expect(scene.landscapeImage!.alpha).toBe(0);

			// Final state: landscape + fullscreen
			mockScale.isFullscreen = true;
			mockSceneManager.start.mockClear();
			scene.update();
			expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene');
		});

		it('should skip checks on desktop', () => {
			(scene as any).sys.game.device.os.desktop = true;
			scene.create();

			expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene');
			expect(scene.landscapeImage).toBeDefined(); // Still creates UI elements
		});

		it('should handle resize during onboarding', () => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();

			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			resizeCall[1]({ width: 1024, height: 768 });

			expect(scene.landscapeImage!.setPosition).toHaveBeenCalled();
			expect(scene.helpText!.setPosition).toHaveBeenCalled();
		});
	});
});
