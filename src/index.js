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
/**
 * @type { Phaser.Core.Config}
 */
// Create canvas with willReadFrequently attribute
const canvas = document.getElementById('luminus-rpg');
if (!canvas) {
	const newCanvas = document.createElement('canvas');
	newCanvas.id = 'luminus-rpg';
	document.getElementById('luminus-rpg-parent').appendChild(newCanvas);
}

const config = {
	type: Phaser.WEBGL,
	parent: 'luminus-rpg-parent',
	canvas: document.getElementById('luminus-rpg'),
	width: 800,
	height: 600,
	render: {
		antialias: false,
		pixelArt: false,
		roundPixels: false,
		transparent: false,
		willReadFrequently: true,
	},
	callbacks: {
		preBoot: function (game) {
			// Set willReadFrequently for Phaser's internal canvas contexts
			const originalGetContext = HTMLCanvasElement.prototype.getContext;
			HTMLCanvasElement.prototype.getContext = function (type, attributes) {
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
	inputKeyboard: true,
	scaleMode: Phaser.Scale.RESIZE,
	autoCenter: Phaser.Scale.CENTER_BOTH,
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
			gravity: { y: 0 }, // Top down game, so no gravity
			checkCollision: false,
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

const game = new Phaser.Game(config);
