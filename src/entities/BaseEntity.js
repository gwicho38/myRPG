import uniqid from 'uniqid';

/**
 * @namespace
 */
export const BaseEntity = {
	/**
	 * A Unique ID to identify the Entity.
	 * @type { string }
	 * @default
	 */
	id: null,
	/**
	 * Controls if the entity is atacking.
	 * @type { boolean }
	 * @default
	 */
	isAtacking: false,

	/**
	 * Controls if the player can atack.
	 * @type { boolean }
	 * @default
	 */
	canAtack: true,

	/**
	 * Controls if the player can move.
	 * @type { boolean }
	 * @default
	 */
	canMove: true,

	/**
	 * Controls if the entity can take damage.
	 * @type { boolean }
	 * @default
	 */
	canTakeDamage: true,

	/**
	 * Controls if the entity is currently blocking.
	 * @type { boolean }
	 * @default
	 */
	isBlocking: false,

	/**
	 * Controls if the entity can block.
	 * @type { boolean }
	 * @default
	 */
	canBlock: true,

	/**
	 * This variable controls when the atack hitbox will appear.
	 * @type { boolean }
	 * @default
	 */
	showHitBox: false,

	/**
	 * The perception range of the entity. Usualy the field of view. For enemies it should be used to atack the player onde it's inside the perception radius.
	 * @type { number }
	 * @default
	 */
	perceptionRange: 75,

	/**
	 * Controls if the entity is currently swimming.
	 * @type { boolean }
	 * @default
	 */
	isSwimming: false,

	/**
	 * Controls if the entity can swim.
	 * @type { boolean }
	 * @default
	 */
	canSwim: true,

	/**
	 * Controls if the entity is currently running.
	 * @type { boolean }
	 * @default
	 */
	isRunning: false,

	/**
	 * The base movement speed when not swimming or running.
	 * @type { number }
	 * @default
	 */
	baseSpeed: 200,

	/**
	 * The movement speed while swimming (slower than normal).
	 * @type { number }
	 * @default
	 */
	swimSpeed: 100,

	/**
	 * The movement speed while running (faster than normal).
	 * @type { number }
	 * @default
	 */
	runSpeed: 300,
};
