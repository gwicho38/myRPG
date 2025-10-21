import { NeverquestEntityTextDisplay } from '../../plugins/NeverquestEntityTextDisplay';
import { ENTITIES } from '../../consts/Entities';

describe('NeverquestEntityTextDisplay', () => {
	let display: NeverquestEntityTextDisplay;
	let mockScene: any;
	let mockTarget: any;
	let mockText: any;
	let mockSprite: any;

	beforeEach(() => {
		// Mock text object
		mockText = {
			text: '',
			x: 0,
			y: 0,
			visible: true,
			active: true,
			depth: 0,
			setOrigin: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			setScale: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		// Mock sprite object
		mockSprite = {
			x: 0,
			y: 0,
			visible: true,
			active: true,
			depth: 0,
			setOrigin: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			setScale: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		// Mock scene
		mockScene = {
			add: {
				text: jest.fn(() => mockText),
				sprite: jest.fn(() => mockSprite),
				tween: jest.fn(),
			},
			scene: {
				isActive: jest.fn(() => true),
				key: 'test-scene',
			},
		};

		// Mock target entity
		mockTarget = {
			container: {
				x: 100,
				y: 200,
			},
			entityName: 'Enemy',
		};

		// Mock console.log to reduce test noise
		jest.spyOn(console, 'log').mockImplementation();

		display = new NeverquestEntityTextDisplay(mockScene);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('Constructor', () => {
		it('should initialize with correct default properties', () => {
			expect(display.scene).toBe(mockScene);
			expect(display.fontSize).toBe('12px');
			expect(display.fontFamily).toBe('"Press Start 2P"');
			expect(display.fontColor).toBe('white');
			expect(display.enemyDamageColor).toBe('yellow');
			expect(display.criticalDamageColor).toBe('red');
			expect(display.heallingColor).toBe('green');
			expect(display.fontVerticalMovement).toBe(5);
			expect(display.verticalMovementDuration).toBe(300);
			expect(display.letterSpacing).toBe(0);
		});
	});

	describe('displayDamage', () => {
		describe('Basic Display', () => {
			it('should display damage text at target position', () => {
				display.displayDamage(10, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					100,
					190, // y - 10
					'10',
					expect.objectContaining({
						fontSize: '12px',
						fontFamily: '"Press Start 2P"',
						color: 'white',
					})
				);
			});

			it('should set text origin to center bottom', () => {
				display.displayDamage(10, mockTarget);

				expect(mockText.setOrigin).toHaveBeenCalledWith(0.5, 1);
			});

			it('should set text depth to 3000', () => {
				display.displayDamage(10, mockTarget);

				expect(mockText.setDepth).toHaveBeenCalledWith(3000);
			});

			it('should set text scale to 0.4', () => {
				display.displayDamage(10, mockTarget);

				expect(mockText.setScale).toHaveBeenCalledWith(0.4);
			});

			it('should convert damage number to string', () => {
				display.displayDamage(123, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					'123',
					expect.any(Object)
				);
			});
		});

		describe('Color Handling', () => {
			it('should use yellow color for Player damage', () => {
				mockTarget.entityName = ENTITIES.Player;

				display.displayDamage(10, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					expect.any(String),
					expect.objectContaining({
						color: 'yellow',
					})
				);
			});

			it('should use green color for healing', () => {
				display.displayDamage(10, mockTarget, false, true);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					expect.any(String),
					expect.objectContaining({
						color: 'green',
					})
				);
			});

			it('should use white color for normal enemy damage', () => {
				mockTarget.entityName = 'Enemy';

				display.displayDamage(10, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					expect.any(String),
					expect.objectContaining({
						color: 'white',
					})
				);
			});

			it('should prioritize healing color over player damage color', () => {
				mockTarget.entityName = ENTITIES.Player;

				display.displayDamage(10, mockTarget, false, true);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					expect.any(String),
					expect.objectContaining({
						color: 'green',
					})
				);
			});
		});

		describe('Critical Hit Sprite', () => {
			it('should create critical sprite when isCritical is true', () => {
				display.displayDamage(10, mockTarget, true);

				expect(mockScene.add.sprite).toHaveBeenCalledWith(100, 190, 'critical_2x');
			});

			it('should not create critical sprite when isCritical is false', () => {
				display.displayDamage(10, mockTarget, false);

				expect(mockScene.add.sprite).not.toHaveBeenCalled();
			});

			it('should set critical sprite depth to 3000', () => {
				display.displayDamage(10, mockTarget, true);

				expect(mockSprite.setDepth).toHaveBeenCalledWith(3000);
			});

			it('should adjust critical sprite for small damage (< 3 digits)', () => {
				display.displayDamage(99, mockTarget, true);

				expect(mockSprite.setOrigin).toHaveBeenCalledWith(0.55, 0.65);
				expect(mockSprite.setScale).toHaveBeenCalledWith(0.7);
			});

			it('should adjust critical sprite for large damage (>= 3 digits)', () => {
				display.displayDamage(100, mockTarget, true);

				expect(mockSprite.setOrigin).toHaveBeenCalledWith(0.55, 0.57);
				expect(mockSprite.setScale).not.toHaveBeenCalled();
			});

			it('should handle critical healing', () => {
				display.displayDamage(10, mockTarget, true, true);

				expect(mockScene.add.sprite).toHaveBeenCalledWith(100, 190, 'critical_2x');
				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					expect.any(String),
					expect.objectContaining({
						color: 'green',
					})
				);
			});
		});

		describe('Animation Tween', () => {
			it('should create tween for text animation', () => {
				display.displayDamage(10, mockTarget);

				expect(mockScene.add.tween).toHaveBeenCalledWith(
					expect.objectContaining({
						targets: [mockText],
						y: 185, // 190 - 5
						alpha: 0,
						duration: 300,
					})
				);
			});

			it('should include critical sprite in tween targets', () => {
				display.displayDamage(10, mockTarget, true);

				expect(mockScene.add.tween).toHaveBeenCalledWith(
					expect.objectContaining({
						targets: [mockText, mockSprite],
					})
				);
			});

			it('should use custom vertical movement', () => {
				display.fontVerticalMovement = 10;
				display.displayDamage(10, mockTarget);

				expect(mockScene.add.tween).toHaveBeenCalledWith(
					expect.objectContaining({
						y: 180, // 190 - 10
					})
				);
			});

			it('should use custom duration', () => {
				display.verticalMovementDuration = 500;
				display.displayDamage(10, mockTarget);

				expect(mockScene.add.tween).toHaveBeenCalledWith(
					expect.objectContaining({
						duration: 500,
					})
				);
			});

			it('should destroy text on tween complete', () => {
				display.displayDamage(10, mockTarget);

				const tweenConfig = (mockScene.add.tween as jest.Mock).mock.calls[0][0];
				tweenConfig.onComplete({} as any);

				expect(mockText.destroy).toHaveBeenCalled();
			});

			it('should destroy critical sprite on tween complete', () => {
				display.displayDamage(10, mockTarget, true);

				const tweenConfig = (mockScene.add.tween as jest.Mock).mock.calls[0][0];
				tweenConfig.onComplete({} as any);

				expect(mockSprite.destroy).toHaveBeenCalled();
			});

			it('should not destroy undefined critical sprite', () => {
				display.displayDamage(10, mockTarget, false);

				const tweenConfig = (mockScene.add.tween as jest.Mock).mock.calls[0][0];

				expect(() => {
					tweenConfig.onComplete({} as any);
				}).not.toThrow();
			});
		});

		describe('Custom Styling', () => {
			it('should use custom font size', () => {
				display.fontSize = '16px';
				display.displayDamage(10, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					expect.any(String),
					expect.objectContaining({
						fontSize: '16px',
					})
				);
			});

			it('should use custom font family', () => {
				display.fontFamily = 'Arial';
				display.displayDamage(10, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					expect.any(String),
					expect.objectContaining({
						fontFamily: 'Arial',
					})
				);
			});

			it('should use custom letter spacing', () => {
				display.letterSpacing = 2;
				display.displayDamage(10, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					expect.any(String),
					expect.objectContaining({
						letterSpacing: 2,
					})
				);
			});

			it('should use custom colors', () => {
				display.enemyDamageColor = 'orange';
				mockTarget.entityName = ENTITIES.Player;
				display.displayDamage(10, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					expect.any(String),
					expect.objectContaining({
						color: 'orange',
					})
				);
			});
		});

		describe('Edge Cases', () => {
			it('should handle zero damage', () => {
				display.displayDamage(0, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					'0',
					expect.any(Object)
				);
			});

			it('should handle negative damage (healing)', () => {
				display.displayDamage(-10, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					'-10',
					expect.any(Object)
				);
			});

			it('should handle large damage numbers', () => {
				display.displayDamage(9999, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					'9999',
					expect.any(Object)
				);
			});

			it('should handle decimal damage', () => {
				display.displayDamage(10.5, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(
					expect.any(Number),
					expect.any(Number),
					'10.5',
					expect.any(Object)
				);
			});

			it('should handle target at origin', () => {
				mockTarget.container.x = 0;
				mockTarget.container.y = 0;

				display.displayDamage(10, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(0, -10, '10', expect.any(Object));
			});

			it('should handle negative target positions', () => {
				mockTarget.container.x = -100;
				mockTarget.container.y = -200;

				display.displayDamage(10, mockTarget);

				expect(mockScene.add.text).toHaveBeenCalledWith(-100, -210, '10', expect.any(Object));
			});

			it('should handle single digit damage with critical', () => {
				display.displayDamage(5, mockTarget, true);

				expect(mockSprite.setOrigin).toHaveBeenCalledWith(0.55, 0.65);
				expect(mockSprite.setScale).toHaveBeenCalledWith(0.7);
			});

			it('should handle exactly 3 digit damage with critical', () => {
				display.displayDamage(100, mockTarget, true);

				expect(mockSprite.setOrigin).toHaveBeenCalledWith(0.55, 0.57);
			});
		});

		describe('Logging', () => {
			it('should log damage display information', () => {
				const consoleSpy = jest.spyOn(console, 'log');
				display.displayDamage(10, mockTarget);

				expect(consoleSpy).toHaveBeenCalledWith(
					'[EntityTextDisplay] displayDamage called:',
					expect.objectContaining({
						damage: 10,
						targetX: 100,
						targetY: 200,
						isCritical: false,
						isHealing: false,
					})
				);
			});

			it('should log critical sprite creation', () => {
				const consoleSpy = jest.spyOn(console, 'log');
				display.displayDamage(10, mockTarget, true);

				expect(consoleSpy).toHaveBeenCalledWith(
					'[EntityTextDisplay] Critical sprite created:',
					expect.any(Object)
				);
			});

			it('should log damage text creation', () => {
				const consoleSpy = jest.spyOn(console, 'log');
				display.displayDamage(10, mockTarget);

				expect(consoleSpy).toHaveBeenCalledWith('[EntityTextDisplay] Damage text created:', expect.any(Object));
			});
		});
	});
});
