import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { Plugin as NineSlicePlugin } from 'phaser3-nineslice';
import { DialogScene } from './scenes/DialogScene';
import { JoystickScene } from './scenes/JoystickScene';
import { HUDScene } from './scenes/HUDScene';
import { PreloadScene } from './scenes/PreloadScene';
import { VideoPlayerScene } from './scenes/VideoPlayerScene';
import { IntroScene } from './scenes/IntroScene';
import { SettingScene } from './scenes/SettingScene';
import OutlinePostFx from 'phaser3-rex-plugins/plugins/outlinepipeline.js';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';
import YoutubePlayerPlugin from 'phaser3-rex-plugins/plugins/youtubeplayer-plugin.js';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { MobileCheckScene } from './scenes/MobileCheckScene';
import { DungeonScene } from './scenes/DungeonScene';
import { InventoryScene } from './scenes/InventoryScene';
import { TutorialScene } from './scenes/TutorialScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { AttributeScene } from './scenes/AttributeScene';
import { TownScene } from './scenes/TownScene';
import { CaveScene } from './scenes/CaveScene';
import { OverworldScene } from './scenes/OverworldScene';

// Create canvas with willReadFrequently attribute
const canvas = document.getElementById('luminus-rpg') as HTMLCanvasElement;
if (!canvas) {
	const newCanvas = document.createElement('canvas');
	newCanvas.id = 'luminus-rpg';
	const parent = document.getElementById('luminus-rpg-parent');
	if (parent) {
		parent.appendChild(newCanvas);
	}
}

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	parent: 'luminus-rpg-parent',
	canvas: document.getElementById('luminus-rpg') as HTMLCanvasElement,
	width: 800,
	height: 600,
	render: {
		antialias: false,
		pixelArt: false,
		roundPixels: false,
		transparent: false,
	},
	callbacks: {
		preBoot: function (_game: Phaser.Game) {
			// Set willReadFrequently for Phaser's internal canvas contexts
			const originalGetContext = HTMLCanvasElement.prototype.getContext;
			HTMLCanvasElement.prototype.getContext = function (type: string, attributes?: any): any {
				if (type === '2d') {
					attributes = attributes || {};
					attributes.willReadFrequently = true;
				}
				return originalGetContext.call(this, type, attributes);
			};
		},
	},
	scene: [
		// Preload should come first
		PreloadScene,
		IntroScene,
		MainScene,
		DungeonScene,
		TownScene,
		CaveScene,
		OverworldScene,
		MobileCheckScene,
		TutorialScene,
		MainMenuScene,

		// UI Scenes should be loaded after the game Scenes.
		JoystickScene,
		DialogScene,
		HUDScene,
		InventoryScene,
		SettingScene,
		VideoPlayerScene,
		AttributeScene,
	],
	input: {
		gamepad: true,
		touch: true,
	},
	scale: {
		mode: Phaser.Scale.RESIZE,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	pipeline: [OutlinePostFx],
	plugins: {
		scene: [
			{
				key: 'rexUI',
				plugin: UIPlugin,
				mapping: 'rexUI',
			},
		],
		global: [
			NineSlicePlugin.DefaultCfg,
			{
				key: 'rexOutlinePipeline',
				plugin: OutlinePipelinePlugin,
				start: true,
			},
			{
				key: 'rexYoutubePlayer',
				plugin: YoutubePlayerPlugin,
				start: true,
			},
		],
	},
	dom: {
		createContainer: true,
	},
	pixelArt: false,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { x: 0, y: 0 }, // Top down game, so no gravity
			checkCollision: { up: false, down: false, left: false, right: false },
			debug: false,
			debugShowBody: true,
			debugShowStaticBody: true,
			debugShowVelocity: true,
			debugVelocityColor: 0xffff00,
			debugBodyColor: 0x0000ff,
			debugStaticBodyColor: 0xffffff,
		},
	},
};

// Initialize game with error handling
let game: Phaser.Game;

try {
	game = new Phaser.Game(config);

	// Make game globally available for debugging
	(window as any).game = game;

	// Handle uncaught game errors
	game.events.on('error', (error: Error) => {
		console.error('Game error:', error);
	});
} catch (error) {
	console.error('Failed to initialize game:', error);

	// Show user-friendly error message
	document.body.innerHTML = `
		<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
			<div style="text-align: center;">
				<h2>Game Failed to Load</h2>
				<p>We're sorry, but the game encountered an error during initialization.</p>
				<p>Please refresh the page to try again.</p>
				<button onclick="window.location.reload()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
					Refresh Page
				</button>
			</div>
		</div>
	`;
}

export default game;
