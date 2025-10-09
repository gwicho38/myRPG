import Phaser from 'phaser';
import { IconNamesConst } from '../consts/UI/IconNames';
import { LuminusHUDProgressBar } from '../plugins/HUD/LuminusHUDProgressBar';
import { LuminusMessageLog } from '../plugins/HUD/LuminusMessageLog';
import { LuminusUtils } from '../utils/LuminusUtils';
import { AttributeSceneName } from './AttributeScene';
import { InventorySceneName } from './InventoryScene';
import { SceneToggleWatcher } from './watchers/SceneToggleWatcher';
import { Player } from '../entities/Player';

/**
 * Scene for HUD Creation. It contains all the HUD of the game.
 * @class
 */
export class HUDScene extends Phaser.Scene {
	/**
	 * The Player game Object.
	 */
	player!: Player;

	/**
	 * Maximize image/sprite name.
	 * @default
	 */
	maximizeSpriteName: string;

	/**
	 * The offset of the x position. Take in account that the x position will be from right to left side.
	 */
	baseSpriteOffsetX: number;

	/**
	 * Maximize image/sprite offset X;
	 * @default
	 */
	maximizeSpriteOffsetX: number;

	/**
	 * Maximize image/sprite offset y;
	 * @default
	 */
	maximizeSpriteOffsetY: number;

	baseSpriteOffsetY: number;

	/**
	 * Settings image/sprite name.
	 * @default
	 */
	settingsSpriteName: string;

	/**
	 * Maximize image/sprite offset X;
	 * @default
	 */
	settingsSpriteOffsetX: number;

	/**
	 * Maximize image/sprite offset y;
	 * @default
	 */
	settingsSpriteOffsetY: number;

	/**
	 * Inventory image/sprite name.
	 * @default
	 */
	inventorySpriteName: string;

	/**
	 * Inventory image/sprite offset X;
	 * @default
	 */
	inventorySpriteOffsetX: number;

	/**
	 * Inventory image/sprite offset y;
	 * @default
	 */
	inventorySpriteOffsetY: number;

	/**
	 * The default Scale of the inventory icon.
	 * @default
	 */
	inventorySpriteScale: number;

	/**
	 * The maximixe Image that will change the resolution.
	 * @default
	 */
	maximize!: Phaser.GameObjects.Image;
	/**
	 * The Settings Image that will change the resolution.
	 * @default
	 */
	settingsIcon!: Phaser.GameObjects.Image;
	/**
	 * The Inventory Image that will open the inventory.
	 * @default
	 */
	inventoryIcon!: Phaser.GameObjects.Image;

	/**
	 * The name of the Settings Scene.
	 * @default
	 */
	settingSceneName: string;

	/**
	 * The name of the Inventory Scene.
	 * @default
	 */
	inventorySceneName: string;

	/**
	 * The Image that indicates the HP of the Player.
	 * @default
	 */
	hp_hud!: Phaser.GameObjects.Image;

	sp_hud!: Phaser.GameObjects.Image;

	/**
	 * The Health bar that will display the player's current HP
	 */
	health_bar!: LuminusHUDProgressBar;

	/**
	 * The message log that displays game events
	 */
	messageLog!: LuminusMessageLog;

	/**
	 * The inventory sprite shortcut name.
	 * @default
	 */
	inventoryShortcutSprite: string;

	/**
	 * The Console Inventory Sprite Name.
	 * @default
	 */
	inventoryShortcutIconXbox: string;

	/**
	 * The Icon for the attributes menu.
	 * @default
	 */
	attributesShortcutIconDesktop: string;
	/**
	 * The Icon for the attributes menu XBOX.
	 * @default
	 */
	attributesShortcutIconXbox: string;

	/**
	 * The icon that represents
	 * @default
	 */
	inventoryShortcutIcon: Phaser.GameObjects.Image | null;

	level_text!: Phaser.GameObjects.Text | null;

	/**
	 * The book attributes icon.
	 */
	attributesBook!: Phaser.GameObjects.Image;

	/**
	 * The name of the Attribute Management/Info Scene.
	 * @default
	 */
	attributeSceneName: string;

	/**
	 * The name of the Icon of the Attributes Scene Button.
	 * @default
	 */
	attributesBookSpriteName: string;

	attributesShortcutIcon: Phaser.GameObjects.Image | null;

	saveButton!: Phaser.GameObjects.Text;

	constructor() {
		super({
			key: 'HUDScene',
		});

		this.maximizeSpriteName = 'maximize';
		this.baseSpriteOffsetX = 50;
		this.maximizeSpriteOffsetX = 50;
		this.maximizeSpriteOffsetY = 50;
		this.baseSpriteOffsetY = 50;
		this.settingsSpriteName = 'cog_settings';
		this.settingsSpriteOffsetX = 100;
		this.settingsSpriteOffsetY = 50;
		this.inventorySpriteName = 'inventory_box';
		this.inventorySpriteOffsetX = 150;
		this.inventorySpriteOffsetY = 50;
		this.inventorySpriteScale = 1;
		this.settingSceneName = 'SettingScene';
		this.inventorySceneName = InventorySceneName;
		this.inventoryShortcutSprite = IconNamesConst.HUDScene.inventory.desktop;
		this.inventoryShortcutIconXbox = IconNamesConst.HUDScene.inventory.xbox;
		this.attributesShortcutIconDesktop = IconNamesConst.HUDScene.attributes.desktop;
		this.attributesShortcutIconXbox = IconNamesConst.HUDScene.attributes.xbox;
		this.inventoryShortcutIcon = null;
		this.level_text = null;
		this.attributeSceneName = AttributeSceneName;
		this.attributesBookSpriteName = 'book_ui';
		this.attributesShortcutIcon = null;
	}

	init(args: any): void {
		this.player = args.player;
	}

	/**
	 * Phaser default create scene.
	 */
	create(): void {
		this.hp_hud = this.add.image(25, 25, 'hp_hud_2x');

		this.sp_hud = this.add.image(25, 45, 'sp_hud_2x');

		this.health_bar = new LuminusHUDProgressBar(this, this.hp_hud.x, this.hp_hud.y, this.hp_hud.width, this.player);

		this.maximize = this.add
			.image(
				this.cameras.main.width - this.maximizeSpriteOffsetX,
				this.maximizeSpriteOffsetY,
				this.maximizeSpriteName
			)
			.setInteractive();

		this.settingsIcon = this.add
			.image(
				this.cameras.main.width - this.settingsSpriteOffsetX,
				this.settingsSpriteOffsetY,
				this.settingsSpriteName
			)
			.setInteractive();

		this.inventoryIcon = this.add
			.image(
				this.cameras.main.width - this.inventorySpriteOffsetX,
				this.inventorySpriteOffsetY,
				this.inventorySpriteName
			)
			.setInteractive()
			.setScale(this.inventorySpriteScale);

		this.attributesBook = this.add
			.image(
				this.cameras.main.width - this.baseSpriteOffsetX * 4.1,
				this.baseSpriteOffsetY,
				this.attributesBookSpriteName
			)
			.setInteractive();

		this.maximize.on('pointerup', () => {
			this.scale.toggleFullscreen();
		});

		// Launches Attribute Scene Scene.
		this.attributesBook.on('pointerup', () => {
			if (!this.scene.isVisible(this.attributeSceneName)) {
				this.scene.launch(this.attributeSceneName, {
					player: this.player,
				});
			} else {
				this.scene.get(this.attributeSceneName).scene.stop();
				// this.scene.stop(this.inventorySceneName);
			}
		});

		// Launches Inventory Scene.s
		this.inventoryIcon.on('pointerup', () => {
			SceneToggleWatcher.toggleScene(this, this.inventorySceneName, this.player);
		});

		if (!LuminusUtils.isMobile() || (LuminusUtils.isMobile() && this.input.gamepad!.pad1)) {
			this.createInventoryShortcutIcon();
			this.createAttributesShortcutIcon();
		}

		if (this.input.gamepad!.pad1) {
			this.createInventoryShortcutIcon();
			this.createAttributesShortcutIcon();
			this.setGamepadTextures();
		}

		this.input.gamepad!.on('connected', () => {
			this.createInventoryShortcutIcon();
			this.createAttributesShortcutIcon();
			this.setGamepadTextures();
		});
		this.input.gamepad!.on('disconnected', () => {
			this.inventoryShortcutIcon!.setTexture(this.inventoryShortcutSprite);
			this.attributesShortcutIcon!.setTexture(this.attributesShortcutIconDesktop);
		});

		// Launch the settings Scene.
		this.settingsIcon.on('pointerdown', () => {
			if (!this.scene.isVisible(this.settingSceneName)) {
				this.scene.launch(this.settingSceneName);
			} else {
				this.scene.stop(this.settingSceneName);
			}
		});

		this.scale.on('resize', (resize: Phaser.Structs.Size) => {
			this.resizeAll(resize);
		});
		// All Scenes have to be stopped before they are called to launch.
		this.scene.stop(this.inventorySceneName);
		this.scene.stop(this.settingSceneName);
		this.scene.stop(this.attributeSceneName);

		this.level_text = this.add.text(15, 75, 'LvL ' + this.player.attributes.level, {
			color: '#ffffff',
		});

		this.createSaveButton();
		this.createMessageLog();
	}

	createMessageLog(): void {
		const logWidth = 600;
		const logHeight = 140;
		const logX = this.cameras.main.width - logWidth - 10;
		const logY = this.cameras.main.height - logHeight - 10;

		this.messageLog = new LuminusMessageLog(this, logX, logY, logWidth, logHeight);

		// Welcome message
		this.messageLog.log('✨ Welcome to Luminus RPG!');
		this.messageLog.log('🎮 Use arrow keys or WASD to move');
		this.messageLog.log('⚔️ Press Space to attack nearby enemies');
	}

	createSaveButton(): void {
		this.saveButton = this.add.text(this.cameras.main.width - 80, 20, 'SAVE', {
			fontSize: '14px',
			color: '#ffffff',
			backgroundColor: '#333333',
			padding: { x: 8, y: 4 },
		});
		this.saveButton.setScrollFactor(0);
		this.saveButton.setInteractive();
		this.saveButton.on('pointerdown', () => {
			const mainScene =
				this.scene.get('MainScene') ||
				this.scene.get('TownScene') ||
				this.scene.get('CaveScene') ||
				this.scene.get('OverworldScene') ||
				this.scene.get('DungeonScene');
			if (mainScene && (mainScene as any).saveManager) {
				(mainScene as any).saveManager.saveGame(false);
			}
		});
		this.saveButton.on('pointerover', () => {
			this.saveButton.setStyle({ backgroundColor: '#555555' });
		});
		this.saveButton.on('pointerout', () => {
			this.saveButton.setStyle({ backgroundColor: '#333333' });
		});
	}

	/**
	 * Creates the inventory shortcut image.
	 */
	createInventoryShortcutIcon(): void {
		if (!this.inventoryShortcutIcon) {
			this.inventoryShortcutIcon = this.add.image(
				this.settingsIcon.x - 70,
				this.settingsIcon.y + 15,
				this.inventoryShortcutSprite
			);
			this.inventoryShortcutIcon.setDisplaySize(30, 30);
		}
	}

	createAttributesShortcutIcon(): void {
		if (!this.attributesShortcutIcon) {
			this.attributesShortcutIcon = this.add
				.image(
					this.attributesBook.x - this.attributesBook.width / 2,
					this.attributesBook.y + 15,
					this.attributesShortcutIconDesktop
				)
				.setDisplaySize(30, 30);
		}
	}

	/**
	 * Sets the GamePad Textures.
	 * If the gamepad is connected, it should use the gamepad textures.
	 */
	setGamepadTextures(): void {
		if (this.inventoryShortcutIcon) this.inventoryShortcutIcon.setTexture(this.inventoryShortcutIconXbox);
		if (this.attributesShortcutIcon) this.attributesShortcutIcon.setTexture(this.attributesShortcutIconXbox);
		// this.attributesShortcutIconXbox
	}

	/**
	 * Resizes everything
	 * @param size the new size.
	 */
	resizeAll(size: Phaser.Structs.Size): void {
		if (this.maximize)
			this.maximize.setPosition(size.width - this.maximizeSpriteOffsetX, this.maximizeSpriteOffsetY);

		if (this.settingsIcon)
			this.settingsIcon.setPosition(size.width - this.settingsSpriteOffsetX, this.settingsSpriteOffsetY);

		this.inventoryIcon.setPosition(size.width - this.inventorySpriteOffsetX, this.inventorySpriteOffsetY);
		if (this.inventoryShortcutIcon)
			this.inventoryShortcutIcon.setPosition(this.settingsIcon.x - 70, this.settingsIcon.y + 15);

		if (this.attributesBook)
			this.attributesBook.setPosition(
				this.cameras.main.width - this.baseSpriteOffsetX * 4.1,
				this.baseSpriteOffsetY
			);
		if (this.attributesShortcutIcon)
			this.attributesShortcutIcon.setPosition(
				this.attributesBook.x - this.attributesBook.width / 2,
				this.attributesBook.y + 15
			);

		// Reposition message log
		if (this.messageLog) {
			const logWidth = 600;
			const logHeight = 140;
			const logX = size.width - logWidth - 10;
			const logY = size.height - logHeight - 10;
			this.messageLog.setPosition(logX, logY);
		}

		// Reposition save button
		if (this.saveButton) {
			this.saveButton.setPosition(size.width - 80, 20);
		}
	}

	/**
	 * Static helper to log messages from anywhere in the game
	 */
	public static log(scene: Phaser.Scene, message: string): void {
		const hudScene = scene.scene.get('HUDScene') as HUDScene;
		if (hudScene && hudScene.messageLog) {
			hudScene.messageLog.log(message);
		}
	}

	update(): void {
		if (this.level_text) this.level_text.setText('LvL ' + this.player.attributes.level);
	}
}
