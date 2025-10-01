/* eslint-disable no-undef */
// Mock Phaser for testing
const Phaser = {
	Scene: class Scene {
		add: any;
		input: any;
		time: any;
		scene: any;
		cameras: any;
		tweens: any;
		plugins: any;
		registry: any;
		data: any;
		physics: any;
		events: any;
		sound: any;

		constructor() {
			this.add = {
				text: jest.fn().mockReturnThis(),
				image: jest.fn().mockReturnThis(),
				sprite: jest.fn().mockReturnThis(),
				nineslice: jest.fn().mockReturnThis(),
			};
			this.input = {
				keyboard: {
					addKeys: jest.fn(),
					createCursorKeys: jest.fn(() => ({
						left: { isDown: false },
						right: { isDown: false },
						up: { isDown: false },
						down: { isDown: false },
					})),
					on: jest.fn(),
					off: jest.fn(),
					removeListener: jest.fn(),
					addKey: jest.fn(() => ({ isDown: false })),
				},
				mouse: {
					disableContextMenu: jest.fn(),
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
						once: jest.fn(),
					},
					on: jest.fn(),
					off: jest.fn(),
				},
				on: jest.fn(),
				isActive: true,
				addPointer: jest.fn(),
			};
			this.time = {
				addEvent: jest.fn(),
				delayedCall: jest.fn(),
				now: Date.now(),
			};
			this.scene = {
				key: 'TestScene',
				start: jest.fn(),
				stop: jest.fn(),
				get: jest.fn(),
			};
			this.cameras = {
				main: {
					midPoint: { x: 400, y: 300 },
					width: 800,
					height: 600,
				},
			};
			this.tweens = {
				add: jest.fn(),
			};
			this.plugins = {
				get: jest.fn(() => ({
					add: jest.fn(),
				})),
			};
			this.registry = {
				get: jest.fn(),
				set: jest.fn(),
			};
			this.data = {
				get: jest.fn(),
				set: jest.fn(),
			};
			this.physics = {
				world: {
					on: jest.fn(),
					off: jest.fn(),
				},
			};
			this.events = {
				on: jest.fn(),
				off: jest.fn(),
				emit: jest.fn(),
				once: jest.fn(),
			};
			this.sound = {
				add: jest.fn(() => ({
					volume: 0,
					play: jest.fn(),
					stop: jest.fn(),
					setVolume: jest.fn(),
				})),
				play: jest.fn(),
				stopAll: jest.fn(),
			};
		}
	},
	Input: {
		Keyboard: {
			KeyCodes: {
				SHIFT: 16,
				ENTER: 13,
				SPACE: 32,
			},
		},
	},
	Physics: {
		Arcade: {
			Sprite: class Sprite {
				scene: any;
				x: number;
				y: number;
				texture: any;
				anims: any;
				body: any;
				flipX: boolean;
				visible: boolean;

				constructor(scene: any, x: number, y: number, texture: string) {
					this.scene = scene;
					this.x = x || 0;
					this.y = y || 0;
					this.texture = { key: texture };
					this.anims = {
						play: jest.fn(),
						currentAnim: { key: '' },
						animationManager: {
							exists: jest.fn(() => true),
						},
					};
					this.body = {
						velocity: { x: 0, y: 0 },
						maxSpeed: 100,
					};
					this.flipX = false;
					this.visible = true;
				}
				setScrollFactor(): this {
					return this;
				}
				setDepth(): this {
					return this;
				}
				setOrigin(): this {
					return this;
				}
				addToUpdateList(): this {
					return this;
				}
			},
		},
	},
	Plugins: {
		ScenePlugin: class ScenePlugin {},
	},
	GameObjects: {
		Components: {
			TransformMatrix: class TransformMatrix {},
		},
		Sprite: class Sprite {
			scene: any;
			x: number;
			y: number;
			texture: any;
			anims: any;
			flipX: boolean;
			visible: boolean;

			constructor(scene: any, x: number, y: number, texture: string) {
				this.scene = scene;
				this.x = x || 0;
				this.y = y || 0;
				this.texture = { key: texture };
				this.anims = {
					play: jest.fn(),
					currentAnim: { key: '' },
					animationManager: {
						exists: jest.fn(() => true),
					},
				};
				this.flipX = false;
				this.visible = true;
			}
			setScrollFactor(): this {
				return this;
			}
			setDepth(): this {
				return this;
			}
			setOrigin(): this {
				return this;
			}
			addToUpdateList(): this {
				return this;
			}
		},
		Container: class Container {
			scene: any;
			x: number;
			y: number;
			children: any[];
			body: any;

			constructor(scene: any, x: number, y: number, children?: any[]) {
				this.scene = scene;
				this.x = x || 0;
				this.y = y || 0;
				this.children = children || [];
				this.body = {
					velocity: { x: 0, y: 0 },
					maxSpeed: 100,
				};
			}
			add(): this {
				return this;
			}
			remove(): this {
				return this;
			}
		},
		Image: class Image {
			scene: any;
			x: number;
			y: number;
			texture: any;
			visible: boolean;

			constructor(scene: any, x: number, y: number, texture: string) {
				this.scene = scene;
				this.x = x || 0;
				this.y = y || 0;
				this.texture = texture;
				this.visible = true;
			}
			setScrollFactor(): this {
				return this;
			}
			setDepth(): this {
				return this;
			}
			setOrigin(): this {
				return this;
			}
		},
		Text: class Text {
			scene: any;
			x: number;
			y: number;
			text: string;
			style: any;
			visible: boolean;

			constructor(scene: any, x: number, y: number, text?: string, style?: any) {
				this.scene = scene;
				this.x = x || 0;
				this.y = y || 0;
				this.text = text || '';
				this.style = style || {};
				this.visible = true;
			}
			setScrollFactor(): this {
				return this;
			}
			setDepth(): this {
				return this;
			}
			setOrigin(): this {
				return this;
			}
		},
	},
	Math: {
		Vector2: class Vector2 {
			x: number;
			y: number;

			constructor(x?: number, y?: number) {
				this.x = x || 0;
				this.y = y || 0;
			}
		},
	},
	Display: {
		Color: class Color {
			r: number;
			g: number;
			b: number;
			a: number;
			static IntegerToRGB = jest.fn();

			constructor(r?: number, g?: number, b?: number, a?: number) {
				this.r = r || 0;
				this.g = g || 0;
				this.b = b || 0;
				this.a = a !== undefined ? a : 1;
			}
		},
	},
	AUTO: 0,
	WEBGL: 1,
	CANVAS: 2,
};

export = Phaser;
