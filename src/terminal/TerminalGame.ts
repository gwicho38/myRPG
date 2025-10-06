import { EntityAttributes, IEntityAttributes } from '../entities/EntityAttributes';
import { TerminalEntity } from './entities/TerminalEntity';
import { TerminalMap } from './TerminalMap';
import { TerminalRenderer } from './TerminalRenderer';

/**
 * Main Terminal Game class
 */
export class TerminalGame {
	private renderer: TerminalRenderer;
	private map: TerminalMap;
	private player: TerminalEntity;
	private enemies: TerminalEntity[] = [];
	private running: boolean = false;
	private tickRate: number = 100; // ms per game tick
	private lastTick: number = Date.now();

	// View settings
	private viewWidth: number = 60;
	private viewHeight: number = 30;

	constructor(debug: boolean = false) {
		this.renderer = new TerminalRenderer(debug);
		this.map = new TerminalMap(80, 40);
		this.map.generateDungeon();

		// Create player
		const spawnPos = this.map.findSpawnPosition();
		const playerAttrs: IEntityAttributes = { ...EntityAttributes };
		playerAttrs.health = 100;
		playerAttrs.maxHealth = 100;
		playerAttrs.atack = 10;
		playerAttrs.defense = 5;

		this.player = new TerminalEntity(spawnPos.x, spawnPos.y, '🧙', 'cyan', playerAttrs, 'Player');
		this.map.addEntity(this.player);

		// Spawn some enemies
		this.spawnEnemies(5);

		// Set up input handlers
		this.setupInput();

		// Initial render
		this.render();

		// Log welcome message
		this.renderer.log('{green-fg}✨ Welcome to Luminus RPG - Terminal Edition! ✨{/green-fg}');
		this.renderer.log('{cyan-fg}🎮 Controls: Arrow/WASD=Move | Space=Attack | H=Help | Q=Quit{/cyan-fg}');
		this.renderer.log('{yellow-fg}🗡️  Your quest begins... Defeat all monsters and collect treasures!{/yellow-fg}');
	}

	/**
	 * Set up input handling
	 */
	private setupInput(): void {
		// Movement keys
		const moveKeys: Record<string, { dx: number; dy: number }> = {
			up: { dx: 0, dy: -1 },
			down: { dx: 0, dy: 1 },
			left: { dx: -1, dy: 0 },
			right: { dx: 1, dy: 0 },
			w: { dx: 0, dy: -1 },
			s: { dx: 0, dy: 1 },
			a: { dx: -1, dy: 0 },
			d: { dx: 1, dy: 0 },
		};

		Object.entries(moveKeys).forEach(([key, delta]) => {
			this.renderer.screen.key([key], () => {
				this.movePlayer(delta.dx, delta.dy);
			});
		});

		// Attack key
		this.renderer.screen.key(['space'], () => {
			this.attackNearby();
		});

		// Help key
		this.renderer.screen.key(['h'], () => {
			this.showHelp();
		});
	}

	/**
	 * Move player
	 */
	private movePlayer(dx: number, dy: number): void {
		const newX = this.player.x + dx;
		const newY = this.player.y + dy;

		if (this.map.isWalkable(newX, newY)) {
			const entityAt = this.map.getEntityAt(newX, newY);
			if (!entityAt) {
				this.player.move(dx, dy);
				this.render();
			} else {
				this.renderer.log(`There's a ${entityAt.entityName} in the way!`, 'yellow');
			}
		} else {
			this.renderer.log('You bump into a wall.', 'red');
		}
	}

	/**
	 * Attack nearby enemies
	 */
	private attackNearby(): void {
		const adjacentPositions = [
			{ dx: 0, dy: -1 },
			{ dx: 0, dy: 1 },
			{ dx: -1, dy: 0 },
			{ dx: 1, dy: 0 },
		];

		for (const pos of adjacentPositions) {
			const x = this.player.x + pos.dx;
			const y = this.player.y + pos.dy;
			const entity = this.map.getEntityAt(x, y);

			if (entity && entity !== this.player) {
				const damage = this.player.attributes.atack;
				entity.takeDamage(damage);
				this.renderer.log(
					`{red-fg}⚔️  You attack ${entity.symbol} ${entity.entityName} for ${damage} damage! 💥{/red-fg}`
				);

				if (!entity.isAlive()) {
					this.renderer.log(`{green-fg}✨ ${entity.entityName} defeated! +10 XP 🎯{/green-fg}`);
					this.map.removeEntity(entity);
					const index = this.enemies.indexOf(entity);
					if (index > -1) {
						this.enemies.splice(index, 1);
					}
					this.player.attributes.experience += 10;
				} else {
					const healthPercent = Math.floor((entity.attributes.health / entity.attributes.maxHealth) * 100);
					this.renderer.log(`{yellow-fg}${entity.entityName} has ${healthPercent}% HP remaining{/yellow-fg}`);
				}

				this.render();
				return;
			}
		}

		this.renderer.log('No enemies nearby!', 'yellow');
	}

	/**
	 * Spawn enemies
	 */
	private spawnEnemies(count: number): void {
		const enemyTypes = [
			{ name: 'Rat', symbol: '🐀', color: 'yellow', health: 20, attack: 3 },
			{ name: 'Bat', symbol: '🦇', color: 'white', health: 15, attack: 5 },
			{ name: 'Ogre', symbol: '👹', color: 'red', health: 50, attack: 8 },
			{ name: 'Goblin', symbol: '👺', color: 'green', health: 25, attack: 6 },
			{ name: 'Ghost', symbol: '👻', color: 'white', health: 30, attack: 7 },
			{ name: 'Dragon', symbol: '🐉', color: 'red', health: 100, attack: 15 },
		];

		for (let i = 0; i < count; i++) {
			const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
			let x, y;
			let attempts = 0;

			// Find a valid spawn position
			do {
				x = Math.floor(Math.random() * this.map.width);
				y = Math.floor(Math.random() * this.map.height);
				attempts++;
			} while (attempts < 100 && (!this.map.isWalkable(x, y) || this.map.getEntityAt(x, y)));

			if (attempts < 100) {
				const enemyAttrs: IEntityAttributes = { ...EntityAttributes };
				enemyAttrs.health = type.health;
				enemyAttrs.maxHealth = type.health;
				enemyAttrs.atack = type.attack;

				const enemy = new TerminalEntity(x, y, type.symbol, type.color, enemyAttrs, type.name);
				this.map.addEntity(enemy);
				this.enemies.push(enemy);
			}
		}
	}

	/**
	 * Show help
	 */
	private showHelp(): void {
		this.renderer.log('{cyan-fg}📖 === Help ==={/cyan-fg}');
		this.renderer.log('🏃 Arrow Keys / WASD: Move');
		this.renderer.log('⚔️  Space: Attack adjacent enemy');
		this.renderer.log('📖 H: Show this help');
		this.renderer.log('🚪 Q / Escape: Quit');
		this.renderer.log('');
		this.renderer.log('{yellow-fg}🎮 Game Elements:{/yellow-fg}');
		this.renderer.log('🧙 You (Player)');
		this.renderer.log('🐀🦇👹👺👻🐉 Monsters');
		this.renderer.log('🧱 Walls  🚪 Doors  🌊 Water');
		this.renderer.log('💎 Treasure  🔥 Torches');
	}

	/**
	 * Update game status display
	 */
	private updateStatus(): void {
		const healthBar = this.createHealthBar(this.player.attributes.health, this.player.attributes.maxHealth);
		const xpBar = this.createXPBar(this.player.attributes.experience, this.player.attributes.nextLevelExperience);

		const status = [
			'{cyan-fg}🧙 Player Status{/cyan-fg}',
			'',
			`❤️  HP: ${healthBar}`,
			`{red-fg}${this.player.attributes.health}/${this.player.attributes.maxHealth}{/red-fg}`,
			'',
			`⭐ Level: {yellow-fg}${this.player.attributes.level}{/yellow-fg}`,
			`✨ XP: ${xpBar}`,
			`{green-fg}${this.player.attributes.experience}/${this.player.attributes.nextLevelExperience}{/green-fg}`,
			'',
			'{cyan-fg}📊 Stats:{/cyan-fg}',
			`💪 STR: ${this.player.attributes.rawAttributes.str}`,
			`🏃 AGI: ${this.player.attributes.rawAttributes.agi}`,
			`❤️  VIT: ${this.player.attributes.rawAttributes.vit}`,
			`🎯 DEX: ${this.player.attributes.rawAttributes.dex}`,
			`🧠 INT: ${this.player.attributes.rawAttributes.int}`,
			'',
			`⚔️  ATK: {red-fg}${this.player.attributes.atack}{/red-fg}`,
			`🛡️  DEF: {blue-fg}${this.player.attributes.defense}{/blue-fg}`,
			'',
			'{yellow-fg}👾 Enemies{/yellow-fg}',
			`Remaining: {red-fg}${this.enemies.length}{/red-fg}`,
			'',
			`📍 Position: (${this.player.x}, ${this.player.y})`,
		].join('\n');

		this.renderer.updateStatus(status);
	}

	/**
	 * Create a health bar visualization
	 */
	private createHealthBar(current: number, max: number): string {
		const barLength = 10;
		const filled = Math.floor((current / max) * barLength);
		const empty = barLength - filled;
		return `{red-fg}${'█'.repeat(filled)}{/red-fg}{grey-fg}${'░'.repeat(empty)}{/grey-fg}`;
	}

	/**
	 * Create an XP bar visualization
	 */
	private createXPBar(current: number, max: number): string {
		const barLength = 10;
		const filled = Math.floor((current / max) * barLength);
		const empty = barLength - filled;
		return `{green-fg}${'█'.repeat(filled)}{/green-fg}{grey-fg}${'░'.repeat(empty)}{/grey-fg}`;
	}

	/**
	 * Render the game
	 */
	private render(): void {
		const mapView = this.map.render(this.player.x, this.player.y, this.viewWidth, this.viewHeight);
		this.renderer.gameBox.setContent(mapView);
		this.updateStatus();
		this.renderer.render();
	}

	/**
	 * Start the game loop
	 */
	public start(): void {
		this.running = true;
		this.renderer.log('{green-fg}Game started!{/green-fg}');
	}

	/**
	 * Stop the game
	 */
	public stop(): void {
		this.running = false;
		this.renderer.cleanup();
	}
}
