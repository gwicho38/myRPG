import { LuminusKeyboardMouseController } from '../../plugins/LuminusKeyboardMouseController';
import { LuminusBattleManager } from '../../plugins/LuminusBattleManager';

jest.mock('../../plugins/LuminusBattleManager');
jest.mock('../../scenes/watchers/SceneToggleWatcher');

describe('LuminusKeyboardMouseController', () => {
	let controller;
	let mockScene;
	let mockPlayer;

	beforeEach(() => {
		mockScene = {
			input: {
				mouse: {
					disableContextMenu: jest.fn(),
				},
				keyboard: {
					on: jest.fn(),
				},
				on: jest.fn(),
			},
			sys: {
				game: {
					device: {
						os: {
							desktop: true,
						},
					},
				},
			},
		};

		mockPlayer = {
			active: true,
			isSwimming: false,
			isBlocking: false,
			container: {
				body: {},
			},
		};

		controller = new LuminusKeyboardMouseController(mockScene, mockPlayer);
	});

	describe('constructor', () => {
		it('should initialize with scene and player', () => {
			expect(controller.scene).toBe(mockScene);
			expect(controller.player).toBe(mockPlayer);
			expect(controller.inventorySceneName).toBe('InventoryScene');
			expect(controller.attributeSceneName).toBe('AttributeScene');
		});
	});

	describe('create', () => {
		it('should set up input handlers', () => {
			controller.create();

			expect(mockScene.input.mouse.disableContextMenu).toHaveBeenCalled();
			expect(mockScene.input.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
			expect(mockScene.input.keyboard.on).toHaveBeenCalledWith('keydown', expect.any(Function));
			expect(mockScene.input.keyboard.on).toHaveBeenCalledWith('keyup', expect.any(Function));
			expect(LuminusBattleManager).toHaveBeenCalled();
		});

		it('should handle left mouse click for attack on desktop', () => {
			controller.create();
			const pointerCallback = mockScene.input.on.mock.calls[0][1];

			const mockPointer = {
				leftButtonDown: () => true,
			};

			pointerCallback(mockPointer);
			expect(controller.luminusBattleManager.atack).toHaveBeenCalledWith(mockPlayer);
		});

		it('should not attack on mobile', () => {
			mockScene.sys.game.device.os.desktop = false;
			controller.create();
			const pointerCallback = mockScene.input.on.mock.calls[0][1];

			const mockPointer = {
				leftButtonDown: () => true,
			};

			pointerCallback(mockPointer);
			expect(controller.luminusBattleManager.atack).not.toHaveBeenCalled();
		});

		it('should not attack while swimming', () => {
			mockPlayer.isSwimming = true;
			controller.create();
			const pointerCallback = mockScene.input.on.mock.calls[0][1];

			const mockPointer = {
				leftButtonDown: () => true,
			};

			pointerCallback(mockPointer);
			expect(controller.luminusBattleManager.atack).not.toHaveBeenCalled();
		});
	});

	describe('keyboard controls', () => {
		beforeEach(() => {
			controller.create();
		});

		it('should attack with spacebar (keyCode 32)', () => {
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find((call) => call[0] === 'keydown')[1];

			keydownCallback({ keyCode: 32 });
			expect(controller.luminusBattleManager.atack).toHaveBeenCalledWith(mockPlayer);
		});

		it('should attack with J key (keyCode 74)', () => {
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find((call) => call[0] === 'keydown')[1];

			keydownCallback({ keyCode: 74 });
			expect(controller.luminusBattleManager.atack).toHaveBeenCalledWith(mockPlayer);
		});

		it('should block with K key (keyCode 75)', () => {
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find((call) => call[0] === 'keydown')[1];

			keydownCallback({ keyCode: 75 });
			expect(controller.luminusBattleManager.block).toHaveBeenCalledWith(mockPlayer);
		});

		it('should stop blocking when K key is released', () => {
			const keyupCallback = mockScene.input.keyboard.on.mock.calls.find((call) => call[0] === 'keyup')[1];

			keyupCallback({ keyCode: 75 });
			expect(controller.luminusBattleManager.stopBlock).toHaveBeenCalledWith(mockPlayer);
		});

		it('should not attack while swimming', () => {
			mockPlayer.isSwimming = true;
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find((call) => call[0] === 'keydown')[1];

			keydownCallback({ keyCode: 32 });
			expect(controller.luminusBattleManager.atack).not.toHaveBeenCalled();
		});

		it('should not block while swimming', () => {
			mockPlayer.isSwimming = true;
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find((call) => call[0] === 'keydown')[1];

			keydownCallback({ keyCode: 75 });
			expect(controller.luminusBattleManager.block).not.toHaveBeenCalled();
		});

		it('should open inventory with I key (keyCode 73)', () => {
			const SceneToggleWatcher = require('../../scenes/watchers/SceneToggleWatcher').SceneToggleWatcher;
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find((call) => call[0] === 'keydown')[1];

			keydownCallback({ keyCode: 73 });
			expect(SceneToggleWatcher.toggleScene).toHaveBeenCalledWith(mockScene, 'InventoryScene', mockPlayer);
		});

		it('should open attributes with U key (keyCode 85)', () => {
			const SceneToggleWatcher = require('../../scenes/watchers/SceneToggleWatcher').SceneToggleWatcher;
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find((call) => call[0] === 'keydown')[1];

			keydownCallback({ keyCode: 85 });
			expect(SceneToggleWatcher.toggleScene).toHaveBeenCalledWith(mockScene, 'AttributeScene', mockPlayer);
		});

		it('should not respond to keys when player is inactive', () => {
			mockPlayer.active = false;
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find((call) => call[0] === 'keydown')[1];

			keydownCallback({ keyCode: 32 });
			expect(controller.luminusBattleManager.atack).not.toHaveBeenCalled();
		});
	});
});
