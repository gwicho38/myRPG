/**
 * Tests for LuminusMessageLog plugin
 */

import { LuminusMessageLog } from '../../../plugins/HUD/LuminusMessageLog';

describe('LuminusMessageLog', () => {
	let messageLog: LuminusMessageLog;
	let mockScene: any;
	let mockContainer: any;
	let mockBackground: any;
	let mockTitleText: any;
	let mockMessageTexts: any[];

	beforeEach(() => {
		// Mock message text objects
		mockMessageTexts = [];
		for (let i = 0; i < 5; i++) {
			mockMessageTexts.push({
				setText: jest.fn().mockReturnThis(),
				setColor: jest.fn().mockReturnThis(),
			});
		}

		// Mock title text
		mockTitleText = {
			setText: jest.fn(),
			setColor: jest.fn(),
		};

		// Mock container
		mockContainer = {
			setScrollFactor: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			add: jest.fn(),
			setPosition: jest.fn(),
			setVisible: jest.fn(),
			destroy: jest.fn(),
		};

		// Mock graphics (background)
		mockBackground = {
			fillStyle: jest.fn().mockReturnThis(),
			fillRoundedRect: jest.fn().mockReturnThis(),
			lineStyle: jest.fn().mockReturnThis(),
			strokeRoundedRect: jest.fn().mockReturnThis(),
		};

		// Mock scene
		let textCallCount = 0;
		mockScene = {
			add: {
				container: jest.fn().mockReturnValue(mockContainer),
				graphics: jest.fn().mockReturnValue(mockBackground),
				text: jest.fn(() => {
					// First call returns title text, subsequent calls return message texts
					if (textCallCount === 0) {
						textCallCount++;
						return mockTitleText;
					}
					return mockMessageTexts[textCallCount++ - 1];
				}),
			},
		};

		messageLog = new LuminusMessageLog(mockScene, 10, 20, 400, 150);
	});

	describe('Constructor', () => {
		it('should initialize with correct scene and dimensions', () => {
			expect(messageLog['scene']).toBe(mockScene);
			expect(messageLog['x']).toBe(10);
			expect(messageLog['y']).toBe(20);
			expect(messageLog['width']).toBe(400);
			expect(messageLog['height']).toBe(150);
		});

		it('should create container at specified position', () => {
			expect(mockScene.add.container).toHaveBeenCalledWith(10, 20);
		});

		it('should set container scroll factor to 0', () => {
			expect(mockContainer.setScrollFactor).toHaveBeenCalledWith(0);
		});

		it('should set container depth to 100', () => {
			expect(mockContainer.setDepth).toHaveBeenCalledWith(100);
		});

		it('should create semi-transparent black background', () => {
			expect(mockBackground.fillStyle).toHaveBeenCalledWith(0x000000, 0.7);
		});

		it('should create rounded rectangle background with correct dimensions', () => {
			expect(mockBackground.fillRoundedRect).toHaveBeenCalledWith(0, 0, 400, 150, 8);
		});

		it('should add border to background', () => {
			expect(mockBackground.lineStyle).toHaveBeenCalledWith(2, 0x444444, 1);
			expect(mockBackground.strokeRoundedRect).toHaveBeenCalledWith(0, 0, 400, 150, 8);
		});

		it('should create title text with correct content', () => {
			expect(mockScene.add.text).toHaveBeenCalledWith(
				10,
				10,
				'⚔️ Game Log',
				expect.objectContaining({
					fontSize: '14px',
					color: '#ffff00',
					fontStyle: 'bold',
				})
			);
		});

		it('should create 5 message text objects', () => {
			// 1 title + 5 messages = 6 total text calls
			expect(mockScene.add.text).toHaveBeenCalledTimes(6);
		});

		it('should position message texts correctly', () => {
			// Check first message position (after title)
			expect(mockScene.add.text).toHaveBeenCalledWith(
				10, // padding
				35, // padding + 25 + 0 * lineHeight
				'',
				expect.objectContaining({
					fontSize: '12px',
					color: '#ffffff',
				})
			);

			// Check second message position
			expect(mockScene.add.text).toHaveBeenCalledWith(
				10,
				55, // padding + 25 + 1 * 20
				'',
				expect.any(Object)
			);
		});

		it('should set word wrap for message texts', () => {
			const messageTextCalls = (mockScene.add.text as jest.Mock).mock.calls.slice(1); // Skip title
			messageTextCalls.forEach((call) => {
				expect(call[3]).toHaveProperty('wordWrap');
				expect(call[3].wordWrap).toEqual({ width: 380 }); // width - padding * 2
			});
		});

		it('should add all elements to container', () => {
			// Background + title + 5 messages = 7 elements
			expect(mockContainer.add).toHaveBeenCalledTimes(7);
		});

		it('should initialize with empty message history', () => {
			expect(messageLog['messageHistory']).toEqual([]);
		});

		it('should initialize with maxMessages of 5', () => {
			expect(messageLog['maxMessages']).toBe(5);
		});
	});

	describe('log()', () => {
		it('should add message to history', () => {
			messageLog.log('Test message');

			expect(messageLog['messageHistory']).toContain('Test message');
			expect(messageLog['messageHistory'].length).toBe(1);
		});

		it('should display single message in first text object', () => {
			messageLog.log('Hello World');

			expect(mockMessageTexts[0].setText).toHaveBeenCalledWith('Hello World');
		});

		it('should display multiple messages in order', () => {
			messageLog.log('Message 1');
			messageLog.log('Message 2');
			messageLog.log('Message 3');

			expect(mockMessageTexts[0].setText).toHaveBeenLastCalledWith('Message 1');
			expect(mockMessageTexts[1].setText).toHaveBeenLastCalledWith('Message 2');
			expect(mockMessageTexts[2].setText).toHaveBeenLastCalledWith('Message 3');
		});

		it('should show only last 5 messages when more than 5 exist', () => {
			for (let i = 1; i <= 7; i++) {
				messageLog.log(`Message ${i}`);
			}

			// Should show messages 3-7
			expect(mockMessageTexts[0].setText).toHaveBeenLastCalledWith('Message 3');
			expect(mockMessageTexts[1].setText).toHaveBeenLastCalledWith('Message 4');
			expect(mockMessageTexts[2].setText).toHaveBeenLastCalledWith('Message 5');
			expect(mockMessageTexts[3].setText).toHaveBeenLastCalledWith('Message 6');
			expect(mockMessageTexts[4].setText).toHaveBeenLastCalledWith('Message 7');
		});

		it('should limit message history to 100 messages', () => {
			for (let i = 1; i <= 150; i++) {
				messageLog.log(`Message ${i}`);
			}

			expect(messageLog['messageHistory'].length).toBe(100);
			// Should have messages 51-150
			expect(messageLog['messageHistory'][0]).toBe('Message 51');
			expect(messageLog['messageHistory'][99]).toBe('Message 150');
		});

		it('should clear unused message text objects', () => {
			messageLog.log('Only one message');

			expect(mockMessageTexts[0].setText).toHaveBeenCalledWith('Only one message');
			expect(mockMessageTexts[1].setText).toHaveBeenCalledWith('');
			expect(mockMessageTexts[2].setText).toHaveBeenCalledWith('');
			expect(mockMessageTexts[3].setText).toHaveBeenCalledWith('');
			expect(mockMessageTexts[4].setText).toHaveBeenCalledWith('');
		});

		it('should apply color based on message content - defeated', () => {
			messageLog.log('Enemy defeated!');

			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#00ff00');
		});

		it('should apply color based on message content - victory', () => {
			messageLog.log('victory achieved!');

			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#00ff00');
		});

		it('should apply color based on message content - damage', () => {
			messageLog.log('Player takes 10 damage');

			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#ff4444');
		});

		it('should apply color based on message content - attack', () => {
			messageLog.log('Enemy attack hits');

			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#ff4444');
		});

		it('should apply color based on message content - heal', () => {
			messageLog.log('Player healed for 20 HP');

			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#44ff44');
		});

		it('should apply color based on message content - restored', () => {
			messageLog.log('Health restored');

			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#44ff44');
		});

		it('should apply color based on message content - level up', () => {
			messageLog.log('Player level up!');

			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#ffff00');
		});

		it('should apply color based on message content - XP', () => {
			messageLog.log('Gained 50 XP');

			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#ffff00');
		});

		it('should use white color for general messages', () => {
			messageLog.log('You found a key');

			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#ffffff');
		});

		it('should handle empty string messages', () => {
			messageLog.log('');

			expect(messageLog['messageHistory']).toContain('');
			expect(mockMessageTexts[0].setText).toHaveBeenCalledWith('');
		});

		it('should handle very long messages', () => {
			const longMessage = 'A'.repeat(500);
			messageLog.log(longMessage);

			expect(messageLog['messageHistory']).toContain(longMessage);
			expect(mockMessageTexts[0].setText).toHaveBeenCalledWith(longMessage);
		});
	});

	describe('clear()', () => {
		it('should clear all message history', () => {
			messageLog.log('Message 1');
			messageLog.log('Message 2');
			messageLog.log('Message 3');

			messageLog.clear();

			expect(messageLog['messageHistory']).toEqual([]);
		});

		it('should clear all displayed message texts', () => {
			messageLog.log('Message 1');
			messageLog.log('Message 2');

			messageLog.clear();

			mockMessageTexts.forEach((mockText) => {
				expect(mockText.setText).toHaveBeenLastCalledWith('');
			});
		});

		it('should allow logging new messages after clear', () => {
			messageLog.log('Message 1');
			messageLog.clear();
			messageLog.log('New message');

			expect(messageLog['messageHistory']).toEqual(['New message']);
			expect(mockMessageTexts[0].setText).toHaveBeenLastCalledWith('New message');
		});
	});

	describe('setPosition()', () => {
		it('should update container position', () => {
			messageLog.setPosition(100, 200);

			expect(mockContainer.setPosition).toHaveBeenCalledWith(100, 200);
		});

		it('should handle negative positions', () => {
			messageLog.setPosition(-50, -30);

			expect(mockContainer.setPosition).toHaveBeenCalledWith(-50, -30);
		});

		it('should handle zero positions', () => {
			messageLog.setPosition(0, 0);

			expect(mockContainer.setPosition).toHaveBeenCalledWith(0, 0);
		});
	});

	describe('setVisible()', () => {
		it('should show container when set to true', () => {
			messageLog.setVisible(true);

			expect(mockContainer.setVisible).toHaveBeenCalledWith(true);
		});

		it('should hide container when set to false', () => {
			messageLog.setVisible(false);

			expect(mockContainer.setVisible).toHaveBeenCalledWith(false);
		});

		it('should toggle visibility multiple times', () => {
			messageLog.setVisible(true);
			messageLog.setVisible(false);
			messageLog.setVisible(true);

			expect(mockContainer.setVisible).toHaveBeenCalledTimes(3);
			expect(mockContainer.setVisible).toHaveBeenLastCalledWith(true);
		});
	});

	describe('destroy()', () => {
		it('should destroy the container', () => {
			messageLog.destroy();

			expect(mockContainer.destroy).toHaveBeenCalled();
		});

		it('should only call destroy once on container', () => {
			messageLog.destroy();

			expect(mockContainer.destroy).toHaveBeenCalledTimes(1);
		});
	});

	describe('Color Priority', () => {
		it('should prioritize defeated over other keywords', () => {
			messageLog.log('Enemy defeated after taking damage');

			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#00ff00');
		});

		it('should prioritize damage over heal when both present', () => {
			messageLog.log('Take damage, need to heal');

			// getMessageColor checks damage before heal, so damage color wins
			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#ff4444');
		});

		it('should handle case-sensitive keywords', () => {
			messageLog.log('DEFEATED'); // uppercase

			// Should not match (lowercase check in implementation)
			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#ffffff');
		});
	});

	describe('Integration', () => {
		it('should handle complete game flow scenario', () => {
			messageLog.log('Combat started');
			messageLog.log('Player attack hits');
			messageLog.log('Enemy takes 15 damage');
			messageLog.log('Enemy defeated!');
			messageLog.log('Gained 50 XP');

			// Should show all 5 messages
			expect(mockMessageTexts[0].setText).toHaveBeenLastCalledWith('Combat started');
			expect(mockMessageTexts[1].setText).toHaveBeenLastCalledWith('Player attack hits');
			expect(mockMessageTexts[2].setText).toHaveBeenLastCalledWith('Enemy takes 15 damage');
			expect(mockMessageTexts[3].setText).toHaveBeenLastCalledWith('Enemy defeated!');
			expect(mockMessageTexts[4].setText).toHaveBeenLastCalledWith('Gained 50 XP');

			// Check colors
			expect(mockMessageTexts[0].setColor).toHaveBeenLastCalledWith('#ffffff');
			expect(mockMessageTexts[1].setColor).toHaveBeenLastCalledWith('#ff4444');
			expect(mockMessageTexts[2].setColor).toHaveBeenLastCalledWith('#ff4444');
			expect(mockMessageTexts[3].setColor).toHaveBeenLastCalledWith('#00ff00');
			expect(mockMessageTexts[4].setColor).toHaveBeenLastCalledWith('#ffff00');
		});

		it('should maintain state across multiple operations', () => {
			messageLog.log('Message 1');
			messageLog.setPosition(50, 50);
			messageLog.log('Message 2');
			messageLog.setVisible(false);
			messageLog.log('Message 3');
			messageLog.clear();
			messageLog.log('Message 4');

			expect(messageLog['messageHistory']).toEqual(['Message 4']);
			expect(mockContainer.setPosition).toHaveBeenCalledWith(50, 50);
			expect(mockContainer.setVisible).toHaveBeenCalledWith(false);
		});
	});

	describe('Edge Cases', () => {
		it('should handle special characters in messages', () => {
			messageLog.log('⚔️💥🛡️ Special characters!');

			expect(mockMessageTexts[0].setText).toHaveBeenCalledWith('⚔️💥🛡️ Special characters!');
		});

		it('should handle messages with line breaks', () => {
			messageLog.log('Line 1\nLine 2');

			expect(mockMessageTexts[0].setText).toHaveBeenCalledWith('Line 1\nLine 2');
		});

		it('should handle rapid consecutive logs', () => {
			for (let i = 0; i < 20; i++) {
				messageLog.log(`Rapid message ${i}`);
			}

			expect(messageLog['messageHistory'].length).toBe(20);
			// Should display last 5
			expect(mockMessageTexts[4].setText).toHaveBeenLastCalledWith('Rapid message 19');
		});

		it('should handle messages with multiple color keywords', () => {
			messageLog.log('defeated damage heal level up XP');

			// Should use first matching color (defeated = green)
			expect(mockMessageTexts[0].setColor).toHaveBeenCalledWith('#00ff00');
		});

		it('should handle exactly 100 messages in history', () => {
			for (let i = 1; i <= 100; i++) {
				messageLog.log(`Message ${i}`);
			}

			expect(messageLog['messageHistory'].length).toBe(100);
			expect(messageLog['messageHistory'][0]).toBe('Message 1');
			expect(messageLog['messageHistory'][99]).toBe('Message 100');
		});

		it('should handle 101 messages (triggers history limit)', () => {
			for (let i = 1; i <= 101; i++) {
				messageLog.log(`Message ${i}`);
			}

			expect(messageLog['messageHistory'].length).toBe(100);
			expect(messageLog['messageHistory'][0]).toBe('Message 2');
			expect(messageLog['messageHistory'][99]).toBe('Message 101');
		});
	});
});
