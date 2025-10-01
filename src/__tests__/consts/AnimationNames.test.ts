/**
 * Test for AnimationNames class
 * Ensures animation suffix values don't have leading dashes to prevent double-dash bug
 */

import { AnimationNames } from '../../consts/AnimationNames';

describe('AnimationNames', () => {
	let animationNames: AnimationNames;

	beforeEach(() => {
		animationNames = new AnimationNames();
	});

	describe('constructor initialization', () => {
		it('should initialize walk animation names correctly', () => {
			expect(animationNames.walkUpAnimationName).toBe('walk-up');
			expect(animationNames.walkRightAnimationName).toBe('walk-right');
			expect(animationNames.walkDownAnimationName).toBe('walk-down');
			expect(animationNames.walkLeftAnimationName).toBe('walk-left');
		});

		it('should initialize prefix animations correctly', () => {
			expect(animationNames.walkPrefixAnimation).toBe('walk');
			expect(animationNames.atkPrefixAnimation).toBe('atk');
			expect(animationNames.idlePrefixAnimation).toBe('idle');
		});

		it('should initialize suffix values WITHOUT leading dashes', () => {
			// This is critical to prevent double-dash animation keys
			// e.g., "character-walk-left" not "character-walk--left"
			expect(animationNames.upAnimationSufix).toBe('up');
			expect(animationNames.downAnimationSufix).toBe('down');
			expect(animationNames.rightAnimationSufix).toBe('right');
			expect(animationNames.leftAnimationSufix).toBe('left');
		});

		it('should not have leading dashes in any suffix', () => {
			// Verify none of the suffixes start with a dash
			expect(animationNames.upAnimationSufix.startsWith('-')).toBe(false);
			expect(animationNames.downAnimationSufix.startsWith('-')).toBe(false);
			expect(animationNames.rightAnimationSufix.startsWith('-')).toBe(false);
			expect(animationNames.leftAnimationSufix.startsWith('-')).toBe(false);
		});
	});

	describe('animation key formatting', () => {
		it('should allow proper concatenation with prefix and suffix', () => {
			// Simulate how LuminusAnimationManager builds animation keys
			const texture = 'character';
			const prefix = animationNames.walkPrefixAnimation;
			const suffix = animationNames.rightAnimationSufix;

			// Should produce "character-walk-right" with single dashes
			const animationKey = `${texture}-${prefix}-${suffix}`;
			expect(animationKey).toBe('character-walk-right');

			// Should NOT have double dashes
			expect(animationKey.includes('--')).toBe(false);
		});

		it('should create correct keys for all directions', () => {
			const texture = 'character';
			const prefix = animationNames.walkPrefixAnimation;

			const upKey = `${texture}-${prefix}-${animationNames.upAnimationSufix}`;
			const downKey = `${texture}-${prefix}-${animationNames.downAnimationSufix}`;
			const leftKey = `${texture}-${prefix}-${animationNames.leftAnimationSufix}`;
			const rightKey = `${texture}-${prefix}-${animationNames.rightAnimationSufix}`;

			expect(upKey).toBe('character-walk-up');
			expect(downKey).toBe('character-walk-down');
			expect(leftKey).toBe('character-walk-left');
			expect(rightKey).toBe('character-walk-right');

			// Verify no double dashes in any key
			expect(upKey.includes('--')).toBe(false);
			expect(downKey.includes('--')).toBe(false);
			expect(leftKey.includes('--')).toBe(false);
			expect(rightKey.includes('--')).toBe(false);
		});

		it('should work with attack animations', () => {
			const texture = 'character';
			const prefix = animationNames.atkPrefixAnimation;

			const rightKey = `${texture}-${prefix}-${animationNames.rightAnimationSufix}`;
			expect(rightKey).toBe('character-atk-right');
			expect(rightKey.includes('--')).toBe(false);
		});

		it('should work with idle animations', () => {
			const texture = 'character';
			const prefix = animationNames.idlePrefixAnimation;

			const downKey = `${texture}-${prefix}-${animationNames.downAnimationSufix}`;
			expect(downKey).toBe('character-idle-down');
			expect(downKey.includes('--')).toBe(false);
		});
	});
});
