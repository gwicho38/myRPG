import Phaser from 'phaser';
import { NeverquestGamePadController } from '../../plugins/NeverquestGamePadController';
import { NeverquestAnimationManager } from '../../plugins/NeverquestAnimationManager';
import { NeverquestBattleManager } from '../../plugins/NeverquestBattleManager';
import { SceneToggleWatcher } from '../../scenes/watchers/SceneToggleWatcher';

// Mock Phaser.Math.Angle.Wrap
Phaser.Math.Angle = Phaser.Math.Angle || ({} as any);
Phaser.Math.Angle.Wrap = jest.fn((angle) => angle);

// Mock dependencies
jest.mock('../../plugins/NeverquestAnimationManager');
jest.mock('../../plugins/NeverquestBattleManager');
jest.mock('../../scenes/watchers/SceneToggleWatcher');

describe('NeverquestGamePadController', () => {
	let controller: NeverquestGamePadController;
	let mockScene: any;
	let mockPlayer: any;
	let mockGamepad: any;
	let mockPhysics: any;
	let mockVelocity: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockVelocity = {
			x: 0,
			y: 0,
			normalize: jest.fn().mockReturnThis(),
			scale: jest.fn().mockReturnThis(),
		};

		mockPhysics = {
			velocityFromRotation: jest.fn((angle, speed, velocity) => {
				velocity.x = Math.cos(angle) * speed;
				velocity.y = Math.sin(angle) * speed;
			}),
		};

		mockGamepad = {
			left: false,
			right: false,
			up: false,
			down: false,
			A: false,
			buttons: Array(10)
				.fill(null)
				.map(() => ({ value: 0 })),
			leftStick: {
				x: 0,
				y: 0,
				angle: jest.fn(() => 0),
			},
		};

		mockPlayer = {
			texture: { key: 'player' },
			speed: 160,
			active: true,
			container: {
				body: {
					setVelocityX: jest.fn(),
					setVelocityY: jest.fn(),
					velocity: mockVelocity,
					maxSpeed: 160,
				},
			},
			anims: {
				play: jest.fn(),
			},
		};

		mockScene = {
			input: {
				gamepad: {
					pad1: mockGamepad,
					on: jest.fn(),
				},
			},
			physics: mockPhysics,
		};

		controller = new NeverquestGamePadController(mockScene, mockPlayer);
	});

	describe('Constructor', () => {
		it('should initialize with correct scene', () => {
			expect(controller.scene).toBe(mockScene);
		});

		it('should initialize with correct player', () => {
			expect(controller.player).toBe(mockPlayer);
		});

		it('should set inventorySceneName to "InventoryScene"', () => {
			expect(controller.inventorySceneName).toBe('InventoryScene');
		});

		it('should set attributeSceneName to "AttributeScene"', () => {
			expect(controller.attributeSceneName).toBe('AttributeScene');
		});

		it('should create NeverquestAnimationManager', () => {
			expect(NeverquestAnimationManager).toHaveBeenCalledWith(mockPlayer);
			expect(controller.neverquestAnimationManager).toBeDefined();
		});

		it('should set gamepad to pad1', () => {
			expect(controller.gamepad).toBe(mockGamepad);
		});

		it('should initialize neverquestBattleManager as null', () => {
			expect(controller.neverquestBattleManager).toBeNull();
		});
	});

	describe('create', () => {
		it('should create NeverquestBattleManager', () => {
			controller.create();

			expect(NeverquestBattleManager).toHaveBeenCalled();
			expect(controller.neverquestBattleManager).toBeDefined();
		});

		it('should register connected event listener', () => {
			controller.create();

			expect(mockScene.input.gamepad.on).toHaveBeenCalledWith('connected', expect.any(Function), controller);
		});

		it('should register down event listener', () => {
			controller.create();

			expect(mockScene.input.gamepad.on).toHaveBeenCalledWith('down', expect.any(Function));
		});

		describe('connected event handler', () => {
			it('should set gamepad when not already set', () => {
				controller.gamepad = null;
				controller.create();

				const connectedHandler = mockScene.input.gamepad.on.mock.calls.find(
					(call: any) => call[0] === 'connected'
				)[1];

				const newGamepad: any = { id: 'new-gamepad' };
				connectedHandler(newGamepad, null, 0);

				expect(controller.gamepad).toBe(newGamepad);
			});

			it('should not overwrite existing gamepad', () => {
				const existingGamepad: any = { id: 'existing' };
				controller.gamepad = existingGamepad;
				controller.create();

				const connectedHandler = mockScene.input.gamepad.on.mock.calls.find(
					(call: any) => call[0] === 'connected'
				)[1];

				const newGamepad: any = { id: 'new-gamepad' };
				connectedHandler(newGamepad, null, 0);

				expect(controller.gamepad).toBe(existingGamepad);
			});
		});

		describe('down event handler', () => {
			let downHandler: any;

			beforeEach(() => {
				controller.create();
				downHandler = mockScene.input.gamepad.on.mock.calls.find((call: any) => call[0] === 'down')[1];
			});

			it('should set gamepad if not already set', () => {
				controller.gamepad = null;
				const pad = { id: 'test-pad', buttons: Array(10).fill({ value: 0 }) };

				downHandler(pad);

				expect(controller.gamepad).toBe(pad);
			});

			it('should toggle inventory scene when button 8 pressed', () => {
				const pad = {
					buttons: Array(10)
						.fill(null)
						.map(() => ({ value: 0 })),
				};
				pad.buttons[8] = { value: 1 };
				controller.gamepad = pad as any;

				downHandler(pad);

				expect(SceneToggleWatcher.toggleScene).toHaveBeenCalledWith(mockScene, 'InventoryScene', mockPlayer);
			});

			it('should toggle attribute scene when button 9 pressed', () => {
				const pad = {
					buttons: Array(10)
						.fill(null)
						.map(() => ({ value: 0 })),
				};
				pad.buttons[9] = { value: 1 };
				controller.gamepad = pad as any;

				downHandler(pad);

				expect(SceneToggleWatcher.toggleScene).toHaveBeenCalledWith(mockScene, 'AttributeScene', mockPlayer);
			});

			it('should attack when A button pressed and player is active', () => {
				const pad = { A: true, buttons: Array(10).fill({ value: 0 }) };
				mockPlayer.active = true;

				downHandler(pad);

				expect(controller.neverquestBattleManager!.atack).toHaveBeenCalledWith(mockPlayer);
			});

			it('should not attack when player is not active', () => {
				const pad = { A: true, buttons: Array(10).fill({ value: 0 }) };
				mockPlayer.active = false;

				downHandler(pad);

				expect(controller.neverquestBattleManager!.atack).not.toHaveBeenCalled();
			});

			it('should not attack when A button not pressed', () => {
				const pad = { A: false, buttons: Array(10).fill({ value: 0 }) };

				downHandler(pad);

				expect(controller.neverquestBattleManager!.atack).not.toHaveBeenCalled();
			});
		});
	});

	describe('sendInputs', () => {
		describe('D-pad Left', () => {
			it('should move left and play left animation', () => {
				controller.gamepad!.left = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityX).toHaveBeenCalledWith(-160);
				expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk-left', true);
			});

			it('should move left when left+down pressed', () => {
				controller.gamepad!.left = true;
				controller.gamepad!.down = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityX).toHaveBeenCalledWith(-160);
				expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk-left', true);
			});

			it('should move left when left+up pressed', () => {
				controller.gamepad!.left = true;
				controller.gamepad!.up = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityX).toHaveBeenCalledWith(-160);
				expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk-left', true);
			});
		});

		describe('D-pad Right', () => {
			it('should move right and play right animation', () => {
				controller.gamepad!.right = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityX).toHaveBeenCalledWith(160);
				expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk-right', true);
			});

			it('should move right when right+down pressed', () => {
				controller.gamepad!.right = true;
				controller.gamepad!.down = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityX).toHaveBeenCalledWith(160);
				expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk-right', true);
			});

			it('should move right when right+up pressed', () => {
				controller.gamepad!.right = true;
				controller.gamepad!.up = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityX).toHaveBeenCalledWith(160);
				expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk-right', true);
			});
		});

		describe('D-pad Up', () => {
			it('should move up and play up animation when no horizontal input', () => {
				controller.gamepad!.up = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityY).toHaveBeenCalledWith(-160);
				expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk-up', true);
			});

			it('should not play up animation when moving left+up', () => {
				controller.gamepad!.up = true;
				controller.gamepad!.left = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityY).toHaveBeenCalledWith(-160);
				expect(mockPlayer.anims.play).not.toHaveBeenCalledWith('player-walk-up', true);
			});

			it('should not play up animation when moving right+up', () => {
				controller.gamepad!.up = true;
				controller.gamepad!.right = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityY).toHaveBeenCalledWith(-160);
				expect(mockPlayer.anims.play).not.toHaveBeenCalledWith('player-walk-up', true);
			});
		});

		describe('D-pad Down', () => {
			it('should move down and play down animation when no horizontal input', () => {
				controller.gamepad!.down = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityY).toHaveBeenCalledWith(160);
				expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk-down', true);
			});

			it('should not play down animation when moving left+down', () => {
				controller.gamepad!.down = true;
				controller.gamepad!.left = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityY).toHaveBeenCalledWith(160);
				expect(mockPlayer.anims.play).not.toHaveBeenCalledWith('player-walk-down', true);
			});

			it('should not play down animation when moving right+down', () => {
				controller.gamepad!.down = true;
				controller.gamepad!.right = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityY).toHaveBeenCalledWith(160);
				expect(mockPlayer.anims.play).not.toHaveBeenCalledWith('player-walk-down', true);
			});
		});

		describe('Analog stick', () => {
			it('should animate and move with analog stick input', () => {
				controller.gamepad!.leftStick.x = 0.5;
				controller.gamepad!.leftStick.y = 0.5;
				controller.gamepad!.leftStick.angle = jest.fn(() => Math.PI / 4); // 45 degrees

				controller.sendInputs();

				expect(controller.neverquestAnimationManager.animateWithAngle).toHaveBeenCalled();
				expect(mockPhysics.velocityFromRotation).toHaveBeenCalledWith(Math.PI / 4, 160, mockVelocity);
			});

			it('should not use analog stick when x and y are both 0', () => {
				controller.gamepad!.leftStick.x = 0;
				controller.gamepad!.leftStick.y = 0;

				controller.sendInputs();

				expect(controller.neverquestAnimationManager.animateWithAngle).not.toHaveBeenCalled();
				expect(mockPhysics.velocityFromRotation).not.toHaveBeenCalled();
			});

			it('should not use analog stick when maxSpeed is 0', () => {
				controller.gamepad!.leftStick.x = 0.5;
				controller.gamepad!.leftStick.y = 0.5;
				mockPlayer.container.body.maxSpeed = 0;

				controller.sendInputs();

				expect(controller.neverquestAnimationManager.animateWithAngle).not.toHaveBeenCalled();
				expect(mockPhysics.velocityFromRotation).not.toHaveBeenCalled();
			});

			it('should wrap angle correctly', () => {
				controller.gamepad!.leftStick.x = 1;
				controller.gamepad!.leftStick.y = 0;
				controller.gamepad!.leftStick.angle = jest.fn(() => 0);

				controller.sendInputs();

				// Phaser.Math.Angle.Wrap is called on the angle
				expect(controller.neverquestAnimationManager.animateWithAngle).toHaveBeenCalled();
			});
		});

		describe('Velocity normalization', () => {
			it('should normalize and scale velocity', () => {
				controller.gamepad!.left = true;

				controller.sendInputs();

				expect(mockVelocity.normalize).toHaveBeenCalled();
				expect(mockVelocity.scale).toHaveBeenCalledWith(160);
			});

			it('should normalize velocity even with no input', () => {
				controller.sendInputs();

				expect(mockVelocity.normalize).toHaveBeenCalled();
				expect(mockVelocity.scale).toHaveBeenCalledWith(160);
			});
		});

		describe('No gamepad', () => {
			it('should do nothing when gamepad is null', () => {
				controller.gamepad = null;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityX).not.toHaveBeenCalled();
				expect(mockPlayer.container.body.setVelocityY).not.toHaveBeenCalled();
				expect(mockPlayer.anims.play).not.toHaveBeenCalled();
			});
		});

		describe('Integration', () => {
			it('should handle diagonal movement (left+up)', () => {
				controller.gamepad!.left = true;
				controller.gamepad!.up = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityX).toHaveBeenCalledWith(-160);
				expect(mockPlayer.container.body.setVelocityY).toHaveBeenCalledWith(-160);
				expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk-left', true);
			});

			it('should handle diagonal movement (right+down)', () => {
				controller.gamepad!.right = true;
				controller.gamepad!.down = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityX).toHaveBeenCalledWith(160);
				expect(mockPlayer.container.body.setVelocityY).toHaveBeenCalledWith(160);
				expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk-right', true);
			});

			it('should prioritize left over right', () => {
				controller.gamepad!.left = true;
				controller.gamepad!.right = true;

				controller.sendInputs();

				// Left is checked first in if-else chain
				expect(mockPlayer.container.body.setVelocityX).toHaveBeenCalledWith(-160);
				expect(mockPlayer.anims.play).toHaveBeenCalledWith('player-walk-left', true);
			});

			it('should work with different player speeds', () => {
				mockPlayer.speed = 200;
				controller.gamepad!.right = true;

				controller.sendInputs();

				expect(mockPlayer.container.body.setVelocityX).toHaveBeenCalledWith(200);
				expect(mockVelocity.scale).toHaveBeenCalledWith(200);
			});

			it('should work with different player textures', () => {
				mockPlayer.texture.key = 'hero';
				controller.gamepad!.up = true;

				controller.sendInputs();

				expect(mockPlayer.anims.play).toHaveBeenCalledWith('hero-walk-up', true);
			});
		});
	});
});
