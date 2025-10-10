import { LuminusHealthBar } from '../../plugins/LuminusHealthBar';

// Mock Phaser module
jest.mock('phaser', () => {
	class MockSprite {
		scene: any;
		x: number;
		y: number;
		texture: any;
		alpha: number = 1;
		tint: number = 0xffffff;
		scaleX: number = 1;
		scaleY: number = 1;
		width: number = 32;
		height: number = 32;

		constructor(scene: any, x: number, y: number, texture: string) {
			this.scene = scene;
			this.x = x;
			this.y = y;
			this.texture = { key: texture };
		}

		setOrigin() {
			return this;
		}
		setDepth() {
			return this;
		}
	}

	return {
		__esModule: true,
		default: {
			GameObjects: {
				Sprite: MockSprite,
			},
		},
	};
});

describe('LuminusHealthBar', () => {
	let mockScene: any;
	let healthBar: LuminusHealthBar;

	beforeEach(() => {
		mockScene = {
			add: {
				existing: jest.fn(),
			},
		};
	});

	describe('Constructor', () => {
		it('should initialize with correct properties', () => {
			healthBar = new LuminusHealthBar(mockScene, 100, 200, 50, 100);

			expect(healthBar.health).toBe(100);
			expect(healthBar.full).toBe(100);
			expect(healthBar.size).toBe(50 * 0.43);
			expect(healthBar.alpha).toBe(0.8);
		});

		it('should set position with default offsets', () => {
			healthBar = new LuminusHealthBar(mockScene, 100, 200, 50, 100);

			expect(healthBar.x).toBe(100);
			expect(healthBar.y).toBe(200);
			expect(healthBar.offX).toBe(0);
			expect(healthBar.offY).toBe(0);
		});

		it('should set position with custom offsets', () => {
			healthBar = new LuminusHealthBar(mockScene, 100, 200, 50, 100, 10, 20);

			expect(healthBar.x).toBe(110);
			expect(healthBar.y).toBe(220);
			expect(healthBar.offX).toBe(10);
			expect(healthBar.offY).toBe(20);
		});

		it('should calculate size as width * 0.43', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 100, 50);

			expect(healthBar.size).toBe(43);
		});

		it('should set initial health equal to max health', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 75);

			expect(healthBar.health).toBe(75);
			expect(healthBar.full).toBe(75);
		});

		it('should call scene.add.existing', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);

			expect(mockScene.add.existing).toHaveBeenCalledWith(healthBar);
		});

		it('should have default height of 3', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);

			expect(healthBar.height).toBe(3);
		});

		it('should use "health" texture', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);

			expect(healthBar.texture.key).toBe('health');
		});

		it('should set initial tint to green when at full health', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);

			// draw() is called in constructor, so tint should be green for full health
			expect(healthBar.tint).toBe(0x00ff00);
		});

		it('should set depth to 2', () => {
			const setDepthSpy = jest.spyOn(LuminusHealthBar.prototype as any, 'setDepth');
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);

			expect(setDepthSpy).toHaveBeenCalled();
		});
	});

	describe('decrease', () => {
		beforeEach(() => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);
		});

		it('should decrease health by damage amount', () => {
			healthBar.decrease(20);

			expect(healthBar.health).toBe(80);
		});

		it('should return false when health is above zero', () => {
			const result = healthBar.decrease(20);

			expect(result).toBe(false);
		});

		it('should return true when health reaches zero', () => {
			const result = healthBar.decrease(100);

			expect(result).toBe(true);
			expect(healthBar.health).toBe(0);
		});

		it('should return true when health goes below zero', () => {
			const result = healthBar.decrease(150);

			expect(result).toBe(true);
			expect(healthBar.health).toBe(0);
		});

		it('should cap health at zero when taking excessive damage', () => {
			healthBar.decrease(200);

			expect(healthBar.health).toBe(0);
		});

		it('should handle multiple decreases correctly', () => {
			healthBar.decrease(30);
			healthBar.decrease(20);
			healthBar.decrease(10);

			expect(healthBar.health).toBe(40);
		});

		it('should handle decimal damage values', () => {
			healthBar.decrease(10.5);

			expect(healthBar.health).toBe(89.5);
		});
	});

	describe('update', () => {
		beforeEach(() => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);
		});

		it('should update health to new value', () => {
			healthBar.update(75);

			expect(healthBar.health).toBe(75);
		});

		it('should allow health to be set to zero', () => {
			healthBar.update(0);

			expect(healthBar.health).toBe(0);
		});

		it('should allow health to exceed max health', () => {
			healthBar.update(150);

			expect(healthBar.health).toBe(150);
		});

		it('should allow negative health values', () => {
			healthBar.update(-10);

			expect(healthBar.health).toBe(-10);
		});

		it('should handle decimal health values', () => {
			healthBar.update(45.7);

			expect(healthBar.health).toBe(45.7);
		});
	});

	describe('draw', () => {
		beforeEach(() => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);
			healthBar.width = 32; // Mock sprite width
		});

		it('should update scaleX based on health percentage', () => {
			healthBar.update(50);

			const expectedScale = (0.5 * healthBar.size) / healthBar.width;
			expect(healthBar.scaleX).toBeCloseTo(expectedScale, 5);
		});

		it('should set scaleX to full when at max health', () => {
			healthBar.update(100);

			const expectedScale = (1.0 * healthBar.size) / healthBar.width;
			expect(healthBar.scaleX).toBeCloseTo(expectedScale, 5);
		});

		it('should set scaleX to zero when health is zero', () => {
			healthBar.update(0);

			expect(healthBar.scaleX).toBe(0);
		});

		it('should set green tint when health is full (100%)', () => {
			healthBar.update(100);

			// At 100% health, color should be green (0x00ff00)
			expect(healthBar.tint).toBe(0x00ff00);
		});

		it('should set yellow tint when health is at 50%', () => {
			healthBar.update(50);

			// At 50% health, color should be yellow (0xffff00)
			expect(healthBar.tint).toBe(0xffff00);
		});

		it('should set red tint when health is at 0%', () => {
			healthBar.update(0);

			// At 0% health, color should be red (0xff0000)
			expect(healthBar.tint).toBe(0xff0000);
		});

		it('should interpolate color between green and yellow (75%)', () => {
			healthBar.update(75);

			// At 75% health, should be between yellow and green
			const tintHex = healthBar.tint.toString(16).padStart(6, '0');
			expect(tintHex).toMatch(/^[0-7][0-9a-f]ff00$/);
		});

		it('should interpolate color between yellow and red (25%)', () => {
			healthBar.update(25);

			// At 25% health, should be between red and yellow
			const tintHex = healthBar.tint.toString(16).padStart(6, '0');
			expect(tintHex).toMatch(/^ff[0-9a-f][0-9a-f]00$/);
		});
	});

	describe('rgbToHex', () => {
		beforeEach(() => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);
		});

		it('should convert pure red to hex', () => {
			const result = healthBar.rgbToHex(255, 0, 0);

			expect(result).toBe(0xff0000);
		});

		it('should convert pure green to hex', () => {
			const result = healthBar.rgbToHex(0, 255, 0);

			expect(result).toBe(0x00ff00);
		});

		it('should convert pure blue to hex', () => {
			const result = healthBar.rgbToHex(0, 0, 255);

			expect(result).toBe(0x0000ff);
		});

		it('should convert white to hex', () => {
			const result = healthBar.rgbToHex(255, 255, 255);

			expect(result).toBe(0xffffff);
		});

		it('should convert black to hex', () => {
			const result = healthBar.rgbToHex(0, 0, 0);

			expect(result).toBe(0x000000);
		});

		it('should convert yellow to hex', () => {
			const result = healthBar.rgbToHex(255, 255, 0);

			expect(result).toBe(0xffff00);
		});

		it('should convert custom RGB values', () => {
			const result = healthBar.rgbToHex(128, 64, 32);

			expect(result).toBe(0x804020);
		});

		it('should handle decimal values by rounding/truncating', () => {
			const result = healthBar.rgbToHex(127.5, 63.9, 31.1);

			// Bitwise operations truncate decimals
			expect(result).toBe(0x7f3f1f);
		});
	});

	describe('Edge Cases', () => {
		it('should handle zero width', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 0, 100);

			expect(healthBar.size).toBe(0);
		});

		it('should handle zero max health', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 0);

			expect(healthBar.health).toBe(0);
			expect(healthBar.full).toBe(0);
		});

		it('should handle very large health values', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 10000);

			healthBar.decrease(500);
			expect(healthBar.health).toBe(9500);
		});

		it('should handle negative offsets', () => {
			healthBar = new LuminusHealthBar(mockScene, 100, 100, 50, 100, -10, -20);

			expect(healthBar.x).toBe(90);
			expect(healthBar.y).toBe(80);
		});

		it('should handle very small width values', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 1, 100);

			expect(healthBar.size).toBe(0.43);
		});

		it('should handle health greater than max after update', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);
			healthBar.update(200);

			// Scale should be > 1 when health exceeds max
			const expectedScale = (2.0 * healthBar.size) / healthBar.width;
			expect(healthBar.scaleX).toBeCloseTo(expectedScale, 5);
		});

		it('should handle zero damage decrease', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);
			const result = healthBar.decrease(0);

			expect(healthBar.health).toBe(100);
			expect(result).toBe(false);
		});

		it('should handle negative damage (healing via decrease)', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);
			healthBar.decrease(50); // Reduce to 50
			healthBar.decrease(-20); // "Heal" by 20

			expect(healthBar.health).toBe(70);
		});

		it('should handle fractional width values', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50.5, 100);

			expect(healthBar.size).toBeCloseTo(50.5 * 0.43, 5);
		});

		it('should handle division by zero in draw with zero full health', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 0);

			// Should not crash when drawing with zero max health
			expect(() => {
				healthBar.draw();
			}).not.toThrow();
		});
	});

	describe('Integration', () => {
		it('should maintain correct state through decrease and update', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);

			healthBar.decrease(30);
			expect(healthBar.health).toBe(70);

			healthBar.update(50);
			expect(healthBar.health).toBe(50);

			healthBar.decrease(50);
			expect(healthBar.health).toBe(0);
		});

		it('should update tint color as health changes', () => {
			healthBar = new LuminusHealthBar(mockScene, 0, 0, 50, 100);

			// Start at full health (green)
			expect(healthBar.tint).toBe(0x00ff00);

			// Decrease to 50% (yellow)
			healthBar.update(50);
			expect(healthBar.tint).toBe(0xffff00);

			// Decrease to 0% (red)
			healthBar.update(0);
			expect(healthBar.tint).toBe(0xff0000);
		});
	});
});
