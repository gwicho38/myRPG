// Mock Phaser for testing
const Phaser = {
	Scene: class Scene {
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
				constructor() {
					this.x = 0;
					this.y = 0;
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
				setScrollFactor() {
					return this;
				}
				setDepth() {
					return this;
				}
				setOrigin() {
					return this;
				}
				addToUpdateList() {
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
			constructor(scene, x, y, texture) {
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
			setScrollFactor() {
				return this;
			}
			setDepth() {
				return this;
			}
			setOrigin() {
				return this;
			}
			addToUpdateList() {
				return this;
			}
		},
		Container: class Container {
			constructor(scene, x, y, children) {
				this.scene = scene;
				this.x = x || 0;
				this.y = y || 0;
				this.children = children || [];
				this.body = {
					velocity: { x: 0, y: 0 },
					maxSpeed: 100,
				};
			}
			add() {
				return this;
			}
			remove() {
				return this;
			}
		},
		Image: class Image {
			constructor(scene, x, y, texture) {
				this.scene = scene;
				this.x = x || 0;
				this.y = y || 0;
				this.texture = texture;
				this.visible = true;
			}
			setScrollFactor() {
				return this;
			}
			setDepth() {
				return this;
			}
			setOrigin() {
				return this;
			}
		},
		Text: class Text {
			constructor(scene, x, y, text, style) {
				this.scene = scene;
				this.x = x || 0;
				this.y = y || 0;
				this.text = text || '';
				this.style = style || {};
				this.visible = true;
			}
			setScrollFactor() {
				return this;
			}
			setDepth() {
				return this;
			}
			setOrigin() {
				return this;
			}
		},
	},
	Math: {
		Vector2: class Vector2 {
			constructor(x, y) {
				this.x = x || 0;
				this.y = y || 0;
			}
		},
	},
	Display: {
		Color: {
			IntegerToRGB: jest.fn(),
		},
	},
	AUTO: 0,
	WEBGL: 1,
	CANVAS: 2,
};

module.exports = Phaser;
export default Phaser;
