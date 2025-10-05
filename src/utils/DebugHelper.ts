/**
 * Comprehensive Debug Helper for Luminus RPG
 *
 * This utility provides a full game state dump that can be used by Claude or developers
 * to understand the current state of the game, debug issues, and develop new features.
 *
 * Usage:
 * - Press F9 to dump state to console and download
 * - Use window.luminusDebug.dump() in console
 * - Use window.luminusDebug.copyToClipboard() to copy state to clipboard
 */

import { logger, GameLogCategory } from './Logger';

interface GameStateDump {
	metadata: {
		timestamp: string;
		version: string;
		userAgent: string;
		viewport: { width: number; height: number };
		performance: PerformanceMetrics;
	};
	phaser: {
		version: string;
		config: any;
		stats: {
			fps: number;
			delta: number;
		};
	};
	scenes: SceneInfo[];
	player: PlayerInfo | null;
	enemies: EnemyInfo[];
	inventory: InventoryInfo;
	activeDialogs: any[];
	environment: EnvironmentInfo;
	errors: ErrorInfo[];
	logs: any[];
}

interface PerformanceMetrics {
	memory?: {
		usedJSHeapSize: string;
		totalJSHeapSize: string;
		limit: string;
	};
	fps: number;
	frameTime: number;
}

interface SceneInfo {
	key: string;
	isActive: boolean;
	isVisible: boolean;
	isSleeping: boolean;
	gameObjectCount: number;
	pluginCount: number;
	plugins: string[];
	children: number;
}

interface PlayerInfo {
	position: { x: number; y: number };
	attributes: any;
	inventory: number;
	speed: number;
	isSwimming: boolean;
	isRunning: boolean;
	canMove: boolean;
	canAtack: boolean;
	health: number;
	maxHealth: number;
	level: number;
}

interface EnemyInfo {
	id: string;
	position: { x: number; y: number };
	health: number;
	entityName: string;
	isActive: boolean;
}

interface InventoryInfo {
	itemCount: number;
	items: any[];
}

interface EnvironmentInfo {
	currentMap: string | null;
	weather: any;
	timeOfDay: any;
}

interface ErrorInfo {
	timestamp: string;
	message: string;
	stack?: string;
	data?: any;
}

class DebugHelper {
	private static instance: DebugHelper;
	private game: Phaser.Game | null = null;
	private errorLog: ErrorInfo[] = [];
	private isEnabled = process.env.NODE_ENV !== 'production';

	private constructor() {
		this.setupErrorCapture();
		this.setupKeyboardShortcuts();
		logger.info(GameLogCategory.SYSTEM, 'DebugHelper initialized');
	}

	static getInstance(): DebugHelper {
		if (!DebugHelper.instance) {
			DebugHelper.instance = new DebugHelper();
		}
		return DebugHelper.instance;
	}

	/**
	 * Initialize the debug helper with the Phaser game instance
	 */
	initialize(game: Phaser.Game): void {
		this.game = game;
		logger.info(GameLogCategory.SYSTEM, 'DebugHelper connected to game instance');
	}

	/**
	 * Setup keyboard shortcuts for debugging
	 */
	private setupKeyboardShortcuts(): void {
		if (typeof window === 'undefined' || !this.isEnabled) return;

		window.addEventListener('keydown', (event) => {
			// F9 - Full debug dump
			if (event.key === 'F9') {
				event.preventDefault();
				this.dumpAndDownload();
			}

			// F10 - Quick console dump
			if (event.key === 'F10') {
				event.preventDefault();
				this.quickDump();
			}

			// F11 - Toggle performance overlay
			if (event.key === 'F11') {
				event.preventDefault();
				this.togglePerformanceOverlay();
			}
		});

		logger.info(GameLogCategory.SYSTEM, 'Debug shortcuts registered (F9, F10, F11)');
	}

	/**
	 * Setup global error capture
	 */
	private setupErrorCapture(): void {
		if (typeof window === 'undefined') return;

		const originalConsoleError = console.error;
		console.error = (...args: any[]) => {
			this.errorLog.push({
				timestamp: new Date().toISOString(),
				message: args.map((arg) => String(arg)).join(' '),
				data: args,
			});
			originalConsoleError.apply(console, args);
		};
	}

	/**
	 * Get information about all active scenes
	 */
	private getSceneInfo(): SceneInfo[] {
		if (!this.game) return [];

		const scenes: SceneInfo[] = [];
		const sceneManager = this.game.scene;

		sceneManager.scenes.forEach((scene: any) => {
			const plugins = Object.keys(scene).filter(
				(key) =>
					scene[key] && typeof scene[key] === 'object' && scene[key].constructor?.name?.includes('Luminus')
			);

			scenes.push({
				key: scene.scene.key,
				isActive: sceneManager.isActive(scene.scene.key),
				isVisible: sceneManager.isVisible(scene.scene.key),
				isSleeping: sceneManager.isSleeping(scene.scene.key),
				gameObjectCount: scene.children?.list?.length || 0,
				pluginCount: plugins.length,
				plugins: plugins,
				children: scene.children?.list?.length || 0,
			});
		});

		return scenes;
	}

	/**
	 * Get player information from active scenes
	 */
	private getPlayerInfo(): PlayerInfo | null {
		if (!this.game) return null;

		const activeScenes = this.game.scene.scenes.filter((s: any) => this.game!.scene.isActive(s.scene.key));

		for (const scene of activeScenes) {
			if ((scene as any).player) {
				const player = (scene as any).player;
				return {
					position: { x: player.x, y: player.y },
					attributes: player.attributes,
					inventory: player.items?.length || 0,
					speed: player.speed,
					isSwimming: player.isSwimming,
					isRunning: player.isRunning,
					canMove: player.canMove,
					canAtack: player.canAtack,
					health: player.attributes?.health || 0,
					maxHealth: player.attributes?.maxHealth || 0,
					level: player.attributes?.level || 1,
				};
			}
		}

		return null;
	}

	/**
	 * Get enemies from active scenes
	 */
	private getEnemyInfo(): EnemyInfo[] {
		if (!this.game) return [];

		const enemies: EnemyInfo[] = [];
		const activeScenes = this.game.scene.scenes.filter((s: any) => this.game!.scene.isActive(s.scene.key));

		for (const scene of activeScenes) {
			if ((scene as any).enemies) {
				const sceneEnemies = (scene as any).enemies;
				if (Array.isArray(sceneEnemies)) {
					sceneEnemies.forEach((enemy: any, index: number) => {
						enemies.push({
							id: enemy.id || `enemy_${index}`,
							position: { x: enemy.x, y: enemy.y },
							health: enemy.attributes?.health || 0,
							entityName: enemy.entityName || 'unknown',
							isActive: enemy.active,
						});
					});
				}
			}
		}

		return enemies;
	}

	/**
	 * Get performance metrics
	 */
	private getPerformanceMetrics(): PerformanceMetrics {
		const metrics: PerformanceMetrics = {
			fps: 0,
			frameTime: 0,
		};

		if (this.game) {
			metrics.fps = this.game.loop.actualFps;
			metrics.frameTime = this.game.loop.delta;
		}

		if (typeof window !== 'undefined' && (window.performance as any).memory) {
			const memory = (window.performance as any).memory;
			metrics.memory = {
				usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
				totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
				limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
			};
		}

		return metrics;
	}

	/**
	 * Safely extract config info without circular references
	 */
	private getSafeConfig(): any {
		if (!this.game?.config) return {};

		const config = this.game.config as any;
		return {
			width: config.width,
			height: config.height,
			type: config.type,
			parent: typeof config.parent === 'string' ? config.parent : '[HTMLElement]',
			physics: config.physics
				? {
						default: config.physics.default,
						arcade: config.physics.arcade
							? {
									gravity: config.physics.arcade.gravity,
									debug: config.physics.arcade.debug,
								}
							: undefined,
					}
				: undefined,
			scale: config.scale
				? {
						mode: config.scale.mode,
						autoCenter: config.scale.autoCenter,
					}
				: undefined,
		};
	}

	/**
	 * Create a comprehensive debug dump of the current game state
	 */
	dump(): GameStateDump {
		logger.info(GameLogCategory.SYSTEM, 'Creating debug dump...');

		const dump: GameStateDump = {
			metadata: {
				timestamp: new Date().toISOString(),
				version: (this.game?.config as any)?.version || 'unknown',
				userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
				viewport: {
					width: typeof window !== 'undefined' ? window.innerWidth : 0,
					height: typeof window !== 'undefined' ? window.innerHeight : 0,
				},
				performance: this.getPerformanceMetrics(),
			},
			phaser: {
				version: Phaser.VERSION,
				config: this.getSafeConfig(),
				stats: {
					fps: this.game?.loop.actualFps || 0,
					delta: this.game?.loop.delta || 0,
				},
			},
			scenes: this.getSceneInfo(),
			player: this.getPlayerInfo(),
			enemies: this.getEnemyInfo(),
			inventory: {
				itemCount: 0,
				items: [],
			},
			activeDialogs: [],
			environment: {
				currentMap: null,
				weather: null,
				timeOfDay: null,
			},
			errors: this.errorLog.slice(-50), // Last 50 errors
			logs: logger.getBuffer().slice(-100), // Last 100 log entries
		};

		return dump;
	}

	/**
	 * Quick console dump with formatted output
	 */
	quickDump(): void {
		const dump = this.dump();

		console.group('🎮 Luminus RPG Debug Dump');
		console.log('⏰ Timestamp:', dump.metadata.timestamp);
		console.log('📊 Performance:', dump.metadata.performance);
		console.log(
			'🎬 Active Scenes:',
			dump.scenes.filter((s) => s.isActive).map((s) => s.key)
		);
		console.log('👤 Player:', dump.player);
		console.log('👾 Enemies:', dump.enemies.length);
		console.log('❌ Recent Errors:', dump.errors.length);
		console.groupEnd();

		logger.info(GameLogCategory.SYSTEM, 'Quick debug dump printed to console');
	}

	/**
	 * Dump state and download as JSON file
	 */
	dumpAndDownload(): void {
		const dump = this.dump();
		const dataStr = JSON.stringify(dump, null, 2);
		const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
		const exportFileDefaultName = `luminus-debug-${Date.now()}.json`;

		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();

		console.log('✅ Debug dump downloaded:', exportFileDefaultName);
		logger.info(GameLogCategory.SYSTEM, `Debug dump downloaded: ${exportFileDefaultName}`);
	}

	/**
	 * Copy dump to clipboard
	 */
	async copyToClipboard(): Promise<void> {
		const dump = this.dump();
		const dataStr = JSON.stringify(dump, null, 2);

		try {
			await navigator.clipboard.writeText(dataStr);
			console.log('✅ Debug dump copied to clipboard');
			logger.info(GameLogCategory.SYSTEM, 'Debug dump copied to clipboard');
		} catch (err) {
			console.error('❌ Failed to copy to clipboard:', err);
			logger.error(GameLogCategory.SYSTEM, 'Failed to copy debug dump to clipboard', err);
		}
	}

	/**
	 * Toggle performance overlay (if available)
	 */
	private togglePerformanceOverlay(): void {
		if (!this.game) return;

		// Toggle FPS display
		const statsPlugin = this.game.plugins.get('FPSPlugin') as any;
		if (statsPlugin) {
			statsPlugin.toggle();
		} else {
			console.log('Performance overlay not available');
		}
	}

	/**
	 * Get specific scene by key
	 */
	getScene(key: string): any {
		if (!this.game) return null;
		return this.game.scene.getScene(key);
	}

	/**
	 * Get all running scenes
	 */
	getActiveScenes(): string[] {
		if (!this.game) return [];
		return this.game.scene.scenes
			.filter((s: any) => this.game!.scene.isActive(s.scene.key))
			.map((s: any) => s.scene.key);
	}

	/**
	 * Teleport player to position (dev only)
	 */
	teleportPlayer(x: number, y: number): void {
		const player = this.getPlayerInfo();
		if (!player) {
			console.error('Player not found');
			return;
		}

		const activeScenes = this.game?.scene.scenes.filter((s: any) => this.game!.scene.isActive(s.scene.key));
		if (activeScenes) {
			for (const scene of activeScenes) {
				if ((scene as any).player) {
					(scene as any).player.setPosition(x, y);
					console.log(`✅ Player teleported to (${x}, ${y})`);
					return;
				}
			}
		}
	}

	/**
	 * Give item to player (dev only)
	 */
	giveItem(itemId: string, quantity: number = 1): void {
		console.log(`📦 Give item not yet implemented: ${itemId} x${quantity}`);
		// TODO: Implement when inventory system is available
	}

	/**
	 * Set player health
	 */
	setPlayerHealth(health: number): void {
		const activeScenes = this.game?.scene.scenes.filter((s: any) => this.game!.scene.isActive(s.scene.key));
		if (activeScenes) {
			for (const scene of activeScenes) {
				if ((scene as any).player) {
					(scene as any).player.attributes.health = health;
					console.log(`✅ Player health set to ${health}`);
					return;
				}
			}
		}
	}

	/**
	 * Setup global console commands
	 */
	setupConsoleCommands(): void {
		if (typeof window === 'undefined' || !this.isEnabled) return;

		(window as any).luminusDebug = {
			dump: () => this.dump(),
			quickDump: () => this.quickDump(),
			download: () => this.dumpAndDownload(),
			copy: () => this.copyToClipboard(),
			scenes: () => this.getActiveScenes(),
			player: () => this.getPlayerInfo(),
			enemies: () => this.getEnemyInfo(),
			teleport: (x: number, y: number) => this.teleportPlayer(x, y),
			setHealth: (health: number) => this.setPlayerHealth(health),
			giveItem: (itemId: string, quantity?: number) => this.giveItem(itemId, quantity),
			help: () => {
				console.log(`
🎮 Luminus Debug Commands
========================

Keyboard Shortcuts:
  F9  - Full debug dump & download
  F10 - Quick console dump
  F11 - Toggle performance overlay

Console Commands:
  luminusDebug.dump()           - Get full state dump object
  luminusDebug.quickDump()      - Print formatted dump to console
  luminusDebug.download()       - Download dump as JSON file
  luminusDebug.copy()           - Copy dump to clipboard
  luminusDebug.scenes()         - List active scenes
  luminusDebug.player()         - Get player info
  luminusDebug.enemies()        - Get enemy info
  luminusDebug.teleport(x, y)   - Teleport player
  luminusDebug.setHealth(hp)    - Set player health
  luminusDebug.giveItem(id, qty) - Give item to player
  luminusDebug.help()           - Show this help

Also available: window.luminus (logger commands)
				`);
			},
		};

		console.log('🎮 Luminus Debug Helper initialized');
		console.log('   Use luminusDebug.help() for available commands');
		console.log('   Press F9 for full debug dump, F10 for quick dump');
	}
}

// Export singleton instance
export const debugHelper = DebugHelper.getInstance();

// Setup console commands on load
if (typeof window !== 'undefined') {
	debugHelper.setupConsoleCommands();
}
