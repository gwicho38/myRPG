import Phaser from 'phaser';
import { Player } from '../entities/Player';

export interface IGameScene extends Phaser.Scene {
	player?: Player;
	map?: Phaser.Tilemaps.Tilemap;
	mapCreator?: any;
}

export interface IPreloadScene extends Phaser.Scene {
	progressBar: Phaser.GameObjects.Graphics | null;
	progressBox: Phaser.GameObjects.Graphics | null;
	cameraWidth: number;
	cameraHeight: number;
	loadingText: Phaser.GameObjects.Text | null;
}

export interface IMainScene extends IGameScene {
	neverquestEnemyZones?: any;
	neverquestEnvironmentParticles?: any;
}

export interface IDialogScene extends Phaser.Scene {
	dialogBox?: any;
	player?: Player;
}

export interface IHUDScene extends Phaser.Scene {
	player?: Player;
	healthBar?: any;
	expBar?: any;
}
