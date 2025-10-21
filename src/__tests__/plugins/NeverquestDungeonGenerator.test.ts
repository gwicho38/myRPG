/**
 * Tests for NeverquestDungeonGenerator plugin
 */

// Mock the @mikewesthad/dungeon library
jest.mock('@mikewesthad/dungeon', () => jest.fn());

import Dungeon from '@mikewesthad/dungeon';
import { NeverquestDungeonGenerator } from '../../plugins/NeverquestDungeonGenerator';
import TILES from '../../consts/DungeonTiles';

const mockGetDoorLocations = jest.fn();
const mockRoom = {
	x: 10,
	y: 10,
	width: 10,
	height: 10,
	left: 10,
	right: 19,
	top: 10,
	bottom: 19,
	getDoorLocations: mockGetDoorLocations,
};

const mockDungeon = {
	width: 50,
	height: 50,
	rooms: [mockRoom],
};

const MockDungeonConstructor = Dungeon as jest.Mock;
MockDungeonConstructor.mockImplementation(() => mockDungeon as any);

describe('NeverquestDungeonGenerator', () => {
	let mockScene: any;
	let mockMap: any;
	let mockGroundLayer: any;
	let mockStuffLayer: any;
	let mockTileset: any;
	let dungeonGenerator: NeverquestDungeonGenerator;

	beforeEach(() => {
		jest.clearAllMocks();

		// Reset mock room data
		mockRoom.x = 10;
		mockRoom.y = 10;
		mockRoom.width = 10;
		mockRoom.height = 10;
		mockRoom.left = 10;
		mockRoom.right = 19;
		mockRoom.top = 10;
		mockRoom.bottom = 19;
		mockGetDoorLocations.mockReturnValue([]);

		// Reset dungeon rooms array
		mockDungeon.rooms = [mockRoom];

		// Create mock tilemap layer
		mockGroundLayer = {
			fill: jest.fn(),
			weightedRandomize: jest.fn(),
			putTileAt: jest.fn(),
			putTilesAt: jest.fn(),
			setCollisionByExclusion: jest.fn(),
		};

		mockStuffLayer = {
			fill: jest.fn(),
			weightedRandomize: jest.fn(),
			putTileAt: jest.fn(),
			putTilesAt: jest.fn(),
		};

		mockTileset = {
			name: 'dungeon_tiles',
		};

		// Create mock tilemap
		mockMap = {
			width: 50,
			height: 50,
			addTilesetImage: jest.fn().mockReturnValue(mockTileset),
			createBlankLayer: jest.fn((name: string) => {
				if (name === 'Ground') return mockGroundLayer;
				if (name === 'Stuff') return mockStuffLayer;
				return null;
			}),
		};

		// Create mock scene
		mockScene = {
			make: {
				tilemap: jest.fn().mockReturnValue(mockMap),
			},
		};
	});

	describe('Constructor', () => {
		it('should initialize with scene', () => {
			dungeonGenerator = new NeverquestDungeonGenerator(mockScene);

			expect(dungeonGenerator.scene).toBe(mockScene);
			expect(dungeonGenerator.dungeon).toBeNull();
			expect(dungeonGenerator.map).toBeNull();
			expect(dungeonGenerator.groundLayer).toBeNull();
			expect(dungeonGenerator.stuffLayer).toBeNull();
		});

		it('should initialize with default configuration values', () => {
			dungeonGenerator = new NeverquestDungeonGenerator(mockScene);

			expect(dungeonGenerator.tileHeight).toBe(48);
			expect(dungeonGenerator.tileWidth).toBe(48);
			expect(dungeonGenerator.mapWidth).toBe(50);
			expect(dungeonGenerator.mapHeight).toBe(50);
			expect(dungeonGenerator.tilesetName).toBe('dungeon_tiles');
			expect(dungeonGenerator.minSizeRoom).toBe(7);
			expect(dungeonGenerator.maxSizeRoom).toBe(14);
			expect(dungeonGenerator.maxRooms).toBe(12);
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			dungeonGenerator = new NeverquestDungeonGenerator(mockScene);
		});

		it('should create dungeon instance with correct configuration', () => {
			dungeonGenerator.create();

			expect(MockDungeonConstructor).toHaveBeenCalledWith({
				width: 50,
				height: 50,
				doorPadding: 2,
				rooms: {
					width: {
						min: 7,
						max: 14,
						onlyOdd: true,
					},
					height: {
						min: 7,
						max: 14,
						onlyOdd: true,
					},
					maxRooms: 12,
				},
			});

			expect(dungeonGenerator.dungeon).not.toBeNull();
		});

		it('should create tilemap with dungeon dimensions', () => {
			dungeonGenerator.create();

			expect(mockScene.make.tilemap).toHaveBeenCalledWith({
				tileWidth: 48,
				tileHeight: 48,
				width: 50,
				height: 50,
			});

			expect(dungeonGenerator.map).toBe(mockMap);
		});

		it('should add tileset image to map', () => {
			dungeonGenerator.create();

			expect(mockMap.addTilesetImage).toHaveBeenCalledWith('dungeon_tiles', null, 48, 48, 1, 2);
		});

		it('should create ground and stuff layers', () => {
			dungeonGenerator.create();

			expect(mockMap.createBlankLayer).toHaveBeenCalledWith('Ground', mockTileset);
			expect(mockMap.createBlankLayer).toHaveBeenCalledWith('Stuff', mockTileset);
			expect(dungeonGenerator.groundLayer).toBe(mockGroundLayer);
			expect(dungeonGenerator.stuffLayer).toBe(mockStuffLayer);
		});

		it('should fill ground layer with blank tiles initially', () => {
			dungeonGenerator.create();

			expect(mockGroundLayer.fill).toHaveBeenCalledWith(TILES.BLANK);
		});

		it('should set collision by exclusion for walkable tiles', () => {
			dungeonGenerator.create();

			expect(mockGroundLayer.setCollisionByExclusion).toHaveBeenCalledWith([-1, 6, 7, 8, 26]);
		});

		it('should place floor tiles in each room', () => {
			dungeonGenerator.create();

			// Floor tiles should be placed in the room interior (x+1, y+1, width-2, height-2)
			expect(mockGroundLayer.weightedRandomize).toHaveBeenCalledWith(TILES.FLOOR, 11, 11, 8, 8);
		});

		it('should place corner wall tiles for each room', () => {
			dungeonGenerator.create();

			expect(mockGroundLayer.putTileAt).toHaveBeenCalledWith(TILES.WALL.TOP_LEFT, 10, 10);
			expect(mockGroundLayer.putTileAt).toHaveBeenCalledWith(TILES.WALL.TOP_RIGHT, 19, 10);
			expect(mockGroundLayer.putTileAt).toHaveBeenCalledWith(TILES.WALL.BOTTOM_RIGHT, 19, 19);
			expect(mockGroundLayer.putTileAt).toHaveBeenCalledWith(TILES.WALL.BOTTOM_LEFT, 10, 19);
		});

		it('should place wall tiles on top edge', () => {
			dungeonGenerator.create();

			expect(mockGroundLayer.weightedRandomize).toHaveBeenCalledWith(TILES.WALL.TOP, 11, 10, 8, 1);
		});

		it('should place wall tiles on bottom edge', () => {
			dungeonGenerator.create();

			expect(mockGroundLayer.weightedRandomize).toHaveBeenCalledWith(TILES.WALL.BOTTOM, 11, 19, 8, 1);
		});

		it('should place wall tiles on left edge', () => {
			dungeonGenerator.create();

			expect(mockGroundLayer.weightedRandomize).toHaveBeenCalledWith(TILES.WALL.LEFT, 10, 11, 1, 8);
		});

		it('should place wall tiles on right edge', () => {
			dungeonGenerator.create();

			expect(mockGroundLayer.weightedRandomize).toHaveBeenCalledWith(TILES.WALL.RIGHT, 19, 11, 1, 8);
		});

		it('should place top door when door is at y=0', () => {
			mockGetDoorLocations.mockReturnValue([{ x: 5, y: 0 }]);

			dungeonGenerator.create();

			// x + doors[i].x - 1 = 10 + 5 - 1 = 14
			// y + doors[i].y = 10 + 0 = 10
			expect(mockGroundLayer.putTilesAt).toHaveBeenCalledWith(TILES.DOOR.TOP, 14, 10);
		});

		it('should place bottom door when door is at y=height-1', () => {
			mockGetDoorLocations.mockReturnValue([{ x: 5, y: 9 }]); // height - 1 = 9

			dungeonGenerator.create();

			// x + doors[i].x - 1 = 10 + 5 - 1 = 14
			// y + doors[i].y = 10 + 9 = 19
			expect(mockGroundLayer.putTilesAt).toHaveBeenCalledWith(TILES.DOOR.BOTTOM, 14, 19);
		});

		it('should place left door when door is at x=0', () => {
			mockGetDoorLocations.mockReturnValue([{ x: 0, y: 5 }]);

			dungeonGenerator.create();

			// x + doors[i].x = 10 + 0 = 10
			// y + doors[i].y - 1 = 10 + 5 - 1 = 14
			expect(mockGroundLayer.putTilesAt).toHaveBeenCalledWith(TILES.DOOR.LEFT, 10, 14);
		});

		it('should place right door when door is at x=width-1', () => {
			mockGetDoorLocations.mockReturnValue([{ x: 9, y: 5 }]); // width - 1 = 9

			dungeonGenerator.create();

			// x + doors[i].x = 10 + 9 = 19
			// y + doors[i].y - 1 = 10 + 5 - 1 = 14
			expect(mockGroundLayer.putTilesAt).toHaveBeenCalledWith(TILES.DOOR.RIGHT, 19, 14);
		});

		it('should handle multiple doors on same room', () => {
			mockGetDoorLocations.mockReturnValue([
				{ x: 5, y: 0 }, // Top
				{ x: 0, y: 5 }, // Left
				{ x: 9, y: 5 }, // Right
				{ x: 5, y: 9 }, // Bottom
			]);

			dungeonGenerator.create();

			expect(mockGroundLayer.putTilesAt).toHaveBeenCalledTimes(4);
			expect(mockGroundLayer.putTilesAt).toHaveBeenCalledWith(TILES.DOOR.TOP, 14, 10);
			expect(mockGroundLayer.putTilesAt).toHaveBeenCalledWith(TILES.DOOR.LEFT, 10, 14);
			expect(mockGroundLayer.putTilesAt).toHaveBeenCalledWith(TILES.DOOR.RIGHT, 19, 14);
			expect(mockGroundLayer.putTilesAt).toHaveBeenCalledWith(TILES.DOOR.BOTTOM, 14, 19);
		});

		it('should handle room with no doors', () => {
			mockGetDoorLocations.mockReturnValue([]);

			dungeonGenerator.create();

			expect(mockGroundLayer.putTilesAt).not.toHaveBeenCalled();
		});

		it('should process multiple rooms', () => {
			const mockRoom2 = {
				x: 30,
				y: 30,
				width: 8,
				height: 8,
				left: 30,
				right: 37,
				top: 30,
				bottom: 37,
				getDoorLocations: jest.fn().mockReturnValue([]),
			};

			mockDungeon.rooms = [mockRoom, mockRoom2];

			dungeonGenerator.create();

			// Should place corner tiles for both rooms
			expect(mockGroundLayer.putTileAt).toHaveBeenCalledWith(TILES.WALL.TOP_LEFT, 10, 10);
			expect(mockGroundLayer.putTileAt).toHaveBeenCalledWith(TILES.WALL.TOP_LEFT, 30, 30);

			// Should place floor tiles for both rooms
			const floorCalls = mockGroundLayer.weightedRandomize.mock.calls.filter(
				(call: any) => call[0] === TILES.FLOOR
			);
			expect(floorCalls.length).toBe(2);
		});

		it('should use custom map dimensions when set', () => {
			dungeonGenerator.mapWidth = 100;
			dungeonGenerator.mapHeight = 80;

			jest.clearAllMocks();

			dungeonGenerator.create();

			expect(MockDungeonConstructor).toHaveBeenCalledWith(
				expect.objectContaining({
					width: 100,
					height: 80,
				})
			);
		});

		it('should use custom room size constraints when set', () => {
			dungeonGenerator.minSizeRoom = 5;
			dungeonGenerator.maxSizeRoom = 20;

			jest.clearAllMocks();

			dungeonGenerator.create();

			expect(MockDungeonConstructor).toHaveBeenCalledWith(
				expect.objectContaining({
					rooms: expect.objectContaining({
						width: expect.objectContaining({
							min: 5,
							max: 20,
						}),
						height: expect.objectContaining({
							min: 5,
							max: 20,
						}),
					}),
				})
			);
		});

		it('should use custom max rooms when set', () => {
			dungeonGenerator.maxRooms = 20;

			jest.clearAllMocks();

			dungeonGenerator.create();

			expect(MockDungeonConstructor).toHaveBeenCalledWith(
				expect.objectContaining({
					rooms: expect.objectContaining({
						maxRooms: 20,
					}),
				})
			);
		});

		it('should use custom tileset name when set', () => {
			dungeonGenerator.tilesetName = 'custom_tiles';

			dungeonGenerator.create();

			expect(mockMap.addTilesetImage).toHaveBeenCalledWith('custom_tiles', null, 48, 48, 1, 2);
		});
	});

	describe('Edge Cases', () => {
		beforeEach(() => {
			dungeonGenerator = new NeverquestDungeonGenerator(mockScene);
		});

		it('should handle room at origin (0, 0)', () => {
			mockRoom.x = 0;
			mockRoom.y = 0;
			mockRoom.left = 0;
			mockRoom.top = 0;
			mockRoom.right = 9;
			mockRoom.bottom = 9;

			dungeonGenerator.create();

			expect(mockGroundLayer.putTileAt).toHaveBeenCalledWith(TILES.WALL.TOP_LEFT, 0, 0);
			expect(mockGroundLayer.weightedRandomize).toHaveBeenCalledWith(TILES.FLOOR, 1, 1, 8, 8);
		});

		it('should handle minimum size room (7x7)', () => {
			mockRoom.width = 7;
			mockRoom.height = 7;
			mockRoom.right = mockRoom.left + 6;
			mockRoom.bottom = mockRoom.top + 6;

			dungeonGenerator.create();

			// Floor should be width-2 x height-2 = 5x5
			expect(mockGroundLayer.weightedRandomize).toHaveBeenCalledWith(
				TILES.FLOOR,
				mockRoom.x + 1,
				mockRoom.y + 1,
				5,
				5
			);
		});

		it('should handle large room dimensions', () => {
			mockRoom.x = 5;
			mockRoom.y = 5;
			mockRoom.width = 20;
			mockRoom.height = 20;
			mockRoom.left = 5;
			mockRoom.top = 5;
			mockRoom.right = 24;
			mockRoom.bottom = 24;

			dungeonGenerator.create();

			expect(mockGroundLayer.weightedRandomize).toHaveBeenCalledWith(TILES.FLOOR, 6, 6, 18, 18);
			expect(mockGroundLayer.weightedRandomize).toHaveBeenCalledWith(TILES.WALL.TOP, 6, 5, 18, 1);
		});

		it('should handle dungeon with no rooms', () => {
			mockDungeon.rooms = [];

			dungeonGenerator.create();

			// Should still create map and layers
			expect(mockMap.createBlankLayer).toHaveBeenCalledWith('Ground', mockTileset);
			expect(mockGroundLayer.fill).toHaveBeenCalledWith(TILES.BLANK);

			// But should not place any room tiles
			expect(mockGroundLayer.putTileAt).not.toHaveBeenCalled();
		});

		it('should handle room with many doors', () => {
			const manyDoors = [
				{ x: 5, y: 0 },
				{ x: 6, y: 0 },
				{ x: 0, y: 5 },
				{ x: 0, y: 6 },
				{ x: 9, y: 5 },
				{ x: 9, y: 6 },
				{ x: 5, y: 9 },
				{ x: 6, y: 9 },
			];
			mockGetDoorLocations.mockReturnValue(manyDoors);

			dungeonGenerator.create();

			expect(mockGroundLayer.putTilesAt).toHaveBeenCalledTimes(8);
		});
	});

	describe('Integration', () => {
		it('should create complete dungeon with all layers and collision', () => {
			dungeonGenerator = new NeverquestDungeonGenerator(mockScene);
			mockGetDoorLocations.mockReturnValue([
				{ x: 5, y: 0 },
				{ x: 0, y: 5 },
			]);

			dungeonGenerator.create();

			// Verify full creation pipeline
			expect(dungeonGenerator.dungeon).not.toBeNull();
			expect(dungeonGenerator.map).not.toBeNull();
			expect(dungeonGenerator.groundLayer).not.toBeNull();
			expect(dungeonGenerator.stuffLayer).not.toBeNull();

			// Verify layer setup
			expect(mockGroundLayer.fill).toHaveBeenCalled();
			expect(mockGroundLayer.setCollisionByExclusion).toHaveBeenCalled();

			// Verify room creation
			expect(mockGroundLayer.weightedRandomize).toHaveBeenCalled();
			expect(mockGroundLayer.putTileAt).toHaveBeenCalled();
			expect(mockGroundLayer.putTilesAt).toHaveBeenCalled();
		});

		it('should properly configure onlyOdd for room dimensions', () => {
			dungeonGenerator = new NeverquestDungeonGenerator(mockScene);

			dungeonGenerator.create();

			expect(MockDungeonConstructor).toHaveBeenCalledWith(
				expect.objectContaining({
					rooms: expect.objectContaining({
						width: expect.objectContaining({
							onlyOdd: true,
						}),
						height: expect.objectContaining({
							onlyOdd: true,
						}),
					}),
				})
			);
		});

		it('should set doorPadding to 2', () => {
			dungeonGenerator = new NeverquestDungeonGenerator(mockScene);

			dungeonGenerator.create();

			expect(MockDungeonConstructor).toHaveBeenCalledWith(
				expect.objectContaining({
					doorPadding: 2,
				})
			);
		});
	});
});
