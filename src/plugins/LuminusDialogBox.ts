import Phaser from 'phaser';
import { NineSlice } from 'phaser3-nineslice';
import { Player } from '../entities/Player';
import { LuminusTypingSoundManager } from './LuminusTypingSoundManager';
import { LuminusVideoOpener } from './LuminusVideoOpener';

// Interface for dialog chat data
export interface IDialogChat {
	message: string;
	index: number;
	left?: boolean;
	right?: boolean;
	leftName?: string;
	rightName?: string;
	leftPortraitName?: string;
	rightPortraitName?: string;
	leftExit?: boolean;
	rightExit?: boolean;
}

// Interface for dialog text message object
export interface IDialogTextMessage extends Phaser.GameObjects.Text {
	setPosition(x: number, y: number): this;
	setStyle(style: Phaser.Types.GameObjects.Text.TextStyle): this;
}

// Interface for dialog object
export interface IDialog extends NineSlice {
	textMessage?: IDialogTextMessage;
	visible: boolean;
	x: number;
	y: number;
	scaleX: number;
}

/**
 * Dialog box system for displaying conversations with typewriter effect and character portraits
 */
export class LuminusDialogBox {
	public scene: Phaser.Scene;
	public player: Player;
	public dialogSpriteName: string;
	public actionButtonSpriteName: string;
	public interactionSpriteName: string;
	public animationIteractionIconName: string;
	public mobileActionButtonSpriteName: string;
	public actionButtonKeyCode: number;
	public dialogHeight: number;
	public margin: number;
	public dialogMaxLines: number;
	public fontWidth: number;
	public fontFamily: string;
	public fontSize: string;
	public fontColor: Phaser.Display.Color;
	public letterSpacing: number;
	public lineSpacing: number;
	public textWidth: number;
	public canShowDialog: boolean;
	public gamepad: Phaser.Input.Gamepad.Gamepad | null;
	public cameraWidth: number;
	public cameraHeight: number;
	public dialog: IDialog;
	public actionButton: Phaser.GameObjects.Image;
	public interactionIcon: Phaser.GameObjects.Sprite;
	public leftPortraitImage: Phaser.GameObjects.Image;
	public rightPortraitImage: Phaser.GameObjects.Image;
	public leftNameText: Phaser.GameObjects.Text;
	public rightNameText: Phaser.GameObjects.Text;
	public keyObj: Phaser.Input.Keyboard.Key;
	public buttonA: any;
	public buttonB: any;
	public luminusTypingSoundManager: LuminusTypingSoundManager;
	public luminusVideoOpener: LuminusVideoOpener;
	public isOverlapingChat: boolean;
	public showRandomChat: boolean;
	public chat: IDialogChat[];
	public currentChat: IDialogChat | null;
	public dialogMessage: string;
	public pagesMessage: string[];
	public pagesNumber: number;
	public currentPage: number;
	public isAnimatingText: boolean;
	public animationText: string[];
	public eventCounter: number;
	public timedEvent: Phaser.Time.TimerEvent | null;

	/**
	 * This class allows one to create Dialogs.
	 * It's possible to set the Action Hotkey, Action button Sprite, Dialog Sprite image,
	 * Interaction icon above player.
	 */
	constructor(scene: Phaser.Scene, player: Player) {
		/**
		 * Scene Context.
		 */
		this.scene = scene;

		/**
		 * Player Game Object.
		 */
		this.player = player;

		/**
		 * Name of the sprite image that will be the dialog.
		 */
		this.dialogSpriteName = 'dialog';

		/**
		 * Name of the Sprite of the button action.
		 */
		this.actionButtonSpriteName = 'space';

		/**
		 * Interaction sprite name.
		 */
		this.interactionSpriteName = 'chat_bubble_animation';

		/**
		 * The name of the animation that the iteraction icon will play.
		 */
		this.animationIteractionIconName = 'chat_bubble_animation';

		/**
		 * Name of the Sprite of the Mobile button action.
		 */
		this.mobileActionButtonSpriteName = 'buttonA';

		/**
		 * Current action button key code.
		 */
		this.actionButtonKeyCode = Phaser.Input.Keyboard.KeyCodes.SPACE;

		/**
		 * Dialog height.
		 */
		this.dialogHeight = 150;

		/**
		 * Margin of the dialog. Used to make spaces in the dialog.
		 */
		this.margin = 15;

		/**
		 * Number of maximum lines that fit on the dialog.
		 */
		this.dialogMaxLines = 4;

		/**
		 * Width of one font character.
		 */
		this.fontWidth = 6;

		/**
		 * Default family of the font.
		 */
		this.fontFamily = "'Press Start 2P'";

		/**
		 * Default font size.
		 */
		this.fontSize = '11px';

		/**
		 * Color of the font.
		 */
		this.fontColor = new Phaser.Display.Color(255, 255, 255, 1);

		/**
		 * Letter spacing.
		 */
		this.letterSpacing = 1;

		/**
		 * Space between lines of the dialog text.
		 */
		this.lineSpacing = 6;

		/**
		 * Max width of the text inside the dialog.
		 */
		this.textWidth = 0;

		/**
		 * Rather it can show de dialog of not.
		 */
		this.canShowDialog = true;

		/**
		 * GamePad Support.
		 */
		this.gamepad = null;

		// Initialize camera dimensions
		this.cameraWidth = 0;
		this.cameraHeight = 0;

		// Initialize dialog state
		this.isOverlapingChat = false;
		this.showRandomChat = false;
		this.chat = [];
		this.currentChat = null;
		this.dialogMessage = '';
		this.pagesMessage = [];
		this.pagesNumber = 0;
		this.currentPage = 0;
		this.isAnimatingText = false;
		this.animationText = [];
		this.eventCounter = 0;
		this.timedEvent = null;

		// Initialize dialog objects (will be created in create method)
		this.dialog = null as any;
		this.actionButton = null as any;
		this.interactionIcon = null as any;
		this.leftPortraitImage = null as any;
		this.rightPortraitImage = null as any;
		this.leftNameText = null as any;
		this.rightNameText = null as any;
		this.keyObj = null as any;
		this.buttonA = null;
		this.buttonB = null;
		this.luminusTypingSoundManager = null as any;
		this.luminusVideoOpener = null as any;
	}

	/**
	 * Initialize the dialog system
	 */
	create(): void {
		this.luminusTypingSoundManager = new LuminusTypingSoundManager(this.scene);
		this.luminusTypingSoundManager.create();

		this.luminusVideoOpener = new LuminusVideoOpener(this.scene);

		this.createDialogueBox();
		this.createDialogueElements();
		this.createInteractionButtons();

		this.keyObj = this.scene.input.keyboard!.addKey(this.actionButtonKeyCode);

		// GamePad Support
		if (this.scene.input.gamepad && this.scene.input.gamepad.total > 0) {
			this.gamepad = this.scene.input.gamepad.getPad(0);
		}

		if (this.gamepad) {
			this.setGamepadTextures();
		}

		this.scene.events.on('update', this.checkUpdate, this);
		this.scene.scale.on('resize', this.resizeComponents, this);
	}

	/**
	 * Create dialog box background
	 */
	createDialogueBox(): void {
		this.cameraWidth = this.scene.cameras.main.width;
		this.cameraHeight = this.scene.cameras.main.height;
		this.textWidth = this.cameraWidth - this.margin * 3;

		this.dialog = this.scene.add.nineslice(
			this.margin,
			this.cameraHeight - this.dialogHeight - this.margin,
			this.cameraWidth - this.margin * 2,
			this.dialogHeight,
			this.dialogSpriteName,
			60,
			32
		) as IDialog;

		this.dialog.setScrollFactor(0, 0).setOrigin(0, 0).setDepth(999999);
		this.dialog.visible = false;
	}

	/**
	 * Create character portraits and name text elements
	 */
	createDialogueElements(): void {
		this.leftPortraitImage = this.scene.add.image(
			this.dialog.x + this.dialog.scaleX * 100,
			this.dialog.y + this.dialog.scaleY * 20,
			''
		);
		this.leftPortraitImage.setScrollFactor(0, 0);
		this.leftPortraitImage.setOrigin(0, 0);
		this.leftPortraitImage.setDepth(999999);
		this.leftPortraitImage.visible = false;

		this.rightPortraitImage = this.scene.add.image(
			this.dialog.x + this.dialog.width - this.dialog.scaleX * 100,
			this.dialog.y + this.dialog.scaleY * 20,
			''
		);
		this.rightPortraitImage.setScrollFactor(0, 0);
		this.rightPortraitImage.setOrigin(1, 0);
		this.rightPortraitImage.setDepth(999999);
		this.rightPortraitImage.visible = false;

		this.leftNameText = this.scene.add.text(
			this.leftPortraitImage.x,
			this.leftPortraitImage.y + this.leftPortraitImage.height + 5,
			'',
			{
				fontFamily: this.fontFamily,
				fontSize: this.fontSize,
				color: this.fontColor.rgba,
			}
		);
		this.leftNameText.setScrollFactor(0, 0);
		this.leftNameText.setOrigin(0, 0);
		this.leftNameText.setDepth(999999);
		this.leftNameText.visible = false;

		this.rightNameText = this.scene.add.text(
			this.rightPortraitImage.x,
			this.rightPortraitImage.y + this.rightPortraitImage.height + 5,
			'',
			{
				fontFamily: this.fontFamily,
				fontSize: this.fontSize,
				color: this.fontColor.rgba,
			}
		);
		this.rightNameText.setScrollFactor(0, 0);
		this.rightNameText.setOrigin(1, 0);
		this.rightNameText.setDepth(999999);
		this.rightNameText.visible = false;
	}

	/**
	 * Create interaction buttons and icons
	 */
	createInteractionButtons(): void {
		this.actionButton = this.scene.add
			.image(this.cameraWidth - this.margin * 4, this.cameraHeight - this.margin * 4, this.actionButtonSpriteName)
			.setScrollFactor(0, 0)
			.setOrigin(0.5, 0.5)
			.setDepth(999999);

		this.actionButton.visible = false;

		this.interactionIcon = this.scene.add
			.sprite(this.cameraWidth / 2, this.cameraHeight / 2, this.interactionSpriteName)
			.setScrollFactor(0, 0)
			.setOrigin(0.5, 0.5)
			.setDepth(999999);

		this.interactionIcon.visible = false;
		this.interactionIcon.anims.play(this.animationIteractionIconName);

		// Get mobile buttons from joystick scene
		const joystickScene = this.scene.scene.get('JoystickScene');
		if (joystickScene) {
			if ((joystickScene as any).buttonA || (joystickScene as any).buttonB) {
				this.buttonA = (joystickScene as any).buttonA;
				this.buttonB = (joystickScene as any).buttonB;
			}
		}
	}

	/**
	 * Set gamepad-specific textures
	 */
	setGamepadTextures(): void {
		this.actionButton.setTexture(this.mobileActionButtonSpriteName);
	}

	/**
	 * Check if any input buttons are currently pressed
	 */
	checkButtonsPressed(): boolean {
		return this.keyObj.isDown || this.isMobileButtonPressed() || (this.gamepad && this.gamepad.A);
	}

	/**
	 * Check if mobile buttons are pressed
	 */
	isMobileButtonPressed(): boolean {
		return (
			(this.buttonA && this.buttonA.isDown) ||
			(this.buttonB && this.buttonB.isDown) ||
			(this.gamepad && this.gamepad.A)
		);
	}

	/**
	 * Open dialog modal with specified text and callback
	 */
	openDialogModal(text: string, callback?: () => void): void {
		if (!this.canShowDialog) return;

		this.chat = [{ message: text, index: 0 }];
		this.isOverlapingChat = true;
		this.showRandomChat = true;

		if (callback) {
			this.scene.events.once('dialogComplete', callback);
		}
	}

	/**
	 * Set text content with optional typewriter animation
	 */
	setText(text: string, animate: boolean = false): void {
		// Safety check: ensure text is defined
		if (text === undefined || text === null) {
			console.warn('[LuminusDialogBox] setText called with undefined/null text - using empty string', {
				text,
				animate,
			});
			text = '';
		}

		console.log('[LuminusDialogBox] setText called', {
			textLength: text.length,
			animate,
			dialogExists: !!this.dialog,
			textMessageExists: !!this.dialog?.textMessage,
			textMessageActive: this.dialog?.textMessage?.active,
		});
		// Reset the dialog
		this.eventCounter = 0;
		this.animationText = text.split('');

		if (animate) {
			this.isAnimatingText = true;
			this.timedEvent = this.scene.time.addEvent({
				delay: 50,
				callback: this.animateText,
				callbackScope: this,
				repeat: this.animationText.length - 1,
			});
		} else {
			if (this.timedEvent) this.timedEvent.remove();
			this.isAnimatingText = false;
			if (this.dialog && this.dialog.textMessage) {
				this.dialog.textMessage.text = text;
				console.log('[LuminusDialogBox] Text set directly (no animation)');
			} else {
				console.warn('[LuminusDialogBox] Cannot set text - dialog or textMessage is null', {
					dialogExists: !!this.dialog,
					textMessageExists: !!this.dialog?.textMessage,
				});
			}
		}
	}

	/**
	 * Animate text character by character (typewriter effect)
	 */
	animateText(): void {
		if (!this.dialog || !this.dialog.textMessage) {
			console.warn('[LuminusDialogBox] animateText called but dialog or textMessage is null - skipping', {
				dialogExists: !!this.dialog,
				textMessageExists: !!this.dialog?.textMessage,
			});
			return;
		}

		this.eventCounter++;
		this.dialog.textMessage.setText(this.dialog.textMessage.text + this.animationText[this.eventCounter - 1]);
		this.luminusTypingSoundManager.type(this.animationText[this.eventCounter - 1]);

		// Stops the text animation.
		if (this.eventCounter === this.animationText.length) {
			console.log('[LuminusDialogBox] Text animation completed');
			this.isAnimatingText = false;
			this.timedEvent?.remove();
		}
	}

	/**
	 * Main update loop for dialog system
	 */
	checkUpdate(): void {
		if (this.actionButton && this.player && this.player.canMove && this.canShowDialog) {
			// Handle dialog button interactions
			this.checkButtonDown();
		}
	}

	/**
	 * Check for button presses to advance dialog
	 */
	checkButtonDown(): void {
		console.log('[LuminusDialogBox] checkButtonDown called', {
			isOverlapingChat: this.isOverlapingChat,
			showRandomChat: this.showRandomChat,
			dialogVisible: this.dialog?.visible,
			chatLength: this.chat.length,
			currentChatIndex: this.currentChat?.index,
			buttonPressed: this.checkButtonsPressed(),
		});

		if ((this.isOverlapingChat || this.showRandomChat) && this.checkButtonsPressed() && !this.dialog.visible) {
			// First time, show the Dialog.
			console.log('[LuminusDialogBox] Opening dialog (first time)');
			this.currentChat = this.chat[0];
			this.dialogMessage = this.currentChat.message;
			this.checkSpeaker();
			this.showDialog();
			if (this.player.container.body && 'maxSpeed' in this.player.container.body) {
				(this.player.container.body as Phaser.Physics.Arcade.Body).maxSpeed = 0;
			}
			// Disable player input capabilities during dialog
			this.player.canMove = false;
			this.player.canAtack = false;
			this.player.canBlock = false;
		} else if (this.isAnimatingText && this.checkButtonsPressed()) {
			// Skips the typing animation.
			console.log('[LuminusDialogBox] Skipping text animation (space pressed during typing)');
			this.setText(this.pagesMessage[this.currentPage], false);
		} else if (
			!this.isAnimatingText &&
			this.currentPage !== this.pagesNumber - 1 &&
			this.checkButtonsPressed() &&
			this.dialog.visible &&
			this.dialog.textMessage &&
			this.dialog.textMessage.active
		) {
			// Has more pages.
			console.log(`[LuminusDialogBox] Advancing to next page (${this.currentPage + 1}/${this.pagesNumber})`);
			this.currentPage++;
			this.dialog.textMessage.text = '';
			this.setText(this.pagesMessage[this.currentPage], true);
		} else if (this.currentChat && this.currentChat.index < this.chat.length - 1 && this.checkButtonsPressed()) {
			// FIXED: Added button press check to prevent auto-advance
			const index = this.currentChat.index;
			console.log(`[LuminusDialogBox] Advancing to next chat message (${index + 1}/${this.chat.length})`);
			this.currentChat = this.chat[index + 1];
			this.dialogMessage = this.currentChat.message;
			this.pagesMessage = [];
			this.setText('', false);
			this.showDialog(false);
		} else if (
			this.checkButtonsPressed() &&
			this.dialog.visible &&
			this.dialog.textMessage &&
			this.dialog.textMessage.active
		) {
			// Close dialog
			console.log('[LuminusDialogBox] Closing dialog (final page)');
			this.dialog.visible = false;
			this.actionButton.visible = false;
			this.isOverlapingChat = false;
			this.showRandomChat = false;

			// FIXED: Clean up chat state to prevent reopening
			this.chat = [];
			this.currentChat = null;
			this.dialogMessage = '';
			this.pagesMessage = [];
			this.pagesNumber = 0;
			this.currentPage = 0;

			if (this.player.container.body && 'maxSpeed' in this.player.container.body) {
				(this.player.container.body as Phaser.Physics.Arcade.Body).maxSpeed = this.player.speed;
			}
			// Re-enable player input capabilities
			this.player.canMove = true;
			this.player.canAtack = true;
			this.player.canBlock = true;
			this.scene.events.emit('dialogComplete');
		} else if (this.checkButtonsPressed()) {
			// Log when button is pressed but no action taken
			console.log('[LuminusDialogBox] Button pressed but no action taken', {
				isAnimatingText: this.isAnimatingText,
				currentPage: this.currentPage,
				pagesNumber: this.pagesNumber,
				dialogVisible: this.dialog?.visible,
				textMessageExists: !!this.dialog?.textMessage,
				textMessageActive: this.dialog?.textMessage?.active,
				isOverlapingChat: this.isOverlapingChat,
				showRandomChat: this.showRandomChat,
				chatLength: this.chat.length,
			});
		}
	}

	/**
	 * Show dialog with optional text creation
	 */
	showDialog(createText: boolean = true): void {
		console.log('[LuminusDialogBox] showDialog called', {
			createText,
			textMessageExists: !!this.dialog?.textMessage,
			pagesCount: this.pagesMessage.length,
			firstPage: this.pagesMessage[0],
			dialogMessage: this.dialogMessage,
		});
		this.currentPage = 0;
		this.dialog.visible = true;
		this.canShowDialog = false;

		// Create pages if necessary
		if (createText) this.createText();

		// Populate pagesMessage from dialogMessage if it's empty
		// (For now, we treat the entire message as a single page)
		if (this.pagesMessage.length === 0 && this.dialogMessage) {
			console.log('[LuminusDialogBox] pagesMessage empty, populating from dialogMessage');
			this.pagesMessage = [this.dialogMessage];
			this.pagesNumber = 1;
		}

		// Animate the text - but only if we have pages to show
		if (this.pagesMessage.length > 0) {
			this.setText(this.pagesMessage[0], true);
		} else {
			console.warn(
				'[LuminusDialogBox] showDialog called but pagesMessage is empty and no dialogMessage - cannot set text'
			);
		}
	}

	/**
	 * Create text element for dialog
	 */
	createText(): void {
		console.log('[LuminusDialogBox] createText called - creating new textMessage element');
		this.dialog.textMessage = this.scene.add.text(this.margin * 2, this.dialog.y + this.margin * 2.5, '', {
			wordWrap: {
				width: this.textWidth,
			},
			fontSize: this.fontSize,
			fontFamily: this.fontFamily,
			color: this.fontColor.rgba,
		}) as IDialogTextMessage;

		this.dialog.textMessage.setScrollFactor(0, 0).setDepth(999999).setOrigin(0, 0);
		console.log('[LuminusDialogBox] textMessage created successfully', {
			exists: !!this.dialog.textMessage,
			active: this.dialog.textMessage?.active,
		});
	}

	/**
	 * Handle speaker configuration (left/right character portraits)
	 */
	checkSpeaker(): void {
		this.resetSpeakersAlpha();

		if (this.currentChat?.left) {
			if (this.currentChat.leftName) {
				this.leftNameText.visible = true;
				this.leftNameText.setText(` ${this.currentChat.leftName}: `);
			} else {
				this.leftNameText.visible = false;
			}
			if (this.currentChat.leftPortraitName) {
				this.leftPortraitImage.visible = true;
				this.leftPortraitImage.setTexture(this.currentChat.leftPortraitName);
			} else {
				this.leftPortraitImage.visible = false;
			}
			this.leftNameText.alpha = 1;
			this.leftPortraitImage.alpha = 1;
		}

		if (this.currentChat?.right) {
			this.rightNameText.setText(` ${this.currentChat.rightName}: `);
			this.rightPortraitImage.setTexture(this.currentChat.rightPortraitName!);
			this.rightNameText.visible = true;
			this.rightPortraitImage.visible = true;
			this.rightNameText.alpha = 1;
			this.rightPortraitImage.alpha = 1;
		}
	}

	/**
	 * Reset speaker opacity
	 */
	resetSpeakersAlpha(): void {
		this.leftNameText.alpha = 0.5;
		this.leftPortraitImage.alpha = 0.5;
		this.rightNameText.alpha = 0.5;
		this.rightPortraitImage.alpha = 0.5;
	}

	/**
	 * Check if dialog is currently active and should block other inputs
	 */
	isDialogActive(): boolean {
		return this.dialog?.visible === true || this.isOverlapingChat || this.showRandomChat;
	}

	/**
	 * Handle component resizing
	 */
	resizeComponents(width: number, height: number): void {
		if (width !== 0 && height !== 0 && this.player && this.player.active) {
			this.cameraWidth = width;
			this.cameraHeight = height;
			this.textWidth = this.cameraWidth - this.margin * 3;
			this.dialog.x = this.margin;
			this.dialog.y = this.cameraHeight - this.dialogHeight - this.margin;
			this.dialog.setSize(this.cameraWidth - this.margin * 2, this.dialogHeight);

			if (this.dialog.textMessage && this.dialog.textMessage.visible) {
				this.dialog.textMessage.setPosition(this.dialog.textMessage.x, this.leftNameText.y + 30);
				this.dialog.textMessage.setStyle({
					wordWrap: {
						width: this.textWidth,
					},
				});
			}
		}
	}
}
