import AnimatedTiles from '../../plugins/AnimatedTiles';

describe('AnimatedTiles', () => {
	let plugin: AnimatedTiles;
	let mockScene: any;
	let mockPluginManager: any;
	let mockMap: any;
	let mockTileset: any;
	let mockTile: any;
	let mockLayer: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockTile = {
			index: 1,
		};

		mockLayer = {
			data: [[mockTile]],
			tilemapLayer: { type: 'DynamicTilemapLayer' },
		};

		mockTileset = {
			firstgid: 1,
			tileData: {
				0: {
					animation: [
						{ tileid: 0, duration: 100 },
						{ tileid: 1, duration: 200 },
					],
				},
			},
		};

		mockMap = {
			tilesets: [mockTileset],
			layers: [mockLayer],
			width: 10,
			height: 10,
		};

		mockScene = {
			sys: {
				settings: {
					isBooted: true,
				},
				events: {
					on: jest.fn(),
					once: jest.fn(),
				},
			},
			time: {
				timeScale: 1,
			},
		};

		mockPluginManager = {
			register: jest.fn(),
		};

		plugin = new AnimatedTiles(mockScene, mockPluginManager);

		// Set up plugin systems (inherited from ScenePlugin)
		(plugin as any).systems = mockScene.sys;
		(plugin as any).scene = mockScene;
	});

	describe('Constructor', () => {
		it('should initialize with null map', () => {
			expect(plugin.map).toBeNull();
		});

		it('should initialize with empty animatedTiles array', () => {
			expect(plugin.animatedTiles).toEqual([]);
		});

		it('should set default rate to 1', () => {
			expect(plugin.rate).toBe(1);
		});

		it('should initialize as inactive', () => {
			expect(plugin.active).toBe(false);
		});

		it('should initialize with empty activeLayer array', () => {
			expect(plugin.activeLayer).toEqual([]);
		});

		it('should set followTimeScale to true by default', () => {
			expect(plugin.followTimeScale).toBe(true);
		});

		it('should register boot event when scene not booted', () => {
			const unbootedScene: any = {
				sys: {
					settings: {
						isBooted: false,
					},
					events: {
						once: jest.fn(),
					},
				},
			};

			new AnimatedTiles(unbootedScene, mockPluginManager);

			expect(unbootedScene.sys.events.once).toHaveBeenCalledWith('boot', expect.any(Function), expect.anything());
		});
	});

	describe('boot', () => {
		it('should register postupdate event listener', () => {
			plugin.boot();

			expect(mockScene.sys.events.on).toHaveBeenCalledWith('postupdate', plugin.postUpdate, plugin);
		});

		it('should register shutdown event listener', () => {
			plugin.boot();

			expect(mockScene.sys.events.on).toHaveBeenCalledWith('shutdown', plugin.shutdown, plugin);
		});

		it('should register destroy event listener', () => {
			plugin.boot();

			expect(mockScene.sys.events.on).toHaveBeenCalledWith('destroy', plugin.destroy, plugin);
		});
	});

	describe('init', () => {
		it('should push map animation data to animatedTiles', () => {
			plugin.init(mockMap);

			expect(plugin.animatedTiles).toHaveLength(1);
			expect(plugin.animatedTiles[0].map).toBe(mockMap);
		});

		it('should set active to true for map animation data', () => {
			plugin.init(mockMap);

			expect(plugin.animatedTiles[0].active).toBe(true);
		});

		it('should set rate to 1 for map animation data', () => {
			plugin.init(mockMap);

			expect(plugin.animatedTiles[0].rate).toBe(1);
		});

		it('should initialize activeLayer array with true for each layer', () => {
			plugin.init(mockMap);

			expect(plugin.animatedTiles[0].activeLayer).toEqual([true]);
		});

		it('should activate plugin when first map is added', () => {
			plugin.init(mockMap);

			expect(plugin.active).toBe(true);
		});

		it('should not change plugin active state when adding second map', () => {
			plugin.init(mockMap);
			plugin.active = false;
			plugin.init(mockMap);

			expect(plugin.active).toBe(false);
		});

		it('should call getAnimatedTiles with map', () => {
			const spy = jest.spyOn(plugin, 'getAnimatedTiles');

			plugin.init(mockMap);

			expect(spy).toHaveBeenCalledWith(mockMap);
		});
	});

	describe('setRate', () => {
		beforeEach(() => {
			plugin.init(mockMap);
		});

		it('should set global rate when no arguments provided', () => {
			plugin.setRate(2);

			expect(plugin.rate).toBe(2);
		});

		it('should set map rate when map index provided', () => {
			plugin.setRate(2, null, 0);

			expect(plugin.animatedTiles[0].rate).toBe(2);
		});

		it('should set tile rate when gid provided', () => {
			const gid = plugin.animatedTiles[0].animatedTiles[0].index;

			plugin.setRate(3, gid);

			expect(plugin.animatedTiles[0].animatedTiles[0].rate).toBe(3);
		});

		it('should set tile rate for specific map when both gid and map provided', () => {
			const gid = plugin.animatedTiles[0].animatedTiles[0].index;

			plugin.setRate(3, gid, 0);

			expect(plugin.animatedTiles[0].animatedTiles[0].rate).toBe(3);
		});

		it('should handle fractional rates', () => {
			plugin.setRate(0.5);

			expect(plugin.rate).toBe(0.5);
		});
	});

	describe('resetRates', () => {
		beforeEach(() => {
			plugin.init(mockMap);
		});

		it('should reset global rate to 1', () => {
			plugin.rate = 2;
			plugin.resetRates();

			expect(plugin.rate).toBe(1);
		});

		it('should reset all map rates to 1', () => {
			plugin.animatedTiles[0].rate = 2;
			plugin.resetRates();

			expect(plugin.animatedTiles[0].rate).toBe(1);
		});

		it('should reset all tile rates to 1', () => {
			plugin.animatedTiles[0].animatedTiles[0].rate = 2;
			plugin.resetRates();

			expect(plugin.animatedTiles[0].animatedTiles[0].rate).toBe(1);
		});

		it('should reset specific map rates when mapIndex provided', () => {
			plugin.rate = 5; // This should not be reset
			plugin.animatedTiles[0].rate = 2;
			plugin.resetRates(0);

			expect(plugin.rate).toBe(5);
			expect(plugin.animatedTiles[0].rate).toBe(1);
		});
	});

	describe('resume', () => {
		beforeEach(() => {
			plugin.init(mockMap);
			plugin.active = false;
			plugin.animatedTiles[0].active = false;
		});

		it('should activate plugin when no arguments', () => {
			plugin.resume();

			expect(plugin.active).toBe(true);
		});

		it('should activate specific layer when layerIndex provided', () => {
			plugin.animatedTiles[0].activeLayer[0] = false;

			plugin.resume(0, 0);

			expect(plugin.animatedTiles[0].activeLayer[0]).toBe(true);
		});

		it('should activate specific map layer when both layerIndex and mapIndex provided', () => {
			plugin.animatedTiles[0].activeLayer[0] = false;

			plugin.resume(0, 0);

			expect(plugin.animatedTiles[0].activeLayer[0]).toBe(true);
		});

		it('should update layer when resuming specific layer', () => {
			const spy = jest.spyOn(plugin, 'updateLayer');

			plugin.resume(0, 0);

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('pause', () => {
		beforeEach(() => {
			plugin.init(mockMap);
		});

		it('should deactivate plugin when no arguments', () => {
			plugin.pause();

			expect(plugin.active).toBe(false);
		});

		it('should deactivate specific layer when layerIndex provided', () => {
			plugin.pause(0);

			expect(plugin.activeLayer[0]).toBe(false);
		});

		it('should deactivate specific map layer when both layerIndex and mapIndex provided', () => {
			plugin.pause(0, 0);

			expect(plugin.animatedTiles[0].activeLayer[0]).toBe(false);
		});
	});

	describe('postUpdate', () => {
		beforeEach(() => {
			plugin.init(mockMap);
		});

		it('should do nothing when plugin is not active', () => {
			plugin.active = false;
			const initialFrame = plugin.animatedTiles[0].animatedTiles[0].currentFrame;

			plugin.postUpdate(0, 200);

			expect(plugin.animatedTiles[0].animatedTiles[0].currentFrame).toBe(initialFrame);
		});

		it('should do nothing when map is not active', () => {
			plugin.animatedTiles[0].active = false;
			const initialFrame = plugin.animatedTiles[0].animatedTiles[0].currentFrame;

			plugin.postUpdate(0, 200);

			expect(plugin.animatedTiles[0].animatedTiles[0].currentFrame).toBe(initialFrame);
		});

		it('should reduce next time by elapsed time', () => {
			const initialNext = plugin.animatedTiles[0].animatedTiles[0].next!;

			plugin.postUpdate(0, 10);

			expect(plugin.animatedTiles[0].animatedTiles[0].next).toBe(initialNext - 10);
		});

		it('should advance to next frame when time is up', () => {
			plugin.animatedTiles[0].animatedTiles[0].next = 10;

			plugin.postUpdate(0, 20);

			expect(plugin.animatedTiles[0].animatedTiles[0].currentFrame).toBe(1);
		});

		it('should wrap to first frame after last frame', () => {
			plugin.animatedTiles[0].animatedTiles[0].currentFrame = 1; // Last frame
			plugin.animatedTiles[0].animatedTiles[0].next = 10;

			plugin.postUpdate(0, 20);

			expect(plugin.animatedTiles[0].animatedTiles[0].currentFrame).toBe(0);
		});

		it('should respect global rate', () => {
			plugin.rate = 2;
			const initialNext = plugin.animatedTiles[0].animatedTiles[0].next!;

			plugin.postUpdate(0, 10);

			expect(plugin.animatedTiles[0].animatedTiles[0].next).toBe(initialNext - 20);
		});

		it('should respect map rate', () => {
			plugin.animatedTiles[0].rate = 2;
			const initialNext = plugin.animatedTiles[0].animatedTiles[0].next!;

			plugin.postUpdate(0, 10);

			expect(plugin.animatedTiles[0].animatedTiles[0].next).toBe(initialNext - 20);
		});

		it('should respect tile rate', () => {
			plugin.animatedTiles[0].animatedTiles[0].rate = 2;
			const initialNext = plugin.animatedTiles[0].animatedTiles[0].next!;

			plugin.postUpdate(0, 10);

			expect(plugin.animatedTiles[0].animatedTiles[0].next).toBe(initialNext - 20);
		});

		it('should respect time scale when followTimeScale is true', () => {
			mockScene.time.timeScale = 0.5;
			plugin.followTimeScale = true;
			const initialNext = plugin.animatedTiles[0].animatedTiles[0].next!;

			plugin.postUpdate(0, 10);

			expect(plugin.animatedTiles[0].animatedTiles[0].next).toBe(initialNext - 5);
		});

		it('should ignore time scale when followTimeScale is false', () => {
			mockScene.time.timeScale = 0.5;
			plugin.followTimeScale = false;
			const initialNext = plugin.animatedTiles[0].animatedTiles[0].next!;

			plugin.postUpdate(0, 10);

			expect(plugin.animatedTiles[0].animatedTiles[0].next).toBe(initialNext - 10);
		});

		it('should update tiles when advancing frame', () => {
			const spy = jest.spyOn(plugin, 'updateLayer');
			plugin.animatedTiles[0].animatedTiles[0].next = 10;

			plugin.postUpdate(0, 20);

			expect(spy).toHaveBeenCalled();
		});

		it('should not update inactive layers', () => {
			plugin.animatedTiles[0].activeLayer[0] = false;
			plugin.animatedTiles[0].animatedTiles[0].next = 10;
			const updateSpy = jest.spyOn(plugin, 'updateLayer');

			plugin.postUpdate(0, 20);

			expect(updateSpy).not.toHaveBeenCalled();
		});
	});

	describe('updateLayer', () => {
		let animatedTile: any;
		let layer: any;

		beforeEach(() => {
			plugin.init(mockMap);
			animatedTile = plugin.animatedTiles[0].animatedTiles[0];
			layer = [{ index: 1 }, { index: 1 }];
		});

		it('should update tile index to current frame', () => {
			animatedTile.currentFrame = 1;

			plugin.updateLayer(animatedTile, layer);

			expect(layer[0].index).toBe(animatedTile.frames[1].tileid);
		});

		it('should update all tiles in layer', () => {
			animatedTile.currentFrame = 1;

			plugin.updateLayer(animatedTile, layer);

			expect(layer[0].index).toBe(animatedTile.frames[1].tileid);
			expect(layer[1].index).toBe(animatedTile.frames[1].tileid);
		});

		it('should remove tiles with different index when oldTileId provided', () => {
			const wrongTile = { index: 999 };
			layer.push(wrongTile);

			plugin.updateLayer(animatedTile, layer, 1);

			expect(layer.includes(wrongTile)).toBe(false);
		});

		it('should remove null tiles when oldTileId provided', () => {
			layer.push(null);

			plugin.updateLayer(animatedTile, layer, 1);

			expect(layer.includes(null)).toBe(false);
		});

		it('should not remove tiles when oldTileId not provided', () => {
			const initialLength = layer.length;

			plugin.updateLayer(animatedTile, layer);

			expect(layer.length).toBe(initialLength);
		});
	});

	describe('getAnimatedTiles', () => {
		it('should return array of animated tile data', () => {
			const result = plugin.getAnimatedTiles(mockMap);

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
		});

		it('should extract animation frames from tileset data', () => {
			const result = plugin.getAnimatedTiles(mockMap);

			expect(result[0].frames).toHaveLength(2);
		});

		it('should set correct tile index with firstgid offset', () => {
			const result = plugin.getAnimatedTiles(mockMap);

			expect(result[0].index).toBe(1); // 0 + firstgid(1)
		});

		it('should set frame tileids with firstgid offset', () => {
			const result = plugin.getAnimatedTiles(mockMap);

			expect(result[0].frames[0].tileid).toBe(1); // 0 + firstgid(1)
			expect(result[0].frames[1].tileid).toBe(2); // 1 + firstgid(1)
		});

		it('should find tiles in layer data', () => {
			const result = plugin.getAnimatedTiles(mockMap);

			expect(result[0].tiles[0]).toContain(mockTile);
		});

		it('should skip static layers', () => {
			mockMap.layers[0].tilemapLayer.type = 'StaticTilemapLayer';

			const result = plugin.getAnimatedTiles(mockMap);

			expect(result[0].tiles[0]).toEqual([]);
		});

		it('should set all layers as active', () => {
			plugin.getAnimatedTiles(mockMap);

			expect(plugin.activeLayer[0]).toBe(true);
		});

		it('should handle multiple tilesets', () => {
			mockMap.tilesets.push({
				firstgid: 10,
				tileData: {
					0: {
						animation: [{ tileid: 0, duration: 100 }],
					},
				},
			});

			const result = plugin.getAnimatedTiles(mockMap);

			expect(result.length).toBeGreaterThan(1);
		});
	});

	describe('destroy', () => {
		it('should call shutdown', () => {
			const spy = jest.spyOn(plugin, 'shutdown');

			plugin.destroy();

			expect(spy).toHaveBeenCalled();
		});

		it('should clear scene reference', () => {
			plugin.destroy();

			expect((plugin as any).scene).toBeUndefined();
		});
	});

	describe('Integration', () => {
		it('should handle complete animation cycle', () => {
			plugin.init(mockMap);
			const initialFrame = plugin.animatedTiles[0].animatedTiles[0].currentFrame;

			// Advance past first frame duration
			plugin.postUpdate(0, 150);

			expect(plugin.animatedTiles[0].animatedTiles[0].currentFrame).not.toBe(initialFrame);
		});

		it('should handle pause and resume', () => {
			plugin.init(mockMap);

			plugin.pause();
			expect(plugin.active).toBe(false);

			plugin.resume();
			expect(plugin.active).toBe(true);
		});

		it('should handle rate changes', () => {
			plugin.init(mockMap);

			plugin.setRate(2);
			expect(plugin.rate).toBe(2);

			plugin.resetRates();
			expect(plugin.rate).toBe(1);
		});

		it('should handle multiple maps', () => {
			plugin.init(mockMap);
			plugin.init(mockMap);

			expect(plugin.animatedTiles).toHaveLength(2);
		});
	});
});
