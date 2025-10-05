import VirtualJoystickConst from '../../../plugins/VirtualJoystick/const';

describe('VirtualJoystick Constants', () => {
	it('should export constant values', () => {
		expect(VirtualJoystickConst).toBeDefined();
		expect(typeof VirtualJoystickConst).toBe('object');
	});

	describe('Motion lock constants', () => {
		it('should have NONE constant for full freedom of movement', () => {
			expect(VirtualJoystickConst.NONE).toBe(0);
		});

		it('should have HORIZONTAL constant for horizontal-only movement', () => {
			expect(VirtualJoystickConst.HORIZONTAL).toBe(1);
		});

		it('should have VERTICAL constant for vertical-only movement', () => {
			expect(VirtualJoystickConst.VERTICAL).toBe(2);
		});
	});

	describe('Button shape constants', () => {
		it('should have CIRC_BUTTON constant for circular hit area', () => {
			expect(VirtualJoystickConst.CIRC_BUTTON).toBe(3);
		});

		it('should have RECT_BUTTON constant for rectangular hit area', () => {
			expect(VirtualJoystickConst.RECT_BUTTON).toBe(4);
		});
	});

	it('should have all expected constants', () => {
		const expectedKeys = ['NONE', 'HORIZONTAL', 'VERTICAL', 'CIRC_BUTTON', 'RECT_BUTTON'];
		const actualKeys = Object.keys(VirtualJoystickConst);
		expect(actualKeys.sort()).toEqual(expectedKeys.sort());
	});

	it('should have unique values for all constants', () => {
		const values = Object.values(VirtualJoystickConst);
		const uniqueValues = new Set(values);
		expect(uniqueValues.size).toBe(values.length);
	});
});
