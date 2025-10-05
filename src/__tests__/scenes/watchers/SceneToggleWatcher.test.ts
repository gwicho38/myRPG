import { SceneToggleWatcher } from '../../../scenes/watchers/SceneToggleWatcher';

describe('SceneToggleWatcher', () => {
	let mockSceneContext: any;
	let mockPlayer: any;
	let mockTargetScene: any;

	beforeEach(() => {
		mockTargetScene = {
			scene: {
				stop: jest.fn(),
			},
		};

		mockSceneContext = {
			scene: {
				isVisible: jest.fn(),
				launch: jest.fn(),
				get: jest.fn(() => mockTargetScene),
			},
		};

		mockPlayer = {
			canMove: true,
			canAtack: true,
		};
	});

	describe('toggleScene', () => {
		it('should open scene when not visible', () => {
			mockSceneContext.scene.isVisible.mockReturnValue(false);

			SceneToggleWatcher.toggleScene(mockSceneContext, 'TestScene', mockPlayer);

			expect(mockSceneContext.scene.launch).toHaveBeenCalledWith('TestScene', {
				player: mockPlayer,
			});
			expect(mockPlayer.canMove).toBe(false);
			expect(mockPlayer.canAtack).toBe(true);
		});

		it('should close scene when visible', () => {
			mockSceneContext.scene.isVisible.mockReturnValue(true);

			SceneToggleWatcher.toggleScene(mockSceneContext, 'TestScene', mockPlayer);

			expect(mockTargetScene.scene.stop).toHaveBeenCalled();
			expect(mockPlayer.canMove).toBe(true);
			expect(mockPlayer.canAtack).toBe(true);
		});

		it('should restore canMove and canAtack when closing scene', () => {
			mockSceneContext.scene.isVisible.mockReturnValue(true);
			mockPlayer.canMove = false;
			mockPlayer.canAtack = false;

			SceneToggleWatcher.toggleScene(mockSceneContext, 'TestScene', mockPlayer);

			expect(mockPlayer.canMove).toBe(true);
			expect(mockPlayer.canAtack).toBe(true);
		});

		it('should pass player data when opening scene', () => {
			mockSceneContext.scene.isVisible.mockReturnValue(false);
			mockPlayer.name = 'TestPlayer';
			mockPlayer.health = 100;

			SceneToggleWatcher.toggleScene(mockSceneContext, 'InventoryScene', mockPlayer);

			expect(mockSceneContext.scene.launch).toHaveBeenCalledWith('InventoryScene', {
				player: mockPlayer,
			});
			expect(mockPlayer.name).toBe('TestPlayer');
			expect(mockPlayer.health).toBe(100);
		});

		it('should handle multiple toggle calls correctly', () => {
			// First call - open
			mockSceneContext.scene.isVisible.mockReturnValue(false);
			SceneToggleWatcher.toggleScene(mockSceneContext, 'TestScene', mockPlayer);
			expect(mockPlayer.canMove).toBe(false);

			// Second call - close
			mockSceneContext.scene.isVisible.mockReturnValue(true);
			SceneToggleWatcher.toggleScene(mockSceneContext, 'TestScene', mockPlayer);
			expect(mockPlayer.canMove).toBe(true);

			// Third call - open again
			mockSceneContext.scene.isVisible.mockReturnValue(false);
			SceneToggleWatcher.toggleScene(mockSceneContext, 'TestScene', mockPlayer);
			expect(mockPlayer.canMove).toBe(false);
		});

		it('should get target scene using scene.get', () => {
			mockSceneContext.scene.isVisible.mockReturnValue(true);

			SceneToggleWatcher.toggleScene(mockSceneContext, 'AttributeScene', mockPlayer);

			expect(mockSceneContext.scene.get).toHaveBeenCalledWith('AttributeScene');
			expect(mockTargetScene.scene.stop).toHaveBeenCalled();
		});

		it('should not modify player state when opening if already can move', () => {
			mockSceneContext.scene.isVisible.mockReturnValue(false);
			const originalCanMove = mockPlayer.canMove;

			SceneToggleWatcher.toggleScene(mockSceneContext, 'TestScene', mockPlayer);

			// canMove should be set to false regardless of original state
			expect(mockPlayer.canMove).toBe(false);
			expect(originalCanMove).toBe(true);
		});
	});
});
