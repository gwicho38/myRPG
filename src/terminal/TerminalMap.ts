import { TerminalEntity } from './entities/TerminalEntity';
import { TerminalAnimator } from './TerminalAnimator';

export enum TileType {
	WALL = 0,
	FLOOR = 1,
	DOOR = 2,
	WATER = 3,
	TREASURE = 4,
	TORCH = 5,
	GRASS = 6,
}

/**
 * Terminal map renderer
 */
export class TerminalMap {
	public width: number;
	public height: number;
	public tiles: TileType[][];
	public entities: TerminalEntity[] = [];
	public animator: TerminalAnimator;

	// Tile symbols
	private readonly TILE_SYMBOLS: Record<TileType, string> = {
		[TileType.WALL]: '█',
		[TileType.FLOOR]: '.',
		[TileType.DOOR]: '🚪',
		[TileType.WATER]: '≈',
		[TileType.TREASURE]: '💎',
		[TileType.TORCH]: '🔥',
		[TileType.GRASS]: '🌿',
	};

	// Tile colors
	private readonly TILE_COLORS: Record<TileType, string> = {
		[TileType.WALL]: 'grey',
		[TileType.FLOOR]: 'black',
		[TileType.DOOR]: 'yellow',
		[TileType.WATER]: 'blue',
		[TileType.TREASURE]: 'cyan',
		[TileType.TORCH]: 'red',
		[TileType.GRASS]: 'green',
	};

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.tiles = this.generateEmptyMap();
		this.animator = new TerminalAnimator();
	}

	/**
	 * Generate an empty map
	 */
	private generateEmptyMap(): TileType[][] {
		const map: TileType[][] = [];
		for (let y = 0; y < this.height; y++) {
			const row: TileType[] = [];
			for (let x = 0; x < this.width; x++) {
				// Create walls around edges, floor in the middle
				if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
					row.push(TileType.WALL);
				} else {
					row.push(TileType.FLOOR);
				}
			}
			map.push(row);
		}
		return map;
	}

	/**
	 * Generate a simple dungeon
	 */
	public generateDungeon(): void {
		// Fill with walls first
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.tiles[y][x] = TileType.WALL;
			}
		}

		// Create some rooms
		this.createRoom(5, 5, 10, 8);
		this.createRoom(20, 5, 10, 8);
		this.createRoom(5, 15, 10, 8);
		this.createRoom(20, 15, 10, 8);

		// Create corridors
		this.createHorizontalCorridor(10, 15, 9);
		this.createHorizontalCorridor(10, 15, 19);
		this.createVerticalCorridor(9, 8, 19);
		this.createVerticalCorridor(25, 8, 19);
	}

	/**
	 * Create a rectangular room
	 */
	private createRoom(x: number, y: number, width: number, height: number): void {
		for (let dy = 0; dy < height; dy++) {
			for (let dx = 0; dx < width; dx++) {
				const mapX = x + dx;
				const mapY = y + dy;
				if (mapX > 0 && mapX < this.width - 1 && mapY > 0 && mapY < this.height - 1) {
					this.tiles[mapY][mapX] = TileType.FLOOR;
				}
			}
		}
	}

	/**
	 * Create a horizontal corridor (3 tiles wide)
	 */
	private createHorizontalCorridor(x1: number, x2: number, y: number): void {
		const minX = Math.min(x1, x2);
		const maxX = Math.max(x1, x2);
		for (let x = minX; x <= maxX; x++) {
			// Create 3-tile wide corridor
			for (let dy = -1; dy <= 1; dy++) {
				const corridorY = y + dy;
				if (x > 0 && x < this.width - 1 && corridorY > 0 && corridorY < this.height - 1) {
					this.tiles[corridorY][x] = TileType.FLOOR;
				}
			}
		}
	}

	/**
	 * Create a vertical corridor (3 tiles wide)
	 */
	private createVerticalCorridor(x: number, y1: number, y2: number): void {
		const minY = Math.min(y1, y2);
		const maxY = Math.max(y1, y2);
		for (let y = minY; y <= maxY; y++) {
			// Create 3-tile wide corridor
			for (let dx = -1; dx <= 1; dx++) {
				const corridorX = x + dx;
				if (corridorX > 0 && corridorX < this.width - 1 && y > 0 && y < this.height - 1) {
					this.tiles[y][corridorX] = TileType.FLOOR;
				}
			}
		}
	}

	/**
	 * Check if a position is walkable
	 */
	public isWalkable(x: number, y: number): boolean {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return false;
		}
		return this.tiles[y][x] !== TileType.WALL;
	}

	/**
	 * Add an entity to the map
	 */
	public addEntity(entity: TerminalEntity): void {
		this.entities.push(entity);
	}

	/**
	 * Remove an entity from the map
	 */
	public removeEntity(entity: TerminalEntity): void {
		const index = this.entities.indexOf(entity);
		if (index > -1) {
			this.entities.splice(index, 1);
		}
	}

	/**
	 * Get entity at position
	 */
	public getEntityAt(x: number, y: number): TerminalEntity | null {
		return this.entities.find((e) => e.x === x && e.y === y) || null;
	}

	/**
	 * Render the map around a center point (camera)
	 */
	public render(centerX: number, centerY: number, viewWidth: number, viewHeight: number): string {
		const lines: string[] = [];
		const halfWidth = Math.floor(viewWidth / 2);
		const halfHeight = Math.floor(viewHeight / 2);

		for (let dy = -halfHeight; dy <= halfHeight; dy++) {
			let line = '';
			for (let dx = -halfWidth; dx <= halfWidth; dx++) {
				const x = centerX + dx;
				const y = centerY + dy;

				// Check for animation effect first (highest priority)
				const effect = this.animator.getEffectAt(x, y);
				if (effect) {
					line += `{${effect.color}-fg}${effect.symbol}{/${effect.color}-fg}`;
				} else {
					// Check for entity at this position
					const entity = this.getEntityAt(x, y);
					if (entity) {
						line += entity.toString();
					} else if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
						const tile = this.tiles[y][x];
						const symbol = this.TILE_SYMBOLS[tile];
						const color = this.TILE_COLORS[tile];
						line += `{${color}-fg}${symbol}{/${color}-fg}`;
					} else {
						line += ' ';
					}
				}
			}
			lines.push(line);
		}

		return lines.join('\n');
	}

	/**
	 * Find a walkable spawn position
	 */
	public findSpawnPosition(): { x: number; y: number } {
		for (let y = 1; y < this.height - 1; y++) {
			for (let x = 1; x < this.width - 1; x++) {
				if (this.isWalkable(x, y)) {
					return { x, y };
				}
			}
		}
		return { x: 1, y: 1 };
	}
}
