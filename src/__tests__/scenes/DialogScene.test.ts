import { DialogScene } from '../../scenes/DialogScene';
import { NeverquestTiledInfoBox } from '../../plugins/NeverquestTiledInfoBox';

// Mock dependencies
jest.mock('../../plugins/NeverquestTiledInfoBox');

describe('DialogScene', () => {
	let scene: DialogScene;
	let mockScale: any;
	let mockInput: any;
	let mockPlayer: any;
	let mockMap: any;
	let mockMainScene: any;
	let mockNeverquestTiledInfoBox: any;

	beforeEach(() => {
		// Mock player
		mockPlayer = {
			container: {
				x: 100,
				y: 100,
			},
			attributes: {
				level: 5,
			},
		};

		// Mock map
		mockMap = {
			layers: [] as any[],
		};

		// Mock main scene
		mockMainScene = {
			scene: {
				key: 'MainScene',
			},
		};

		// Mock scale manager
		mockScale = {
			on: jest.fn(),
		};

		// Mock input manager
		mockInput = {
			on: jest.fn(),
		};

		// Mock NeverquestTiledInfoBox instance
		const mockDialogBox = {
			resizeComponents: jest.fn(),
			checkUpdate: jest.fn(),
		};

		mockNeverquestTiledInfoBox = {
			create: jest.fn(),
			neverquestDialogBox: mockDialogBox,
		};

		(NeverquestTiledInfoBox as jest.Mock).mockImplementation(() => mockNeverquestTiledInfoBox);

		// Create scene instance
		scene = new DialogScene();
		(scene as any).scale = mockScale;
		(scene as any).input = mockInput;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should create scene with correct key', () => {
			expect(scene.constructor.name).toBe('DialogScene');
		});

		it('should initialize with null values', () => {
			const freshScene = new DialogScene();
			expect(freshScene.player).toBeNull();
			expect(freshScene.map).toBeNull();
			expect(freshScene.mainScene).toBeNull();
		});
	});

	describe('init()', () => {
		it('should set player from args', () => {
			scene.init({ player: mockPlayer, map: mockMap, scene: mockMainScene });
			expect(scene.player).toBe(mockPlayer);
		});

		it('should set map from args', () => {
			scene.init({ player: mockPlayer, map: mockMap, scene: mockMainScene });
			expect(scene.map).toBe(mockMap);
		});

		it('should set mainScene from args', () => {
			scene.init({ player: mockPlayer, map: mockMap, scene: mockMainScene });
			expect(scene.mainScene).toBe(mockMainScene);
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap, scene: mockMainScene });
			scene.create();
		});

		it('should create NeverquestTiledInfoBox with correct arguments', () => {
			expect(NeverquestTiledInfoBox).toHaveBeenCalledWith(mockMainScene, mockPlayer, mockMap, scene);
		});

		it('should call create on neverquestTiledInfoBox', () => {
			expect(mockNeverquestTiledInfoBox.create).toHaveBeenCalled();
		});

		it('should store neverquestTiledInfoBox reference', () => {
			expect(scene.neverquestTiledInfoBox).toBe(mockNeverquestTiledInfoBox);
		});

		it('should register resize event listener', () => {
			expect(mockScale.on).toHaveBeenCalledWith('resize', expect.any(Function));
		});

		it('should register pointerdown event listener', () => {
			expect(mockInput.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
		});
	});

	describe('Resize Handling', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap, scene: mockMainScene });
			scene.create();
		});

		it('should call resizeComponents on dialog box when resize event fires', () => {
			const resizeCallback = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize')[1];
			const newSize = { width: 1024, height: 768 };

			resizeCallback(newSize);

			expect(mockNeverquestTiledInfoBox.neverquestDialogBox.resizeComponents).toHaveBeenCalledWith(1024, 768);
		});

		it('should handle resize when neverquestTiledInfoBox exists', () => {
			const resizeCallback = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize')[1];
			const newSize = { width: 800, height: 600 };

			expect(() => resizeCallback(newSize)).not.toThrow();
		});

		it('should handle resize gracefully when neverquestDialogBox is missing', () => {
			scene.neverquestTiledInfoBox = { ...mockNeverquestTiledInfoBox, neverquestDialogBox: null };
			const resizeCallback = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize')[1];
			const newSize = { width: 800, height: 600 };

			expect(() => resizeCallback(newSize)).not.toThrow();
		});

		it('should handle resize gracefully when neverquestTiledInfoBox is missing', () => {
			scene.neverquestTiledInfoBox = null as any;
			const resizeCallback = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize')[1];
			const newSize = { width: 800, height: 600 };

			expect(() => resizeCallback(newSize)).not.toThrow();
		});
	});

	describe('Pointer Interaction', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap, scene: mockMainScene });
			scene.create();
		});

		it('should handle pointerdown event', () => {
			const pointerdownCallback = mockInput.on.mock.calls.find((call: any) => call[0] === 'pointerdown')[1];

			expect(() => pointerdownCallback()).not.toThrow();
		});
	});

	describe('update()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap, scene: mockMainScene });
			scene.create();
		});

		it('should call checkUpdate on dialog box', () => {
			scene.update();
			expect(mockNeverquestTiledInfoBox.neverquestDialogBox.checkUpdate).toHaveBeenCalled();
		});

		it('should handle update when neverquestTiledInfoBox is null', () => {
			scene.neverquestTiledInfoBox = null as any;
			expect(() => scene.update()).not.toThrow();
		});

		it('should be called multiple times without errors', () => {
			expect(() => {
				scene.update();
				scene.update();
				scene.update();
			}).not.toThrow();
		});
	});

	describe('Integration', () => {
		it('should initialize all components in correct order', () => {
			scene.init({ player: mockPlayer, map: mockMap, scene: mockMainScene });
			scene.create();

			// Verify initialization order
			expect(scene.player).toBe(mockPlayer);
			expect(scene.map).toBe(mockMap);
			expect(scene.mainScene).toBe(mockMainScene);

			// Verify plugin creation
			expect(NeverquestTiledInfoBox).toHaveBeenCalledWith(mockMainScene, mockPlayer, mockMap, scene);
			expect(mockNeverquestTiledInfoBox.create).toHaveBeenCalled();

			// Verify event listeners
			expect(mockScale.on).toHaveBeenCalledWith('resize', expect.any(Function));
			expect(mockInput.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
		});

		it('should handle full resize cycle', () => {
			scene.init({ player: mockPlayer, map: mockMap, scene: mockMainScene });
			scene.create();

			// Trigger resize multiple times
			const resizeCallback = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize')[1];

			resizeCallback({ width: 800, height: 600 });
			resizeCallback({ width: 1024, height: 768 });
			resizeCallback({ width: 1920, height: 1080 });

			expect(mockNeverquestTiledInfoBox.neverquestDialogBox.resizeComponents).toHaveBeenCalledTimes(3);
			expect(mockNeverquestTiledInfoBox.neverquestDialogBox.resizeComponents).toHaveBeenCalledWith(1920, 1080);
		});

		it('should handle update loop continuously', () => {
			scene.init({ player: mockPlayer, map: mockMap, scene: mockMainScene });
			scene.create();

			// Simulate multiple update frames
			for (let i = 0; i < 10; i++) {
				scene.update();
			}

			expect(mockNeverquestTiledInfoBox.neverquestDialogBox.checkUpdate).toHaveBeenCalledTimes(10);
		});

		it('should pass correct scene reference to NeverquestTiledInfoBox', () => {
			scene.init({ player: mockPlayer, map: mockMap, scene: mockMainScene });
			scene.create();

			const callArgs = (NeverquestTiledInfoBox as jest.Mock).mock.calls[0];
			expect(callArgs[0]).toBe(mockMainScene);
			expect(callArgs[1]).toBe(mockPlayer);
			expect(callArgs[2]).toBe(mockMap);
			expect(callArgs[3]).toBe(scene);
		});
	});
});
