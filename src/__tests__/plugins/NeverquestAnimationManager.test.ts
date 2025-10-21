/**
 * Test for NeverquestAnimationManager
 * Ensures animation keys are properly concatenated without double-dashes
 */

import { NeverquestAnimationManager } from '../../plugins/NeverquestAnimationManager';

describe('NeverquestAnimationManager', () => {
	let mockEntity: any;
	let animationManager: NeverquestAnimationManager;

	beforeEach(() => {
		// Create a mock entity with Phaser-like structure
		mockEntity = {
			texture: { key: 'character' },
			anims: {
				play: jest.fn(),
				currentAnim: null,
				animationManager: {
					exists: jest.fn().mockReturnValue(true),
				},
			},
			flipX: false,
		};

		animationManager = new NeverquestAnimationManager(mockEntity);
	});

	describe('animation key formatting', () => {
		it('should create animation keys without double-dashes in animateWithAngle', () => {
			const animation = 'walk';

			// Test right direction (angle between -0.66 and 0.66)
			animationManager.animateWithAngle(animation, 0);

			// Should call play with 'walk-right' not 'walk--right'
			expect(mockEntity.anims.play).toHaveBeenCalledWith('walk-right', true);

			const callArgs = mockEntity.anims.play.mock.calls[0][0];
			expect(callArgs).toBe('walk-right');
			expect(callArgs.includes('--')).toBe(false);
		});

		it('should handle up direction without double-dashes', () => {
			animationManager.animateWithAngle('walk', -1.5); // Up direction

			const callArgs = mockEntity.anims.play.mock.calls[0][0];
			expect(callArgs).toBe('walk-up');
			expect(callArgs.includes('--')).toBe(false);
		});

		it('should handle down direction without double-dashes', () => {
			animationManager.animateWithAngle('walk', 1.5); // Down direction

			const callArgs = mockEntity.anims.play.mock.calls[0][0];
			expect(callArgs).toBe('walk-down');
			expect(callArgs.includes('--')).toBe(false);
		});

		it('should handle left direction without double-dashes', () => {
			animationManager.animateWithAngle('walk', Math.PI); // Left direction

			const callArgs = mockEntity.anims.play.mock.calls[0][0];
			expect(callArgs).toBe('walk-left');
			expect(callArgs.includes('--')).toBe(false);
		});
	});

	describe('setLeftAnimation', () => {
		it('should create correct animation key without double-dashes', () => {
			animationManager.setLeftAnimation();

			const callArgs = mockEntity.anims.play.mock.calls[0][0];
			expect(callArgs).toBe('character-walk-left');
			expect(callArgs.includes('--')).toBe(false);
		});

		it('should fallback to right animation with flip when left does not exist', () => {
			mockEntity.anims.animationManager.exists.mockImplementation((key: string) => {
				return key.includes('right');
			});

			animationManager.setLeftAnimation();

			expect(mockEntity.anims.play).toHaveBeenCalledWith('character-walk-right', true);
			expect(mockEntity.flipX).toBe(true);
		});

		it('should reset flipX when playing left animation directly', () => {
			mockEntity.flipX = true;
			animationManager.setLeftAnimation();

			expect(mockEntity.flipX).toBe(false);
		});
	});

	describe('setRightAnimation', () => {
		it('should create correct animation key without double-dashes', () => {
			animationManager.setRightAnimation();

			const callArgs = mockEntity.anims.play.mock.calls[0][0];
			expect(callArgs).toBe('character-walk-right');
			expect(callArgs.includes('--')).toBe(false);
		});

		it('should reset flipX to false', () => {
			mockEntity.flipX = true;
			animationManager.setRightAnimation();

			expect(mockEntity.flipX).toBe(false);
		});
	});

	describe('setUpAnimation', () => {
		it('should create correct animation key without double-dashes', () => {
			animationManager.setUpAnimation();

			const callArgs = mockEntity.anims.play.mock.calls[0][0];
			expect(callArgs).toBe('character-walk-up');
			expect(callArgs.includes('--')).toBe(false);
		});
	});

	describe('setDownAnimation', () => {
		it('should create correct animation key without double-dashes', () => {
			animationManager.setDownAnimation();

			const callArgs = mockEntity.anims.play.mock.calls[0][0];
			expect(callArgs).toBe('character-walk-down');
			expect(callArgs.includes('--')).toBe(false);
		});
	});

	describe('setIdleAnimation', () => {
		it('should convert walk animation to idle while maintaining direction', () => {
			mockEntity.anims.currentAnim = { key: 'character-walk-right' };
			animationManager.setIdleAnimation();

			const callArgs = mockEntity.anims.play.mock.calls[0][0];
			expect(callArgs).toBe('character-idle-right');
			expect(callArgs.includes('--')).toBe(false);
		});

		it('should not change to idle if already idle', () => {
			mockEntity.anims.currentAnim = { key: 'character-idle-down' };
			animationManager.setIdleAnimation();

			expect(mockEntity.anims.play).not.toHaveBeenCalled();
		});

		it('should not change animation if entity is attacking', () => {
			const mockPlayer: any = {
				...mockEntity,
				isAtacking: true,
			};
			const playerAnimManager = new NeverquestAnimationManager(mockPlayer);
			mockPlayer.anims.currentAnim = { key: 'character-walk-right' };

			playerAnimManager.setIdleAnimation();

			expect(mockPlayer.anims.play).not.toHaveBeenCalled();
		});
	});

	describe('animate', () => {
		it('should play the given animation', () => {
			animationManager.animate('character-walk-left');

			expect(mockEntity.anims.play).toHaveBeenCalledWith('character-walk-left', true);
			expect(animationManager.lastAnimation).toBe('character-walk-left');
		});

		it('should not crash if anims is null', () => {
			mockEntity.anims = null;
			expect(() => animationManager.animate('test')).not.toThrow();
		});
	});

	describe('isMoving', () => {
		it('should detect movement from container body velocity', () => {
			const mockPlayerWithContainer: any = {
				texture: { key: 'character' },
				anims: mockEntity.anims,
				container: {
					body: {
						velocity: { x: 100, y: 0 },
					},
				},
			};

			const manager = new NeverquestAnimationManager(mockPlayerWithContainer);
			expect(manager.isMoving()).toBe(true);
		});

		it('should detect no movement when velocity is zero', () => {
			const mockPlayerWithContainer: any = {
				texture: { key: 'character' },
				anims: mockEntity.anims,
				container: {
					body: {
						velocity: { x: 0, y: 0 },
					},
				},
			};

			const manager = new NeverquestAnimationManager(mockPlayerWithContainer);
			expect(manager.isMoving()).toBe(false);
		});

		it('should detect movement from entity body velocity', () => {
			mockEntity.body = {
				velocity: { x: 0, y: 50 },
			};

			expect(animationManager.isMoving()).toBe(true);
		});

		it('should return false when no body exists', () => {
			expect(animationManager.isMoving()).toBe(false);
		});
	});
});
