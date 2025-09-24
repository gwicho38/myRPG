import Phaser from 'phaser';
import { LuminusInterfaceController } from '../plugins/LuminusInterfaceController';
import { LuminusSaveManager } from '../plugins/LuminusSaveManager';
import intro_video from '../assets/video/intro_video_converted_FULLHD.mp4';
import { NineSlice } from 'phaser3-nineslice';
import { PanelComponent } from '../components/PanelComponent';

export class MainMenuScene extends Phaser.Scene {
	constructor() {
		super({
			key: 'MainMenuScene',
		});

		/**
		 * @type { LuminusInterfaceController }
		 */
		this.luminusInterfaceControler = null;

		/**
		 * The Start Game Button text.
		 * @type { Phaser.GameObjects.Text }
		 */
		this.gameStartText = null;

		/**
		 * The Offset of the Nine Slice background. It's used to protect the background from streching.
		 * It will make it responsive in any scale size without losing resolution.
		 * @type { number }
		 * @default
		 */
		this.nineSliceOffset = 10;

		/**
		 * Max width of the text inside the dialog.
		 * @type { number }
		 * @default
		 */
		this.textWidth = 452; // Defines the text Width.

		/**
		 * The Font Family of the scene.
		 * @type { string }
		 * @default
		 */
		this.fontFamily = '"Press Start 2P"';

		/**
		 * The last InteractionControler Current Action.
		 *  @type { any }
		 */
		this.lastMenuAction = null;
	}

	preload() {
		this.load.video('intro_video', intro_video, 'loadeddata', false, true);
	}

	create() {
		this.video = this.add.video(this.cameras.main.x, this.cameras.main.y, 'intro_video');

		if (this.scale.orientation === 'portrait-primary') {
			this.video.setScale(2);
			this.video.setOrigin(0.4, 0);
		} else {
			// if Landscape, just fits the video on the canvas.
			this.video.scaleX = this.cameras.main.width / this.video.width;
			this.video.scaleY = this.cameras.main.height / this.video.height;
			this.video.setOrigin(0, 0);
		}

		this.video.setLoop(true);
		this.video.play();

		// Prevents video freeze when game is out of focus (i.e. user changes tab on the browser)
		this.video.setPaused(false);

		this.sound.volume = 0.35;
		this.themeSound = this.sound.add('forest', {
			loop: true,
		});
		this.themeSound.play();
		this.luminusInterfaceControler = new LuminusInterfaceController(this);

		this.gameStartText = this.add
			.text(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y, 'Start Game', {
				fontSize: 34,
				fontFamily: '"Press Start 2P"',
			})
			.setOrigin(0.5, 0.5)
			.setInteractive();

		this.gameStartText.on('pointerdown', (pointer) => {
			this.startGame();
		});

		this.saveManager = new LuminusSaveManager(this);

		this.loadGameText = this.add
			.text(this.gameStartText.x, this.gameStartText.y + 60, 'Load Game', {
				fontSize: 34,
				fontFamily: this.fontFamily,
				color: this.saveManager.hasSaveData() ? '#ffffff' : '#666666',
			})
			.setOrigin(0.5, 0.5)
			.setInteractive();

		this.loadGameText.on('pointerdown', (pointer) => {
			if (this.saveManager.hasSaveData()) {
				this.loadGame();
			}
		});

		this.creditsText = this.add
			.text(this.gameStartText.x, this.gameStartText.y + 120, 'Credits', {
				fontSize: 34,
				fontFamily: this.fontFamily,
			})
			.setOrigin(0.5, 0.5)
			.setInteractive();

		this.creditsText.on('pointerdown', (pointer, object) => {
			console.log(object);
			this.showCredits();
		});

		this.setMainMenuActions();

		this.scale.on('resize', (resize) => {
			this.resizeAll(resize);
		});
	}

	/**
	 * resizes the game canvas.
	 */
	resizeAll(size) {
		if (size && this && this.cameras && this.cameras.main) {
			this.gameStartText.setPosition(size.width / 2, size.height / 2);
			this.loadGameText.setPosition(this.gameStartText.x, this.gameStartText.y + 60);
			this.creditsText.setPosition(this.gameStartText.x, this.gameStartText.y + 120);
			this.video.setPosition(this.cameras.main.x, this.cameras.main.y);
			if (size.aspectRatio < 1) {
				this.video.setScale(2);
				this.video.setOrigin(0.4, 0);
			} else {
				// if Landscape, just fits the video on the canvas.
				this.video.scaleX = this.cameras.main.width / this.video.width;
				this.video.scaleY = this.cameras.main.height / this.video.height;
				this.video.setOrigin(0, 0);
			}
		}
	}

	setMainMenuActions() {
		// Sets the Firts action.
		this.luminusInterfaceControler.interfaceElements[0] = [];
		this.luminusInterfaceControler.interfaceElements[0][0] = [];
		const firstAction = {
			element: this.gameStartText,
			action: 'startGame',
			context: this,
			args: 'MainScene',
		};
		this.luminusInterfaceControler.closeAction = null;
		this.luminusInterfaceControler.currentElementAction = firstAction;
		this.luminusInterfaceControler.interfaceElements[0][0].push(firstAction);

		const loadGameAction = {
			element: this.loadGameText,
			action: 'loadGame',
			context: this,
			args: null,
		};
		this.luminusInterfaceControler.interfaceElements[0][1] = [];
		this.luminusInterfaceControler.interfaceElements[0][1].push(loadGameAction);

		const credits = {
			element: this.creditsText,
			action: 'showCredits',
			context: this,
			args: 'Credits',
		};
		this.luminusInterfaceControler.interfaceElements[0][2] = [];
		this.luminusInterfaceControler.interfaceElements[0][2].push(credits);

		this.luminusInterfaceControler.updateHighlightedElement(firstAction.element);
	}

	showCredits() {
		this.luminusInterfaceControler.menuHistoryAdd();
		this.panelComponent = new PanelComponent(this);
		this.creditsBackground = this.panelComponent.panelBackground;
		this.creditsTitle = this.panelComponent.panelTitle;
		this.creditsTitleText = this.panelComponent.panelTitleText;
		this.panelComponent.setTitleText('Credits');
		this.closeButton = this.panelComponent.closeButton;
		this.creditsTextContent = this.add
			.text(
				this.creditsBackground.x + 30,
				this.creditsBackground.y + this.panelComponent.backgroundMainContentPaddingTop,
				`Multiple Songs by Matthew Pablo https://matthewpablo.com/services/

Forest - Intro Scene Music by "syncopika"
            `,
				{
					wordWrap: {
						width: this.textWidth,
					},
					fontSize: 11,
					fontFamily: this.fontFamily,
				}
			)
			.setOrigin(0, 0);

		const closeAction = {
			element: this.closeButton,
			action: 'closeCredits',
			context: this,
			args: '',
		};
		this.luminusInterfaceControler.removeCurrentSelectionHighlight();
		this.luminusInterfaceControler.clearItems();
		this.luminusInterfaceControler.closeAction = closeAction;
		this.luminusInterfaceControler.currentElementAction = closeAction;
		this.luminusInterfaceControler.interfaceElements[0] = [];
		this.luminusInterfaceControler.interfaceElements[0][0] = [];
		this.luminusInterfaceControler.interfaceElements[0][0].push(closeAction);
		this.luminusInterfaceControler.updateHighlightedElement(closeAction.element);

		this.closeButton.on('pointerup', (pointer) => {
			this.closeCredits();
		});
	}

	closeCredits() {
		this.panelComponent.destroy();
		this.creditsTextContent.destroy();
		this.luminusInterfaceControler.closeAction = null;
		this.luminusInterfaceControler.currentElementAction = null;
		this.luminusInterfaceControler.clearItems();
		this.setMainMenuActions();
		this.luminusInterfaceControler.menuHistoryRetrieve();
	}

	startGame() {
		this.themeSound.stop();
		this.cameras.main.fadeOut(1000, 0, 0, 0);
		const startSound = this.sound.add('start_game');
		startSound.play();
		this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
			this.scene.start('MobileCheckScene');
			this.scene.stop();
		});
	}

	loadGame() {
		if (!this.saveManager.hasSaveData()) {
			return;
		}

		const saveData = this.saveManager.loadGame(false);
		if (saveData) {
			this.themeSound.stop();
			this.cameras.main.fadeOut(1000, 0, 0, 0);
			const startSound = this.sound.add('start_game');
			startSound.play();
			this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
				this.scene.start(saveData.scene);
				this.scene.stop();

				setTimeout(() => {
					const targetScene = this.scene.get(saveData.scene);
					if (targetScene && targetScene.saveManager) {
						targetScene.saveManager.applySaveData(saveData);
					}
				}, 100);
			});
		}
	}
}
