// Global test setup
beforeEach(() => {
	// Clear all mocks before each test
	jest.clearAllMocks();
});

// Mock Phaser for testing
global.Phaser = {
	Scene: class Scene {
		constructor() {
			this.add = {
				text: jest.fn(),
				image: jest.fn(),
				sprite: jest.fn(),
			};
			this.input = {
				keyboard: {
					addKeys: jest.fn(),
					createCursorKeys: jest.fn(),
					on: jest.fn(),
					addKey: jest.fn(),
				},
			};
			this.time = {
				addEvent: jest.fn(),
				delayedCall: jest.fn(),
				now: Date.now(),
			};
			this.scene = {
				key: 'TestScene',
			};
		}
	},
	Input: {
		Keyboard: {
			KeyCodes: {
				SHIFT: 16,
				ENTER: 13,
				SPACE: 32,
			},
		},
	},
	Physics: {
		Arcade: {
			Sprite: class Sprite {},
		},
	},
};