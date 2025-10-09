/**
 * Minimap Plugin for Luminus RPG
 * Displays a small map in the bottom-left corner of the viewport
 */

import Phaser from 'phaser';

export class LuminusMinimap {
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

		// Calculate map area to show (centered on player)
		const viewRadius = Math.max(this.width, this.height) / (2 * this.mapScale);

		const startX = Math.max(0, Math.floor((playerX - viewRadius) / this.map.tileWidth));
		const startY = Math.max(0, Math.floor((playerY - viewRadius) / this.map.tileHeight));
		const endX = Math.min(this.map.width, Math.ceil((playerX + viewRadius) / this.map.tileWidth));
		const endY = Math.min(this.map.height, Math.ceil((playerY + viewRadius) / this.map.tileHeight));

		// Only log once for debugging
		if (!this.hasLoggedOnce) {
			console.log('[Minimap] Render bounds:', {
				playerPos: { x: playerX, y: playerY },
				bounds: { startX, startY, endX, endY },
				mapSize: { width: this.map.width, height: this.map.height },
				tileSize: { width: this.map.tileWidth, height: this.map.tileHeight },
				layerCount: this.map.layers.length,
			});
		}

		// Draw tiles as colored pixels
		const tileScale = (this.width / (endX - startX)) * 0.9; // Slight margin
		let tilesRendered = 0;

		// Create a temporary graphics object for drawing
		const tempGraphics = this.scene.add.graphics();

		// Iterate through all layers to render tiles
		this.map.layers.forEach((layerData, layerIndex) => {
			const layer = layerData.tilemapLayer;

			if (!this.hasLoggedOnce) {
				console.log(`[Minimap] Layer ${layerIndex}:`, {
					name: layerData.name,
					hasLayer: !!layer,
					visible: layer?.visible,
				});
			}

			if (!layer) return;

			for (let y = startY; y < endY; y++) {
				for (let x = startX; x < endX; x++) {
					const tile = layer.getTileAt(x, y);
					if (tile && tile.index !== -1) {
						tilesRendered++;

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
						const pixelX = (x - startX) * tileScale;
						const pixelY = (y - startY) * tileScale;

						// Draw rectangle on temp graphics
						tempGraphics.fillStyle(color, 1);
						tempGraphics.fillRect(pixelX, pixelY, Math.max(1, tileScale), Math.max(1, tileScale));
					}
				}
			}
		});

		if (!this.hasLoggedOnce) {
			console.log(`[Minimap] Rendered ${tilesRendered} tiles with tileScale ${tileScale}`);
			this.hasLoggedOnce = true;
		}

		// Draw the graphics to the render texture
		this.mapTexture.draw(tempGraphics);

		// Clean up temporary graphics
		tempGraphics.destroy();

		// Update player marker position (center of minimap)
		this.playerMarker.setPosition(this.width / 2, this.height / 2);
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
