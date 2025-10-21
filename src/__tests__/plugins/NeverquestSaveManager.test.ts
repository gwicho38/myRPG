import { NeverquestSaveManager } from '../../plugins/NeverquestSaveManager';

describe('NeverquestSaveManager', () => {
	let saveManager: any;
	let mockScene: any;

	beforeEach(() => {
		// Clear localStorage
		localStorage.clear();

		// Create mock scene
		mockScene = {
			scene: {
				key: 'TestScene',
				get: jest.fn().mockReturnValue({
					messageLog: {
						log: jest.fn(),
					},
				}),
				start: jest.fn(),
			},
			time: {
				addEvent: jest.fn().mockReturnValue({
					delay: 30000,
					loop: true,
					paused: false,
					hasDispatched: false,
					destroy: jest.fn(),
				}),
				delayedCall: jest.fn(),
				now: Date.now(),
			},
			player: {
				container: {
					x: 100,
					y: 200,
				},
				attributes: {
					health: 100,
					level: 1,
					experience: 0,
					rawAttributes: {},
					availableStatPoints: 0,
				},
				items: [],
			},
			add: {
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn(),
					setScrollFactor: jest.fn(),
					setDepth: jest.fn(),
					destroy: jest.fn(),
				}),
			},
			tweens: {
				add: jest.fn(),
			},
			cameras: {
				main: {
					width: 800,
					height: 600,
				},
			},
		};

		saveManager = new NeverquestSaveManager(mockScene);
	});

	describe('constructor', () => {
		it('should initialize with default values', () => {
			expect(saveManager.scene).toBe(mockScene);
			expect(saveManager.saveKey).toBe('neverquest_rpg_save');
			expect(saveManager.checkpointKey).toBe('neverquest_rpg_checkpoint');
			expect(saveManager.checkpointInterval).toBe(30000); // 30 * 1000
			expect(saveManager.autoSaveEnabled).toBe(true);
		});
	});

	describe('create', () => {
		it('should start checkpoint timer', () => {
			saveManager.create();
			expect(mockScene.time.addEvent).toHaveBeenCalled();
			expect(mockScene.time.delayedCall).toHaveBeenCalled();
		});
	});

	describe('saveGame', () => {
		it('should save game data to localStorage', () => {
			const result = saveManager.saveGame(false);
			expect(result).toBe(true);
			expect(localStorage.getItem('neverquest_rpg_save')).toBeTruthy();
		});

		it('should save checkpoint when isCheckpoint is true', () => {
			const result = saveManager.saveGame(true);
			expect(result).toBe(true);
			expect(localStorage.getItem('neverquest_rpg_checkpoint')).toBeTruthy();
		});
	});

	describe('loadGame', () => {
		it('should load saved game data', () => {
			// First save
			saveManager.saveGame(false);

			// Then load
			const loadedData = saveManager.loadGame(false);
			expect(loadedData).toBeTruthy();
			expect(loadedData.scene).toBe('TestScene');
			expect(loadedData.player.x).toBe(100);
			expect(loadedData.player.y).toBe(200);
		});

		it('should return null when no save data exists', () => {
			const loadedData = saveManager.loadGame(false);
			expect(loadedData).toBe(null);
		});
	});

	describe('hasSaveData', () => {
		it('should return false when no save exists', () => {
			expect(saveManager.hasSaveData()).toBe(false);
		});

		it('should return true when save exists', () => {
			saveManager.saveGame(false);
			expect(saveManager.hasSaveData()).toBe(true);
		});
	});

	describe('deleteSave', () => {
		it('should remove save data from localStorage', () => {
			saveManager.saveGame(false);
			expect(saveManager.hasSaveData()).toBe(true);

			saveManager.deleteSave(false);
			expect(saveManager.hasSaveData()).toBe(false);
		});
	});

	describe('setAutoSave', () => {
		it('should disable auto-save', () => {
			saveManager.setAutoSave(false);
			expect(saveManager.autoSaveEnabled).toBe(false);
		});

		it('should enable auto-save', () => {
			saveManager.setAutoSave(false);
			saveManager.setAutoSave(true);
			expect(saveManager.autoSaveEnabled).toBe(true);
		});
	});

	describe('startCheckpointTimer', () => {
		it('should destroy existing timer before creating new one', () => {
			// Create initial timer
			saveManager.create();
			const firstTimer = saveManager.checkpointTimer;

			// Create new timer
			saveManager.startCheckpointTimer();

			expect(firstTimer.destroy).toHaveBeenCalled();
		});

		it('should handle missing scene time system', () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
			mockScene.time = null;

			saveManager.startCheckpointTimer();

			expect(consoleSpy).toHaveBeenCalledWith('Cannot start timer - scene or time system not available');
			consoleSpy.mockRestore();
		});

		it('should handle addEvent error', () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
			mockScene.time.addEvent.mockImplementation(() => {
				throw new Error('Timer creation failed');
			});

			saveManager.startCheckpointTimer();

			expect(consoleSpy).toHaveBeenCalledWith('Failed to create auto-save timer:', expect.any(Error));
			consoleSpy.mockRestore();
		});
	});

	describe('stopCheckpointTimer', () => {
		it('should destroy and null timer when it exists', () => {
			saveManager.create();
			expect(saveManager.checkpointTimer).toBeTruthy();

			saveManager.stopCheckpointTimer();

			expect(saveManager.checkpointTimer).toBe(null);
		});

		it('should do nothing when timer does not exist', () => {
			saveManager.checkpointTimer = null;
			expect(() => saveManager.stopCheckpointTimer()).not.toThrow();
		});
	});

	describe('createSaveData', () => {
		it('should return null when no player found', () => {
			mockScene.player = null;
			const result = saveManager.createSaveData();

			expect(result).toBe(null);
		});

		it('should create complete save data with player', () => {
			mockScene.player.attributes.baseHealth = 100;
			mockScene.player.attributes.atack = 10;
			mockScene.player.attributes.defense = 5;

			const result = saveManager.createSaveData();

			expect(result).toBeTruthy();
			expect(result?.player.x).toBe(100);
			expect(result?.player.y).toBe(200);
			expect(result?.player.attributes.baseHealth).toBe(100);
			expect(result?.player.attributes.atack).toBe(10);
			expect(result?.scene).toBe('TestScene');
			expect(result?.version).toBe('1.0.0');
		});
	});

	describe('saveGame error handling', () => {
		it('should return false when createSaveData returns null', () => {
			mockScene.player = null;
			const result = saveManager.saveGame(false);

			expect(result).toBe(false);
		});

		it('should handle localStorage errors', () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
			jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
				throw new Error('Storage quota exceeded');
			});

			const result = saveManager.saveGame(false);

			expect(result).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith('Failed to save game:', expect.any(Error));

			consoleSpy.mockRestore();
			jest.restoreAllMocks();
		});
	});

	describe('loadGame error handling', () => {
		it('should handle JSON parse errors', () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
			localStorage.setItem('neverquest_rpg_save', 'invalid json {]');

			const result = saveManager.loadGame(false);

			expect(result).toBe(null);
			expect(consoleSpy).toHaveBeenCalledWith('Failed to load game:', expect.any(Error));

			consoleSpy.mockRestore();
		});

		it('should load checkpoint data when loadCheckpoint is true', () => {
			saveManager.saveGame(true);
			const result = saveManager.loadGame(true);

			expect(result).toBeTruthy();
			expect(localStorage.getItem('neverquest_rpg_checkpoint')).toBeTruthy();
		});
	});

	describe('createCheckpoint', () => {
		it('should not save when player is not found', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
			mockScene.player = null;

			saveManager.createCheckpoint();

			expect(consoleSpy).toHaveBeenCalledWith('Cannot auto-save: No player found');
			consoleSpy.mockRestore();
		});

		it('should not save when player is attacking', () => {
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
			mockScene.player.canMove = true;
			mockScene.player.isAtacking = true;

			saveManager.createCheckpoint();

			expect(consoleSpy).toHaveBeenCalledWith('Auto-save skipped - player busy');
			consoleSpy.mockRestore();
		});

		it('should not save when player cannot move', () => {
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
			mockScene.player.canMove = false;
			mockScene.player.isAtacking = false;

			saveManager.createCheckpoint();

			expect(consoleSpy).toHaveBeenCalledWith('Auto-save skipped - player busy');
			consoleSpy.mockRestore();
		});

		it('should save when player can move and not attacking', () => {
			mockScene.player.canMove = true;
			mockScene.player.isAtacking = false;

			saveManager.createCheckpoint();

			expect(localStorage.getItem('neverquest_rpg_checkpoint')).toBeTruthy();
		});

		it('should not save when autoSaveEnabled is false', () => {
			saveManager.autoSaveEnabled = false;
			mockScene.player.canMove = true;
			mockScene.player.isAtacking = false;

			saveManager.createCheckpoint();

			expect(localStorage.getItem('neverquest_rpg_checkpoint')).toBeFalsy();
		});
	});

	describe('getPlayer', () => {
		it('should get player from scene.player', () => {
			const result = saveManager.getPlayer();
			expect(result).toBe(mockScene.player);
		});

		it('should get player from scene.data when scene.player is null', () => {
			const dataPlayer = { container: { x: 50, y: 50 } };
			mockScene.player = null;
			mockScene.data = {
				get: jest.fn((key: string) => (key === 'player' ? dataPlayer : null)),
			};

			const result = saveManager.getPlayer();
			expect(result).toBe(dataPlayer);
		});

		it('should get player from children when scene.player and data are null', () => {
			const childPlayer = { container: { x: 75, y: 75 } };
			mockScene.player = null;
			mockScene.data = null;
			mockScene.children = {
				getByName: jest.fn((name: string) => (name === 'player' ? childPlayer : null)),
			};

			const result = saveManager.getPlayer();
			expect(result).toBe(childPlayer);
		});

		it('should return null when no player found', () => {
			mockScene.player = null;
			mockScene.data = null;
			mockScene.children = null;

			const result = saveManager.getPlayer();
			expect(result).toBe(null);
		});
	});

	describe('applySaveData', () => {
		it('should apply save data to player', () => {
			const saveData = saveManager.createSaveData();
			saveData!.player.x = 300;
			saveData!.player.y = 400;

			mockScene.player.container.setPosition = jest.fn();
			mockScene.player.healthBar = {
				update: jest.fn(),
			};

			const result = saveManager.applySaveData(saveData!);

			expect(result).toBe(true);
			expect(mockScene.player.container.setPosition).toHaveBeenCalledWith(300, 400);
		});

		it('should return false when saveData is null', () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
			const result = saveManager.applySaveData(null as any);

			expect(result).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith('Invalid save data');
			consoleSpy.mockRestore();
		});

		it('should return false when saveData.player is missing', () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
			const result = saveManager.applySaveData({ player: null } as any);

			expect(result).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith('Invalid save data');
			consoleSpy.mockRestore();
		});

		it('should return false when no player found to apply data to', () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
			const saveData = saveManager.createSaveData();
			mockScene.player = null;

			const result = saveManager.applySaveData(saveData!);

			expect(result).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith('No player found to apply save data to');
			consoleSpy.mockRestore();
		});

		it('should handle errors during apply', () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
			const saveData = saveManager.createSaveData();
			mockScene.player.container.setPosition = jest.fn(() => {
				throw new Error('Position error');
			});

			const result = saveManager.applySaveData(saveData!);

			expect(result).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith('Failed to apply save data:', expect.any(Error));
			consoleSpy.mockRestore();
		});

		it('should switch scenes when save data scene differs', () => {
			const saveData = saveManager.createSaveData();
			saveData!.scene = 'DifferentScene';

			mockScene.player.container.setPosition = jest.fn();

			saveManager.applySaveData(saveData!);

			expect(mockScene.scene.start).toHaveBeenCalledWith('DifferentScene');
		});
	});

	describe('showSaveNotification', () => {
		it('should show notification with custom message', () => {
			saveManager.showSaveNotification('Test Message');

			expect(mockScene.add.text).toHaveBeenCalledWith(
				400,
				80,
				'Test Message',
				expect.objectContaining({
					color: '#44ff44',
				})
			);
		});

		it('should show error notification with red color', () => {
			saveManager.showSaveNotification('Error!', true);

			expect(mockScene.add.text).toHaveBeenCalledWith(
				400,
				80,
				'Error!',
				expect.objectContaining({ color: '#ff4444' })
			);
		});

		it('should destroy notification on tween complete', () => {
			const mockNotification = {
				setOrigin: jest.fn(),
				setScrollFactor: jest.fn(),
				setDepth: jest.fn(),
				destroy: jest.fn(),
			};
			mockScene.add.text.mockReturnValue(mockNotification);

			saveManager.showSaveNotification('Test');

			// Get the tween config
			const tweenConfig = mockScene.tweens.add.mock.calls[0][0];

			// Call the onComplete callback
			tweenConfig.onComplete();

			expect(mockNotification.destroy).toHaveBeenCalled();
		});
	});

	describe('destroy', () => {
		it('should stop checkpoint timer on destroy', () => {
			saveManager.create();
			const timer = saveManager.checkpointTimer;

			saveManager.destroy();

			expect(timer.destroy).toHaveBeenCalled();
			expect(saveManager.checkpointTimer).toBe(null);
		});
	});

	describe('deleteSave with checkpoint', () => {
		it('should delete checkpoint data', () => {
			saveManager.saveGame(true);
			expect(localStorage.getItem('neverquest_rpg_checkpoint')).toBeTruthy();

			saveManager.deleteSave(true);
			expect(localStorage.getItem('neverquest_rpg_checkpoint')).toBeFalsy();
		});
	});

	describe('hasSaveData with checkpoint', () => {
		it('should check for checkpoint data', () => {
			expect(saveManager.hasSaveData(true)).toBe(false);

			saveManager.saveGame(true);
			expect(saveManager.hasSaveData(true)).toBe(true);
		});
	});
});
