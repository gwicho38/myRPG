import { Animations } from '../../consts/Animations';

describe('Animations', () => {
	it('should export an array of animation configurations', () => {
		expect(Array.isArray(Animations)).toBe(true);
		expect(Animations.length).toBeGreaterThan(0);
	});

	it('should include chat bubble animation configuration', () => {
		const chatBubbleAnim = Animations.find((anim) => anim.key === 'chat_bubble_animation');

		expect(chatBubbleAnim).toBeDefined();
		expect(chatBubbleAnim?.atlas).toBe('chat_bubble_animation');
		expect(chatBubbleAnim?.frameRate).toBe(3);
		expect(chatBubbleAnim?.repeat).toBe(-1);
	});

	it('should include player animations', () => {
		const playerAnims = Animations.filter((anim) => anim.key?.includes('character'));
		expect(playerAnims.length).toBeGreaterThan(0);
	});

	it('should include bat animations', () => {
		const batAnims = Animations.filter((anim) => anim.key?.includes('bat'));
		expect(batAnims.length).toBeGreaterThan(0);
	});

	it('should include rat animations', () => {
		const ratAnims = Animations.filter((anim) => anim.key?.includes('rat'));
		expect(ratAnims.length).toBeGreaterThan(0);
	});

	it('should include ogre animations', () => {
		const ogreAnims = Animations.filter((anim) => anim.key?.includes('ogre'));
		expect(ogreAnims.length).toBeGreaterThan(0);
	});

	it('should have valid animation configuration structure', () => {
		Animations.forEach((anim) => {
			expect(anim).toHaveProperty('key');
			if (anim.atlas) {
				expect(typeof anim.atlas).toBe('string');
			}
			if (anim.frameRate !== undefined) {
				expect(typeof anim.frameRate).toBe('number');
			}
		});
	});
});
