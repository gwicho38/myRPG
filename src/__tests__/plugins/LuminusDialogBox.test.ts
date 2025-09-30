import { LuminusDialogBox } from '../../plugins/LuminusDialogBox';

// Mock player
const mockPlayer = {
	container: {
		body: {
			maxSpeed: 100,
		},
	},
	canMove: true,
	canAtack: true,
	canBlock: true,
	speed: 100,
} as any;

// Mock scene
const mockScene = {
	events: {
		emit: jest.fn(),
	},
	cameras: {
		main: {
			width: 800,
			height: 600,
		},
	},
	add: {
		text: jest.fn(() => ({
			setScrollFactor: jest.fn(() => ({
				setDepth: jest.fn(() => ({})),
			})),
		})),
		nineslice: jest.fn(() => ({
			setScrollFactor: jest.fn(() => ({
				setDepth: jest.fn(() => ({ visible: false })),
			})),
		})),
		image: jest.fn(() => ({
			setScrollFactor: jest.fn(() => ({
				setDepth: jest.fn(() => ({ visible: false })),
			})),
		})),
	},
} as any;

describe('LuminusDialogBox', () => {
	let dialogBox: LuminusDialogBox;

	beforeEach(() => {
		dialogBox = new LuminusDialogBox(mockScene, mockPlayer);
	});

	test('should create dialog box with initial state', () => {
		expect(dialogBox.scene).toBe(mockScene);
		expect(dialogBox.player).toBe(mockPlayer);
		expect(dialogBox.isAnimatingText).toBe(false);
		expect(dialogBox.isOverlapingChat).toBe(false);
	});

	test('should initialize dialog system', () => {
		expect(dialogBox.dialog).toBeDefined();
		expect(dialogBox.actionButton).toBeDefined();
	});

	test('should have player reference', () => {
		expect(dialogBox.player).toBe(mockPlayer);
	});
});
