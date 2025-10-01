// Mock for phaser3-juice-plugin
class PhaserJuice {
	constructor() {}

	shake(_object: any, _options?: any): Promise<void> {
		return Promise.resolve();
	}

	flash(_object: any, _options?: any): Promise<void> {
		return Promise.resolve();
	}

	pulse(_object: any, _options?: any): Promise<void> {
		return Promise.resolve();
	}

	jump(_object: any, _options?: any): Promise<void> {
		return Promise.resolve();
	}
}

export = PhaserJuice;
