import Phaser from 'phaser';
import { ENTITIES } from '../consts/Entities';
import { AttributesManager } from '../plugins/attributes/AttributesManager';
import { LuminusHUDProgressBar } from '../plugins/HUD/LuminusHUDProgressBar';
import { LuminusHealthBar } from '../plugins/LuminusHealthBar';
import { LuminusKeyboardMouseController } from '../plugins/LuminusKeyboardMouseController';
import { LuminusMovement } from '../plugins/LuminusMovement';
import { IInventoryItem } from '../types/ItemTypes';
import { BaseEntity, IBaseEntity } from './BaseEntity';
import { EntityAttributes, IEntityAttributes } from './EntityAttributes';

/**
 * Player class extending Phaser's Arcade Sprite with game-specific functionality
 */
export class Player extends Phaser.Physics.Arcade.Sprite implements IBaseEntity {
	// BaseEntity properties
	public id: string | null = null;
	public isAtacking: boolean = false;
	public canAtack: boolean = true;
	public canMove: boolean = true;
	public canTakeDamage: boolean = true;
	public isBlocking: boolean = false;
	public canBlock: boolean = true;
	public showHitBox: boolean = false;
	public perceptionRange: number = 75;
	public isSwimming: boolean = false;
	public canSwim: boolean = true;
	public isRunning: boolean = false;
	public wasShiftDown: boolean = false;
	public baseSpeed: number = 200;
	public swimSpeed: number = 100;
	public runSpeed: number = 300;

	// Player-specific properties
	public attributes: IEntityAttributes;
	public attributesManager: AttributesManager;
	public entityName: string;
	public container: Phaser.GameObjects.Container;
	public speed: number;
	public items: IInventoryItem[];
	public healthBar: LuminusHealthBar;
	public walkDust: any;
	public hitZone: Phaser.GameObjects.Zone;
	public luminusKeyboardMouseController: LuminusKeyboardMouseController;
	public luminusMovement: LuminusMovement;
	public luminusHUDProgressBar: LuminusHUDProgressBar | null = null;
	public joystickScene: any;

	// Original properties from JS version
	public hitZoneWidth: number = 12;
	public hitZoneHeigth: number = 21;
	public bodyWidth: number = 12;
	public bodyHeight: number = 8;
	public bodyOffsetY: number = 2;
	public dustParticleName: string = 'walk_dust';

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, map?: any) {
		super(scene, 0, 0, texture);

		// Has to call this method, so the animations work properly.
		this.addToUpdateList();

		console.log('[Player] Constructor - before BaseEntity assign:', { canAtack: this.canAtack });
		// Here are all classes that this Player Extends.
		Object.assign(this, BaseEntity);
		console.log('[Player] Constructor - after BaseEntity assign:', { canAtack: this.canAtack });

		/**
		 * The entity attributes.
		 */
		this.attributes = {} as IEntityAttributes;
		Object.assign(this.attributes, EntityAttributes);

		/**
		 * The Attributes Manager.
		 */
		this.attributesManager = new AttributesManager(this.scene, this);

		/**
		 * The name of the Entity. It's used for differenciation of the entityes.
		 */
		this.entityName = ENTITIES.Player;

		/**
		 * Maximum speed to be used for the player.
		 */
		this.speed = 70;

		// TODO - Should get the player's items when he starts the game.
		/**
		 * An Array with the Item ID's and the number of that specific Item that the player has.
		 */
		this.items = [];

		/**
		 * The zone that will interact as a hitzone.
		 */
		this.hitZone = this.scene.add.zone(0, 0, this.width, this.height);

		// TODO - Change the offsets to a JSON file or DataBase so it's not HardCoded.
		/**
		 * The Health Bar.
		 */
		this.healthBar = new LuminusHealthBar(
			this.scene,
			0,
			0,
			this.width * 2,
			this.attributes.baseHealth,
			-this.width / 2.2,
			this.height / 2
		);

		this.setDepth(1);

		/**
		 * The class responsible for managing Keyboard and Mouse inputs.
		 */
		this.luminusKeyboardMouseController = new LuminusKeyboardMouseController(this.scene, this);
		this.luminusKeyboardMouseController.create();

		this.scene.scene.launch('JoystickScene', {
			player: this,
			map: map,
		});

		/**
		 * The Joystick Scene.
		 */
		this.joystickScene = this.scene.scene.get('JoystickScene');

		/**
		 * This object is responsible for moving the entity.
		 */
		this.luminusMovement = new LuminusMovement(this.scene, this, this.joystickScene);
		console.log('[Player] Constructor - after luminusMovement created:', { canAtack: this.canAtack });

		this.play('character-idle-down');

		/**
		 * The container that holds the player game objects.
		 */
		this.container = new Phaser.GameObjects.Container(this.scene, x, y, [this, this.healthBar, this.hitZone]);
		this.container.setDepth(1);

		// Initializes the physics.
		this.setPhysics();
		/**
		 * The dust particles that the entity will emit when it moves.
		 */
		this.walkDust = this.scene.add
			.particles(this.container.x, this.container.y, this.dustParticleName, {
				follow: this.container,
				speed: 2,
				scale: { start: 0.1, end: 0.25 },
				frequency: 1000,
				quantity: 20,
				lifespan: 1000,
				rotate: { min: 0, max: 360 },
				alpha: { start: 1, end: 0 },
				followOffset: {
					x: 0,
					y: 10,
				},
			})
			.setDepth(0);

		this.walkDust.on = false;
		// All the dependencies that need to be inside the update game loop.
		this.scene.events.on('update', this.onUpdate, this);
	}

	/**
	 * The default pre update method from the Sprite Game Object.
	 */
	preUpdate(time: number, delta: number): void {
		super.preUpdate(time, delta);
	}

	/**
	 * This method is called every game loop. Anything that depends on it (update game loop method) should be put in here.
	 */
	onUpdate(): void {
		this.updateMovementDependencies();
		if (this.luminusMovement) this.luminusMovement.move();
	}

	/**
	 * Initializes the physics
	 */
	setPhysics(): void {
		// this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.body!.setSize(this.bodyWidth, this.bodyHeight);
		(this.body as Phaser.Physics.Arcade.Body).offset.y = this.height / 1.8;
		(this.body as Phaser.Physics.Arcade.Body).maxSpeed = this.speed;

		this.scene.add.existing(this.container);
		this.scene.physics.add.existing(this.container);
		(this.container.body as Phaser.Physics.Arcade.Body).setSize(this.bodyWidth, this.bodyHeight);
		(this.container.body as Phaser.Physics.Arcade.Body).offset.y = this.bodyOffsetY;
		(this.container.body as Phaser.Physics.Arcade.Body).offset.x = -(this.bodyWidth / 2);
		(this.container.body as Phaser.Physics.Arcade.Body).maxSpeed = this.speed;

		this.scene.physics.add.existing(this.hitZone);
		(this.hitZone.body as Phaser.Physics.Arcade.Body).setSize(this.hitZoneWidth, this.hitZoneHeigth);

		// Debug color lines.
		(this.container.body as Phaser.Physics.Arcade.Body).debugBodyColor = 0xffffff;
		(this.body as Phaser.Physics.Arcade.Body).debugBodyColor = 0xffff00;
	}

	/**
	 * Destroys all the sprite dependencies.
	 */
	destroyAll(): void {
		this.container.destroy();
		this.destroy();
	}

	/**
	 * Updates all dependencies that are required by the game.
	 * You should put any updates that require movement iteraction here.
	 */
	updateMovementDependencies(): void {
		// if (this.hitZone) {
		//     this.hitZone.x = this.x;
		//     this.hitZone.y = this.y;
		// }
	}
}
