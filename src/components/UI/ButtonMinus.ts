import { NeverquestUtils } from '../../utils/NeverquestUtils';

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
			NeverquestUtils.executeFunctionByName(action, scene, args);
			this.play({ key: 'touch_button_minus' }).once(
				Phaser.Animations.Events.ANIMATION_COMPLETE,
				(_animationState: Phaser.Animations.AnimationState, _frame: Phaser.Animations.AnimationFrame) => {
					if (this.anims.currentAnim?.key === `touch_button_minus`) {
						this.play('init_button_minus');
					}
				}
			);
		});
	}
}
