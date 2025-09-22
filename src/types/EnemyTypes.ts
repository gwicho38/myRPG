import { EntityDrops } from '../models/EntityDrops';

export interface IEnemyConfig {
	id: number;
	name: string;
	texture: string;
	baseHealth: number;
	atack: number;
	defense: number;
	speed: number;
	flee: number;
	hit: number;
	exp: number;
	healthBarOffsetX: number;
	healthBarOffsetY: number;
	drops: EntityDrops[];
}
