import { LuminusVideoOpener } from '../../plugins/LuminusVideoOpener';

describe('LuminusVideoOpener', () => {
	let opener: LuminusVideoOpener;
	let mockScene: any;
	let mockPlayer: any;

	beforeEach(() => {
		mockPlayer = {
			x: 100,
			y: 100,
		};

		mockScene = {
			scene: {
				launch: jest.fn(),
			},
			player: mockPlayer,
		};

		opener = new LuminusVideoOpener(mockScene);
	});

	describe('Constructor', () => {
		it('should initialize with correct scene', () => {
			expect(opener['scene']).toBe(mockScene);
		});

		it('should set default videoIdProperty to "videoId"', () => {
			expect(opener['videoIdProperty']).toBe('videoId');
		});
	});

	describe('checkHasVideo', () => {
		describe('Video property found', () => {
			it('should launch VideoPlayerScene when videoId property exists', () => {
				const properties = [
					{ name: 'videoId', value: 'abc123' },
					{ name: 'otherProp', value: 'test' },
				];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith('VideoPlayerScene', {
					player: mockPlayer,
					videoId: 'abc123',
				});
			});

			it('should pass correct player reference', () => {
				const properties = [{ name: 'videoId', value: 'xyz789' }];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith(
					'VideoPlayerScene',
					expect.objectContaining({
						player: mockPlayer,
					})
				);
			});

			it('should pass correct videoId value', () => {
				const properties = [{ name: 'videoId', value: 'test-video-id' }];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith(
					'VideoPlayerScene',
					expect.objectContaining({
						videoId: 'test-video-id',
					})
				);
			});

			it('should handle numeric videoId values', () => {
				const properties = [{ name: 'videoId', value: 12345 }];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith('VideoPlayerScene', {
					player: mockPlayer,
					videoId: 12345,
				});
			});

			it('should handle boolean videoId values', () => {
				const properties = [{ name: 'videoId', value: true }];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith('VideoPlayerScene', {
					player: mockPlayer,
					videoId: true,
				});
			});

			it('should use first videoId property when multiple exist', () => {
				const properties = [
					{ name: 'videoId', value: 'first-video' },
					{ name: 'videoId', value: 'second-video' },
				];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith('VideoPlayerScene', {
					player: mockPlayer,
					videoId: 'first-video',
				});
			});

			it('should find videoId property in any position', () => {
				const properties = [
					{ name: 'prop1', value: 'test1' },
					{ name: 'prop2', value: 'test2' },
					{ name: 'videoId', value: 'found-video' },
					{ name: 'prop3', value: 'test3' },
				];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith('VideoPlayerScene', {
					player: mockPlayer,
					videoId: 'found-video',
				});
			});

			it('should handle empty string videoId', () => {
				const properties = [{ name: 'videoId', value: '' }];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith('VideoPlayerScene', {
					player: mockPlayer,
					videoId: '',
				});
			});

			it('should handle zero as videoId', () => {
				const properties = [{ name: 'videoId', value: 0 }];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith('VideoPlayerScene', {
					player: mockPlayer,
					videoId: 0,
				});
			});
		});

		describe('Video property not found', () => {
			it('should not launch scene when videoId property does not exist', () => {
				const properties = [
					{ name: 'otherProp', value: 'test' },
					{ name: 'anotherProp', value: 123 },
				];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).not.toHaveBeenCalled();
			});

			it('should not launch scene when properties array is empty', () => {
				const properties: any[] = [];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).not.toHaveBeenCalled();
			});

			it('should handle properties with similar names', () => {
				const properties = [
					{ name: 'videoIdTest', value: 'test' },
					{ name: 'myVideoId', value: 'test' },
					{ name: 'video_id', value: 'test' },
				];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).not.toHaveBeenCalled();
			});

			it('should be case-sensitive for property name', () => {
				const properties = [
					{ name: 'VideoId', value: 'test' },
					{ name: 'VIDEOID', value: 'test' },
					{ name: 'videoid', value: 'test' },
				];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).not.toHaveBeenCalled();
			});
		});

		describe('Multiple calls', () => {
			it('should handle multiple checkHasVideo calls', () => {
				const properties1 = [{ name: 'videoId', value: 'video1' }];
				const properties2 = [{ name: 'videoId', value: 'video2' }];

				opener.checkHasVideo(properties1);
				opener.checkHasVideo(properties2);

				expect(mockScene.scene.launch).toHaveBeenCalledTimes(2);
				expect(mockScene.scene.launch).toHaveBeenNthCalledWith(1, 'VideoPlayerScene', {
					player: mockPlayer,
					videoId: 'video1',
				});
				expect(mockScene.scene.launch).toHaveBeenNthCalledWith(2, 'VideoPlayerScene', {
					player: mockPlayer,
					videoId: 'video2',
				});
			});

			it('should handle alternating found/not found properties', () => {
				const propertiesWithVideo = [{ name: 'videoId', value: 'video1' }];
				const propertiesWithoutVideo = [{ name: 'other', value: 'test' }];

				opener.checkHasVideo(propertiesWithVideo);
				opener.checkHasVideo(propertiesWithoutVideo);
				opener.checkHasVideo(propertiesWithVideo);

				expect(mockScene.scene.launch).toHaveBeenCalledTimes(2);
			});
		});

		describe('Integration', () => {
			it('should handle complete video triggering flow', () => {
				// Simulate Tiled object properties
				const tiledObjectProperties = [
					{ name: 'type', value: 'trigger' },
					{ name: 'videoId', value: 'intro-cutscene' },
					{ name: 'width', value: 32 },
					{ name: 'height', value: 32 },
				];

				opener.checkHasVideo(tiledObjectProperties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith('VideoPlayerScene', {
					player: mockPlayer,
					videoId: 'intro-cutscene',
				});
				expect(mockScene.scene.launch).toHaveBeenCalledTimes(1);
			});

			it('should work with different player states', () => {
				const differentPlayer = { x: 500, y: 250, health: 100 };
				mockScene.player = differentPlayer;

				const properties = [{ name: 'videoId', value: 'test' }];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith('VideoPlayerScene', {
					player: differentPlayer,
					videoId: 'test',
				});
			});
		});

		describe('Edge Cases', () => {
			it('should handle property with videoId name but no value', () => {
				const properties = [{ name: 'videoId', value: undefined as any }];

				opener.checkHasVideo(properties);

				// Should still launch since property.name exists
				expect(mockScene.scene.launch).toHaveBeenCalled();
			});

			it('should handle property with videoId name but null value', () => {
				const properties = [{ name: 'videoId', value: null as any }];

				opener.checkHasVideo(properties);

				// Should still launch since property.name exists
				expect(mockScene.scene.launch).toHaveBeenCalled();
			});

			it('should handle very long videoId strings', () => {
				const longVideoId = 'a'.repeat(1000);
				const properties = [{ name: 'videoId', value: longVideoId }];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith('VideoPlayerScene', {
					player: mockPlayer,
					videoId: longVideoId,
				});
			});

			it('should handle special characters in videoId', () => {
				const specialVideoId = 'video-id_with.special@chars#123!';
				const properties = [{ name: 'videoId', value: specialVideoId }];

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith('VideoPlayerScene', {
					player: mockPlayer,
					videoId: specialVideoId,
				});
			});

			it('should handle large property arrays', () => {
				const properties = [];
				for (let i = 0; i < 1000; i++) {
					properties.push({ name: `prop${i}`, value: i });
				}
				properties.push({ name: 'videoId', value: 'found' });

				opener.checkHasVideo(properties);

				expect(mockScene.scene.launch).toHaveBeenCalledWith('VideoPlayerScene', {
					player: mockPlayer,
					videoId: 'found',
				});
			});
		});
	});
});
