// Mock for phaser3-juice-plugin
class PhaserJuice {
	constructor() {}

	shake(_object, _options) {
		return Promise.resolve();
	}

	flash(_object, _options) {
		return Promise.resolve();
	}

	pulse(_object, _options) {
		return Promise.resolve();
	}

	jump(_object, _options) {
		return Promise.resolve();
	}
}

module.exports = PhaserJuice;
export default PhaserJuice;
