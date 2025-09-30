import { LuminusEntityTextDisplay } from '../LuminusEntityTextDisplay';

interface Entity {
	attributes: {
		experience: number;
		nextLevelExperience: number;
		level: number;
		availableStatPoints: number;
		baseHealth: number;
		health: number;
	};
	healthBar?: {
		full: number;
		health?: number;
		update: (health: number) => void;
		draw?: () => void;
	};
	scene: Phaser.Scene;
	getTopLeft: () => { x: number; y: number };
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	texture: { key: string };
	container: {
		x: number;
		y: number;
	};
}

export class ExpManager {
	static displayText: LuminusEntityTextDisplay;
	static particles_logo: Phaser.GameObjects.Particles.ParticleEmitter;

	/**
	 * Adds exp to the player entity
	 * @param { Player | Enemy } entity the entity that should level up.
	 * @param { number } exp amount of exp received by the player.
	 * @param { number } extraExp extra exp, used for recursive call of the method.
	 */
	static addExp(entity: Entity, exp: number, extraExp: number = 0): void {
		entity.attributes.experience += exp + extraExp;
		let excedingExp = 0;
		if (entity.attributes.nextLevelExperience <= entity.attributes.experience) {
			excedingExp = entity.attributes.experience - entity.attributes.nextLevelExperience;
			this.levelUpEntity(entity);
			if (excedingExp > 0) this.addExp(entity, 0, excedingExp);
		}
	}

	/**
	 * Adds a level or more to the entity.
	 * @param { Player | Enemy} entity
	 */
	static levelUpEntity(entity: Entity): void {
		entity.attributes.level += 1;
		entity.attributes.availableStatPoints += 1;
		entity.attributes.experience = 0;
		entity.attributes.baseHealth += 10;
		entity.attributes.nextLevelExperience += 100 * entity.attributes.level;
		if (entity.healthBar) {
			entity.healthBar.full = entity.attributes.baseHealth;
			entity.healthBar.update(entity.attributes.health);
		}
		// Add next level experience.
		this.levelUpEffects(entity);
	}

	/**
	 * Displays the level up effects.
	 * @param { Player | Enemy} entity
	 */
	static levelUpEffects(entity: Entity): void {
		entity.scene.sound.play('level_up');
		this.displayText = new LuminusEntityTextDisplay(entity.scene);
		this.displayText.displayDamage('LEVEL UP!!', entity);

		const origin = entity.getTopLeft();
		const textures = entity.scene.textures;
		let pixel: Phaser.Display.Color;
		const logoSource = {
			getRandomPoint: (vec: Phaser.Math.Vector2) => {
				do {
					const x = Phaser.Math.Between(0, entity.width * entity.scaleX - 1);
					const y = Phaser.Math.Between(0, entity.height * entity.scaleY - 1);
					pixel = textures.getPixel(x, y, entity.texture.key) as Phaser.Display.Color;
					return vec.setTo(x + origin.x, y + origin.y);
				} while (pixel.alpha < 255);
			},
		};

		this.particles_logo = entity.scene.add.particles(entity.container.x, entity.container.y, 'flares', {
			lifespan: 300,
			gravityY: 10,
			speed: 20,
			quantity: 1,
			scale: { start: 0, end: 0.15, ease: 'Quad.easeOut' },
			alpha: { start: 1, end: 0, ease: 'Quad.easeIn' },
			blendMode: 'ADD',
			emitZone: { type: 'random', source: logoSource },
		});

		// let particles = entity.scene.add.particles('flares');

		// particles.createEmitter({
		//     frame: ['white', 'blue'],
		//     follow: entity.container,
		//     followOffset: {
		//         y: -entity.hitZone.body.height / 1.3,
		//     },
		//     lifespan: 3000,
		//     speed: 20,
		//     angle: { min: 0, max: 360 },
		//     gravityY: 10,
		//     alpha: { start: 1, end: 0 },
		//     bounds: {
		//         x: entity.container.x - 50,
		//         y: entity.container.y - entity.hitZone.body.height - 50,
		//         w: 100,
		//         h: 100,
		//     },
		//     scale: { start: 0.01, end: 0 },
		//     quantity: 2,
		//     blendMode: 'ADD',
		// });

		setTimeout((_t) => {
			this.particles_logo.destroy();
		}, 400);
	}
}
