import TILE_MAPPING from '../../consts/DungeonTiles';

describe('DungeonTiles', () => {
	it('should export TILE_MAPPING object', () => {
		expect(TILE_MAPPING).toBeDefined();
		expect(typeof TILE_MAPPING).toBe('object');
	});

	describe('WALL configuration', () => {
		it('should have corner tiles', () => {
			expect(TILE_MAPPING.WALL.TOP_LEFT).toBe(3);
			expect(TILE_MAPPING.WALL.TOP_RIGHT).toBe(4);
			expect(TILE_MAPPING.WALL.BOTTOM_RIGHT).toBe(23);
			expect(TILE_MAPPING.WALL.BOTTOM_LEFT).toBe(22);
		});

		it('should have weighted wall sides', () => {
			expect(Array.isArray(TILE_MAPPING.WALL.TOP)).toBe(true);
			expect(Array.isArray(TILE_MAPPING.WALL.LEFT)).toBe(true);
			expect(Array.isArray(TILE_MAPPING.WALL.RIGHT)).toBe(true);
			expect(Array.isArray(TILE_MAPPING.WALL.BOTTOM)).toBe(true);
		});

		it('should have valid TileWeight structures', () => {
			TILE_MAPPING.WALL.TOP.forEach((tileWeight) => {
				expect(tileWeight).toHaveProperty('index');
				expect(tileWeight).toHaveProperty('weight');
				expect(typeof tileWeight.weight).toBe('number');
			});
		});
	});

	describe('FLOOR configuration', () => {
		it('should have weighted floor tiles', () => {
			expect(Array.isArray(TILE_MAPPING.FLOOR)).toBe(true);
			expect(TILE_MAPPING.FLOOR.length).toBeGreaterThan(0);
		});

		it('should have valid TileWeight structures', () => {
			TILE_MAPPING.FLOOR.forEach((tileWeight) => {
				expect(tileWeight).toHaveProperty('index');
				expect(tileWeight).toHaveProperty('weight');
			});
		});
	});

	describe('POT configuration', () => {
		it('should have weighted pot tiles', () => {
			expect(Array.isArray(TILE_MAPPING.POT)).toBe(true);
			expect(TILE_MAPPING.POT.length).toBe(3);
		});
	});

	describe('DOOR configuration', () => {
		it('should have door configurations for all directions', () => {
			expect(Array.isArray(TILE_MAPPING.DOOR.TOP)).toBe(true);
			expect(Array.isArray(TILE_MAPPING.DOOR.LEFT)).toBe(true);
			expect(Array.isArray(TILE_MAPPING.DOOR.BOTTOM)).toBe(true);
			expect(Array.isArray(TILE_MAPPING.DOOR.RIGHT)).toBe(true);
		});

		it('should have correct door tile counts', () => {
			expect(TILE_MAPPING.DOOR.TOP).toEqual([40, 6, 38]);
			expect(TILE_MAPPING.DOOR.BOTTOM).toEqual([2, 6, 0]);
		});
	});

	describe('Special tiles', () => {
		it('should have CHEST tile index', () => {
			expect(TILE_MAPPING.CHEST).toBe(166);
		});

		it('should have STAIRS tile index', () => {
			expect(TILE_MAPPING.STAIRS).toBe(81);
		});

		it('should have TOWER tile configuration', () => {
			expect(Array.isArray(TILE_MAPPING.TOWER)).toBe(true);
			expect(TILE_MAPPING.TOWER).toEqual([[186], [205]]);
		});
	});
});
