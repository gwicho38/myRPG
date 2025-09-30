import Phaser from 'phaser';

export class MobileCheckScene extends Phaser.Scene {
	landscapeImage: Phaser.GameObjects.Image | null;
	landscapeImageName: string;
	helpText: Phaser.GameObjects.Text | null;
	textOrientationFullscreen: string;
	textOrientation: string;
	textFullscreen: string;
	fontSize: string;
	fontFamily: string;
	isMobile: boolean | null;
	finishedChecks: boolean;
	nextScene: string;

	constructor() {
		super({
			key: 'MobileCheckScene',
		});

		this.landscapeImage = null;
		this.landscapeImageName = 'landscape_mobile';
		this.helpText = null;
		this.textOrientationFullscreen =
			'Please, touch the screen to enable Full Screen mode and rotate your device to Landscape mode.';
		this.textOrientation = 'Please, rotate your device to landscape to have a better experience.';
		this.textFullscreen = 'Please, touch the screen to enable Full Screen mode.';
		this.fontSize = '20px';
		this.fontFamily = "'Press Start 2P'";
		this.isMobile = null;
		this.finishedChecks = false;
		this.nextScene = 'MainScene';
	}

	create(): void {
		this.isMobile = !this.sys.game.device.os.desktop ? true : false;

		if (!this.isMobile || this.sys.game.device.os.iPhone) {
			this.goNextScene();
		}
		this.landscapeImage = this.add.image(
			this.cameras.main.width / 2,
			this.cameras.main.height / 2,
			this.landscapeImageName
		);

		this.helpText = this.add.text(
			this.cameras.main.width / 2,
			this.cameras.main.height / 2 - this.landscapeImage.height / 2 - 50,
			this.textOrientationFullscreen,
			{
				wordWrap: {
					width: this.cameras.main.width - 50,
				},
				wordWrapUseAdvanced: false,
				fontSize: this.fontSize,
				fontFamily: this.fontFamily,
			}
		);

		this.helpText.setOrigin(0.5, 0.5);

		this.tweens.add({
			targets: this.landscapeImage,
			angle: { from: 0, to: 90 },
			duration: 2000,
			yoyo: true,
			loop: -1,
			delay: 500,
			completeDelay: 500,
		});

		this.input.once('pointerup', () => {
			this.scale.startFullscreen();
		});

		this.scale.on('resize', (size: any) => {
			if (this.scene.isVisible()) {
				this.landscapeImage!.setPosition(size.width / 2, size.height / 2);
				this.helpText!.setPosition(size.width / 2, size.height / 2 - this.landscapeImage!.height / 2 - 50);
			}
		});
	}

	goNextScene(): void {
		this.scene.start(this.nextScene);
		this.scene.stop(this.scene.key);
	}

	update(): void {
		if (!this.scale.isLandscape && !this.scale.isFullscreen) {
			this.finishedChecks = false;
			this.landscapeImage!.alpha = 1;
			this.helpText!.setText(this.textOrientationFullscreen);
		} else if (!this.scale.isLandscape && this.scale.isFullscreen) {
			this.finishedChecks = false;
			this.landscapeImage!.alpha = 1;
			this.helpText!.setText(this.textOrientation);
		} else if (this.scale.isLandscape && !this.scale.isFullscreen) {
			this.finishedChecks = false;
			this.landscapeImage!.alpha = 0;
			this.helpText!.setText(this.textFullscreen);
		} else if (!this.finishedChecks) {
			this.finishedChecks = true;
			this.goNextScene();
		}
		this.helpText!.setWordWrapWidth(this.cameras.main.width - 50);
	}
}
