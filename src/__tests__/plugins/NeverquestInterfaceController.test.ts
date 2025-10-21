import { NeverquestInterfaceController } from '../../plugins/NeverquestInterfaceController';

describe('NeverquestInterfaceController', () => {
	let controller: any;
	let mockScene: any;
	let mockElement: any;

	beforeEach(() => {
		mockScene = {
			input: {
				keyboard: {
					on: jest.fn(),
				},
				gamepad: {
					pad1: {
						id: 'mock-gamepad',
						index: 0,
						buttons: [],
						axes: [],
						connected: true,
						on: jest.fn(),
						off: jest.fn(),
					},
					on: jest.fn(),
					off: jest.fn(),
				},
			},
			add: {
				image: jest.fn().mockReturnValue({
					destroy: jest.fn(),
					setOrigin: jest.fn(),
					setScale: jest.fn(),
					setPosition: jest.fn(),
				}),
			},
			plugins: {
				get: jest.fn(() => ({
					add: jest.fn(),
				})),
			},
			events: {
				on: jest.fn(),
				off: jest.fn(),
				emit: jest.fn(),
				once: jest.fn(),
			},
		};

		mockElement = {
			x: 100,
			y: 100,
			width: 50,
			height: 50,
		};

		controller = new NeverquestInterfaceController(mockScene);
	});

	describe('constructor', () => {
		it('should initialize with default values', () => {
			expect(controller.scene).toBe(mockScene);
			expect(controller.interfaceElements).toEqual([]);
			expect(controller.currentElementAction).toBe(null);
			expect(controller.closeAction).toBe(null);
			expect(controller.menuHistory).toEqual([]);
			expect(controller.currentLinePosition).toBe(0);
			expect(controller.currentMatrixRow).toBe(0);
			expect(controller.currentMatrixCol).toBe(0);
		});

		it('should set up keyboard listener', () => {
			expect(mockScene.input.keyboard.on).toHaveBeenCalledWith('keydown', expect.any(Function));
		});
	});

	describe('navigation', () => {
		beforeEach(() => {
			// Set up a 2x2 grid of elements
			controller.interfaceElements = [
				[[{ element: mockElement, action: 'action1' }], [{ element: mockElement, action: 'action2' }]],
				[[{ element: mockElement, action: 'action3' }], [{ element: mockElement, action: 'action4' }]],
			];
			controller.currentElementAction = { element: mockElement, action: 'action1', context: null, args: null };
			mockScene.sound = { play: jest.fn() };
		});

		describe('moveUp', () => {
			it('should move up when not at top', () => {
				controller.currentLinePosition = 0;
				controller.currentMatrixRow = 1;
				controller.moveUp();
				expect(controller.currentMatrixRow).toBe(0);
			});

			it('should not move up when at top', () => {
				controller.currentLinePosition = 0;
				controller.currentMatrixRow = 0;
				controller.moveUp();
				expect(controller.currentMatrixRow).toBe(0);
			});

			it('should not move when no elements exist', () => {
				controller.interfaceElements = [];
				controller.currentLinePosition = 0;
				controller.moveUp();
				expect(controller.currentMatrixRow).toBe(0);
			});
		});

		describe('moveDown', () => {
			it('should move down when not at bottom', () => {
				controller.currentLinePosition = 0;
				controller.currentMatrixRow = 0;
				controller.moveDown();
				expect(controller.currentMatrixRow).toBe(1);
			});

			it('should not move down when at bottom', () => {
				controller.currentLinePosition = 0;
				controller.currentMatrixRow = 1;
				controller.moveDown();
				expect(controller.currentMatrixRow).toBe(1);
			});
		});

		describe('moveLeft', () => {
			it('should move left when not at leftmost', () => {
				controller.currentLinePosition = 0;
				controller.currentMatrixRow = 0;
				controller.currentMatrixCol = 0;
				controller.interfaceElements[0][0] = [
					{ element: mockElement, action: 'action1', context: null, args: null },
					{ element: mockElement, action: 'action2', context: null, args: null },
				];
				controller.currentMatrixCol = 1;
				controller.moveLeft();
				expect(controller.currentMatrixCol).toBe(0);
			});

			it('should not move left when at leftmost', () => {
				controller.currentLinePosition = 0;
				controller.currentMatrixRow = 0;
				controller.currentMatrixCol = 0;
				controller.moveLeft();
				expect(controller.currentMatrixCol).toBe(0);
			});
		});

		describe('moveRight', () => {
			it('should move right when not at rightmost', () => {
				controller.currentLinePosition = 0;
				controller.currentMatrixRow = 0;
				controller.currentMatrixCol = 0;
				controller.interfaceElements[0][0] = [
					{ element: mockElement, action: 'action1', context: null, args: null },
					{ element: mockElement, action: 'action2', context: null, args: null },
				];
				controller.moveRight();
				expect(controller.currentMatrixCol).toBe(1);
			});

			it('should not move right when at rightmost', () => {
				controller.currentLinePosition = 0;
				controller.currentMatrixRow = 0;
				controller.interfaceElements[0][0] = [
					{ element: mockElement, action: 'action1', context: null, args: null },
				];
				controller.currentMatrixCol = 0;
				controller.moveRight();
				expect(controller.currentMatrixCol).toBe(0);
			});
		});
	});

	describe('keyboard input handling', () => {
		let keyboardCallback: any;

		beforeEach(() => {
			keyboardCallback = mockScene.input.keyboard.on.mock.calls[0][1];
			controller.currentElementAction = {
				action: 'testAction',
				context: this,
				args: ['arg1'],
			};
			controller.executeFunctionByName = jest.fn();
		});

		it('should move left with arrow key (keyCode 37)', () => {
			controller.moveLeft = jest.fn();
			keyboardCallback({ keyCode: 37 });
			expect(controller.moveLeft).toHaveBeenCalled();
		});

		it('should move right with arrow key (keyCode 39)', () => {
			controller.moveRight = jest.fn();
			keyboardCallback({ keyCode: 39 });
			expect(controller.moveRight).toHaveBeenCalled();
		});

		it('should move up with arrow key (keyCode 38)', () => {
			controller.moveUp = jest.fn();
			keyboardCallback({ keyCode: 38 });
			expect(controller.moveUp).toHaveBeenCalled();
		});

		it('should move up with K key (keyCode 75) for menu navigation', () => {
			controller.moveUp = jest.fn();
			keyboardCallback({ keyCode: 75 });
			expect(controller.moveUp).toHaveBeenCalled();
		});

		it('should move down with arrow key (keyCode 40)', () => {
			controller.moveDown = jest.fn();
			keyboardCallback({ keyCode: 40 });
			expect(controller.moveDown).toHaveBeenCalled();
		});

		it('should move down with J key (keyCode 74) for menu navigation', () => {
			controller.moveDown = jest.fn();
			keyboardCallback({ keyCode: 74 });
			expect(controller.moveDown).toHaveBeenCalled();
		});

		it('should execute action with Enter key (keyCode 13)', () => {
			keyboardCallback({ keyCode: 13 });
			expect(controller.executeFunctionByName).toHaveBeenCalledWith(
				'testAction',
				controller.currentElementAction.context,
				['arg1']
			);
		});

		it('should execute action with E key (keyCode 69)', () => {
			keyboardCallback({ keyCode: 69 });
			expect(controller.executeFunctionByName).toHaveBeenCalledWith(
				'testAction',
				controller.currentElementAction.context,
				['arg1']
			);
		});

		it('should close with Escape key (keyCode 27)', () => {
			controller.close = jest.fn();
			keyboardCallback({ keyCode: 27 });
			expect(controller.close).toHaveBeenCalled();
		});

		it('should not execute action when no action exists', () => {
			controller.currentElementAction = null;
			keyboardCallback({ keyCode: 13 });
			expect(controller.executeFunctionByName).not.toHaveBeenCalled();
		});
	});

	describe('close', () => {
		beforeEach(() => {
			controller.outlineEffect = {
				outlinePostFxPlugin: {
					destroy: jest.fn(),
				},
			};
		});

		it('should execute close action when available', () => {
			controller.closeAction = {
				action: 'closeFunction',
				context: this,
				args: [],
			};
			controller.executeFunctionByName = jest.fn();

			controller.close();

			expect(controller.outlineEffect.outlinePostFxPlugin.destroy).toHaveBeenCalled();
			expect(controller.executeFunctionByName).toHaveBeenCalledWith(
				'closeFunction',
				controller.closeAction.context,
				[]
			);
		});

		it('should handle missing close action gracefully', () => {
			controller.closeAction = null;
			expect(() => controller.close()).not.toThrow();
			expect(controller.outlineEffect.outlinePostFxPlugin.destroy).toHaveBeenCalled();
		});

		it('should handle close action without action property', () => {
			controller.closeAction = {};
			expect(() => controller.close()).not.toThrow();
			expect(controller.outlineEffect.outlinePostFxPlugin.destroy).toHaveBeenCalled();
		});
	});

	describe('highlight management', () => {
		beforeEach(() => {
			mockScene.sys = {};
			controller.outlineEffect = {
				applyEffect: jest.fn(),
				removeEffect: jest.fn(),
			};
			controller.currentElementAction = { element: mockElement, action: 'test', context: null, args: null };
		});

		it('should update highlight position', () => {
			controller.updateHighlightedElement(mockElement);
			expect(controller.outlineEffect.applyEffect).toHaveBeenCalledWith(mockElement);
		});

		it('should create highlight if it does not exist', () => {
			controller.updateHighlightedElement(mockElement);
			expect(controller.outlineEffect.applyEffect).toHaveBeenCalledWith(mockElement);
		});

		it('should remove highlight when requested', () => {
			controller.removeCurrentSelectionHighlight();
			expect(controller.outlineEffect.removeEffect).toHaveBeenCalledWith(mockElement);
		});

		it('should handle removing non-existent highlight', () => {
			controller.currentElementAction = null;
			expect(() => controller.removeCurrentSelectionHighlight()).not.toThrow();
		});
	});

	describe('menu history', () => {
		beforeEach(() => {
			mockScene.sys = {};
			controller.outlineEffect = {
				removeEffect: jest.fn(),
				applyEffect: jest.fn(),
			};
		});

		it('should add to menu history', () => {
			controller.currentLinePosition = 1;
			controller.currentMatrixRow = 2;
			controller.currentMatrixCol = 3;
			controller.currentElementAction = { element: mockElement, action: 'test', context: null, args: null };
			controller.closeAction = { action: 'close' };

			controller.menuHistoryAdd();

			expect(controller.menuHistory).toHaveLength(1);
			expect(controller.menuHistory[0]).toEqual({
				currentLinePosition: 1,
				currentMatrixRow: 2,
				currentMatrixCol: 3,
				currentElementAction: { element: mockElement, action: 'test', context: null, args: null },
				closeAction: { action: 'close' },
			});
		});

		it('should retrieve from menu history', () => {
			const menuState: any = {
				currentLinePosition: 1,
				currentMatrixRow: 2,
				currentMatrixCol: 3,
				currentElementAction: { element: mockElement, action: 'test', context: null, args: null },
				closeAction: { action: 'close' },
			};
			controller.menuHistory.push(menuState);
			controller.outlineEffect.applyEffect = jest.fn();

			controller.menuHistoryRetrieve();

			expect(controller.currentLinePosition).toBe(1);
			expect(controller.currentMatrixRow).toBe(2);
			expect(controller.currentMatrixCol).toBe(3);
			expect(controller.currentElementAction).toEqual({
				element: mockElement,
				action: 'test',
				context: null,
				args: null,
			});
			expect(controller.closeAction).toEqual({ action: 'close' });
			expect(controller.menuHistory).toHaveLength(0);
		});

		it('should handle empty menu history', () => {
			controller.menuHistoryRetrieve();
			expect(controller.currentLinePosition).toBe(0);
			expect(controller.currentMatrixRow).toBe(0);
			expect(controller.currentMatrixCol).toBe(0);
		});
	});

	describe('clearItems', () => {
		it('should clear all interface elements', () => {
			controller.interfaceElements = [[{ element: mockElement }]];
			controller.clearItems();
			expect(controller.interfaceElements).toEqual([]);
		});
	});

	describe('executeFunctionByName', () => {
		it('should execute function by name on context', () => {
			const context: any = {
				testFunction: jest.fn(),
			};

			controller.executeFunctionByName('testFunction', context, ['arg1', 'arg2']);

			expect(context.testFunction).toHaveBeenCalledWith('arg1', 'arg2');
		});

		it('should handle nested function names', () => {
			const context: any = {
				nested: {
					testFunction: jest.fn(),
				},
			};

			(global as any).nested = context.nested;
			controller.executeFunctionByName('nested.testFunction', global, ['arg1']);

			expect(context.nested.testFunction).toHaveBeenCalledWith('arg1');
		});

		it('should handle missing function gracefully', () => {
			const context: any = {};
			expect(() => controller.executeFunctionByName('missingFunction', context, [])).not.toThrow();
		});
	});
});
