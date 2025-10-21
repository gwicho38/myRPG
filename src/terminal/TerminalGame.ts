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
	private tickRate: number = 500; // ms per game tick (enemy movement)
	private lastTick: number = Date.now();
	private gameLoopInterval?: ReturnType<typeof setInterval>;

	// View settings
	private viewWidth: number = 60;
	private viewHeight: number = 30;

	constructor(debug: boolean = false) {
		this.renderer = new TerminalRenderer(debug);
		this.map = new TerminalMap(80, 40);
		this.map.generateOverworld();

		// Create player
		const spawnPos = this.map.findSpawnPosition();
		const playerAttrs: IEntityAttributes = { ...EntityAttributes };
		playerAttrs.health = 100;
		playerAttrs.maxHealth = 100;
		playerAttrs.atack = 10;
		playerAttrs.defense = 5;

		this.player = new TerminalEntity(spawnPos.x, spawnPos.y, '🧙‍♂️', 'white', playerAttrs, 'Player');
		this.player.isPlayer = true;
		this.map.addEntity(this.player);

		// Spawn some enemies
		this.spawnEnemies(5);

		// Set up input handlers
		this.setupInput();

		// Initial render
		this.render();

		// Log welcome message
		this.renderer.log('{green-fg}✨ Welcome to Neverquest - Terminal Edition! ✨{/green-fg}');
		this.renderer.log(
			'{cyan-fg}🎮 Controls: Arrow/WASD=Move | Space/J=Attack | B/K=Block | H=Help | Q=Quit{/cyan-fg}'
		);
		this.renderer.log('{yellow-fg}🗡️  Your quest begins... Defeat all monsters and collect treasures!{/yellow-fg}');
		this.renderer.log('');
		this.renderer.log(
			"{red-fg}👀 Look for {/red-fg}{red-bg}{yellow-fg}{bold}[🧙‍♂️]{/bold}{/yellow-fg}{/red-bg}{red-fg} (wizard in YELLOW BRACKETS on RED) - that's YOU!{/red-fg}"
		);
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

		// Attack keys (Space or J)
		this.renderer.screen.key(['space', 'j'], () => {
			this.attackNearby();
		});

		// Block/Defend keys (B or K)
		this.renderer.screen.key(['b', 'k'], () => {
			this.blockAction();
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

				// Additional renders to show walking animation
				setTimeout(() => this.render(), 50);
				setTimeout(() => this.render(), 100);
				setTimeout(() => this.render(), 150);
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
	private async attackNearby(): Promise<void> {
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

				// Play attack animation
				await this.map.animator.animateAttack(this.player.x, this.player.y, entity.x, entity.y, () =>
					this.render()
				);

				entity.takeDamage(damage);

				// Show damage number animation
				await this.map.animator.animateDamage(entity.x, entity.y, damage, () => this.render());

				this.renderer.log(
					`{red-fg}⚔️  You attack ${entity.symbol} ${entity.entityName} for ${damage} damage! 💥{/red-fg}`
				);

				if (!entity.isAlive()) {
					// Death animation
					await this.map.animator.animateDeath(entity.x, entity.y, () => this.render());

					this.renderer.log(`{green-fg}✨ ${entity.entityName} defeated! +10 XP 🎯{/green-fg}`);
					this.map.removeEntity(entity);
					const index = this.enemies.indexOf(entity);
					if (index > -1) {
						this.enemies.splice(index, 1);
					}
					this.player.attributes.experience += 10;

					// Victory particle burst
					await this.map.animator.animateParticleBurst(entity.x, entity.y, () => this.render());
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
	 * Block/Defend action
	 */
	private async blockAction(): Promise<void> {
		// Temporarily boost defense
		const defenseBoost = 5;
		this.player.attributes.defense += defenseBoost;

		// Show block animation
		await this.map.animator.animateBlock(this.player.x, this.player.y, () => this.render());

		this.renderer.log(`{blue-fg}🛡️  You raise your shield! Defense +${defenseBoost} for this turn{/blue-fg}`);

		// Reset defense after a short time (simulated turn)
		setTimeout(() => {
			this.player.attributes.defense -= defenseBoost;
			this.renderer.log('{grey-fg}Your shield is lowered{/grey-fg}');
			this.render();
		}, 2000);

		this.render();
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
		this.renderer.log('⚔️  Space / J: Attack adjacent enemy (with animation!)');
		this.renderer.log('🛡️  B / K: Block/Defend (+5 DEF for 2 seconds)');
		this.renderer.log('📖 H: Show this help');
		this.renderer.log('🚪 Q / Escape: Quit');
		this.renderer.log('');
		this.renderer.log('{yellow-fg}🎮 Game Elements:{/yellow-fg}');
		this.renderer.log(
			'{red-bg}{yellow-fg}{bold}[🧙‍♂️]{/bold}{/yellow-fg}{/red-bg} You (Player) - Wizard in YELLOW BRACKETS on RED!'
		);
		this.renderer.log('🐀🦇👹👺👻🐉 Monsters');
		this.renderer.log('█ Walls  🚪 Doors  ≈ Water');
		this.renderer.log('💎 Treasure  🔥 Torches');
		this.renderer.log('');
		this.renderer.log('{green-fg}✨ NEW: Animated attacks with particles and damage numbers!{/green-fg}');
	}

	/**
	 * Update game status display
	 */
	private updateStatus(): void {
		const healthBar = this.createHealthBar(this.player.attributes.health, this.player.attributes.maxHealth);
		const xpBar = this.createXPBar(this.player.attributes.experience, this.player.attributes.nextLevelExperience);

		const status = [
			'{cyan-fg}{red-bg}{yellow-fg}{bold}[🧙‍♂️]{/bold}{/yellow-fg}{/red-bg} Player Status{/cyan-fg}',
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
	 * Update game state (enemy AI)
	 */
	private update(): void {
		if (!this.running) return;

		// Move each enemy
		for (const enemy of this.enemies) {
			this.moveEnemy(enemy);
		}

		this.render();
	}

	/**
	 * Move an enemy using simple AI
	 */
	private moveEnemy(enemy: TerminalEntity): void {
		// Calculate distance to player
		const dx = this.player.x - enemy.x;
		const dy = this.player.y - enemy.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// If player is within perception range, move towards player
		if (distance < 10) {
			// Move towards player
			const moveX = dx !== 0 ? Math.sign(dx) : 0;
			const moveY = dy !== 0 ? Math.sign(dy) : 0;

			// Try to move in the direction of the player
			const newX = enemy.x + moveX;
			const newY = enemy.y + moveY;

			if (this.map.isWalkable(newX, newY) && !this.map.getEntityAt(newX, newY)) {
				enemy.move(moveX, moveY);
			}
			// If can't move diagonally, try horizontal or vertical
			else if (
				moveX !== 0 &&
				this.map.isWalkable(enemy.x + moveX, enemy.y) &&
				!this.map.getEntityAt(enemy.x + moveX, enemy.y)
			) {
				enemy.move(moveX, 0);
			} else if (
				moveY !== 0 &&
				this.map.isWalkable(enemy.x, enemy.y + moveY) &&
				!this.map.getEntityAt(enemy.x, enemy.y + moveY)
			) {
				enemy.move(0, moveY);
			}
		} else {
			// Random movement when player is far away
			const directions = [
				{ dx: 0, dy: -1 },
				{ dx: 0, dy: 1 },
				{ dx: -1, dy: 0 },
				{ dx: 1, dy: 0 },
			];

			// 30% chance to move
			if (Math.random() < 0.3) {
				const dir = directions[Math.floor(Math.random() * directions.length)];
				const newX = enemy.x + dir.dx;
				const newY = enemy.y + dir.dy;

				if (this.map.isWalkable(newX, newY) && !this.map.getEntityAt(newX, newY)) {
					enemy.move(dir.dx, dir.dy);
				}
			}
		}
	}

	/**
	 * Start the game loop
	 */
	public start(): void {
		this.running = true;
		this.renderer.log('{green-fg}Game started!{/green-fg}');

		// Start the game loop for enemy movement
		this.gameLoopInterval = setInterval(() => {
			this.update();
		}, this.tickRate);
	}

	/**
	 * Stop the game
	 */
	public stop(): void {
		this.running = false;
		if (this.gameLoopInterval) {
			clearInterval(this.gameLoopInterval);
		}
		this.renderer.cleanup();
	}
}
