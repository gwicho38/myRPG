// Mock for phaser3-nineslice
const NineSlice = class NineSlice {
	constructor(scene, x, y, width, height, key, corner) {
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.key = key;
		this.corner = corner;
		this.visible = false;
		this.scaleX = 1;
		this.scaleY = 1;
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
};

const NineSlicePlugin = class NineSlicePlugin {
	constructor() {}
	add() {
		return {
			nineslice: jest.fn((x, y, w, h, key, corner) => new NineSlice(null, x, y, w, h, key, corner)),
		};
	}
};

module.exports = { NineSlice, NineSlicePlugin, default: NineSlicePlugin };
