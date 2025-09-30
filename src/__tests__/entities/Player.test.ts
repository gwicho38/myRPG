import { Player } from '../../entities/Player';

// Mock Phaser scene
const mockScene = {
	add: {
		existing: jest.fn(),
		particles: jest.fn(() => ({
			createEmitter: jest.fn(() => ({
				setDepth: jest.fn(() => ({ on: false })),
			})),
		})),
		zone: jest.fn(() => ({
			setOrigin: jest.fn(),
			setPosition: jest.fn(),
		})),
		container: jest.fn(() => ({
			setPosition: jest.fn(),
			add: jest.fn(),
		})),
	},
	physics: {
		add: {
			existing: jest.fn(),
		},
	},
	events: {
		on: jest.fn(),
		off: jest.fn(),
		emit: jest.fn(),
		once: jest.fn(),
	},
	input: {
		keyboard: {
			createCursorKeys: jest.fn(() => ({
				left: { isDown: false },
				right: { isDown: false },
				up: { isDown: false },
				down: { isDown: false },
			})),
			addKeys: jest.fn(),
			addKey: jest.fn(() => ({ isDown: false })),
			on: jest.fn(),
		},
		mouse: {
			disableContextMenu: jest.fn(),
		},
		gamepad: {
			pad1: {
				id: 'mock-gamepad',
				index: 0,
				buttons: [],
				axes: [],
				connected: true,
			},
			on: jest.fn(),
			off: jest.fn(),
		},
		on: jest.fn(),
	},
	map: {
		worldToTileX: jest.fn(),
		worldToTileY: jest.fn(),
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
	scene: {
		launch: jest.fn(),
		stop: jest.fn(),
		start: jest.fn(),
		get: jest.fn(),
	},
} as any;

describe('Player', () => {
	let player: Player;

	beforeEach(() => {
		player = new Player(mockScene, 100, 100, 'player_sprite');
	});

	test('should create player with initial attributes', () => {
		expect(player.x).toBe(100);
		expect(player.y).toBe(100);
		expect(player.entityName).toBe('player');
		expect(player.canMove).toBe(true);
		expect(player.canAtack).toBe(true);
		expect(player.canBlock).toBe(true);
	});

	test('should have initial attributes', () => {
		expect(player.attributes).toBeDefined();
		expect(player.attributes.health).toBeGreaterThan(0);
		expect(player.attributes.level).toBeGreaterThanOrEqual(1);
		expect(player.speed).toBeGreaterThan(0);
	});

	test('should have movement capabilities', () => {
		expect(player.luminusMovement).toBeDefined();
		expect(player.luminusKeyboardMouseController).toBeDefined();
	});

	test('should initialize with items array', () => {
		expect(player.items).toBeDefined();
		expect(Array.isArray(player.items)).toBe(true);
	});
});
