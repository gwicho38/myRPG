import { IBaseEntity } from '../../entities/BaseEntity';
import { IEntityAttributes } from '../../entities/EntityAttributes';

/**
 * Terminal representation of a game entity
 */
export class TerminalEntity implements IBaseEntity {
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

	// Terminal-specific properties
	public x: number;
	public y: number;
	public symbol: string;
	public color: string;
	public attributes: IEntityAttributes;
	public entityName: string;
	public isPlayer: boolean = false;

	constructor(
		x: number,
		y: number,
		symbol: string,
		color: string,
		attributes: IEntityAttributes,
		entityName: string
	) {
		this.x = x;
		this.y = y;
		this.symbol = symbol;
		this.color = color;
		this.attributes = attributes;
		this.entityName = entityName;
		this.id = `${entityName}_${Date.now()}`;
	}

	/**
	 * Move the entity by delta x and y
	 */
	public move(dx: number, dy: number): void {
		if (this.canMove) {
			this.x += dx;
			this.y += dy;
		}
	}

	/**
	 * Set absolute position
	 */
	public setPosition(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}

	/**
	 * Get entity representation as colored string
	 */
	public toString(): string {
		if (this.isPlayer) {
			// Make player highly visible with bold, bright styling and background
			return `{black-bg}{yellow-fg}{bold}${this.symbol}{/bold}{/yellow-fg}{/black-bg}`;
		}
		return `{${this.color}-fg}${this.symbol}{/${this.color}-fg}`;
	}

	/**
	 * Take damage
	 */
	public takeDamage(amount: number): void {
		if (this.canTakeDamage && this.attributes) {
			this.attributes.health = Math.max(0, this.attributes.health - amount);
		}
	}

	/**
	 * Check if entity is alive
	 */
	public isAlive(): boolean {
		return this.attributes && this.attributes.health > 0;
	}

	/**
	 * Heal
	 */
	public heal(amount: number): void {
		if (this.attributes) {
			this.attributes.health = Math.min(this.attributes.maxHealth, this.attributes.health + amount);
		}
	}
}
