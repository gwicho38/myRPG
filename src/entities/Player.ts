import Phaser from 'phaser';
import { AttributesManager } from '../plugins/attributes/AttributesManager';
import { ENTITIES } from '../consts/Entities';
import { LuminusHUDProgressBar } from '../plugins/HUD/LuminusHUDProgressBar';
import { LuminusHealthBar } from '../plugins/LuminusHealthBar';
import { LuminusKeyboardMouseController } from '../plugins/LuminusKeyboardMouseController';
import { LuminusMovement } from '../plugins/LuminusMovement';
import { BaseEntity, IBaseEntity } from './BaseEntity';
import { EntityAttributes, IEntityAttributes } from './EntityAttributes';
import { IInventoryItem } from '../types/ItemTypes';

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
	public healthBar?: LuminusHealthBar;
	public walkDust?: any;
	public hitZone?: Phaser.GameObjects.Zone;
	public luminusKeyboardMouseController?: LuminusKeyboardMouseController;
	public luminusMovement?: LuminusMovement;

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, map?: any) {
		super(scene, 0, 0, texture);

		// Has to call this method, so the animations work properly.
		this.addToUpdateList();

		// Initialize BaseEntity properties
		Object.assign(this, BaseEntity);

		// Initialize attributes
		this.attributes = {} as IEntityAttributes;
		Object.assign(this.attributes, EntityAttributes);

		// Initialize managers
		this.attributesManager = new AttributesManager(this.scene, this);
		this.entityName = ENTITIES.Player;

		// Initialize collections
		this.items = [];
		this.speed = this.baseSpeed;

		// Create container for the player
		this.container = this.scene.add.container(x, y);
		this.container.add(this);

		// Enable physics on the container
		this.scene.physics.world.enable(this.container);

		// Set up physics body
		const body = this.container.body as Phaser.Physics.Arcade.Body;
		body.setSize(12, 16);
		body.setOffset(-6, -8);
		body.setCollideWorldBounds(true);

		// Initialize health bar
		this.createHealthBar();

		// Initialize controls
		this.createControls();
	}

	private createHealthBar(): void {
		this.healthBar = new LuminusHealthBar(
			this.scene,
			this.container.x,
			this.container.y - 20,
			this.attributes.health,
			this.attributes.maxHealth
		);
	}

	private createControls(): void {
		this.luminusKeyboardMouseController = new LuminusKeyboardMouseController(this.scene, this);
		this.luminusKeyboardMouseController.create();

		this.luminusMovement = new LuminusMovement(this.scene, this, null);
	}

	public takeDamage(damage: number): void {
		if (!this.canTakeDamage) return;

		// Apply damage reduction if blocking
		const actualDamage = this.isBlocking ? Math.floor(damage * 0.5) : damage;

		this.attributes.health = Math.max(0, this.attributes.health - actualDamage);

		// Update health bar
		if (this.healthBar) {
			(this.healthBar as any).setValue(this.attributes.health);
		}

		// Check if player died
		if (this.attributes.health <= 0) {
			this.handleDeath();
		}
	}

	private handleDeath(): void {
		this.canMove = false;
		this.canAtack = false;
		// Add death logic here (respawn, game over, etc.)
		console.log('Player died!');
	}

	public heal(amount: number): void {
		this.attributes.health = Math.min(this.attributes.maxHealth, this.attributes.health + amount);

		if (this.healthBar) {
			(this.healthBar as any).setValue(this.attributes.health);
		}
	}

	public gainExperience(amount: number): void {
		this.attributes.experience += amount;
		(this.attributesManager as any).checkLevelUp();
	}

	public addItem(item: any): void {
		this.items.push(item);
	}

	public removeItem(itemId: string): boolean {
		const index = this.items.findIndex((item) => item.id.toString() === itemId);
		if (index !== -1) {
			this.items.splice(index, 1);
			return true;
		}
		return false;
	}

	public hasItem(itemId: string): boolean {
		return this.items.some((item) => item.id.toString() === itemId);
	}

	public update(): void {
		// Update movement
		if (this.luminusMovement) {
			this.luminusMovement.move();
		}

		// Update health bar position
		if (this.healthBar) {
			this.healthBar.setPosition(this.container.x, this.container.y - 30);
		}
	}

	public destroy(): void {
		// Clean up resources
		if (this.healthBar) {
			this.healthBar.destroy();
		}

		if (this.container) {
			this.container.destroy();
		}

		super.destroy();
	}
}
