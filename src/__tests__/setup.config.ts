// Global test setup
beforeEach(() => {
	// Clear all mocks before each test
	jest.clearAllMocks();
});

// Import the Phaser mock and set as global
// Note: phaser module is already mocked via jest.config.js moduleNameMapper
import PhaserMock from '../__mocks__/phaserMock';
(global as any).Phaser = PhaserMock;
