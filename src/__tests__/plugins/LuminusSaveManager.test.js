import { LuminusSaveManager } from '../../plugins/LuminusSaveManager';

describe('LuminusSaveManager', () => {
	let saveManager;
	let mockScene;

	beforeEach(() => {
		// Clear localStorage
		localStorage.clear();

		// Create mock scene
		mockScene = {
			scene: {
				key: 'TestScene',
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

		saveManager = new LuminusSaveManager(mockScene);
	});

	describe('constructor', () => {
		it('should initialize with default values', () => {
			expect(saveManager.scene).toBe(mockScene);
			expect(saveManager.saveKey).toBe('luminus_rpg_save');
			expect(saveManager.checkpointKey).toBe('luminus_rpg_checkpoint');
			expect(saveManager.checkpointInterval).toBe(30000);
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
			expect(localStorage.getItem('luminus_rpg_save')).toBeTruthy();
		});

		it('should save checkpoint when isCheckpoint is true', () => {
			const result = saveManager.saveGame(true);
			expect(result).toBe(true);
			expect(localStorage.getItem('luminus_rpg_checkpoint')).toBeTruthy();
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
			expect(loadedData.player.position.x).toBe(100);
			expect(loadedData.player.position.y).toBe(200);
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
});
