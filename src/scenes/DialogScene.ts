import Phaser from 'phaser';
import { LuminusTiledInfoBox } from '../plugins/LuminusTiledInfoBox';
import { Player } from '../entities/Player';
import { IDialogScene } from '../types/SceneTypes';

export class DialogScene extends Phaser.Scene implements IDialogScene {
	public player: Player | null = null;
	public map: Phaser.Tilemaps.Tilemap | null = null;
	public mainScene: Phaser.Scene | null = null;
	public luminusTiledInfoBox!: LuminusTiledInfoBox;

	constructor() {
		super({
			key: 'DialogScene',
		});
	}

	init(args: { player: Player; map: Phaser.Tilemaps.Tilemap; scene: Phaser.Scene }): void {
		this.player = args.player;
		this.map = args.map;
		this.mainScene = args.scene;
	}

	create(): void {
		this.luminusTiledInfoBox = new LuminusTiledInfoBox(this.mainScene!, this.player!, this.map!, this);
		this.luminusTiledInfoBox.create();

		this.scale.on('resize', (resize: { width: number; height: number }) => {
			if (this.luminusTiledInfoBox && this.luminusTiledInfoBox.luminusDialogBox) {
				this.luminusTiledInfoBox.luminusDialogBox.resizeComponents(resize.width, resize.height);
			}
		});

		this.input.on('pointerdown', () => {
			// console.log(this.cameras.main);
		});
	}

	update(): void {
		if (this.luminusTiledInfoBox) this.luminusTiledInfoBox.luminusDialogBox.checkUpdate();
	}
}
