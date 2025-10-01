/* eslint-disable no-undef */
// Mock for phaser3-nineslice
const NineSlice = class NineSlice {
	scene: any;
	x: number;
	y: number;
	width: number;
	height: number;
	key: any;
	corner: any;
	visible: boolean;
	scaleX: number;
	scaleY: number;

	constructor(scene: any, x: number, y: number, width: number, height: number, key: any, corner: any) {
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

	setScrollFactor(): this {
		return this;
	}
	setDepth(): this {
		return this;
	}
	setOrigin(): this {
		return this;
	}
};

const NineSlicePlugin = class NineSlicePlugin {
	constructor() {}
	add(): any {
		return {
			nineslice: jest.fn(
				(x: number, y: number, w: number, h: number, key: any, corner: any) =>
					new NineSlice(null, x, y, w, h, key, corner)
			),
		};
	}
};

export = { NineSlice, NineSlicePlugin, default: NineSlicePlugin };
