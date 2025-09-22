import { LuminusMovement } from '../../plugins/LuminusMovement';

describe('LuminusMovement', () => {
	let movement;
	let mockScene;
	let mockPlayer;

	beforeEach(() => {
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
				isActive: true,
				addPointer: jest.fn(),
			},
			map: {
				worldToTileX: jest.fn((x) => Math.floor(x / 16)),
				worldToTileY: jest.fn((y) => Math.floor(y / 16)),
				getLayer: jest.fn((index) => ({ name: 'Ground' })),
				getTileAt: jest.fn(),
			},
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
		it('should return false when not on water tile', () => {
			mockScene.map.getTileAt.mockReturnValue({ index: 161 }); // Grass tile
			expect(movement.isOnWater()).toBe(false);
		});

		it('should return true when on shallow water tile', () => {
			mockScene.map.getTileAt.mockReturnValue({ index: 482 });
			expect(movement.isOnWater()).toBe(true);
		});

		it('should return true when on regular water tile', () => {
			mockScene.map.getTileAt.mockReturnValue({ index: 653 });
			expect(movement.isOnWater()).toBe(true);
		});

		it('should return true when on deep water tile', () => {
			mockScene.map.getTileAt.mockReturnValue({ index: 734 });
			expect(movement.isOnWater()).toBe(true);
		});

		it('should return false when no map exists', () => {
			mockScene.map = null;
			expect(movement.isOnWater()).toBe(false);
		});
	});

	describe('updateSwimmingState', () => {
		it('should enter swimming mode when moving onto water', () => {
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
	});
});
