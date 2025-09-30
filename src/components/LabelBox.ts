import Phaser from 'phaser';
import { PanelComponent } from './PanelComponent';

export class LabelBox {
	/**
	 * The Phaser Scene that the Panel will be created on.
	 */
	public scene: Phaser.Scene;

	/**
	 * The Panel that will show the information.
	 */
	public panel: PanelComponent;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.panel = new PanelComponent(scene);
	}
}
