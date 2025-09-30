import Phaser from 'phaser';
import { v4 as uuidv4 } from 'uuid';
import { DB_SEED_ITEMS } from '../consts/DB_SEED/Items';
import { PlayerConfig } from '../consts/player/Player';
import { LuminusConsumableManager } from '../plugins/LuminusConsumableManager';
import { Player } from './Player';
import { IItemConfig, IInventoryItem } from '../types/ItemTypes';
import { BuffType } from '../models/BuffType';
import { ItemType } from '../models/ItemType';

export class Item extends Phaser.Physics.Arcade.Sprite {
	public scene: Phaser.Scene;
	public id: string;
	public commonId: number;
	public name: string;
	public itemType: ItemType;
	public buffType: BuffType | number;
	public description: string;
	public script: string;
	public stackable: boolean;
	public inventoryScale: number;
	public useSfx: string;
	public scenePlayerVariableName: string;
	public luminusConsumableManager: LuminusConsumableManager;

	constructor(scene: Phaser.Scene, x: number, y: number, id: number) {
		const itemConfig: IItemConfig | undefined = DB_SEED_ITEMS.find((i) => i.id === id);
		if (!itemConfig) {
			throw new Error(`Item config not found for id: ${id}`);
		}

		super(scene, x, y, itemConfig.texture);

		this.scene = scene;
		this.id = uuidv4();
		this.commonId = itemConfig.id;
		this.name = itemConfig.name;
		this.itemType = itemConfig.type;
		this.buffType = itemConfig.buffType;
		this.description = itemConfig.description;
		this.script = itemConfig.script;
		this.stackable = itemConfig.stackable;
		this.inventoryScale = itemConfig.inventoryScale;
		this.useSfx = itemConfig.sfx;

		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);

		this.scenePlayerVariableName = PlayerConfig.variableName;
		this.luminusConsumableManager = new LuminusConsumableManager();

		this.pickItemLogic();
	}

	public pickItemLogic(): void {
		let canCollide = true;
		const playerEntity = (this.scene as any)[this.scenePlayerVariableName] as Player;

		this.scene.physics.add.collider(
			this as any,
			playerEntity.hitZone as any,
			(item: any, _player: any) => {
				canCollide = false;
				this.scene.sound.play('get_items');

				this.scene.tweens.add({
					targets: item,
					props: {
						x: playerEntity.container.x,
						y: playerEntity.container.y,
						scale: 0.2,
					},
					onComplete: (tween: Phaser.Tweens.Tween) => {
						if (tween.totalProgress === 1) {
							(item as Item).addInventory(playerEntity);
						}
					},
					ease: 'Quad',
					duration: 350,
				});
			},
			() => canCollide
		);
	}

	public addInventory(player: Player): void {
		let hasItem = false;

		player.items.forEach((item: IInventoryItem) => {
			if (this.commonId === item.id) {
				hasItem = true;
				item.count++;
			}
		});

		if (!hasItem) {
			player.items.push({
				id: this.commonId,
				count: 1,
			});
		}

		this.destroy();
	}

	public consume(player: Player): void {
		this.luminusConsumableManager.useItem(this, player);
	}
}
