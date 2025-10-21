/**
 * Minimap Plugin for Neverquest
 * Displays a small map in the bottom-left corner of the viewport
 */

import Phaser from 'phaser';

export class NeverquestMinimap {
	scene: Phaser.Scene;
	player: any;
	map: Phaser.Tilemaps.Tilemap;

	// Minimap container
	container!: Phaser.GameObjects.Container;

	// Minimap dimensions
	width: number = 150;
	height: number = 150;
	padding: number = 10;

	// Minimap position (bottom-left)
	x: number;
	y: number;

	// Map rendering
	mapTexture!: Phaser.GameObjects.RenderTexture;
	playerMarker!: Phaser.GameObjects.Graphics;
	border!: Phaser.GameObjects.Graphics;

	// Scale factor for minimap (how much of the map to show)
	mapScale: number = 0.1; // 10% of full map size
	showFullMap: boolean = true; // If true, show entire map; if false, show area around player

	// Debug logging (only log once initially)
	private hasLoggedOnce: boolean = false;

	/**
	 * Creates a new Minimap
	 * @param scene The parent scene
	 * @param player The player object to track
	 * @param map The tilemap to render
	 */
	constructor(scene: Phaser.Scene, player: any, map: Phaser.Tilemaps.Tilemap) {
		this.scene = scene;
		this.player = player;
		this.map = map;

		console.log('[Minimap] Constructor called with:', {
			hasScene: !!scene,
			hasPlayer: !!player,
			hasMap: !!map,
			mapWidth: map?.width,
			mapHeight: map?.height,
			layerCount: map?.layers?.length,
		});

		// Position in bottom-left corner
		this.x = this.padding;
		this.y = this.scene.cameras.main.height - this.height - this.padding;

		this.create();
	}

	/**
	 * Creates the minimap UI
	 */
	create(): void {
		// Create container for minimap
		this.container = this.scene.add.container(this.x, this.y);
		this.container.setScrollFactor(0);
		this.container.setDepth(1000);

		// Create background
		const background = this.scene.add.graphics();
		background.fillStyle(0x000000, 0.7);
		background.fillRect(0, 0, this.width, this.height);

		// Create border
		this.border = this.scene.add.graphics();
		this.border.lineStyle(2, 0xffffff, 0.8);
		this.border.strokeRect(0, 0, this.width, this.height);

		// Create render texture for the map
		this.mapTexture = this.scene.add.renderTexture(0, 0, this.width, this.height);
		this.mapTexture.setOrigin(0, 0); // Set origin to top-left

		// Create player marker (red dot)
		this.playerMarker = this.scene.add.graphics();
		this.playerMarker.fillStyle(0xff0000, 1);
		this.playerMarker.fillCircle(0, 0, 3);

		// Add all to container
		this.container.add([background, this.mapTexture, this.playerMarker, this.border]);

		// Initial render
		this.renderMap();
	}

	/**
	 * Renders the map onto the minimap texture
	 */
	renderMap(): void {
		if (!this.mapTexture || !this.map) {
			console.log('[Minimap] Missing mapTexture or map:', {
				hasTexture: !!this.mapTexture,
				hasMap: !!this.map,
			});
			return;
		}

		this.mapTexture.clear();

		// Calculate visible area around player
		const playerX = this.player.container.x;
		const playerY = this.player.container.y;

		// Use the first available layer to convert world coordinates to tile coordinates
		const firstLayer = this.map.layers.find((l) => l.tilemapLayer)?.tilemapLayer;

		// Convert player world position to tile coordinates using Phaser's built-in methods
		let playerTileX: number;
		let playerTileY: number;

		if (firstLayer && typeof firstLayer.worldToTileX === 'function') {
			// Use Phaser's coordinate conversion (handles map offsets properly)
			playerTileX = firstLayer.worldToTileX(playerX);
			playerTileY = firstLayer.worldToTileY(playerY);
		} else {
			// Fallback to manual calculation
			playerTileX = Math.floor(playerX / this.map.tileWidth);
			playerTileY = Math.floor(playerY / this.map.tileHeight);
		}

		let startX: number, startY: number, endX: number, endY: number;
		let desiredStartX: number, desiredStartY: number, desiredEndX: number, desiredEndY: number;
		let viewRadiusInTiles: number;

		if (this.showFullMap) {
			// Show the entire map
			startX = 0;
			startY = 0;
			endX = this.map.width;
			endY = this.map.height;
			desiredStartX = 0;
			desiredStartY = 0;
			desiredEndX = this.map.width;
			desiredEndY = this.map.height;
			viewRadiusInTiles = Math.max(this.map.width, this.map.height) / 2;
		} else {
			// Show area around player
			const adjustedMapScale = this.mapScale * 1.2;
			viewRadiusInTiles =
				Math.max(this.width, this.height) /
				(2 * adjustedMapScale * Math.max(this.map.tileWidth, this.map.tileHeight));

			desiredStartX = Math.floor(playerTileX - viewRadiusInTiles);
			desiredStartY = Math.floor(playerTileY - viewRadiusInTiles);
			desiredEndX = Math.ceil(playerTileX + viewRadiusInTiles);
			desiredEndY = Math.ceil(playerTileY + viewRadiusInTiles);

			startX = Math.max(0, desiredStartX);
			startY = Math.max(0, desiredStartY);
			endX = Math.min(this.map.width, desiredEndX);
			endY = Math.min(this.map.height, desiredEndY);
		}

		// Only log once for debugging
		if (!this.hasLoggedOnce) {
			console.log('[Minimap] Render bounds:');
			console.log(`  Player world position: (${playerX}, ${playerY})`);
			console.log(`  Player tile position: (${playerTileX}, ${playerTileY})`);
			console.log(`  View radius in tiles: ${viewRadiusInTiles}`);
			console.log(
				`  Desired bounds: start(${desiredStartX}, ${desiredStartY}) end(${desiredEndX}, ${desiredEndY})`
			);
			console.log(`  Clamped bounds: start(${startX}, ${startY}) end(${endX}, ${endY})`);
			console.log(`  Map size: ${this.map.width} x ${this.map.height} tiles`);
			console.log(`  Tile size: ${this.map.tileWidth} x ${this.map.tileHeight} pixels`);
			console.log(`  Layer count: ${this.map.layers.length}`);
		}

		// Calculate how many tiles we're actually showing
		const tileRangeX = endX - startX;
		const tileRangeY = endY - startY;

		// Avoid division by zero
		if (tileRangeX <= 0 || tileRangeY <= 0) {
			console.warn('[Minimap] Invalid tile range:', { tileRangeX, tileRangeY });
			return;
		}

		// Calculate tile scale based on actual visible tile range
		const tileScaleX = this.width / tileRangeX;
		const tileScaleY = this.height / tileRangeY;
		const tileScale = Math.min(tileScaleX, tileScaleY); // Use uniform scale

		// Calculate actual rendered size
		const renderedWidth = tileRangeX * tileScale;
		const renderedHeight = tileRangeY * tileScale;

		// Center the rendered content within the minimap frame
		const centerOffsetX = (this.width - renderedWidth) / 2;
		const centerOffsetY = (this.height - renderedHeight) / 2;

		if (!this.hasLoggedOnce) {
			console.log('[Minimap] Scale calculation:');
			console.log(`  Tile range: ${tileRangeX} x ${tileRangeY}`);
			console.log(`  Minimap size: ${this.width} x ${this.height}`);
			console.log(`  Scale X: ${this.width} / ${tileRangeX} = ${tileScaleX}`);
			console.log(`  Scale Y: ${this.height} / ${tileRangeY} = ${tileScaleY}`);
			console.log(`  Final scale: ${tileScale}`);
			console.log(`  Rendered size: ${renderedWidth} x ${renderedHeight}`);
			console.log(`  Center offsets: (${centerOffsetX}, ${centerOffsetY})`);
		}

		// Create a temporary graphics object for drawing
		const tempGraphics = this.scene.add.graphics();

		// Draw a test rectangle in top-left corner to verify coordinate system
		tempGraphics.fillStyle(0xff0000, 1);
		tempGraphics.fillRect(0, 0, 10, 10);

		let minX = Infinity,
			maxX = -Infinity,
			minY = Infinity,
			maxY = -Infinity;

		// Iterate through all layers to render tiles
		this.map.layers.forEach((layerData, _layerIndex) => {
			const layer = layerData.tilemapLayer;

			// Layer logging disabled to reduce console spam

			if (!layer) return;

			for (let y = startY; y < endY; y++) {
				for (let x = startX; x < endX; x++) {
					const tile = layer.getTileAt(x, y);
					if (tile && tile.index !== -1) {
						// Determine tile color based on collision or layer properties
						let color = 0x228b22; // Floor color (green)

						// Check if tile has collision
						if (
							tile.collides ||
							tile.collideUp ||
							tile.collideDown ||
							tile.collideLeft ||
							tile.collideRight
						) {
							color = 0x8b4513; // Wall color (brown)
						}

						// Check layer name for additional context
						if (layerData.name && layerData.name.toLowerCase().includes('collision')) {
							color = 0x8b4513; // Wall/collision layer (brown)
						} else if (layerData.name && layerData.name.toLowerCase().includes('ground')) {
							// Keep floor color for ground layer if not colliding
							if (!tile.collides) {
								color = 0x228b22;
							}
						}

						// Calculate position on minimap
						// Start from current tile position relative to start, then add center offset
						const relativeX = x - startX;
						const relativeY = y - startY;
						const pixelX = relativeX * tileScale + centerOffsetX;
						const pixelY = relativeY * tileScale + centerOffsetY;

						// Tile calculation (logging disabled to reduce console spam)

						// Only draw if tile is COMPLETELY within minimap bounds
						const tileSize = Math.max(1, tileScale);
						if (
							pixelX >= 0 &&
							pixelX + tileSize <= this.width &&
							pixelY >= 0 &&
							pixelY + tileSize <= this.height
						) {
							// Track actual draw bounds
							minX = Math.min(minX, pixelX);
							maxX = Math.max(maxX, pixelX + tileSize);
							minY = Math.min(minY, pixelY);
							maxY = Math.max(maxY, pixelY + tileSize);

							// Draw rectangle on temp graphics
							tempGraphics.fillStyle(color, 1);
							tempGraphics.fillRect(pixelX, pixelY, tileSize, tileSize);
						}
					}
				}
			}
		});

		// Log actual draw bounds
		if (!this.hasLoggedOnce) {
			console.log('[Minimap] Actual draw bounds:');
			console.log(`  Min: (${minX}, ${minY})`);
			console.log(`  Max: (${maxX}, ${maxY})`);
			console.log(`  Size: ${maxX - minX} x ${maxY - minY}`);
		}

		// Draw the graphics to the render texture
		this.mapTexture.draw(tempGraphics);

		// Clean up temporary graphics
		tempGraphics.destroy();

		// Calculate player marker position (same as tile rendering)
		// Position relative to start, then add center offset
		const relativePlayerX = playerTileX - startX;
		const relativePlayerY = playerTileY - startY;

		// Calculate marker position in pixels
		let markerX = relativePlayerX * tileScale + centerOffsetX;
		let markerY = relativePlayerY * tileScale + centerOffsetY;

		// Keep marker within visible bounds
		const clampedMarkerX = Math.max(5, Math.min(this.width - 5, markerX));
		const clampedMarkerY = Math.max(5, Math.min(this.height - 5, markerY));

		// Debug player position
		if (!this.hasLoggedOnce) {
			console.log('[Minimap] Player position:');
			console.log(`  World position: (${playerX}, ${playerY})`);
			console.log(`  Tile position: (${playerTileX}, ${playerTileY})`);
			console.log(`  View bounds: start(${startX}, ${startY}) end(${endX}, ${endY})`);
			console.log(`  Relative position: (${relativePlayerX}, ${relativePlayerY})`);
			console.log(`  Marker pixel position: (${markerX}, ${markerY})`);
			console.log(`  Clamped marker position: (${clampedMarkerX}, ${clampedMarkerY})`);
			console.log(`  Minimap size: ${this.width} x ${this.height}`);
			console.log(
				`  Marker position as %: (${((clampedMarkerX / this.width) * 100).toFixed(1)}%, ${((clampedMarkerY / this.height) * 100).toFixed(1)}%)`
			);
			this.hasLoggedOnce = true;
		}

		this.playerMarker.setPosition(clampedMarkerX, clampedMarkerY);
	}

	/**
	 * Updates the minimap (call in scene's update loop)
	 */
	update(): void {
		this.renderMap();
	}

	/**
	 * Sets the position of the minimap
	 */
	setPosition(x: number, y: number): void {
		this.x = x;
		this.y = y;
		if (this.container) {
			this.container.setPosition(x, y);
		}
	}

	/**
	 * Resizes the minimap
	 */
	resize(width?: number, height?: number): void {
		if (width) this.width = width;
		if (height) this.height = height;

		// Reposition to bottom-left
		this.x = this.padding;
		this.y = this.scene.cameras.main.height - this.height - this.padding;
		this.setPosition(this.x, this.y);

		// Recreate with new size
		if (this.container) {
			this.container.destroy();
			this.create();
		}
	}

	/**
	 * Destroys the minimap
	 */
	destroy(): void {
		if (this.container) {
			this.container.destroy();
		}
	}
}
