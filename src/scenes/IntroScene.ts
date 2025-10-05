import Phaser from 'phaser';

/**
 * The Introduction Scene.
 * @class
 */
export class IntroScene extends Phaser.Scene {
	/**
	 * The mid center of the screen in the horizontal position;
	 */
	centerX!: number;

	/**
	 * The mid center of the screen in the vertical position;
	 */
	centerY!: number;

	/**
	 * The phaser logo image.
	 */
	logo_phaser!: Phaser.GameObjects.Image;

	/**
	 * The text that will show along side the phaser Logo.
	 */
	logo_phaser_text!: Phaser.GameObjects.Text;

	/**
	 * The partibles that will spawn on the phaser logo.
	 */
	particles_logo!: Phaser.GameObjects.Particles.ParticleEmitter;

	/**
	 * The Studio image game object to display.
	 */
	studioImage!: Phaser.GameObjects.Image;

	/**
	 * The text game object to display with the game studio.
	 */
	studioText!: Phaser.GameObjects.Text;

	/**
	 * The font size of the text above the logo.
	 * @default
	 */
	logoTextFontSize: number;

	/**
	 * The phaser logo Sprite / Texture name
	 * @default
	 */
	phaserLogoSpriteName: string;

	/**
	 * The Phaser logo text.
	 * @default
	 */
	phaserLogoText: string;

	/**
	 * The phaser logo text.
	 * @default
	 */
	logoPhaserFontFamily: string;

	/**
	 * The Luminus logo sprite / texture name
	 * @default
	 */
	luminusLogo: string;

	/**
	 * The Luminus logo Text.
	 * @default
	 */
	luminusLogoText: string;

	/**
	 * Particles Sprite / Texture name.
	 * @default
	 */
	particlesSpriteName: string;

	/**
	 * The Luminus Logo font Family.
	 * @default
	 */
	luminusLogoFontFamily: string;

	/**
	 * The font size of the text above the luminus logo.
	 * @default
	 */
	luminusLogoFontSize: string;

	/**
	 * Returns if the device is mobile
	 * @default
	 */
	isMobile: boolean | null;

	/**
	 * Track completed tweens
	 */
	tweensCompleted: number;

	/**
	 * Total number of tweens to wait for
	 */
	totalTweens: number;

	/**
	 * This scene is responsible for presenting the introduction of the Game.
	 */
	constructor() {
		super({
			key: 'IntroScene',
		});

		this.logoTextFontSize = 35;
		this.phaserLogoSpriteName = 'logo_phaser';
		this.phaserLogoText = 'Proudly created with';
		this.logoPhaserFontFamily = "'Press Start 2P'";
		this.luminusLogo = 'luminus_candle';
		this.luminusLogoText = 'Luminus Game Studio';
		this.particlesSpriteName = 'flares';
		this.luminusLogoFontFamily = "'Press Start 2P'";
		this.luminusLogoFontSize = '25px';
		this.isMobile = null;
		this.tweensCompleted = 0;
		this.totalTweens = 2;
	}

	create(): void {
		this.isMobile = !this.sys.game.device.os.desktop ? true : false;
		this.centerX = this.scale.width / 2;
		this.centerY = this.scale.height / 2;
		this.tweensCompleted = 0;
		this.totalTweens = 2;

		// LOGO Part.
		this.createPhaserLogo();
		this.createLuminusLogo();

		// this.input.on('pointerdown', (pointer) => {
		//     this.timeline.destroy();
		//     this.scene.launch('MainScene');
		// });

		this.scale.on('resize', (size: Phaser.Structs.Size) => {
			// console.log(size);
			if (this.scene.isVisible()) {
				this.resizeAll(size);
			}
		});
	}

	/**
	 *
	 * @param size new size of the game.
	 */
	resizeAll(size: Phaser.Structs.Size): void {
		this.centerX = size.width / 2;
		this.centerY = size.height / 2;
		this.logo_phaser.setPosition(this.centerX, this.centerY);
		this.logo_phaser_text.setPosition(
			this.centerX,
			this.centerY - this.logo_phaser.height / 2 - this.mobileMargin()
		);
		this.studioImage.setPosition(this.centerX, this.centerY);
		this.studioText.setPosition(this.centerX, this.centerY - this.studioImage.height / 2 - this.mobileMargin());
	}

	mobileMargin(): number {
		return this.isMobile == true ? 15 : 60;
	}

	/**
	 * Creates the Phaser logo to present with the the particles.
	 */
	createPhaserLogo(): void {
		this.logo_phaser = this.add.image(this.centerX, this.centerY, this.phaserLogoSpriteName);
		this.logo_phaser.alpha = 0;

		if (this.scale.height / this.logo_phaser.height > 0.7) {
			this.logo_phaser.setScale(0.5);
		}

		this.logo_phaser_text = this.add.text(
			this.centerX,
			this.centerY - (this.logo_phaser.height * this.logo_phaser.scaleY) / 2 - this.mobileMargin(),
			this.phaserLogoText,
			{
				wordWrap: {
					width: this.cameras.main.width - 50,
				},
				fontFamily: this.logoPhaserFontFamily,
				fontSize: `${this.logoTextFontSize * this.logo_phaser.scale}px`,
			}
		);
		this.logo_phaser_text.setOrigin(0.5, 0.5);
		this.logo_phaser_text.alpha = 0;

		const textures = this.textures;

		const origin = this.logo_phaser.getTopLeft();
		let pixel: Phaser.Display.Color;
		const logoSource = {
			getRandomPoint: (vec: Phaser.Math.Vector2) => {
				do {
					const x = Phaser.Math.Between(0, this.logo_phaser.width * this.logo_phaser.scaleX - 1);
					const y = Phaser.Math.Between(0, this.logo_phaser.height * this.logo_phaser.scaleY - 1);
					pixel = textures.getPixel(x, y, this.phaserLogoSpriteName)!;
					return vec.setTo(x + origin.x, y + origin.y);
				} while (pixel.alpha < 255);
			},
		};

		this.particles_logo = this.add.particles(0, 0, this.particlesSpriteName, {
			lifespan: 1000,
			gravityY: 10,
			scale: { start: 0, end: 0.25, ease: 'Quad.easeOut' },
			alpha: { start: 1, end: 0, ease: 'Quad.easeIn' },
			blendMode: 'ADD',
			emitZone: { type: 'random', source: logoSource as any },
		});

		this.tweens.add({
			targets: [this.logo_phaser, this.logo_phaser_text, this.particles_logo],
			alpha: { from: 0, to: 1 },
			duration: 2000,
			yoyo: true,
			onComplete: () => {
				this.particles_logo.destroy();
				this.onTweenComplete();
			},
		});
	}

	createLuminusLogo(): void {
		this.studioImage = this.add.image(this.centerX, this.centerY, this.luminusLogo);
		this.studioImage.alpha = 0;

		this.studioText = this.add.text(
			this.centerX,
			this.centerY - this.studioImage.height / 2 - 60,
			this.luminusLogoText,
			{
				fontFamily: this.luminusLogoFontFamily,
				fontSize: this.luminusLogoFontSize,
			}
		);
		this.studioText.setOrigin(0.5, 0.5);
		this.studioText.alpha = 0;

		this.tweens.add({
			targets: [this.studioImage, this.studioText],
			alpha: { from: 0, to: 1 },
			duration: 2000,
			yoyo: true,
			delay: 4000, // Start after the first tween completes
			onComplete: () => {
				this.onTweenComplete();
			},
		});
	}

	onTweenComplete(): void {
		this.tweensCompleted++;
		if (this.tweensCompleted >= this.totalTweens) {
			this.scene.start('MainMenuScene');
		}
	}
}
