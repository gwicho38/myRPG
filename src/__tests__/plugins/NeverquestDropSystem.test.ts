/**
 * Tests for NeverquestDropSystem plugin
 */

import { NeverquestDropSystem } from '../../plugins/NeverquestDropSystem';
import { Item } from '../../entities/Item';

// Mock the Item entity
jest.mock('../../entities/Item', () => {
	return {
		Item: jest.fn().mockImplementation((scene, x, y, id) => {
			return {
				scene,
				x,
				y,
				id,
				commonId: id,
			};
		}),
	};
});

describe('NeverquestDropSystem', () => {
	let mockScene: any;
	let mockEntity: any;
	let dropSystem: NeverquestDropSystem;

	beforeEach(() => {
		// Mock Phaser geometry classes
		const MockRectangle: any = jest.fn().mockImplementation((x, y, width, height) => {
			return { x, y, width, height };
		});
		MockRectangle.Inflate = jest.fn((rect) => rect);
		MockRectangle.Clone = jest.fn((rect) => ({ ...rect }));
		MockRectangle.Random = jest.fn(() => ({ x: 100, y: 100 }));

		(global as any).Phaser = {
			Geom: {
				Rectangle: MockRectangle,
				Point: jest.fn(),
			},
		};

		// Create mock scene
		mockScene = {
			add: {
				existing: jest.fn(),
			},
			physics: {
				add: {
					existing: jest.fn(),
				},
			},
			tweens: {
				add: jest.fn(),
			},
		};

		// Create mock entity
		mockEntity = {
			id: 1,
			container: {
				x: 200,
				y: 150,
			},
			drops: [],
		};
	});

	describe('Constructor', () => {
		it('should initialize with entity properties', () => {
			mockEntity.drops = [
				{ id: 101, chance: 50 },
				{ id: 102, chance: 30 },
			];

			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			expect(dropSystem.scene).toBe(mockScene);
			expect(dropSystem.entityId).toBe(1);
			expect(dropSystem.entity).toBe(mockEntity);
			expect(dropSystem.drops).toEqual(mockEntity.drops);
		});

		it('should initialize with empty drops array', () => {
			mockEntity.drops = [];

			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			expect(dropSystem.drops).toEqual([]);
		});

		it('should create dropItems function', () => {
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			expect(dropSystem.dropItems).toBeDefined();
			expect(typeof dropSystem.dropItems).toBe('function');
		});
	});

	describe('dropItems()', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('should drop item with 100% chance', () => {
			mockEntity.drops = [{ id: 101, chance: 100 }];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			dropSystem.dropItems();

			expect(Item).toHaveBeenCalledWith(mockScene, 100, 80, 101);
		});

		it('should drop item when chance check passes', () => {
			mockEntity.drops = [{ id: 101, chance: 80 }];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			// Mock Math.random to return 0.1 (10%)
			jest.spyOn(Math, 'random').mockReturnValue(0.1);

			dropSystem.dropItems();

			// 80 - (0.1 * 100) = 80 - 10 = 70 >= 0, should drop
			expect(Item).toHaveBeenCalledTimes(1);
		});

		it('should not drop item when chance check fails', () => {
			mockEntity.drops = [{ id: 101, chance: 10 }];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			// Mock Math.random to return 0.9 (90%)
			jest.spyOn(Math, 'random').mockReturnValue(0.9);

			dropSystem.dropItems();

			// 10 - (0.9 * 100) = 10 - 90 = -80 < 0, should not drop
			expect(Item).not.toHaveBeenCalled();
		});

		it('should drop multiple items', () => {
			mockEntity.drops = [
				{ id: 101, chance: 100 },
				{ id: 102, chance: 100 },
				{ id: 103, chance: 100 },
			];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			dropSystem.dropItems();

			expect(Item).toHaveBeenCalledTimes(3);
			expect(Item).toHaveBeenCalledWith(mockScene, 100, 80, 101);
			expect(Item).toHaveBeenCalledWith(mockScene, 100, 80, 102);
			expect(Item).toHaveBeenCalledWith(mockScene, 100, 80, 103);
		});

		it('should add floating animation to dropped items', () => {
			mockEntity.drops = [{ id: 101, chance: 100 }];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			dropSystem.dropItems();

			expect(mockScene.tweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					props: expect.objectContaining({
						y: expect.any(Object),
					}),
					duration: 2000,
					loop: -1,
					yoyo: true,
				})
			);
		});

		it('should position items relative to entity container', () => {
			mockEntity.container = { x: 300, y: 250 };
			mockEntity.drops = [{ id: 101, chance: 100 }];

			const mockRandomPoint = { x: 305, y: 248 };
			const MockRectangle = (global as any).Phaser.Geom.Rectangle;
			MockRectangle.Random.mockReturnValue(mockRandomPoint);

			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);
			dropSystem.dropItems();

			// Item should be created at random point with y offset -20
			expect(Item).toHaveBeenCalledWith(mockScene, 305, 228, 101);
		});

		it('should handle empty drops array', () => {
			mockEntity.drops = [];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			dropSystem.dropItems();

			expect(Item).not.toHaveBeenCalled();
		});

		it('should create rectangle bounds based on entity position', () => {
			mockEntity.container = { x: 150, y: 200 };
			mockEntity.drops = [{ id: 101, chance: 100 }];

			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);
			dropSystem.dropItems();

			// Should use Phaser geometry functions
			const MockRectangle = (global as any).Phaser.Geom.Rectangle;
			expect(MockRectangle.Clone).toHaveBeenCalled();
			expect(MockRectangle.Inflate).toHaveBeenCalled();
			expect(MockRectangle.Random).toHaveBeenCalled();
		});

		it('should offset item spawn position by -20 on y-axis', () => {
			mockEntity.drops = [{ id: 101, chance: 100 }];
			const MockRectangle = (global as any).Phaser.Geom.Rectangle;
			MockRectangle.Random.mockReturnValue({ x: 100, y: 150 });

			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);
			dropSystem.dropItems();

			// y position should be 150 - 20 = 130
			expect(Item).toHaveBeenCalledWith(mockScene, 100, 130, 101);
		});

		it('should animate item to y - 4 position', () => {
			mockEntity.drops = [{ id: 101, chance: 100 }];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			dropSystem.dropItems();

			const tweenConfig = (mockScene.tweens.add as jest.Mock).mock.calls[0][0];
			const item = tweenConfig.targets;

			// Item y is 80 (100 - 20), animation should go to 76 (80 - 4)
			expect(tweenConfig.props.y.value).toBe(item.y - 4);
		});
	});

	describe('Probability Distribution', () => {
		it('should respect 50% drop chance statistically', () => {
			mockEntity.drops = [{ id: 101, chance: 50 }];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			let dropCount = 0;
			const iterations = 100;
			const MockedItem = Item as jest.MockedClass<typeof Item>;

			for (let i = 0; i < iterations; i++) {
				jest.clearAllMocks();
				// Simulate random values from 0 to 1
				jest.spyOn(Math, 'random').mockReturnValue(i / iterations);
				dropSystem.dropItems();

				if (MockedItem.mock.calls.length > 0) {
					dropCount++;
				}
			}

			// With 50% chance, we should get roughly 50 drops (allow 20% variance)
			expect(dropCount).toBeGreaterThan(40);
			expect(dropCount).toBeLessThan(60);
		});

		it('should always drop with 100% chance', () => {
			mockEntity.drops = [{ id: 101, chance: 100 }];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			for (let i = 0; i < 50; i++) {
				jest.clearAllMocks();
				jest.spyOn(Math, 'random').mockReturnValue(Math.random());
				dropSystem.dropItems();

				expect(Item).toHaveBeenCalledTimes(1);
			}
		});

		it('should never drop with 0% chance', () => {
			mockEntity.drops = [{ id: 101, chance: 0 }];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			for (let i = 0; i < 50; i++) {
				jest.clearAllMocks();
				// Test with various random values
				jest.spyOn(Math, 'random').mockReturnValue(Math.random());
				dropSystem.dropItems();

				expect(Item).not.toHaveBeenCalled();
			}
		});
	});

	describe('Edge Cases', () => {
		it('should handle entity at origin (0, 0)', () => {
			mockEntity.container = { x: 0, y: 0 };
			mockEntity.drops = [{ id: 101, chance: 100 }];

			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);
			dropSystem.dropItems();

			expect(Item).toHaveBeenCalled();
		});

		it('should handle negative entity positions', () => {
			mockEntity.container = { x: -50, y: -30 };
			mockEntity.drops = [{ id: 101, chance: 100 }];

			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);
			dropSystem.dropItems();

			expect(Item).toHaveBeenCalled();
		});

		it('should handle very high chance values', () => {
			mockEntity.drops = [{ id: 101, chance: 1000 }];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			jest.spyOn(Math, 'random').mockReturnValue(0.99);
			dropSystem.dropItems();

			// 1000 - 99 = 901 >= 0, should drop
			expect(Item).toHaveBeenCalled();
		});

		it('should handle negative chance values', () => {
			mockEntity.drops = [{ id: 101, chance: -10 }];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			jest.spyOn(Math, 'random').mockReturnValue(0.01);
			dropSystem.dropItems();

			// -10 - 1 = -11 < 0, should not drop
			expect(Item).not.toHaveBeenCalled();
		});

		it('should handle fractional chance values', () => {
			mockEntity.drops = [{ id: 101, chance: 50.5 }];
			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			jest.spyOn(Math, 'random').mockReturnValue(0.5);
			dropSystem.dropItems();

			// 50.5 - 50 = 0.5 >= 0, should drop
			expect(Item).toHaveBeenCalled();
		});

		it('should handle large number of drop definitions', () => {
			mockEntity.drops = [];
			for (let i = 0; i < 100; i++) {
				mockEntity.drops.push({ id: 1000 + i, chance: 100 });
			}

			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);
			dropSystem.dropItems();

			expect(Item).toHaveBeenCalledTimes(100);
		});
	});

	describe('Integration', () => {
		it('should correctly handle mixed chance drops', () => {
			mockEntity.drops = [
				{ id: 101, chance: 100 }, // Always drop
				{ id: 102, chance: 0 }, // Never drop
				{ id: 103, chance: 80 }, // Likely drop
			];

			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);

			jest.spyOn(Math, 'random').mockReturnValue(0.1); // 10%
			dropSystem.dropItems();

			// Should drop items 101 (100% chance) and 103 (80% chance with 10% roll)
			expect(Item).toHaveBeenCalledTimes(2);
			expect(Item).toHaveBeenCalledWith(expect.any(Object), expect.any(Number), expect.any(Number), 101);
			expect(Item).toHaveBeenCalledWith(expect.any(Object), expect.any(Number), expect.any(Number), 103);
		});

		it('should create multiple items with unique positions', () => {
			mockEntity.drops = [
				{ id: 101, chance: 100 },
				{ id: 102, chance: 100 },
			];

			let callCount = 0;
			const MockRectangle = (global as any).Phaser.Geom.Rectangle;
			MockRectangle.Random.mockImplementation(() => {
				callCount++;
				return { x: 100 + callCount * 10, y: 100 + callCount * 5 };
			});

			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);
			dropSystem.dropItems();

			// Each item should have been positioned at different coordinates
			expect(Item).toHaveBeenNthCalledWith(1, mockScene, 110, 85, 101);
			expect(Item).toHaveBeenNthCalledWith(2, mockScene, 120, 90, 102);
		});

		it('should create animations for each dropped item', () => {
			mockEntity.drops = [
				{ id: 101, chance: 100 },
				{ id: 102, chance: 100 },
				{ id: 103, chance: 100 },
			];

			dropSystem = new NeverquestDropSystem(mockScene, mockEntity);
			dropSystem.dropItems();

			expect(mockScene.tweens.add).toHaveBeenCalledTimes(3);
		});
	});
});
