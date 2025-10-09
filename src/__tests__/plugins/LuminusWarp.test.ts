import { LuminusWarp } from '../../plugins/LuminusWarp';

describe('LuminusWarp', () => {
	let warp: LuminusWarp;
	let mockScene: any;
	let mockPlayer: any;
	let mockMap: any;
	let mockCamera: any;
	let cameraCallbacks: any;

	beforeEach(() => {
		cameraCallbacks = {};

		// Mock camera
		mockCamera = {
			fade: jest.fn(),
			fadeIn: jest.fn(),
			on: jest.fn((event, callback) => {
				cameraCallbacks[event] = callback;
			}),
		};

		// Mock zone
		const mockZone = {
			body: {
				immovable: false,
			},
			setOrigin: jest.fn(),
		};

		// Mock scene
		mockScene = {
			add: {
				zone: jest.fn(() => mockZone),
				particles: jest.fn(),
			},
			physics: {
				add: {
					existing: jest.fn(),
					collider: jest.fn((zones, playerContainer, callback) => {
						mockScene._colliderCallback = callback;
					}),
				},
			},
			cameras: {
				main: mockCamera,
			},
			scene: {
				key: 'TestScene',
				switch: jest.fn(),
				start: jest.fn(),
			},
		};

		// Mock player
		mockPlayer = {
			container: {
				x: 100,
				y: 100,
				body: {
					maxSpeed: 200,
				},
			},
			luminusMovement: {},
			destroy: jest.fn(),
		};

		// Mock map
		mockMap = {
			getObjectLayer: jest.fn(() => ({
				objects: [
					{
						id: 1,
						x: 50,
						y: 50,
						width: 32,
						height: 32,
						properties: [{ name: 'goto', value: 2 }],
					},
					{
						id: 2,
						x: 200,
						y: 200,
						width: 32,
						height: 32,
					},
				],
			})),
		};

		warp = new LuminusWarp(mockScene, mockPlayer, mockMap);
	});

	describe('Constructor', () => {
		it('should initialize with correct properties', () => {
			expect(warp.scene).toBe(mockScene);
			expect(warp.player).toBe(mockPlayer);
			expect(warp.map).toBe(mockMap);
		});

		it('should set default fade times', () => {
			expect(warp.defaultFadeTime).toBe(300);
			expect(warp.fadeOutTime).toBe(300);
			expect(warp.fadeInTime).toBe(300);
		});

		it('should set default property names', () => {
			expect(warp.warpObjectName).toBe('warps');
			expect(warp.propertyWarpName).toBe('goto');
			expect(warp.propertyChangeScene).toBe('scene');
		});

		it('should cache player max speed', () => {
			expect(warp['maxSpeed']).toBe(200);
		});

		it('should initialize particles config as null', () => {
			expect(warp.particlesConfig).toBeNull();
		});
	});

	describe('createWarps', () => {
		it('should retrieve warps from map object layer', () => {
			warp.createWarps();

			expect(mockMap.getObjectLayer).toHaveBeenCalledWith('warps');
		});

		it('should create zones for warp objects with properties', () => {
			warp.createWarps();

			expect(mockScene.add.zone).toHaveBeenCalledWith(50, 50, 32, 32);
		});

		it('should create particle effects at warp positions', () => {
			warp.createWarps();

			expect(mockScene.add.particles).toHaveBeenCalledWith(
				66, // x + width/2
				66, // y + height/2
				'particle_warp',
				expect.any(Object)
			);
		});

		it('should configure particle emitter with correct properties', () => {
			warp.createWarps();

			expect(warp.particlesConfig).toEqual({
				angle: -90,
				frequency: 300,
				speed: 1,
				x: { min: -16, max: 16 },
				y: { min: -16, max: 16 },
				lifespan: { min: 500, max: 2000 },
				scale: { start: 1.3, end: 0.8 },
				alpha: { start: 1, end: 0.7 },
			});
		});

		it('should add physics to warp zones', () => {
			warp.createWarps();

			expect(mockScene.physics.add.existing).toHaveBeenCalled();
		});

		it('should make warp zones immovable', () => {
			const mockZone = {
				body: { immovable: false },
				setOrigin: jest.fn(),
			};
			mockScene.add.zone.mockReturnValue(mockZone);

			warp.createWarps();

			expect(mockZone.body.immovable).toBe(true);
		});

		it('should set zone origin to (0, 0)', () => {
			const mockZone = {
				body: { immovable: false },
				setOrigin: jest.fn(),
			};
			mockScene.add.zone.mockReturnValue(mockZone);

			warp.createWarps();

			expect(mockZone.setOrigin).toHaveBeenCalledWith(0, 0);
		});

		it('should set up camera fade out listener', () => {
			warp.createWarps();

			expect(mockCamera.on).toHaveBeenCalledWith('camerafadeoutstart', expect.any(Function));
		});

		it('should set up camera fade in listener', () => {
			warp.createWarps();

			expect(mockCamera.on).toHaveBeenCalledWith('camerafadeincomplete', expect.any(Function));
		});

		it('should create collider between warp zones and player', () => {
			warp.createWarps();

			expect(mockScene.physics.add.collider).toHaveBeenCalledWith(
				expect.any(Array),
				mockPlayer.container,
				expect.any(Function)
			);
		});

		it('should filter warp objects from destinations', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{ id: 1, properties: [{ name: 'goto', value: 2 }] },
					{ id: 2 },
					{ id: 3, properties: [{ name: 'goto', value: 4 }] },
					{ id: 4 },
				],
			});

			warp.createWarps();

			// Should create zones only for objects with properties (2 zones)
			expect(mockScene.add.zone).toHaveBeenCalledTimes(2);
		});
	});

	describe('Camera Fade Effects', () => {
		it('should stop player movement on fade out start', () => {
			warp.createWarps();

			cameraCallbacks['camerafadeoutstart']();

			expect(mockPlayer.container.body.maxSpeed).toBe(0);
		});

		it('should restore player movement on fade in complete', () => {
			warp.createWarps();

			cameraCallbacks['camerafadeoutstart']();
			cameraCallbacks['camerafadeincomplete']();

			expect(mockPlayer.container.body.maxSpeed).toBe(200);
		});

		it('should use custom fade out time', () => {
			warp.fadeOutTime = 500;
			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [{ name: 'goto', value: 2 }],
				},
			};

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			expect(mockCamera.fade).toHaveBeenCalledWith(500);
		});

		it('should use custom fade in time', () => {
			warp.fadeInTime = 400;
			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [{ name: 'goto', value: 2 }],
				},
			};

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			expect(mockCamera.fadeIn).toHaveBeenCalledWith(400);
		});
	});

	describe('Warp Collision - Same Scene Teleport', () => {
		it('should teleport player to destination on collision', () => {
			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [{ name: 'goto', value: 2 }],
				},
			};

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			expect(mockPlayer.container.x).toBe(200);
			expect(mockPlayer.container.y).toBe(200);
		});

		it('should trigger camera fade out', () => {
			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [{ name: 'goto', value: 2 }],
				},
			};

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			expect(mockCamera.fade).toHaveBeenCalledWith(300);
		});

		it('should trigger camera fade in', () => {
			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [{ name: 'goto', value: 2 }],
				},
			};

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			expect(mockCamera.fadeIn).toHaveBeenCalledWith(300);
		});
	});

	describe('Warp Collision - Scene Change', () => {
		it('should start scene when scene property exists with previousScene data', () => {
			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [
						{ name: 'goto', value: 'DungeonScene' },
						{ name: 'scene', value: true },
					],
				},
			};

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			expect(mockScene.scene.start).toHaveBeenCalledWith('DungeonScene', { previousScene: 'TestScene' });
		});

		it('should destroy player on scene change', () => {
			mockScene.player = mockPlayer;
			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [
						{ name: 'goto', value: 'DungeonScene' },
						{ name: 'scene', value: true },
					],
				},
			};

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			expect(mockPlayer.destroy).toHaveBeenCalled();
		});

		it('should null player movement on scene change', () => {
			mockScene.player = mockPlayer;
			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [
						{ name: 'goto', value: 'DungeonScene' },
						{ name: 'scene', value: true },
					],
				},
			};

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			expect(mockPlayer.luminusMovement).toBeNull();
		});

		it('should stop scene music if available', () => {
			mockScene.stopSceneMusic = jest.fn();
			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [
						{ name: 'goto', value: 'DungeonScene' },
						{ name: 'scene', value: true },
					],
				},
			};

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			expect(mockScene.stopSceneMusic).toHaveBeenCalled();
		});

		it('should not stop music if function not available', () => {
			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [
						{ name: 'goto', value: 'DungeonScene' },
						{ name: 'scene', value: true },
					],
				},
			};

			expect(() => {
				mockScene._colliderCallback(mockWarpPoint, mockPlayer);
			}).not.toThrow();
		});

		it('should not fade camera for scene change', () => {
			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [
						{ name: 'goto', value: 'DungeonScene' },
						{ name: 'scene', value: true },
					],
				},
			};

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			expect(mockCamera.fade).not.toHaveBeenCalled();
		});
	});

	describe('Custom Configuration', () => {
		it('should use custom warp object name', () => {
			warp.warpObjectName = 'teleports';
			warp.createWarps();

			expect(mockMap.getObjectLayer).toHaveBeenCalledWith('teleports');
		});

		it('should use custom property names', () => {
			warp.propertyWarpName = 'destination';
			warp.propertyChangeScene = 'changeLevel';

			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						id: 1,
						x: 50,
						y: 50,
						width: 32,
						height: 32,
						properties: [{ name: 'destination', value: 2 }],
					},
					{
						id: 2,
						x: 200,
						y: 200,
					},
				],
			});

			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [{ name: 'destination', value: 2 }],
				},
			};

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			expect(mockPlayer.container.x).toBe(200);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty warp object layer', () => {
			mockMap.getObjectLayer.mockReturnValue({ objects: [] });

			expect(() => {
				warp.createWarps();
			}).not.toThrow();
		});

		it('should handle warp with no matching destination', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						id: 1,
						x: 50,
						y: 50,
						width: 32,
						height: 32,
						properties: [{ name: 'goto', value: 999 }],
					},
				],
			});

			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [{ name: 'goto', value: 999 }],
				},
			};

			const initialX = mockPlayer.container.x;
			const initialY = mockPlayer.container.y;

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			// Player should not move
			expect(mockPlayer.container.x).toBe(initialX);
			expect(mockPlayer.container.y).toBe(initialY);
		});

		it('should handle zero fade times', () => {
			warp.fadeOutTime = 0;
			warp.fadeInTime = 0;
			warp.createWarps();

			const mockWarpPoint = {
				warp: {
					properties: [{ name: 'goto', value: 2 }],
				},
			};

			mockScene._colliderCallback(mockWarpPoint, mockPlayer);

			expect(mockCamera.fade).toHaveBeenCalledWith(0);
			expect(mockCamera.fadeIn).toHaveBeenCalledWith(0);
		});
	});
});
