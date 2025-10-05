import { IconNamesConst } from '../../../consts/UI/IconNames';

describe('IconNamesConst', () => {
	it('should export IconNamesConst object', () => {
		expect(IconNamesConst).toBeDefined();
		expect(typeof IconNamesConst).toBe('object');
	});

	describe('HUDScene icons', () => {
		it('should have HUDScene property', () => {
			expect(IconNamesConst).toHaveProperty('HUDScene');
		});

		it('should have inventory icons for all platforms', () => {
			const inventory = IconNamesConst.HUDScene.inventory;
			expect(inventory).toHaveProperty('desktop');
			expect(inventory).toHaveProperty('xbox');
			expect(inventory).toHaveProperty('playstation');
			expect(inventory).toHaveProperty('mobile');
		});

		it('should have attributes icons for all platforms', () => {
			const attributes = IconNamesConst.HUDScene.attributes;
			expect(attributes).toHaveProperty('desktop');
			expect(attributes).toHaveProperty('xbox');
			expect(attributes).toHaveProperty('playstation');
			expect(attributes).toHaveProperty('mobile');
		});

		it('should have valid desktop icon names', () => {
			expect(IconNamesConst.HUDScene.inventory.desktop).toBe('inventory_shortcut');
			expect(IconNamesConst.HUDScene.attributes.desktop).toBe('attributes_shortcut_icon');
		});

		it('should have valid xbox icon names', () => {
			expect(IconNamesConst.HUDScene.inventory.xbox).toBe('buttonXboxWindows');
			expect(IconNamesConst.HUDScene.attributes.xbox).toBe('XboxOne_Menu');
		});
	});
});
