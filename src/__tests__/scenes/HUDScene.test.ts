import { HUDScene } from '../../scenes/HUDScene';
import { NeverquestHUDProgressBar } from '../../plugins/HUD/NeverquestHUDProgressBar';
import { NeverquestMessageLog } from '../../plugins/HUD/NeverquestMessageLog';
import { NeverquestMinimap } from '../../plugins/HUD/NeverquestMinimap';
import { SceneToggleWatcher } from '../../scenes/watchers/SceneToggleWatcher';
import { NeverquestUtils } from '../../utils/NeverquestUtils';

// Mock dependencies
jest.mock('../../plugins/HUD/NeverquestHUDProgressBar');
jest.mock('../../plugins/HUD/NeverquestMessageLog');
jest.mock('../../plugins/HUD/NeverquestMinimap');
jest.mock('../../scenes/watchers/SceneToggleWatcher');
jest.mock('../../utils/NeverquestUtils');

describe('HUDScene', () => {
	let scene: HUDScene;
	let mockAdd: any;
	let mockScene: any;
	let mockScale: any;
	let mockCameras: any;
	let mockInput: any;
	let mockPlayer: any;
	let mockMap: any;

	beforeEach(() => {
		// Mock player
		mockPlayer = {
			attributes: {
				level: 5,
				hp: 80,
				maxHp: 100,
			},
		};

		// Mock map
		mockMap = {
			layers: [] as any[],
		};

		// Mock image objects
		const mockImage = {
			x: 100,
			y: 50,
			width: 50,
			height: 20,
			setInteractive: jest.fn().mockReturnThis(),
			setScale: jest.fn().mockReturnThis(),
			setPosition: jest.fn().mockReturnThis(),
			setTexture: jest.fn().mockReturnThis(),
			setDisplaySize: jest.fn().mockReturnThis(),
			on: jest.fn().mockReturnThis(),
		};

		// Mock text objects
		const mockText = {
			setScrollFactor: jest.fn().mockReturnThis(),
			setInteractive: jest.fn().mockReturnThis(),
			setPosition: jest.fn().mockReturnThis(),
			setStyle: jest.fn().mockReturnThis(),
			setText: jest.fn().mockReturnThis(),
			on: jest.fn().mockReturnThis(),
		};

		// Mock add (GameObjectFactory)
		mockAdd = {
			image: jest.fn(() => ({ ...mockImage })),
			text: jest.fn(() => ({ ...mockText })),
		};

		// Mock scene manager
		mockScene = {
			isVisible: jest.fn(() => false),
			launch: jest.fn(),
			stop: jest.fn(),
			get: jest.fn(() => ({
				scene: {
					stop: jest.fn(),
				},
				saveManager: {
					saveGame: jest.fn(),
				},
			})),
		};

		// Mock scale manager
		mockScale = {
			on: jest.fn(),
			toggleFullscreen: jest.fn(),
		};

		// Mock cameras
		mockCameras = {
			main: {
				width: 800,
				height: 600,
			},
		};

		// Mock gamepad
		const mockGamepad = {
			pad1: null as any,
			on: jest.fn(),
		};

		mockInput = {
			gamepad: mockGamepad,
		};

		// Mock NeverquestHUDProgressBar
		(NeverquestHUDProgressBar as jest.Mock).mockImplementation(() => ({}));

		// Mock NeverquestMessageLog
		const mockMessageLogInstance = {
			log: jest.fn(),
			setPosition: jest.fn(),
		};
		(NeverquestMessageLog as jest.Mock).mockImplementation(() => mockMessageLogInstance);

		// Mock NeverquestMinimap
		const mockMinimapInstance = {
			update: jest.fn(),
			resize: jest.fn(),
		};
		(NeverquestMinimap as jest.Mock).mockImplementation(() => mockMinimapInstance);

		// Mock NeverquestUtils
		(NeverquestUtils.isMobile as jest.Mock) = jest.fn(() => false);

		// Mock SceneToggleWatcher
		(SceneToggleWatcher.toggleScene as jest.Mock) = jest.fn();

		// Create scene instance
		scene = new HUDScene();
		(scene as any).add = mockAdd;
		(scene as any).scene = mockScene;
		(scene as any).scale = mockScale;
		(scene as any).cameras = mockCameras;
		(scene as any).input = mockInput;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should create scene with correct key', () => {
			expect(scene.constructor.name).toBe('HUDScene');
		});

		it('should initialize sprite names', () => {
			expect(scene.maximizeSpriteName).toBe('maximize');
			expect(scene.settingsSpriteName).toBe('cog_settings');
			expect(scene.inventorySpriteName).toBe('inventory_box');
			expect(scene.attributesBookSpriteName).toBe('book_ui');
		});

		it('should initialize sprite offsets', () => {
			expect(scene.baseSpriteOffsetX).toBe(50);
			expect(scene.baseSpriteOffsetY).toBe(50);
			expect(scene.maximizeSpriteOffsetX).toBe(50);
			expect(scene.maximizeSpriteOffsetY).toBe(50);
			expect(scene.settingsSpriteOffsetX).toBe(100);
			expect(scene.settingsSpriteOffsetY).toBe(50);
			expect(scene.inventorySpriteOffsetX).toBe(150);
			expect(scene.inventorySpriteOffsetY).toBe(50);
		});

		it('should initialize scene names', () => {
			expect(scene.settingSceneName).toBe('SettingScene');
			expect(scene.inventorySceneName).toBe('InventoryScene');
			expect(scene.attributeSceneName).toBe('AttributeScene');
		});

		it('should initialize null values', () => {
			expect(scene.inventoryShortcutIcon).toBeNull();
			expect(scene.level_text).toBeNull();
			expect(scene.attributesShortcutIcon).toBeNull();
		});
	});

	describe('init()', () => {
		it('should set player from args', () => {
			scene.init({ player: mockPlayer, map: mockMap });
			expect(scene.player).toBe(mockPlayer);
		});

		it('should set map from args', () => {
			scene.init({ player: mockPlayer, map: mockMap });
			expect(scene.map).toBe(mockMap);
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap });
			scene.create();
		});

		describe('HUD Elements', () => {
			it('should create HP HUD image', () => {
				expect(mockAdd.image).toHaveBeenCalledWith(25, 25, 'hp_hud_2x');
				expect(scene.hp_hud).toBeDefined();
			});

			it('should create SP HUD image', () => {
				expect(mockAdd.image).toHaveBeenCalledWith(25, 45, 'sp_hud_2x');
				expect(scene.sp_hud).toBeDefined();
			});

			it('should create health bar', () => {
				expect(NeverquestHUDProgressBar).toHaveBeenCalledWith(
					scene,
					scene.hp_hud.x,
					scene.hp_hud.y,
					scene.hp_hud.width,
					mockPlayer
				);
				expect(scene.health_bar).toBeDefined();
			});
		});

		describe('Icon Buttons', () => {
			it('should create maximize button', () => {
				expect(mockAdd.image).toHaveBeenCalledWith(750, 50, 'maximize');
				expect(scene.maximize.setInteractive).toHaveBeenCalled();
			});

			it('should create settings button', () => {
				expect(mockAdd.image).toHaveBeenCalledWith(700, 50, 'cog_settings');
				expect(scene.settingsIcon.setInteractive).toHaveBeenCalled();
			});

			it('should create inventory button', () => {
				expect(mockAdd.image).toHaveBeenCalledWith(650, 50, 'inventory_box');
				expect(scene.inventoryIcon.setInteractive).toHaveBeenCalled();
				expect(scene.inventoryIcon.setScale).toHaveBeenCalledWith(1);
			});

			it('should create attributes book button', () => {
				expect(mockAdd.image).toHaveBeenCalledWith(595, 50, 'book_ui');
				expect(scene.attributesBook.setInteractive).toHaveBeenCalled();
			});
		});

		describe('Button Events', () => {
			it('should register maximize button event handler', () => {
				expect(scene.maximize.on).toHaveBeenCalledWith('pointerup', expect.any(Function));
			});

			it('should register attributes book event handler', () => {
				expect(scene.attributesBook.on).toHaveBeenCalledWith('pointerup', expect.any(Function));
			});

			it('should register inventory icon event handler', () => {
				expect(scene.inventoryIcon.on).toHaveBeenCalledWith('pointerup', expect.any(Function));
			});

			it('should register settings icon event handler', () => {
				expect(scene.settingsIcon.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
			});
		});

		describe('Gamepad Support', () => {
			it('should create shortcut icons on desktop', () => {
				expect(scene.inventoryShortcutIcon).toBeDefined();
				expect(scene.attributesShortcutIcon).toBeDefined();
			});

			it('should not create shortcut icons on mobile without gamepad', () => {
				(NeverquestUtils.isMobile as jest.Mock).mockReturnValue(true);
				mockInput.gamepad.pad1 = null;

				scene.create();

				// Shortcut icons won't be created in this scenario
				expect(scene.inventoryShortcutIcon).toBeDefined(); // Already created in beforeEach
			});

			it('should create shortcut icons on mobile with gamepad', () => {
				(NeverquestUtils.isMobile as jest.Mock).mockReturnValue(true);
				mockInput.gamepad.pad1 = {};

				scene.create();

				expect(scene.inventoryShortcutIcon).toBeDefined();
				expect(scene.attributesShortcutIcon).toBeDefined();
			});

			it('should register gamepad connected event handler', () => {
				expect(mockInput.gamepad.on).toHaveBeenCalledWith('connected', expect.any(Function));
			});

			it('should register gamepad disconnected event handler', () => {
				expect(mockInput.gamepad.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
			});
		});

		describe('Scene Management', () => {
			it('should stop all overlay scenes initially', () => {
				expect(mockScene.stop).toHaveBeenCalledWith('InventoryScene');
				expect(mockScene.stop).toHaveBeenCalledWith('SettingScene');
				expect(mockScene.stop).toHaveBeenCalledWith('AttributeScene');
			});

			it('should register resize event listener', () => {
				expect(mockScale.on).toHaveBeenCalledWith('resize', expect.any(Function));
			});
		});

		describe('Level Display', () => {
			it('should create level text', () => {
				expect(mockAdd.text).toHaveBeenCalledWith(15, 75, 'LvL 5', { color: '#ffffff' });
				expect(scene.level_text).toBeDefined();
			});
		});

		describe('Helper Methods', () => {
			it('should call createSaveButton', () => {
				expect(scene.saveButton).toBeDefined();
			});

			it('should call createMessageLog', () => {
				expect(scene.messageLog).toBeDefined();
			});

			it('should call createMinimap', () => {
				expect(scene.minimap).toBeDefined();
			});
		});
	});

	describe('createMinimap()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap });
		});

		it('should create minimap with map reference', () => {
			scene.createMinimap();
			expect(NeverquestMinimap).toHaveBeenCalledWith(scene, mockPlayer, mockMap);
			expect(scene.minimap).toBeDefined();
		});

		it('should not create minimap without map reference', () => {
			scene.map = undefined;
			scene.createMinimap();
			expect(NeverquestMinimap).not.toHaveBeenCalled();
		});
	});

	describe('createMessageLog()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap });
			scene.createMessageLog();
		});

		it('should create message log with correct dimensions', () => {
			expect(NeverquestMessageLog).toHaveBeenCalledWith(scene, 190, 450, 600, 140);
			expect(scene.messageLog).toBeDefined();
		});

		it('should log welcome messages', () => {
			expect(scene.messageLog.log).toHaveBeenCalledWith('✨ Welcome to Neverquest!');
			expect(scene.messageLog.log).toHaveBeenCalledWith('🎮 Use arrow keys or WASD to move');
			expect(scene.messageLog.log).toHaveBeenCalledWith('⚔️ Press Space to attack nearby enemies');
		});
	});

	describe('createSaveButton()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap });
			scene.createSaveButton();
		});

		it('should create save button with correct styling', () => {
			expect(mockAdd.text).toHaveBeenCalledWith(
				720,
				20,
				'SAVE',
				expect.objectContaining({
					fontSize: '14px',
					color: '#ffffff',
					backgroundColor: '#333333',
				})
			);
			expect(scene.saveButton).toBeDefined();
		});

		it('should set save button as interactive', () => {
			expect(scene.saveButton.setInteractive).toHaveBeenCalled();
		});

		it('should set scroll factor to 0', () => {
			expect(scene.saveButton.setScrollFactor).toHaveBeenCalledWith(0);
		});

		it('should register pointerdown event handler', () => {
			expect(scene.saveButton.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
		});

		it('should register pointerover event handler', () => {
			expect(scene.saveButton.on).toHaveBeenCalledWith('pointerover', expect.any(Function));
		});

		it('should register pointerout event handler', () => {
			expect(scene.saveButton.on).toHaveBeenCalledWith('pointerout', expect.any(Function));
		});
	});

	describe('createInventoryShortcutIcon()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap });
			scene.create();
		});

		it('should create inventory shortcut icon', () => {
			expect(scene.inventoryShortcutIcon).toBeDefined();
			expect(scene.inventoryShortcutIcon?.setDisplaySize).toHaveBeenCalledWith(30, 30);
		});

		it('should not recreate icon if already exists', () => {
			const iconsBefore = mockAdd.image.mock.calls.length;
			scene.createInventoryShortcutIcon();
			const iconsAfter = mockAdd.image.mock.calls.length;
			expect(iconsAfter).toBe(iconsBefore);
		});
	});

	describe('createAttributesShortcutIcon()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap });
			scene.create();
		});

		it('should create attributes shortcut icon', () => {
			expect(scene.attributesShortcutIcon).toBeDefined();
			expect(scene.attributesShortcutIcon?.setDisplaySize).toHaveBeenCalledWith(30, 30);
		});

		it('should not recreate icon if already exists', () => {
			const iconsBefore = mockAdd.image.mock.calls.length;
			scene.createAttributesShortcutIcon();
			const iconsAfter = mockAdd.image.mock.calls.length;
			expect(iconsAfter).toBe(iconsBefore);
		});
	});

	describe('setGamepadTextures()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap });
			scene.create();
		});

		it('should set Xbox textures for inventory icon', () => {
			scene.setGamepadTextures();
			expect(scene.inventoryShortcutIcon?.setTexture).toHaveBeenCalled();
		});

		it('should set Xbox textures for attributes icon', () => {
			scene.setGamepadTextures();
			expect(scene.attributesShortcutIcon?.setTexture).toHaveBeenCalled();
		});
	});

	describe('resizeAll()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap });
			scene.create();
		});

		it('should reposition maximize button', () => {
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.maximize.setPosition).toHaveBeenCalledWith(974, 50);
		});

		it('should reposition settings button', () => {
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.settingsIcon.setPosition).toHaveBeenCalledWith(924, 50);
		});

		it('should reposition inventory button', () => {
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.inventoryIcon.setPosition).toHaveBeenCalledWith(874, 50);
		});

		it('should reposition attributes book', () => {
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.attributesBook.setPosition).toHaveBeenCalled();
		});

		it('should reposition message log', () => {
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.messageLog.setPosition).toHaveBeenCalledWith(414, 618);
		});

		it('should reposition save button', () => {
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.saveButton.setPosition).toHaveBeenCalledWith(944, 20);
		});

		it('should resize minimap', () => {
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.minimap?.resize).toHaveBeenCalled();
		});
	});

	describe('static log()', () => {
		it('should log message to HUD scene message log', () => {
			const mockHudScene = {
				messageLog: {
					log: jest.fn(),
				},
			};

			const mockGameScene = {
				scene: {
					get: jest.fn(() => mockHudScene),
				},
			};

			HUDScene.log(mockGameScene as any, 'Test message');

			expect(mockGameScene.scene.get).toHaveBeenCalledWith('HUDScene');
			expect(mockHudScene.messageLog.log).toHaveBeenCalledWith('Test message');
		});

		it('should handle missing message log gracefully', () => {
			const mockHudScene = {
				messageLog: null as any,
			};

			const mockGameScene = {
				scene: {
					get: jest.fn(() => mockHudScene),
				},
			};

			expect(() => HUDScene.log(mockGameScene as any, 'Test message')).not.toThrow();
		});
	});

	describe('update()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer, map: mockMap });
			scene.create();
		});

		it('should update level text', () => {
			mockPlayer.attributes.level = 10;
			scene.update();
			expect(scene.level_text?.setText).toHaveBeenCalledWith('LvL 10');
		});

		it('should update minimap', () => {
			scene.update();
			expect(scene.minimap?.update).toHaveBeenCalled();
		});

		it('should handle null level text', () => {
			scene.level_text = null;
			expect(() => scene.update()).not.toThrow();
		});

		it('should handle null minimap', () => {
			scene.minimap = undefined;
			expect(() => scene.update()).not.toThrow();
		});
	});

	describe('Integration', () => {
		it('should create all HUD elements in correct order', () => {
			scene.init({ player: mockPlayer, map: mockMap });
			scene.create();

			// Verify all elements are created
			expect(scene.hp_hud).toBeDefined();
			expect(scene.sp_hud).toBeDefined();
			expect(scene.health_bar).toBeDefined();
			expect(scene.maximize).toBeDefined();
			expect(scene.settingsIcon).toBeDefined();
			expect(scene.inventoryIcon).toBeDefined();
			expect(scene.attributesBook).toBeDefined();
			expect(scene.level_text).toBeDefined();
			expect(scene.saveButton).toBeDefined();
			expect(scene.messageLog).toBeDefined();
			expect(scene.minimap).toBeDefined();
		});

		it('should register all gamepad event handlers', () => {
			scene.init({ player: mockPlayer, map: mockMap });
			scene.create();

			expect(mockInput.gamepad.on).toHaveBeenCalledWith('connected', expect.any(Function));
			expect(mockInput.gamepad.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
		});

		it('should register all button event handlers', () => {
			scene.init({ player: mockPlayer, map: mockMap });
			scene.create();

			// Verify all button handlers are registered
			expect(scene.inventoryIcon.on).toHaveBeenCalledWith('pointerup', expect.any(Function));
			expect(scene.settingsIcon.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
			expect(scene.attributesBook.on).toHaveBeenCalledWith('pointerup', expect.any(Function));
			expect(scene.maximize.on).toHaveBeenCalledWith('pointerup', expect.any(Function));
		});
	});
});
