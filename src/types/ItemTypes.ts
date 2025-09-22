import { ItemType } from '../models/ItemType';
import { BuffType } from '../models/BuffType';

export interface IItemConfig {
	id: number;
	name: string;
	type: ItemType;
	buffType: BuffType | number;
	description: string;
	script: string;
	texture: string;
	sfx: string;
	stackable: boolean;
	inventoryScale: number;
}

export interface IInventoryItem {
	id: number;
	count: number;
}
