/**
 * LuminusLightingManager Plugin
 * Implements atmospheric lighting with radial gradients, torch mechanics, and dynamic shadows
 */

import Phaser from 'phaser';

export interface LightSource {
	x: number;
	y: number;
	radius: number;
	color?: number;
	intensity?: number;
	flicker?: boolean;
	flickerAmount?: number;
}

export interface LightingOptions {
	/**
	 * Ambient darkness level (0.0 = fully lit, 1.0 = pitch black)
	 * Default: 0.85
	 */
	ambientDarkness?: number;

	/**
	 * Default light radius for player torch
	 * Default: 100 pixels
	 */
	defaultLightRadius?: number;

	/**
	 * Enable flickering effects for torches
	 * Default: true
	 */
	enableFlicker?: boolean;

	/**
	 * Amount of flicker variation in pixels
	 * Default: 5
	 */
	flickerAmount?: number;

	/**
	 * Light color tint (0xRRGGBB)
	 * Default: 0xffaa66 (warm orange)
	 */
	lightColor?: number;

	/**
	 * Use smooth gradient (better quality but slower)
	 * Default: true
	 */
	smoothGradient?: boolean;

	/**
	 * Update lighting every N frames (1 = every frame)
	 * Default: 1
	 */
	updateFrequency?: number;
}

export class LuminusLightingManager {
	private scene: Phaser.Scene;
	private options: Required<LightingOptions>;

	// Graphics layers
	private darknessLayer: Phaser.GameObjects.Graphics;
	private lightingLayer: Phaser.GameObjects.RenderTexture;
	private maskGraphics: Phaser.GameObjects.Graphics;

	// Light sources
	private playerLight: LightSource | null = null;
	private staticLights: LightSource[] = [];
	private dynamicLights: LightSource[] = [];

	// Performance tracking
	private frameCounter: number = 0;
	private lastUpdateFrame: number = 0;

	// State
	private enabled: boolean = true;

	constructor(scene: Phaser.Scene, options: LightingOptions = {}) {
		this.scene = scene;

		// Set default options
		this.options = {
			ambientDarkness: options.ambientDarkness ?? 0.85,
			defaultLightRadius: options.defaultLightRadius ?? 100,
			enableFlicker: options.enableFlicker ?? true,
			flickerAmount: options.flickerAmount ?? 5,
			lightColor: options.lightColor ?? 0xffaa66,
			smoothGradient: options.smoothGradient ?? true,
			updateFrequency: options.updateFrequency ?? 1,
		};

		this.darknessLayer = {} as Phaser.GameObjects.Graphics;
		this.lightingLayer = {} as Phaser.GameObjects.RenderTexture;
		this.maskGraphics = {} as Phaser.GameObjects.Graphics;

		console.log('[LuminusLighting] Initialized with options:', this.options);
	}

	/**
	 * Create the lighting system
	 * Call this in the scene's create() method
	 */
	public create(): void {
		const width = this.scene.scale.width;
		const height = this.scene.scale.height;

		// Create darkness overlay (base layer)
		this.darknessLayer = this.scene.add.graphics();
		this.darknessLayer.setDepth(1000); // Above game objects
		this.darknessLayer.setScrollFactor(0); // Fixed to camera

		// Create lighting render texture (light sources)
		this.lightingLayer = this.scene.add.renderTexture(0, 0, width * 2, height * 2);
		this.lightingLayer.setDepth(1001); // Above darkness
		this.lightingLayer.setScrollFactor(0);

		// Create mask graphics for rendering lights
		this.maskGraphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

		// Set blend mode for realistic lighting (ADD = 1)
		this.lightingLayer.setBlendMode(1);

		console.log('[LuminusLighting] Created lighting layers');
	}

	/**
	 * Update the lighting system
	 * Call this in the scene's update() method
	 */
	public update(): void {
		if (!this.enabled) {
			return;
		}

		this.frameCounter++;

		// Skip update if not at update frequency
		if (this.frameCounter - this.lastUpdateFrame < this.options.updateFrequency) {
			return;
		}

		this.lastUpdateFrame = this.frameCounter;

		// Clear previous frame
		this.lightingLayer.clear();
		this.darknessLayer.clear();

		// Draw darkness overlay
		this.drawDarkness();

		// Draw all light sources
		this.drawLights();
	}

	/**
	 * Draw the ambient darkness overlay
	 */
	private drawDarkness(): void {
		const width = this.scene.scale.width;
		const height = this.scene.scale.height;

		this.darknessLayer.fillStyle(0x000000, this.options.ambientDarkness);
		this.darknessLayer.fillRect(0, 0, width, height);
	}

	/**
	 * Draw all light sources (player, static, dynamic)
	 */
	private drawLights(): void {
		// Draw player light
		if (this.playerLight) {
			this.drawLight(this.playerLight);
		}

		// Draw static lights (torches on walls, etc.)
		for (const light of this.staticLights) {
			this.drawLight(light);
		}

		// Draw dynamic lights (spells, projectiles, etc.)
		for (const light of this.dynamicLights) {
			this.drawLight(light);
		}
	}

	/**
	 * Draw a single light source with radial gradient
	 */
	private drawLight(light: LightSource): void {
		const camera = this.scene.cameras.main;

		// Convert world position to screen position
		const screenX = light.x - camera.scrollX;
		const screenY = light.y - camera.scrollY;

		// Apply flicker effect if enabled
		let radius = light.radius;
		if (light.flicker && this.options.enableFlicker) {
			const flickerAmount = light.flickerAmount || this.options.flickerAmount;
			radius += Math.floor(Math.random() * (flickerAmount * 2 + 1)) - flickerAmount;
		}

		const color = light.color || this.options.lightColor;
		const intensity = light.intensity || 1.0;

		// Draw radial gradient light
		if (this.options.smoothGradient) {
			this.drawSmoothLight(screenX, screenY, radius, color, intensity);
		} else {
			this.drawSimpleLight(screenX, screenY, radius, color, intensity);
		}
	}

	/**
	 * Draw smooth radial gradient (better quality)
	 */
	private drawSmoothLight(x: number, y: number, radius: number, color: number, intensity: number): void {
		this.maskGraphics.clear();

		// Extract RGB components
		const r = (color >> 16) & 0xff;
		const g = (color >> 8) & 0xff;
		const b = color & 0xff;

		// Draw gradient circles from center outward
		const steps = 20;
		for (let i = steps; i > 0; i--) {
			const ratio = i / steps;
			const currentRadius = radius * ratio;
			const alpha = intensity * (1 - ratio) * (1 - ratio); // Quadratic falloff

			// Convert RGB to hex color
			const hexColor = (r << 16) | (g << 8) | b;
			this.maskGraphics.fillStyle(hexColor, alpha);
			this.maskGraphics.fillCircle(x, y, currentRadius);
		}

		// Draw to lighting layer
		this.maskGraphics.generateTexture('temp_light', radius * 2, radius * 2);
		this.lightingLayer.draw('temp_light', x - radius, y - radius);
		this.scene.textures.remove('temp_light');
	}

	/**
	 * Draw simple circle light (faster)
	 */
	private drawSimpleLight(x: number, y: number, radius: number, color: number, intensity: number): void {
		this.maskGraphics.clear();

		const r = (color >> 16) & 0xff;
		const g = (color >> 8) & 0xff;
		const b = color & 0xff;

		// Convert RGB to hex color
		const hexColor = (r << 16) | (g << 8) | b;
		this.maskGraphics.fillStyle(hexColor, intensity);
		this.maskGraphics.fillCircle(x, y, radius);

		// Draw to lighting layer
		this.maskGraphics.generateTexture('temp_light', radius * 2, radius * 2);
		this.lightingLayer.draw('temp_light', x - radius, y - radius);
		this.scene.textures.remove('temp_light');
	}

	/**
	 * Set the player's light source (follows player)
	 */
	public setPlayerLight(x: number, y: number, radius?: number): void {
		if (!this.playerLight) {
			this.playerLight = {
				x,
				y,
				radius: radius || this.options.defaultLightRadius,
				color: this.options.lightColor,
				intensity: 1.0,
				flicker: true,
				flickerAmount: this.options.flickerAmount,
			};
		} else {
			this.playerLight.x = x;
			this.playerLight.y = y;
			if (radius !== undefined) {
				this.playerLight.radius = radius;
			}
		}
	}

	/**
	 * Update player light radius (for torch/lantern changes)
	 */
	public setPlayerLightRadius(radius: number): void {
		if (this.playerLight) {
			this.playerLight.radius = radius;
		}
	}

	/**
	 * Remove player light
	 */
	public removePlayerLight(): void {
		this.playerLight = null;
	}

	/**
	 * Add a static light source (torch on wall, crystal, etc.)
	 */
	public addStaticLight(x: number, y: number, radius: number, options: Partial<LightSource> = {}): LightSource {
		const light: LightSource = {
			x,
			y,
			radius,
			color: options.color || 0xffaa66,
			intensity: options.intensity || 0.8,
			flicker: options.flicker ?? true,
			flickerAmount: options.flickerAmount || 3,
		};

		this.staticLights.push(light);
		return light;
	}

	/**
	 * Add a dynamic light source (spell, projectile, etc.)
	 */
	public addDynamicLight(x: number, y: number, radius: number, options: Partial<LightSource> = {}): LightSource {
		const light: LightSource = {
			x,
			y,
			radius,
			color: options.color || 0xaaccff,
			intensity: options.intensity || 1.0,
			flicker: options.flicker ?? false,
		};

		this.dynamicLights.push(light);
		return light;
	}

	/**
	 * Remove a light source
	 */
	public removeLight(light: LightSource): void {
		const staticIndex = this.staticLights.indexOf(light);
		if (staticIndex !== -1) {
			this.staticLights.splice(staticIndex, 1);
			return;
		}

		const dynamicIndex = this.dynamicLights.indexOf(light);
		if (dynamicIndex !== -1) {
			this.dynamicLights.splice(dynamicIndex, 1);
		}
	}

	/**
	 * Clear all static lights
	 */
	public clearStaticLights(): void {
		this.staticLights = [];
	}

	/**
	 * Clear all dynamic lights
	 */
	public clearDynamicLights(): void {
		this.dynamicLights = [];
	}

	/**
	 * Set ambient darkness level (0.0 - 1.0)
	 */
	public setAmbientDarkness(darkness: number): void {
		this.options.ambientDarkness = Math.max(0, Math.min(1, darkness));
	}

	/**
	 * Enable/disable lighting system
	 */
	public setEnabled(enabled: boolean): void {
		this.enabled = enabled;

		if (!enabled) {
			// Clear all layers when disabled
			this.lightingLayer.clear();
			this.darknessLayer.clear();
		}
	}

	/**
	 * Check if lighting is enabled
	 */
	public isEnabled(): boolean {
		return this.enabled;
	}

	/**
	 * Get all light sources (for debugging)
	 */
	public getLights(): { player: LightSource | null; static: LightSource[]; dynamic: LightSource[] } {
		return {
			player: this.playerLight,
			static: this.staticLights,
			dynamic: this.dynamicLights,
		};
	}

	/**
	 * Destroy the lighting system
	 */
	public destroy(): void {
		if (this.darknessLayer) {
			this.darknessLayer.destroy();
		}
		if (this.lightingLayer) {
			this.lightingLayer.destroy();
		}
		if (this.maskGraphics) {
			this.maskGraphics.destroy();
		}

		this.playerLight = null;
		this.staticLights = [];
		this.dynamicLights = [];

		console.log('[LuminusLighting] Destroyed');
	}
}
