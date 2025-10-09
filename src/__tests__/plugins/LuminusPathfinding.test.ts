import Phaser from 'phaser';
import { LuminusPathfinding } from '../../plugins/LuminusPathfinding';

describe('LuminusPathfinding', () => {
	let mockScene: Phaser.Scene;
	let mockTilemap: Phaser.Tilemaps.Tilemap;
	let mockLayer: Phaser.Tilemaps.TilemapLayer;
	let pathfinding: LuminusPathfinding;

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

		// Mock layer with a simple grid:
		// 0 0 0 0 0 0 0 0 0 0
		// 0 1 1 1 1 1 1 1 1 0
		// 0 1 0 0 0 0 0 0 1 0
		// 0 1 0 1 1 1 1 0 1 0
		// 0 1 0 1 0 0 1 0 1 0
		// 0 1 0 1 0 0 1 0 1 0
		// 0 1 0 1 1 1 1 0 1 0
		// 0 1 0 0 0 0 0 0 1 0
		// 0 1 1 1 1 1 1 1 1 0
		// 0 0 0 0 0 0 0 0 0 0
		const gridData = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
			[0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
			[0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
			[0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
			[0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
			[0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
			[0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
			[0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		];

		mockLayer = {
			getTileAt: (x: number, y: number) => {
				if (gridData[y] && gridData[y][x] !== undefined) {
					const isBlocked = gridData[y][x] === 1;
					return {
						collides: isBlocked,
					} as Phaser.Tilemaps.Tile;
				}
				return null;
			},
		} as Phaser.Tilemaps.TilemapLayer;

		pathfinding = new LuminusPathfinding(mockScene, mockTilemap, mockLayer);
	});

	describe('constructor', () => {
		it('should create a pathfinding instance', () => {
			expect(pathfinding).toBeDefined();
		});

		it('should initialize grid from collision layer', () => {
			const grid = pathfinding.getGrid();
			expect(grid.length).toBe(10);
			expect(grid[0].length).toBe(10);
		});

		it('should mark collision tiles as blocked', () => {
			const grid = pathfinding.getGrid();
			// Check that wall tiles are blocked (1)
			expect(grid[1][1]).toBe(1);
			expect(grid[1][2]).toBe(1);
		});

		it('should mark non-collision tiles as walkable', () => {
			const grid = pathfinding.getGrid();
			// Check that floor tiles are walkable (0)
			expect(grid[0][0]).toBe(0);
			expect(grid[2][2]).toBe(0);
		});
	});

	describe('worldToTile', () => {
		it('should convert world coordinates to tile coordinates', () => {
			const result = pathfinding.worldToTile(64, 96);
			expect(result).toEqual({ tileX: 2, tileY: 3 });
		});

		it('should handle coordinates at tile boundaries', () => {
			const result = pathfinding.worldToTile(32, 32);
			expect(result).toEqual({ tileX: 1, tileY: 1 });
		});

		it('should handle origin correctly', () => {
			const result = pathfinding.worldToTile(0, 0);
			expect(result).toEqual({ tileX: 0, tileY: 0 });
		});
	});

	describe('tileToWorld', () => {
		it('should convert tile coordinates to world coordinates', () => {
			const result = pathfinding.tileToWorld(2, 3);
			// Should return center of tile
			expect(result).toEqual({ x: 80, y: 112 }); // 2*32+16, 3*32+16
		});

		it('should return center of tile', () => {
			const result = pathfinding.tileToWorld(0, 0);
			expect(result).toEqual({ x: 16, y: 16 }); // Center of first tile
		});
	});

	describe('isTileWalkable', () => {
		it('should return true for walkable tiles', () => {
			expect(pathfinding.isTileWalkable(0, 0)).toBe(true);
			expect(pathfinding.isTileWalkable(2, 2)).toBe(true);
		});

		it('should return false for blocked tiles', () => {
			expect(pathfinding.isTileWalkable(1, 1)).toBe(false);
			expect(pathfinding.isTileWalkable(2, 1)).toBe(false);
		});

		it('should return false for out of bounds tiles', () => {
			expect(pathfinding.isTileWalkable(-1, 0)).toBe(false);
			expect(pathfinding.isTileWalkable(0, -1)).toBe(false);
			expect(pathfinding.isTileWalkable(10, 0)).toBe(false);
			expect(pathfinding.isTileWalkable(0, 10)).toBe(false);
		});
	});

	describe('isPositionWalkable', () => {
		it('should return true for walkable world positions', () => {
			expect(pathfinding.isPositionWalkable(16, 16)).toBe(true); // Center of 0,0
			expect(pathfinding.isPositionWalkable(80, 80)).toBe(true); // Center of 2,2
		});

		it('should return false for blocked world positions', () => {
			expect(pathfinding.isPositionWalkable(48, 48)).toBe(false); // Center of 1,1
		});
	});

	describe('findPath', () => {
		it('should find a path between two walkable points', (done) => {
			// From (0,0) to (9,9) - path along the top and right edges
			pathfinding.findPath(16, 16, 304, 304, (path) => {
				expect(path).not.toBeNull();
				expect(path!.length).toBeGreaterThan(0);
				done();
			});
		});

		it('should return null when no path exists', (done) => {
			// From (0,0) to (4,4) - completely blocked by walls
			pathfinding.findPath(16, 16, 144, 144, (path) => {
				expect(path).toBeNull();
				done();
			});
		});

		it('should return null for out of bounds coordinates', (done) => {
			pathfinding.findPath(16, 16, 400, 400, (path) => {
				expect(path).toBeNull();
				done();
			});
		});

		it('should return null when end position is not walkable', (done) => {
			// Try to path to a wall tile
			pathfinding.findPath(16, 16, 48, 48, (path) => {
				expect(path).toBeNull();
				done();
			});
		});

		it('should return path as Vector2 array', (done) => {
			// Path along edges from (0,0) to (9,0)
			pathfinding.findPath(16, 16, 304, 16, (path) => {
				expect(path).not.toBeNull();
				expect(Array.isArray(path)).toBe(true);
				if (path) {
					expect(path[0]).toBeInstanceOf(Phaser.Math.Vector2);
				}
				done();
			});
		});
	});

	describe('getGrid', () => {
		it('should return the pathfinding grid', () => {
			const grid = pathfinding.getGrid();
			expect(grid).toBeDefined();
			expect(Array.isArray(grid)).toBe(true);
			expect(grid.length).toBe(10);
			expect(grid[0].length).toBe(10);
		});

		it('should return grid with correct walkable/blocked values', () => {
			const grid = pathfinding.getGrid();
			// Top-left should be walkable
			expect(grid[0][0]).toBe(0);
			// Wall should be blocked
			expect(grid[1][1]).toBe(1);
		});
	});

	describe('pathfinding with different options', () => {
		it('should respect custom walkable tiles', () => {
			// Create pathfinding where tile index 1 is walkable instead of 0
			const customPathfinding = new LuminusPathfinding(mockScene, mockTilemap, mockLayer, {
				walkableTiles: [1],
			});

			// Now walls should be walkable and floors should be blocked
			const grid = customPathfinding.getGrid();
			expect(grid[0][0]).toBe(0); // Floor (index 0) is now "blocked" for pathfinding
			expect(grid[1][1]).toBe(1); // Wall (index 1) is now "walkable" for pathfinding
		});

		it('should allow disabling diagonal movement', () => {
			const noDiagonalPathfinding = new LuminusPathfinding(mockScene, mockTilemap, mockLayer, {
				allowDiagonal: false,
			});

			expect(noDiagonalPathfinding).toBeDefined();
		});

		it('should allow corner cutting configuration', () => {
			const cornerCuttingPathfinding = new LuminusPathfinding(mockScene, mockTilemap, mockLayer, {
				dontCrossCorners: false,
			});

			expect(cornerCuttingPathfinding).toBeDefined();
		});
	});

	describe('debugDraw', () => {
		it('should not throw when drawing debug grid', () => {
			const mockGraphics = {
				clear: jest.fn(),
				fillStyle: jest.fn(),
				fillRect: jest.fn(),
			} as any;

			expect(() => {
				pathfinding.debugDraw(mockGraphics, 0.5);
			}).not.toThrow();

			expect(mockGraphics.clear).toHaveBeenCalled();
			expect(mockGraphics.fillStyle).toHaveBeenCalled();
			expect(mockGraphics.fillRect).toHaveBeenCalled();
		});
	});

	describe('debugDrawPath', () => {
		it('should not throw when drawing a path', () => {
			const mockGraphics = {
				lineStyle: jest.fn(),
				beginPath: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn(),
				strokePath: jest.fn(),
				fillStyle: jest.fn(),
				fillCircle: jest.fn(),
			} as any;

			const testPath = [new Phaser.Math.Vector2(0, 0), new Phaser.Math.Vector2(32, 32)];

			expect(() => {
				pathfinding.debugDrawPath(mockGraphics, testPath);
			}).not.toThrow();

			expect(mockGraphics.lineStyle).toHaveBeenCalled();
			expect(mockGraphics.beginPath).toHaveBeenCalled();
			expect(mockGraphics.strokePath).toHaveBeenCalled();
		});

		it('should not draw empty paths', () => {
			const mockGraphics = {
				lineStyle: jest.fn(),
				beginPath: jest.fn(),
			} as any;

			pathfinding.debugDrawPath(mockGraphics, []);

			expect(mockGraphics.lineStyle).not.toHaveBeenCalled();
			expect(mockGraphics.beginPath).not.toHaveBeenCalled();
		});
	});
});
