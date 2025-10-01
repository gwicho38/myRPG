/**
 * The entity drops configuration object.
 * @class
 */
export class EntityDrops {
	/**
	 * The ID of the Item on the DB or Seed.
	 */
	public id: number;

	/**
	 * The chance of an item to be dropped in percentage.
	 */
	public chance: number;

	/**
	 * @param id The ID of the Item on the DB or Seed.
	 * @param chance The chance of dropping the item.
	 */
	constructor(id: number, chance: number) {
		this.id = id;
		this.chance = chance;
	}
}
