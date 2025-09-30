import { LuminusUtils } from '../../utils/LuminusUtils';

export class ButtonMinus extends Phaser.GameObjects.Sprite {
	scene: Phaser.Scene;

	constructor(scene: Phaser.Scene, x: number, y: number, action: string, args: any) {
		super(scene, x, y, 'minus_small_button');

		/**
		 * @type { Phaser.Scene }
		 */
		this.scene = scene;

		this.scene.add.existing(this);
		this.setInteractive();
		this.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
			LuminusUtils.executeFunctionByName(action, scene, args);
			this.play({ key: 'touch_button_minus' }).once(
				Phaser.Animations.Events.ANIMATION_COMPLETE,
				(animationState: Phaser.Animations.AnimationState) => {
					if (animationState.key === `touch_button_minus`) {
						this.play('init_button_minus');
					}
				}
			);
		});
	}
}
