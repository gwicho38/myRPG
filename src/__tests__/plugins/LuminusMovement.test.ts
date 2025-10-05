import { LuminusMovement } from '../../plugins/LuminusMovement';

describe('LuminusMovement', () => {
	let movement: any;
	let mockScene: any;
	let mockPlayer: any;

	beforeEach(() => {
		const mockMap = {
			worldToTileX: jest.fn((x: number): number => Math.floor(x / 16)),
			worldToTileY: jest.fn((y: number): number => Math.floor(y / 16)),
			getLayer: jest.fn((_name: string): any => null),
			getTileAt: jest.fn(),
			tileWidth: 16,
			tileHeight: 16,
		};

		mockScene = {
			input: {
				keyboard: {
					createCursorKeys: jest.fn(() => ({
						left: { isDown: false },
						right: { isDown: false },
						up: { isDown: false },
						down: { isDown: false },
					})),
					addKeys: jest.fn(() => ({
						W: { isDown: false },
						A: { isDown: false },
						S: { isDown: false },
						D: { isDown: false },
					})),
					addKey: jest.fn(() => ({ isDown: false })),
					on: jest.fn(),
				},
				gamepad: {
					pad1: {
						id: 'mock-gamepad',
						index: 0,
						buttons: [],
						axes: [],
						connected: true,
					},
					on: jest.fn(),
					off: jest.fn(),
				},
				isActive: true,
				addPointer: jest.fn(),
			},
			data: {
				get: jest.fn((key: string): any => (key === 'map' ? mockMap : null)),
			},
			map: mockMap,
		};

		mockPlayer = {
			container: {
				x: 100,
				y: 100,
				body: {
					velocity: { x: 0, y: 0, normalize: jest.fn().mockReturnThis(), scale: jest.fn() },
					setVelocity: jest.fn(),
					setVelocityX: jest.fn(),
					setVelocityY: jest.fn(),
					maxSpeed: 200,
				},
			},
			canMove: true,
			isAtacking: false,
			isSwimming: false,
			isRunning: false,
			canSwim: true,
			speed: 200,
			baseSpeed: 200,
			swimSpeed: 100,
			runSpeed: 300,
			texture: { key: 'player' },
			anims: {
				play: jest.fn(),
				currentAnim: { key: '' },
				animationManager: {
					exists: jest.fn(() => true),
				},
			},
			setTint: jest.fn(),
			clearTint: jest.fn(),
			walkDust: { on: false },
		};

		movement = new LuminusMovement(mockScene, mockPlayer, null);
	});

	describe('isMoving', () => {
		it('should return false when velocity is zero', () => {
			expect(movement.isMoving()).toBe(false);
		});

		it('should return true when velocity is non-zero', () => {
			mockPlayer.container.body.velocity.x = 100;
			expect(movement.isMoving()).toBe(true);
		});
	});

	describe('isAnyKeyDown', () => {
		it('should return false when no keys are pressed', () => {
			expect(movement.isAnyKeyDown()).toBe(false);
		});

		it('should return true when arrow key is pressed', () => {
			movement.cursors.left.isDown = true;
			expect(movement.isAnyKeyDown()).toBe(true);
		});

		it('should return true when WASD key is pressed', () => {
			movement.wasd.W.isDown = true;
			expect(movement.isAnyKeyDown()).toBe(true);
		});
	});

	describe('isOnWater', () => {
		it('should return false when scene.data does not exist', () => {
			mockScene.data = null;
			expect(movement.isOnWater()).toBe(false);
		});

		it('should return false when player does not exist', () => {
			movement.player = null;
			expect(movement.isOnWater()).toBe(false);
		});

		it('should return false when player.container does not exist', () => {
			movement.player.container = null;
			expect(movement.isOnWater()).toBe(false);
		});

		it('should return false when map not found in scene data', () => {
			mockScene.data.get.mockReturnValue(null);
			expect(movement.isOnWater()).toBe(false);
		});

		it('should return false when no water layer exists', () => {
			mockScene.map.getLayer.mockReturnValue(null);
			expect(movement.isOnWater()).toBe(false);
		});

		it('should return true when on water tile (lowercase layer name)', () => {
			const waterLayer = { name: 'water' };
			mockScene.map.getLayer.mockImplementation((name: string): any => (name === 'water' ? waterLayer : null));
			mockScene.map.getTileAt.mockReturnValue({ index: 653 }); // non-null tile

			expect(movement.isOnWater()).toBe(true);
		});

		it('should return true when on water tile (uppercase layer name)', () => {
			const waterLayer = { name: 'Water' };
			mockScene.map.getLayer.mockImplementation((name: string): any => (name === 'Water' ? waterLayer : null));
			mockScene.map.getTileAt.mockReturnValue({ index: 653 });

			expect(movement.isOnWater()).toBe(true);
		});

		it('should return false when water tile is null', () => {
			const waterLayer = { name: 'water' };
			mockScene.map.getLayer.mockImplementation((name: string): any => (name === 'water' ? waterLayer : null));
			mockScene.map.getTileAt.mockReturnValue(null);

			expect(movement.isOnWater()).toBe(false);
		});

		it('should calculate correct tile coordinates', () => {
			const waterLayer = { name: 'water' };
			mockScene.map.getLayer.mockImplementation((name: string): any => (name === 'water' ? waterLayer : null));
			mockScene.map.getTileAt.mockReturnValue({ index: 653 });

			mockPlayer.container.x = 100;
			mockPlayer.container.y = 100;

			movement.isOnWater();

			// tileX = Math.floor(100 / 16) = 6
			// tileY = Math.floor(100 / 16) = 6
			expect(mockScene.map.getTileAt).toHaveBeenCalledWith(6, 6, false, waterLayer);
		});
	});

	describe('updateSwimmingState', () => {
		it('should do nothing if player does not exist', () => {
			movement.player = null;
			expect(() => movement.updateSwimmingState()).not.toThrow();
		});

		it('should do nothing if player cannot swim', () => {
			mockPlayer.canSwim = false;
			const wasSwimming = mockPlayer.isSwimming;
			movement.updateSwimmingState();
			expect(mockPlayer.isSwimming).toBe(wasSwimming);
		});

		it('should enter swimming mode when moving onto water', () => {
			const waterLayer = { name: 'water' };
			mockScene.map.getLayer.mockImplementation((name: string): any => (name === 'water' ? waterLayer : null));
			mockScene.map.getTileAt.mockReturnValue({ index: 653 });
			movement.updateSwimmingState();

			expect(mockPlayer.isSwimming).toBe(true);
			expect(mockPlayer.speed).toBe(100);
			expect(mockPlayer.setTint).toHaveBeenCalledWith(0x87ceeb);
		});

		it('should exit swimming mode when moving off water', () => {
			mockPlayer.isSwimming = true;
			mockPlayer.speed = 100;
			mockScene.map.getTileAt.mockReturnValue({ index: 161 }); // Land tile

			movement.updateSwimmingState();

			expect(mockPlayer.isSwimming).toBe(false);
			expect(mockPlayer.speed).toBe(200);
			expect(mockPlayer.clearTint).toHaveBeenCalled();
		});

		it('should disable running when entering water', () => {
			mockPlayer.isRunning = true;
			mockScene.map.getTileAt.mockReturnValue({ index: 653 });

			movement.updateSwimmingState();

			expect(mockPlayer.isRunning).toBe(false);
			expect(mockPlayer.isSwimming).toBe(true);
		});

		it('should not swim if player cannot swim', () => {
			mockPlayer.canSwim = false;
			mockScene.map.getTileAt.mockReturnValue({ index: 653 });

			movement.updateSwimmingState();

			expect(mockPlayer.isSwimming).toBe(false);
		});
	});

	describe('updateRunningState', () => {
		it('should enter running mode when Shift is pressed', () => {
			movement.shiftKey.isDown = true;
			movement.updateRunningState();

			expect(mockPlayer.isRunning).toBe(true);
			expect(mockPlayer.speed).toBe(300);
		});

		it('should exit running mode when Shift is released', () => {
			mockPlayer.isRunning = true;
			mockPlayer.speed = 300;
			movement.shiftKey.isDown = false;

			movement.updateRunningState();

			expect(mockPlayer.isRunning).toBe(false);
			expect(mockPlayer.speed).toBe(200);
		});

		it('should not run while swimming', () => {
			mockPlayer.isSwimming = true;
			movement.shiftKey.isDown = true;

			movement.updateRunningState();

			expect(mockPlayer.isRunning).toBe(false);
		});
	});

	describe('move', () => {
		it('should update swimming and running states', () => {
			const updateSwimmingSpy = jest.spyOn(movement, 'updateSwimmingState');
			const updateRunningSpy = jest.spyOn(movement, 'updateRunningState');

			movement.move();

			expect(updateSwimmingSpy).toHaveBeenCalled();
			expect(updateRunningSpy).toHaveBeenCalled();
		});

		it('should move left when left arrow is pressed', () => {
			movement.cursors.left.isDown = true;
			movement.move();

			expect(mockPlayer.container.body.setVelocityX).toHaveBeenCalledWith(-200);
			expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk_left', true);
		});

		it('should move right when D key is pressed', () => {
			movement.wasd.D.isDown = true;
			movement.move();

			expect(mockPlayer.container.body.setVelocityX).toHaveBeenCalledWith(200);
			expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk_right', true);
		});

		it('should move up when W key is pressed', () => {
			movement.wasd.W.isDown = true;
			movement.move();

			expect(mockPlayer.container.body.setVelocityY).toHaveBeenCalledWith(-200);
			expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk_up', true);
		});

		it('should move down when down arrow is pressed', () => {
			movement.cursors.down.isDown = true;
			movement.move();

			expect(mockPlayer.container.body.setVelocityY).toHaveBeenCalledWith(200);
			expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk_down', true);
		});

		it('should not move when player cannot move', () => {
			mockPlayer.canMove = false;
			movement.cursors.left.isDown = true;
			movement.move();

			expect(mockPlayer.container.body.setVelocity).toHaveBeenCalledWith(0);
			expect(mockPlayer.container.body.setVelocityX).not.toHaveBeenCalled();
		});

		it('should not move when player is attacking', () => {
			mockPlayer.isAtacking = true;
			movement.cursors.left.isDown = true;
			movement.move();

			expect(mockPlayer.container.body.setVelocityX).not.toHaveBeenCalled();
		});

		it('should normalize diagonal movement', () => {
			movement.cursors.left.isDown = true;
			movement.cursors.up.isDown = true;
			movement.move();

			expect(mockPlayer.container.body.velocity.normalize).toHaveBeenCalled();
			expect(mockPlayer.container.body.velocity.scale).toHaveBeenCalledWith(200);
		});

		it('should enable walk dust when moving', () => {
			movement.cursors.left.isDown = true;
			movement.move();
			mockPlayer.container.body.velocity.x = -200;

			// Need to call move again to trigger dust check
			movement.move();
			expect(mockPlayer.walkDust.on).toBe(true);
		});

		it('should handle virtual joystick movement (right)', () => {
			movement.stick = {
				isDown: true,
				force: 0.8,
				angle: 0, // right
			};

			movement.move();

			// cos(0) * 200 * 0.8 = 160
			expect(mockPlayer.container.body.setVelocity).toHaveBeenCalledWith(160, 0);
		});

		it('should handle virtual joystick movement (down)', () => {
			movement.stick = {
				isDown: true,
				force: 0.7,
				angle: Math.PI / 2, // down
			};

			movement.move();

			// cos(PI/2) ≈ 0, sin(PI/2) = 1
			// velocityY = sin(PI/2) * 200 * 0.7 = 140
			const calls = mockPlayer.container.body.setVelocity.mock.calls;
			const lastCall = calls[calls.length - 1];
			expect(lastCall[1]).toBeCloseTo(140, 0);
		});

		it('should ignore virtual joystick when force is too low', () => {
			movement.stick = {
				isDown: true,
				force: 0.05, // below 0.1 threshold
				angle: 0,
			};

			const initialCalls = mockPlayer.container.body.setVelocity.mock.calls.length;
			movement.move();

			// Should not set velocity from joystick
			const newCalls = mockPlayer.container.body.setVelocity.mock.calls.length;
			expect(newCalls).toBe(initialCalls);
		});

		it('should disable walk dust when not moving', () => {
			mockPlayer.walkDust.on = true;
			mockPlayer.container.body.velocity.x = 0;
			mockPlayer.container.body.velocity.y = 0;

			movement.move();

			expect(mockPlayer.walkDust.on).toBe(false);
		});
	});

	describe('Constructor edge cases', () => {
		it('should initialize isRunning to false when undefined', () => {
			const playerWithoutRunning = {
				...mockPlayer,
				isRunning: undefined,
			};

			const newMovement = new LuminusMovement(mockScene, playerWithoutRunning);

			expect(playerWithoutRunning.isRunning).toBe(false);
			expect(playerWithoutRunning.wasShiftDown).toBe(false);
		});

		it('should set up joystick scene events when provided', () => {
			const mockJoystickScene: any = {
				events: {
					on: jest.fn(),
				},
			};

			const newMovement = new LuminusMovement(mockScene, mockPlayer, mockJoystickScene);

			expect(mockJoystickScene.events.on).toHaveBeenCalledWith('setStick', expect.any(Function));

			// Test the event handler
			const setStickHandler = mockJoystickScene.events.on.mock.calls[0][1];
			const mockStick = { force: 0.5, angle: 0 };
			setStickHandler(mockStick);

			expect(newMovement.stick).toBe(mockStick);
		});

		it('should log WASD key presses', () => {
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			// Get the keyboard event handler
			const keydownHandler = mockScene.input.keyboard.on.mock.calls.find(
				(call: any[]) => call[0] === 'keydown'
			)[1];

			// Simulate WASD key presses
			keydownHandler({ code: 'KeyW' });
			keydownHandler({ code: 'KeyA' });
			keydownHandler({ code: 'KeyS' });
			keydownHandler({ code: 'KeyD' });

			expect(consoleSpy).toHaveBeenCalledWith('WASD Control: KeyW pressed');
			expect(consoleSpy).toHaveBeenCalledWith('WASD Control: KeyA pressed');
			expect(consoleSpy).toHaveBeenCalledWith('WASD Control: KeyS pressed');
			expect(consoleSpy).toHaveBeenCalledWith('WASD Control: KeyD pressed');

			consoleSpy.mockRestore();
		});
	});
});
