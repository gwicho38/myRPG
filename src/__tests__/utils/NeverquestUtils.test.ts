import { NeverquestUtils } from '../../utils/NeverquestUtils';

describe('NeverquestUtils', () => {
	describe('isMobile', () => {
		let originalUserAgent: string;
		let originalVendor: string;

		beforeEach(() => {
			// Save original values
			originalUserAgent = navigator.userAgent;
			originalVendor = navigator.vendor;
		});

		afterEach(() => {
			// Restore original values
			Object.defineProperty(navigator, 'userAgent', {
				value: originalUserAgent,
				writable: true,
				configurable: true,
			});
			Object.defineProperty(navigator, 'vendor', {
				value: originalVendor,
				writable: true,
				configurable: true,
			});
		});

		it('should return false for desktop user agent', () => {
			Object.defineProperty(navigator, 'userAgent', {
				value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				writable: true,
				configurable: true,
			});

			expect(NeverquestUtils.isMobile()).toBe(false);
		});

		it('should return true for iPhone user agent', () => {
			Object.defineProperty(navigator, 'userAgent', {
				value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
				writable: true,
				configurable: true,
			});

			expect(NeverquestUtils.isMobile()).toBe(true);
		});

		it('should return true for Android mobile user agent', () => {
			Object.defineProperty(navigator, 'userAgent', {
				value: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Mobile',
				writable: true,
				configurable: true,
			});

			expect(NeverquestUtils.isMobile()).toBe(true);
		});

		it('should return true for iPod user agent', () => {
			Object.defineProperty(navigator, 'userAgent', {
				value: 'Mozilla/5.0 (iPod; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15',
				writable: true,
				configurable: true,
			});

			expect(NeverquestUtils.isMobile()).toBe(true);
		});

		it('should return true for Android tablet user agent', () => {
			Object.defineProperty(navigator, 'userAgent', {
				value: 'Mozilla/5.0 (Linux; Android 9; SM-T830) AppleWebKit/537.36 Mobile',
				writable: true,
				configurable: true,
			});

			expect(NeverquestUtils.isMobile()).toBe(true);
		});

		it('should return false for Mac desktop user agent', () => {
			Object.defineProperty(navigator, 'userAgent', {
				value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
				writable: true,
				configurable: true,
			});

			expect(NeverquestUtils.isMobile()).toBe(false);
		});

		it('should return false for Linux desktop user agent', () => {
			Object.defineProperty(navigator, 'userAgent', {
				value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
				writable: true,
				configurable: true,
			});

			expect(NeverquestUtils.isMobile()).toBe(false);
		});
	});

	describe('executeFunctionByName', () => {
		it('should execute a simple function', () => {
			const context = {
				testFunc: jest.fn().mockReturnValue('result'),
			};

			const result = NeverquestUtils.executeFunctionByName('testFunc', context);

			expect(context.testFunc).toHaveBeenCalled();
			expect(result).toBe('result');
		});

		it('should execute a function with arguments', () => {
			const context = {
				add: (a: number, b: number) => a + b,
			};

			const result = NeverquestUtils.executeFunctionByName('add', context, 5, 3);

			expect(result).toBe(8);
		});

		it('should execute a nested function', () => {
			const context = {
				nested: {
					deepFunc: jest.fn().mockReturnValue('deep result'),
				},
			};

			const result = NeverquestUtils.executeFunctionByName('nested.deepFunc', context);

			expect(context.nested.deepFunc).toHaveBeenCalled();
			expect(result).toBe('deep result');
		});

		it('should execute a deeply nested function', () => {
			const context = {
				level1: {
					level2: {
						level3: {
							func: (x: number) => x * 2,
						},
					},
				},
			};

			const result = NeverquestUtils.executeFunctionByName('level1.level2.level3.func', context, 10);

			expect(result).toBe(20);
		});

		it('should pass multiple arguments correctly', () => {
			const context = {
				multiply: (a: number, b: number, c: number) => a * b * c,
			};

			const result = NeverquestUtils.executeFunctionByName('multiply', context, 2, 3, 4);

			expect(result).toBe(24);
		});

		it('should return null when function name is empty', () => {
			const context = {
				testFunc: jest.fn(),
			};

			const result = NeverquestUtils.executeFunctionByName('', context);

			expect(result).toBe(null);
			expect(context.testFunc).not.toHaveBeenCalled();
		});

		it('should handle context with this binding', () => {
			const context = {
				value: 42,
				getValue: function () {
					return this.value;
				},
			};

			const result = NeverquestUtils.executeFunctionByName('getValue', context);

			expect(result).toBe(42);
		});

		it('should work with array methods', () => {
			const context = {
				arr: [1, 2, 3, 4, 5],
			};

			const result = NeverquestUtils.executeFunctionByName('arr.filter', context, (x: number) => x > 2);

			expect(result).toEqual([3, 4, 5]);
		});

		it('should handle functions that return objects', () => {
			const context = {
				getObject: () => ({ foo: 'bar', baz: 123 }),
			};

			const result = NeverquestUtils.executeFunctionByName('getObject', context);

			expect(result).toEqual({ foo: 'bar', baz: 123 });
		});

		it('should handle functions that return undefined', () => {
			const context = {
				noReturn: () => {},
			};

			const result = NeverquestUtils.executeFunctionByName('noReturn', context);

			expect(result).toBeUndefined();
		});
	});
});
