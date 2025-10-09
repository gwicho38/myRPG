import Phaser from 'phaser';
import { LuminusLineOfSight } from '../../plugins/LuminusLineOfSight';

describe('LuminusLineOfSight', () => {
	let mockScene: Phaser.Scene;
	let mockTilemap: Phaser.Tilemaps.Tilemap;
	let mockLayer: Phaser.Tilemaps.TilemapLayer;
	let lineOfSight: LuminusLineOfSight;

	beforeEach(() => {
		// Mock scene
		mockScene = {} as Phaser.Scene;

		// Mock tilemap with 10x10 grid, 32x32 tiles
		mockTilemap = {
			width: 10,
			height: 10,
			tileWidth: 32,
			tileHeight: 32,
		} as Phaser.Tilemaps.Tilemap;

		// Create a simple test grid with a wall in the middle
		// 0 0 0 0 0 0 0 0 0 0
		// 0 0 0 0 0 0 0 0 0 0
		// 0 0 0 0 0 0 0 0 0 0
		// 0 0 0 0 0 0 0 0 0 0
		// 0 0 0 0 1 1 1 0 0 0   <- Wall row
		// 0 0 0 0 1 1 1 0 0 0   <- Wall row
		// 0 0 0 0 1 1 1 0 0 0   <- Wall row
		// 0 0 0 0 0 0 0 0 0 0
		// 0 0 0 0 0 0 0 0 0 0
		// 0 0 0 0 0 0 0 0 0 0

		mockLayer = {
			getTileAt: (x: number, y: number) => {
				// Create a vertical wall at x=4,5,6 and y=4,5,6
				const isWall = x >= 4 && x <= 6 && y >= 4 && y <= 6;
				if (isWall) {
					return {
						collides: true,
					} as Phaser.Tilemaps.Tile;
				}
				return {
					collides: false,
				} as Phaser.Tilemaps.Tile;
			},
		} as Phaser.Tilemaps.TilemapLayer;

		lineOfSight = new LuminusLineOfSight(mockScene, mockTilemap, mockLayer);
	});

	describe('constructor', () => {
		it('should create a line-of-sight instance', () => {
			expect(lineOfSight).toBeDefined();
		});

		it('should build obstacles from collision tiles', () => {
			const obstacles = lineOfSight.getObstacles();
			expect(obstacles.length).toBeGreaterThan(0);
		});

		it('should create 4 edges per collision tile', () => {
			// We have a 3x3 wall (9 tiles), each tile has 4 edges
			const obstacles = lineOfSight.getObstacles();
			expect(obstacles.length).toBe(9 * 4);
		});
	});

	describe('isVisible', () => {
		it('should return true for unobstructed line of sight', () => {
			// From (0,0) to (0,100) - clear path along left edge
			const visible = lineOfSight.isVisible(16, 16, 16, 100);
			expect(visible).toBe(true);
		});

		it('should return false when wall blocks line of sight', () => {
			// From left side to right side, passing through center of wall
			// Wall is at tiles (4,5), (5,5), (6,5) which is pixels (128-224, 160-192)
			const visible = lineOfSight.isVisible(50, 176, 250, 176);
			expect(visible).toBe(false);
		});

		it('should return true for very short distances', () => {
			const visible = lineOfSight.isVisible(10, 10, 20, 20);
			expect(visible).toBe(true);
		});

		it('should handle visibility along edges of obstacles', () => {
			// Test along the top edge of the wall
			const visible = lineOfSight.isVisible(16, 128, 128, 128);
			expect(visible).toBe(true);
		});
	});

	describe('isInVisionCone', () => {
		it('should detect target within vision cone and range', () => {
			// Source at (100, 100), facing right (0 radians)
			// Target at (150, 100) - directly ahead, 50 pixels away
			const inCone = lineOfSight.isInVisionCone(
				100,
				100,
				0, // Facing right
				150,
				100,
				{
					range: 200,
					angle: 180,
				}
			);
			expect(inCone).toBe(true);
		});

		it('should reject target outside vision range', () => {
			const inCone = lineOfSight.isInVisionCone(
				100,
				100,
				0, // Facing right
				400,
				100, // Too far
				{
					range: 200,
					angle: 180,
				}
			);
			expect(inCone).toBe(false);
		});

		it('should reject target outside vision angle', () => {
			const inCone = lineOfSight.isInVisionCone(
				100,
				100,
				0, // Facing right
				100,
				200, // Directly below (90 degrees off)
				{
					range: 200,
					angle: 90, // Only 90 degree cone
				}
			);
			expect(inCone).toBe(false);
		});

		it('should use default range if not specified', () => {
			const inCone = lineOfSight.isInVisionCone(
				100,
				100,
				0,
				150,
				100
				// No options - should use defaults
			);
			expect(inCone).toBe(true);
		});

		it('should handle 360 degree vision', () => {
			// Target behind should be visible with 360 degree vision
			const inCone = lineOfSight.isInVisionCone(
				100,
				100,
				0, // Facing right
				50,
				100, // Behind (to the left)
				{
					range: 200,
					angle: 360,
				}
			);
			expect(inCone).toBe(true);
		});

		it('should check line-of-sight even if in cone', () => {
			// Target is in cone but blocked by wall
			// Wall is at tiles (4,5), (5,5), (6,5) which is pixels (128-224, 160-192)
			const inCone = lineOfSight.isInVisionCone(
				50,
				176, // Left side
				0, // Facing right
				250,
				176, // Right side - should be blocked by wall
				{
					range: 400,
					angle: 180,
				}
			);
			expect(inCone).toBe(false); // Blocked by wall
		});
	});

	describe('calculateVisionPolygon', () => {
		it('should return an array of points', () => {
			const polygon = lineOfSight.calculateVisionPolygon(100, 100, 0, {
				range: 100,
				angle: 180,
				rayCount: 16,
			});

			expect(Array.isArray(polygon)).toBe(true);
			expect(polygon.length).toBeGreaterThan(0);
		});

		it('should include source point as first point', () => {
			const polygon = lineOfSight.calculateVisionPolygon(100, 100, 0);

			expect(polygon[0].x).toBe(100);
			expect(polygon[0].y).toBe(100);
		});

		it('should respect ray count parameter', () => {
			const rayCount = 8;
			const polygon = lineOfSight.calculateVisionPolygon(100, 100, 0, {
				rayCount,
			});

			// Should have rayCount + 1 points (including center)
			expect(polygon.length).toBe(rayCount + 2); // +1 for center, +1 for inclusive range
		});

		it('should create polygon with default parameters', () => {
			const polygon = lineOfSight.calculateVisionPolygon(100, 100, 0);
			expect(polygon).toBeDefined();
			expect(polygon.length).toBeGreaterThan(1);
		});

		it('should handle different angles', () => {
			const polygon90 = lineOfSight.calculateVisionPolygon(100, 100, 0, {
				angle: 90,
			});
			const polygon180 = lineOfSight.calculateVisionPolygon(100, 100, 0, {
				angle: 180,
			});

			expect(polygon90.length).toBeGreaterThan(0);
			expect(polygon180.length).toBeGreaterThan(0);
		});
	});

	describe('debugDrawVisionCone', () => {
		it('should not throw when drawing vision cone', () => {
			const mockGraphics = {
				fillStyle: jest.fn(),
				beginPath: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn(),
				closePath: jest.fn(),
				fillPath: jest.fn(),
				lineStyle: jest.fn(),
				lineBetween: jest.fn(),
			} as any;

			expect(() => {
				lineOfSight.debugDrawVisionCone(mockGraphics, 100, 100, 0, {
					range: 100,
					angle: 180,
				});
			}).not.toThrow();

			expect(mockGraphics.fillStyle).toHaveBeenCalled();
			expect(mockGraphics.beginPath).toHaveBeenCalled();
			expect(mockGraphics.fillPath).toHaveBeenCalled();
		});

		it('should use custom color and alpha', () => {
			const mockGraphics = {
				fillStyle: jest.fn(),
				beginPath: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn(),
				closePath: jest.fn(),
				fillPath: jest.fn(),
				lineStyle: jest.fn(),
				lineBetween: jest.fn(),
			} as any;

			lineOfSight.debugDrawVisionCone(
				mockGraphics,
				100,
				100,
				0,
				{ range: 100 },
				0xff0000, // Red
				0.5 // 50% alpha
			);

			expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0xff0000, 0.5);
		});
	});

	describe('debugDrawObstacles', () => {
		it('should not throw when drawing obstacles', () => {
			const mockGraphics = {
				lineStyle: jest.fn(),
				lineBetween: jest.fn(),
			} as any;

			expect(() => {
				lineOfSight.debugDrawObstacles(mockGraphics);
			}).not.toThrow();

			expect(mockGraphics.lineStyle).toHaveBeenCalled();
			expect(mockGraphics.lineBetween).toHaveBeenCalled();
		});

		it('should draw all obstacles', () => {
			const mockGraphics = {
				lineStyle: jest.fn(),
				lineBetween: jest.fn(),
			} as any;

			lineOfSight.debugDrawObstacles(mockGraphics);

			const obstacles = lineOfSight.getObstacles();
			expect(mockGraphics.lineBetween).toHaveBeenCalledTimes(obstacles.length);
		});
	});

	describe('getObstacles', () => {
		it('should return array of line segments', () => {
			const obstacles = lineOfSight.getObstacles();
			expect(Array.isArray(obstacles)).toBe(true);
		});

		it('should return obstacles with correct structure', () => {
			const obstacles = lineOfSight.getObstacles();
			if (obstacles.length > 0) {
				const obstacle = obstacles[0];
				expect(obstacle).toHaveProperty('x1');
				expect(obstacle).toHaveProperty('y1');
				expect(obstacle).toHaveProperty('x2');
				expect(obstacle).toHaveProperty('y2');
			}
		});
	});

	describe('edge cases', () => {
		it('should handle source and target at same position', () => {
			const visible = lineOfSight.isVisible(100, 100, 100, 100);
			expect(visible).toBe(true);
		});

		it('should handle very small distances', () => {
			const visible = lineOfSight.isVisible(100, 100, 100.1, 100.1);
			expect(visible).toBe(true);
		});

		it('should handle negative coordinates', () => {
			// Since our map starts at 0,0, negative coords should work
			const visible = lineOfSight.isVisible(-10, -10, -5, -5);
			expect(visible).toBe(true);
		});

		it('should handle narrow vision cones', () => {
			// With very narrow vision cone (10 degrees)
			const inCone = lineOfSight.isInVisionCone(100, 100, 0, 150, 120, {
				// Target is off to the side
				angle: 10, // Very narrow 10-degree vision cone
			});
			// Target is outside narrow cone
			expect(inCone).toBe(false);
		});
	});
});
