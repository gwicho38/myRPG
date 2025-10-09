import Phaser from 'phaser';
import { AnimationNames } from '../consts/AnimationNames';
import { LuminusAnimationManager } from '../plugins/LuminusAnimationManager';
import { LuminusHealthBar } from '../plugins/LuminusHealthBar';
import { BaseEntity, IBaseEntity } from './BaseEntity';
import { EntityAttributes, IEntityAttributes } from './EntityAttributes';
import uniqid from 'uniqid';
import { LuminusBattleManager } from '../plugins/LuminusBattleManager';
import { ENTITIES } from '../consts/Entities';
import { LuminusDropSystem } from '../plugins/LuminusDropSystem';
import { EnemiesSeedConfig } from '../consts/enemies/EnemiesSeedConfig';
import { IEnemyConfig } from '../types/EnemyTypes';

export class Enemy extends Phaser.Physics.Arcade.Sprite implements IBaseEntity {
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

	// Enemy-specific properties
	public attributes: IEntityAttributes;
	public entityName: string;
	public commonId: number;
	public baseHealth: number;
	public atack: number;
	public defense: number;
	public speed: number;
	public drops: any[];
	public exp: number;
	public luminusAnimationManager: LuminusAnimationManager;
	public luminusBattleManager: LuminusBattleManager;
	public hitZone: Phaser.GameObjects.Zone;
	public healthBar: LuminusHealthBar;
	public container: Phaser.GameObjects.Container;

	// Pathfinding properties
	public currentPath: Phaser.Math.Vector2[] | null = null;
	public currentWaypointIndex: number = 0;
	public pathUpdateInterval: number = 1000; // Update path every 1 second
	public lastPathUpdate: number = 0;
	public waypointReachedDistance: number = 10; // Distance to consider waypoint reached

	// Animation properties from AnimationNames
	public idlePrefixAnimation: string = 'idle-';
	public walkPrefixAnimation: string = 'walk-';
	public atackPrefixAnimation: string = 'atk-';
	public downAnimationSufix: string = 'down';
	public upAnimationSufix: string = 'up';
	public leftAnimationSufix: string = 'left';
	public rightAnimationSufix: string = 'right';

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, id: number) {
		super(scene, 0, 0, texture);

		const enemyConfig: IEnemyConfig | undefined = EnemiesSeedConfig.find((c) => c.id === id);
		if (!enemyConfig) {
			throw new Error(`Enemy config not found for id: ${id}`);
		}

		Object.assign(this, BaseEntity);

		this.attributes = {} as IEntityAttributes;
		Object.assign(this.attributes, EntityAttributes);
		Object.assign(this, new AnimationNames());

		this.setAttributes(enemyConfig);

		this.entityName = ENTITIES.Enemy;
		this.scene = scene;
		this.id = uniqid();
		this.commonId = enemyConfig.id;
		this.baseHealth = enemyConfig.baseHealth;
		this.atack = enemyConfig.atack;
		this.defense = enemyConfig.defense;
		this.speed = enemyConfig.speed;
		this.drops = enemyConfig.drops;
		this.exp = enemyConfig.exp;

		this.luminusAnimationManager = new LuminusAnimationManager(this);
		this.luminusBattleManager = new LuminusBattleManager();

		this.hitZone = this.scene.add.zone(0, 0, this.width, this.height);
		this.scene.physics.add.existing(this.hitZone);

		this.healthBar = new LuminusHealthBar(
			this.scene,
			0,
			0,
			this.attributes.health,
			this.attributes.maxHealth
		) as any;

		this.x = 0;
		this.y = 0;

		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.body!.setSize(this.body!.width, this.body!.height);
		(this.body as Phaser.Physics.Arcade.Body).immovable = true;

		this.container = new Phaser.GameObjects.Container(this.scene, x, y, [this, this.healthBar, this.hitZone]);

		this.scene.add.existing(this.container);
		this.scene.physics.add.existing(this.container);

		const idleDown = `${this.idlePrefixAnimation}-${this.downAnimationSufix}`;
		const idleAnimation = texture ? `${texture}-${idleDown}` : `bat-${idleDown}`;

		this.anims.play(idleAnimation);
		this.scene.events.on('update', this.onUpdate, this);
		Object.assign(this, new (LuminusDropSystem as any)(scene, this, enemyConfig));
	}

	public setAttributes(attributes: IEnemyConfig): void {
		if (this.attributes.atack !== undefined) {
			this.attributes.atack = attributes.atack;
			this.attributes.hit = attributes.hit;
			this.attributes.flee = attributes.flee;
			this.attributes.defense = attributes.defense;
			this.attributes.health = attributes.baseHealth;
		}
	}

	public onUpdate(): void {
		if (this && this.body) {
			this.checkPlayerInRange();
		}
	}

	public checkPlayerInRange(): void {
		let inRange = false;
		let enemiesInRange = this.scene.physics.overlapCirc(this.container.x, this.container.y, this.perceptionRange);

		for (let target of enemiesInRange) {
			if (target && target.gameObject && (target.gameObject as any).entityName === ENTITIES.Player) {
				// Check line-of-sight if available
				const sceneWithLOS = this.scene as any;
				let hasLineOfSight = true; // Default to true for backward compatibility

				if (sceneWithLOS.lineOfSight) {
					// Check if player is visible (not behind walls)
					hasLineOfSight = sceneWithLOS.lineOfSight.isVisible(
						this.container.x,
						this.container.y,
						(target.gameObject as any).container.x,
						(target.gameObject as any).container.y
					);
				}

				// Only pursue if we can see the player
				if (hasLineOfSight) {
					let overlaps = false;
					this.scene.physics.overlap((target.gameObject as any).hitZone, this, (_t: any, _enemy: any) => {
						overlaps = true;
						this.stopMovement();
						if (this.canAtack) this.luminusBattleManager.atack(this);
					});

					inRange = true;
					if (!overlaps && !this.isAtacking) {
						// Try to use pathfinding if available
						const sceneWithPathfinding = this.scene as any;
						if (sceneWithPathfinding.pathfinding) {
							this.followPathToTarget((target.gameObject as any).container);
						} else {
							// Fallback to direct movement (old behavior)
							this.moveDirectlyToTarget((target.gameObject as any).container);
						}
					}
				}
			}
		}

		if (!inRange) {
			this.stopMovement();
			this.currentPath = null;
		}
	}

	/**
	 * Move directly to target (original behavior, fallback)
	 */
	private moveDirectlyToTarget(target: Phaser.GameObjects.Container): void {
		this.scene.physics.moveToObject(this.container, target, this.speed);

		const body = this.container.body as Phaser.Physics.Arcade.Body;
		const angle = Math.atan2(body.velocity.y, body.velocity.x);

		this.scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), this.speed);
		(this.luminusAnimationManager as any).animateWithAngle(
			`${this.texture.key}-${this.walkPrefixAnimation}`,
			angle
		);
		this.changeBodySize(this.width, this.height);
	}

	/**
	 * Follow a path to the target using pathfinding
	 */
	private followPathToTarget(target: Phaser.GameObjects.Container): void {
		const now = this.scene.time.now;
		const sceneWithPathfinding = this.scene as any;

		// Update path periodically or if we don't have one
		if (!this.currentPath || now - this.lastPathUpdate > this.pathUpdateInterval) {
			this.lastPathUpdate = now;

			sceneWithPathfinding.pathfinding.findPath(
				this.container.x,
				this.container.y,
				target.x,
				target.y,
				(path: Phaser.Math.Vector2[] | null) => {
					if (path && path.length > 1) {
						this.currentPath = path;
						this.currentWaypointIndex = 1; // Start at 1 (0 is current position)
					} else {
						// No path found, try direct movement
						this.moveDirectlyToTarget(target);
					}
				}
			);
		}

		// Follow the current path
		if (this.currentPath && this.currentWaypointIndex < this.currentPath.length) {
			const waypoint = this.currentPath[this.currentWaypointIndex];
			const distance = Phaser.Math.Distance.Between(this.container.x, this.container.y, waypoint.x, waypoint.y);

			if (distance < this.waypointReachedDistance) {
				// Reached waypoint, move to next one
				this.currentWaypointIndex++;
			} else {
				// Move towards current waypoint
				const angle = Phaser.Math.Angle.Between(this.container.x, this.container.y, waypoint.x, waypoint.y);

				this.scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), this.speed);

				(this.luminusAnimationManager as any).animateWithAngle(
					`${this.texture.key}-${this.walkPrefixAnimation}`,
					angle
				);
				this.changeBodySize(this.width, this.height);
			}
		}
	}

	public stopMovement(): void {
		const body = this.container.body as Phaser.Physics.Arcade.Body;
		body.setAcceleration(0, 0);
		body.setVelocity(0, 0);
		(this.luminusAnimationManager as any).setIdleAnimation();
		this.changeBodySize(this.width, this.height);
	}

	public changeBodySize(width: number, height: number): void {
		(this.body as Phaser.Physics.Arcade.Body).setSize(width, height);
		(this.hitZone.body as Phaser.Physics.Arcade.Body).setSize(width, height);
		(this.container.body as Phaser.Physics.Arcade.Body).setSize(width, height);
		(this.container.body as Phaser.Physics.Arcade.Body).setOffset(-(width / 2), -(height / 2));
	}

	public destroyAll(): void {
		this.healthBar.destroy();
		this.container.destroy();
		this.destroy();
	}
}
