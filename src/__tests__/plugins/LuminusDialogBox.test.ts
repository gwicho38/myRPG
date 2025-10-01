import { LuminusDialogBox } from '../../plugins/LuminusDialogBox';

describe('LuminusDialogBox', () => {
	let dialogBox: any;
	let mockScene: any;
	let mockPlayer: any;
	let mockDialogText: any;

	beforeEach(() => {
		mockDialogText = {
			setText: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setWordWrapWidth: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			setPosition: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		mockScene = {
			add: {
				text: jest.fn().mockReturnValue(mockDialogText),
				image: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					setScale: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				nineslice: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
			},
			input: {
				keyboard: {
					on: jest.fn(),
					off: jest.fn(),
					removeListener: jest.fn(),
				},
			},
			cameras: {
				main: {
					midPoint: { x: 400, y: 300 },
					height: 600,
					width: 800,
				},
			},
			tweens: {
				add: jest.fn(),
			},
		};

		mockPlayer = {
			container: {
				body: {
					maxSpeed: 200,
				},
			},
			speed: 200,
			canMove: true,
			canAtack: true,
			canBlock: true,
			active: true,
		};

		dialogBox = new LuminusDialogBox(mockScene, mockPlayer);
	});

	describe('constructor', () => {
		it('should initialize with default values', () => {
			expect(dialogBox.scene).toBe(mockScene);
			expect(dialogBox.fontFamily).toBe('"Press Start 2P"');
			expect(dialogBox.currentText).toBe('');
			expect(dialogBox.currentCharacterIndex).toBe(0);
			expect(dialogBox.dialogBoxOpened).toBe(false);
			expect(dialogBox.dialogBoxOpenedAndWaitingInteraction).toBe(false);
			expect(dialogBox.isTypingText).toBe(false);
		});
	});

	describe('openDialogModal', () => {
		it('should open dialog modal with text', () => {
			const callback = jest.fn();
			dialogBox.openDialogModal('Test message', callback);

			expect(dialogBox.dialogBoxOpened).toBe(true);
			expect(dialogBox.currentText).toBe('Test message');
			expect(mockScene.add.nineslice).toHaveBeenCalled();
			expect(mockScene.add.text).toHaveBeenCalled();
		});

		it('should start typing animation', () => {
			jest.useFakeTimers();
			dialogBox.openDialogModal('Hello', jest.fn());

			expect(dialogBox.isTypingText).toBe(true);
			expect(dialogBox.currentCharacterIndex).toBe(0);

			jest.advanceTimersByTime(100);
			expect(mockDialogText.setText).toHaveBeenCalled();

			jest.useRealTimers();
		});

		it('should handle dialog already open', () => {
			dialogBox.dialogBoxOpened = true;
			dialogBox.openDialogModal('Test', jest.fn());
			// Should handle gracefully without errors
			expect(dialogBox.currentText).toBe('Test');
		});
	});

	describe('closeDialogModal', () => {
		beforeEach(() => {
			dialogBox.openDialogModal('Test', jest.fn());
		});

		it('should close dialog and clean up', () => {
			dialogBox.closeDialogModal();

			expect(dialogBox.dialogBoxOpened).toBe(false);
			expect(dialogBox.currentText).toBe('');
			expect(dialogBox.currentCharacterIndex).toBe(0);
			expect(dialogBox.isTypingText).toBe(false);
		});

		it('should destroy dialog elements', () => {
			const background = dialogBox.dialogBoxModalBackground;
			const text = dialogBox.dialogText;
			const interaction = dialogBox.interactionIcon;

			dialogBox.closeDialogModal();

			expect(background.destroy).toHaveBeenCalled();
			expect(text.destroy).toHaveBeenCalled();
			expect(interaction.destroy).toHaveBeenCalled();
		});

		it('should execute callback if provided', () => {
			const callback = jest.fn();
			dialogBox.callback = callback;
			dialogBox.closeDialogModal();

			expect(callback).toHaveBeenCalled();
			expect(dialogBox.callback).toBe(null);
		});

		it('should handle closing when not open', () => {
			dialogBox.dialogBoxOpened = false;
			expect(() => dialogBox.closeDialogModal()).not.toThrow();
		});
	});

	describe('text typing animation', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('should type text character by character', () => {
			const text = 'Hello';
			dialogBox.openDialogModal(text, jest.fn());

			for (let i = 1; i <= text.length; i++) {
				jest.advanceTimersByTime(50);
				expect(mockDialogText.setText).toHaveBeenCalledWith(text.substring(0, i));
			}

			expect(dialogBox.isTypingText).toBe(false);
			expect(dialogBox.dialogBoxOpenedAndWaitingInteraction).toBe(true);
		});

		it('should handle empty text', () => {
			dialogBox.openDialogModal('', jest.fn());
			jest.advanceTimersByTime(100);
			expect(dialogBox.isTypingText).toBe(false);
		});

		it('should stop typing when dialog is closed', () => {
			dialogBox.openDialogModal('Long text message', jest.fn());
			jest.advanceTimersByTime(50);

			dialogBox.closeDialogModal();

			jest.advanceTimersByTime(200);
			// Should not continue typing after close
			expect(dialogBox.currentCharacterIndex).toBe(0);
		});
	});

	describe('keyboard interaction', () => {
		let keyboardCallback: any;

		beforeEach(() => {
			dialogBox.openDialogModal('Test message', jest.fn());
			keyboardCallback = mockScene.input.keyboard.on.mock.calls[0][1];
		});

		it('should skip typing animation on keypress', () => {
			dialogBox.isTypingText = true;
			keyboardCallback({ keyCode: 32 }); // Space

			expect(dialogBox.isTypingText).toBe(false);
			expect(dialogBox.currentCharacterIndex).toBe(dialogBox.currentText.length);
			expect(mockDialogText.setText).toHaveBeenCalledWith('Test message');
		});

		it('should close dialog on keypress when typing complete', () => {
			dialogBox.isTypingText = false;
			dialogBox.dialogBoxOpenedAndWaitingInteraction = true;

			keyboardCallback({ keyCode: 13 }); // Enter

			expect(dialogBox.dialogBoxOpened).toBe(false);
		});

		it('should ignore keypress when dialog not open', () => {
			dialogBox.dialogBoxOpened = false;
			keyboardCallback({ keyCode: 32 });
			// Should not throw error
			expect(dialogBox.dialogBoxOpened).toBe(false);
		});
	});

	describe('interaction icon', () => {
		beforeEach(() => {
			dialogBox.openDialogModal('Test', jest.fn());
		});

		it('should create interaction icon', () => {
			expect(mockScene.add.image).toHaveBeenCalledWith(
				expect.any(Number),
				expect.any(Number),
				'dialog_interaction'
			);
		});

		it('should animate interaction icon', () => {
			expect(mockScene.tweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					targets: dialogBox.interactionIcon,
					loop: -1,
					yoyo: true,
				})
			);
		});

		it('should position interaction icon correctly', () => {
			const icon = dialogBox.interactionIcon;
			expect(icon.setPosition).toHaveBeenCalled();
			expect(icon.setDepth).toHaveBeenCalledWith(99999);
		});
	});

	describe('modal positioning', () => {
		it('should position dialog at bottom of screen', () => {
			dialogBox.openDialogModal('Test', jest.fn());

			const expectedY = mockScene.cameras.main.height - 80;
			expect(dialogBox.dialogBoxModalBackground.setPosition).toHaveBeenCalledWith(
				mockScene.cameras.main.midPoint.x,
				expectedY
			);
		});

		it('should set correct text wrap width', () => {
			dialogBox.openDialogModal('Test', jest.fn());
			expect(mockDialogText.setWordWrapWidth).toHaveBeenCalledWith(452);
		});
	});

	describe('null safety', () => {
		it('should not crash when setText is called before textMessage is created', () => {
			// Create a new dialog box without opening the modal
			const newDialogBox = new LuminusDialogBox(mockScene, mockPlayer);

			// Ensure textMessage is null
			if (newDialogBox.dialog) {
				newDialogBox.dialog.textMessage = null;
			}

			// This should not throw an error
			expect(() => newDialogBox.setText('Test text', false)).not.toThrow();
		});

		it('should not crash when animateText is called before textMessage is created', () => {
			// Create a new dialog box
			const newDialogBox = new LuminusDialogBox(mockScene, mockPlayer);

			// Set up animation state
			newDialogBox.animationText = ['T', 'e', 's', 't'];
			newDialogBox.eventCounter = 0;

			// Ensure textMessage is null
			if (newDialogBox.dialog) {
				newDialogBox.dialog.textMessage = null;
			}

			// This should not throw an error
			expect(() => newDialogBox.animateText()).not.toThrow();
		});
	});
});
