/**
 * Raw attributes interface for base stats
 */
export interface IRawAttributes {
	str: number; // Strength
	agi: number; // Agility
	vit: number; // Vitality
	dex: number; // Dexterity
	int: number; // Intelligence
	[key: string]: number; // Index signature for dynamic access
}

/**
 * Bonus attributes interface for equipment/consumable bonuses
 */
export interface IBonusAttributes {
	equipment: any[];
	consumable: any[];
	extra: any[];
}

/**
 * Entity attributes interface for all entity stats
 */
export interface IEntityAttributes {
	/** The entity level */
	level: number;

	/** The raw base attributes of the entity */
	rawAttributes: IRawAttributes;

	/** Available stat points for attribute upgrades */
	availableStatPoints: number;

	/** Bonus attributes from equipment and consumables */
	bonus: IBonusAttributes;

	/** Current health points */
	health: number;

	/** Maximum health points */
	maxHealth: number;

	/** Base health without bonuses */
	baseHealth: number;

	/** Attack points */
	atack: number;

	/** Defense points */
	defense: number;

	/** Movement speed */
	speed: number;

	/** Critical chance percentage */
	critical: number;

	/** Flee/evasion stat */
	flee: number;

	/** Hit/accuracy stat */
	hit: number;

	/** Current experience points */
	experience: number;

	/** Experience needed for next level */
	nextLevelExperience: number;
}

/**
 * Default entity attributes object
 */
export const EntityAttributes: IEntityAttributes = {
	level: 1,
	rawAttributes: {
		str: 1, // Strength
		agi: 1, // Agility
		vit: 1, // Vitality
		dex: 1, // Dexterity
		int: 1, // Intelligence
	},
	availableStatPoints: 2,
	bonus: {
		equipment: [],
		consumable: [],
		extra: [],
	},
	health: 10,
	maxHealth: 10,
	baseHealth: 10,
	atack: 4,
	defense: 1,
	speed: 50,
	critical: 0,
	flee: 1,
	hit: 1,
	experience: 0,
	nextLevelExperience: 50,
};
