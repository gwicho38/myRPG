import { NeverquestObjectMarker } from '../../plugins/NeverquestObjectMarker';

describe('NeverquestObjectMarker', () => {
	let marker: NeverquestObjectMarker;
	let mockScene: any;
	let mockMap: any;
	let mockImage: any;

	beforeEach(() => {
		mockImage = {
			setDepth: jest.fn().mockReturnThis(),
		};

		mockScene = {
			add: {
				image: jest.fn(() => mockImage),
			},
		};

		mockMap = {
			getObjectLayer: jest.fn(),
		};

		marker = new NeverquestObjectMarker(mockScene, mockMap);
	});

	describe('Constructor', () => {
		it('should initialize with correct scene', () => {
			expect(marker.scene).toBe(mockScene);
		});

		it('should initialize with correct map', () => {
			expect(marker.map).toBe(mockMap);
		});

		it('should set default tiledObjectLayer to "markers"', () => {
			expect(marker.tiledObjectLayer).toBe('markers');
		});

		it('should set default markerSpriteName to "question_mark"', () => {
			expect(marker.markerSpriteName).toBe('question_mark');
		});

		it('should allow customizing tiledObjectLayer', () => {
			marker.tiledObjectLayer = 'custom_markers';

			expect(marker.tiledObjectLayer).toBe('custom_markers');
		});

		it('should allow customizing markerSpriteName', () => {
			marker.markerSpriteName = 'exclamation_mark';

			expect(marker.markerSpriteName).toBe('exclamation_mark');
		});
	});

	describe('create', () => {
		describe('With objects', () => {
			it('should get object layer from map', () => {
				mockMap.getObjectLayer.mockReturnValue({ objects: [] });

				marker.create();

				expect(mockMap.getObjectLayer).toHaveBeenCalledWith('markers');
			});

			it('should create image for object with x and y coordinates', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [{ x: 100, y: 200 }],
				});

				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledWith(100, 200, 'question_mark');
			});

			it('should set depth to 2 for created image', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [{ x: 100, y: 200 }],
				});

				marker.create();

				expect(mockImage.setDepth).toHaveBeenCalledWith(2);
			});

			it('should create images for multiple objects', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [
						{ x: 100, y: 200 },
						{ x: 150, y: 250 },
						{ x: 200, y: 300 },
					],
				});

				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledTimes(3);
				expect(mockScene.add.image).toHaveBeenCalledWith(100, 200, 'question_mark');
				expect(mockScene.add.image).toHaveBeenCalledWith(150, 250, 'question_mark');
				expect(mockScene.add.image).toHaveBeenCalledWith(200, 300, 'question_mark');
			});

			it('should handle objects at origin (0, 0)', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [{ x: 0, y: 0 }],
				});

				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledWith(0, 0, 'question_mark');
			});

			it('should handle negative coordinates', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [{ x: -100, y: -200 }],
				});

				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledWith(-100, -200, 'question_mark');
			});

			it('should handle decimal coordinates', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [{ x: 100.5, y: 200.75 }],
				});

				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledWith(100.5, 200.75, 'question_mark');
			});

			it('should use custom tiledObjectLayer name', () => {
				marker.tiledObjectLayer = 'custom_layer';
				mockMap.getObjectLayer.mockReturnValue({ objects: [] });

				marker.create();

				expect(mockMap.getObjectLayer).toHaveBeenCalledWith('custom_layer');
			});

			it('should use custom markerSpriteName', () => {
				marker.markerSpriteName = 'exclamation';
				mockMap.getObjectLayer.mockReturnValue({
					objects: [{ x: 100, y: 200 }],
				});

				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledWith(100, 200, 'exclamation');
			});
		});

		describe('With missing coordinates', () => {
			it('should skip object when x is undefined', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [{ y: 200 }],
				});

				marker.create();

				expect(mockScene.add.image).not.toHaveBeenCalled();
			});

			it('should skip object when y is undefined', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [{ x: 100 }],
				});

				marker.create();

				expect(mockScene.add.image).not.toHaveBeenCalled();
			});

			it('should skip object when both x and y are undefined', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [{}],
				});

				marker.create();

				expect(mockScene.add.image).not.toHaveBeenCalled();
			});

			it('should create images only for objects with valid coordinates', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [
						{ x: 100, y: 200 }, // Valid
						{ x: 150 }, // Missing y
						{ y: 250 }, // Missing x
						{ x: 200, y: 300 }, // Valid
					],
				});

				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledTimes(2);
				expect(mockScene.add.image).toHaveBeenCalledWith(100, 200, 'question_mark');
				expect(mockScene.add.image).toHaveBeenCalledWith(200, 300, 'question_mark');
			});
		});

		describe('Edge Cases', () => {
			it('should handle null object layer', () => {
				mockMap.getObjectLayer.mockReturnValue(null);

				expect(() => marker.create()).not.toThrow();
				expect(mockScene.add.image).not.toHaveBeenCalled();
			});

			it('should handle undefined object layer', () => {
				mockMap.getObjectLayer.mockReturnValue(undefined);

				expect(() => marker.create()).not.toThrow();
				expect(mockScene.add.image).not.toHaveBeenCalled();
			});

			it('should handle object layer without objects property', () => {
				mockMap.getObjectLayer.mockReturnValue({});

				expect(() => marker.create()).not.toThrow();
				expect(mockScene.add.image).not.toHaveBeenCalled();
			});

			it('should handle empty objects array', () => {
				mockMap.getObjectLayer.mockReturnValue({ objects: [] });

				marker.create();

				expect(mockScene.add.image).not.toHaveBeenCalled();
			});

			it('should handle large number of objects', () => {
				const objects = [];
				for (let i = 0; i < 1000; i++) {
					objects.push({ x: i, y: i });
				}
				mockMap.getObjectLayer.mockReturnValue({ objects });

				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledTimes(1000);
			});

			it('should handle very large coordinates', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [{ x: 999999, y: 999999 }],
				});

				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledWith(999999, 999999, 'question_mark');
			});
		});

		describe('Multiple create calls', () => {
			it('should create images on each call', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [{ x: 100, y: 200 }],
				});

				marker.create();
				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledTimes(2);
			});

			it('should handle different object layers on subsequent calls', () => {
				mockMap.getObjectLayer.mockReturnValueOnce({
					objects: [{ x: 100, y: 200 }],
				});
				mockMap.getObjectLayer.mockReturnValueOnce({
					objects: [{ x: 300, y: 400 }],
				});

				marker.create();
				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledWith(100, 200, 'question_mark');
				expect(mockScene.add.image).toHaveBeenCalledWith(300, 400, 'question_mark');
			});

			it('should respect property changes between calls', () => {
				marker.markerSpriteName = 'sprite1';
				mockMap.getObjectLayer.mockReturnValue({
					objects: [{ x: 100, y: 200 }],
				});

				marker.create();

				marker.markerSpriteName = 'sprite2';
				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledWith(100, 200, 'sprite1');
				expect(mockScene.add.image).toHaveBeenCalledWith(100, 200, 'sprite2');
			});
		});

		describe('Integration', () => {
			it('should handle complete marker creation flow', () => {
				marker.tiledObjectLayer = 'npc_markers';
				marker.markerSpriteName = 'talk_icon';

				mockMap.getObjectLayer.mockReturnValue({
					objects: [
						{ x: 100, y: 200, name: 'NPC1' },
						{ x: 150, y: 250, name: 'NPC2' },
					],
				});

				marker.create();

				expect(mockMap.getObjectLayer).toHaveBeenCalledWith('npc_markers');
				expect(mockScene.add.image).toHaveBeenCalledTimes(2);
				expect(mockScene.add.image).toHaveBeenCalledWith(100, 200, 'talk_icon');
				expect(mockScene.add.image).toHaveBeenCalledWith(150, 250, 'talk_icon');
				expect(mockImage.setDepth).toHaveBeenCalledTimes(2);
				expect(mockImage.setDepth).toHaveBeenCalledWith(2);
			});

			it('should handle mixed valid and invalid objects', () => {
				mockMap.getObjectLayer.mockReturnValue({
					objects: [
						{ x: 100, y: 200 }, // Valid
						{ x: 150 }, // Invalid - missing y
						{ name: 'test' }, // Invalid - missing both
						{ x: 200, y: 300 }, // Valid
						{ y: 400 }, // Invalid - missing x
					],
				});

				marker.create();

				expect(mockScene.add.image).toHaveBeenCalledTimes(2);
			});
		});
	});
});
