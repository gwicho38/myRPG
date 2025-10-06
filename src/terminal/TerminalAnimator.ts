/**
 * Terminal animation system for visual effects
 */
export interface AnimationFrame {
	x: number;
	y: number;
	symbol: string;
	color: string;
	duration: number;
}

export interface TemporaryEffect {
	x: number;
	y: number;
	symbol: string;
	color: string;
	expiresAt: number;
}

export class TerminalAnimator {
	private effects: TemporaryEffect[] = [];

	/**
	 * Add a temporary visual effect to the map
	 */
	public addEffect(x: number, y: number, symbol: string, color: string, duration: number): void {
		this.effects.push({
			x,
			y,
			symbol,
			color,
			expiresAt: Date.now() + duration,
		});
	}

	/**
	 * Get effect at position (if any)
	 */
	public getEffectAt(x: number, y: number): TemporaryEffect | null {
		// Clean up expired effects
		this.effects = this.effects.filter((e) => e.expiresAt > Date.now());

		return this.effects.find((e) => e.x === x && e.y === y) || null;
	}

	/**
	 * Clear all effects
	 */
	public clearEffects(): void {
		this.effects = [];
	}

	/**
	 * Create an attack animation from attacker to target
	 */
	public async animateAttack(
		fromX: number,
		fromY: number,
		toX: number,
		toY: number,
		onFrame: () => void
	): Promise<void> {
		// Show weapon flying toward target
		this.addEffect(fromX, fromY, '⚔️', 'yellow', 150);
		onFrame();
		await this.sleep(150);

		// Impact effect on target
		this.addEffect(toX, toY, '💥', 'red', 200);
		onFrame();
		await this.sleep(100);

		// Sparkle effect
		this.addEffect(toX, toY, '✨', 'yellow', 150);
		onFrame();
		await this.sleep(150);
	}

	/**
	 * Create a block/defend animation
	 */
	public async animateBlock(x: number, y: number, onFrame: () => void): Promise<void> {
		// Shield appears
		this.addEffect(x, y, '🛡️', 'blue', 200);
		onFrame();
		await this.sleep(100);

		// Shield flash
		this.addEffect(x, y, '✨', 'cyan', 150);
		onFrame();
		await this.sleep(150);

		// Shield fades
		this.addEffect(x, y, '🛡️', 'grey', 100);
		onFrame();
		await this.sleep(100);
	}

	/**
	 * Create a damage number animation
	 */
	public async animateDamage(x: number, y: number, damage: number, onFrame: () => void): Promise<void> {
		const damageStr = `-${damage}`;

		// Damage number floats up
		this.addEffect(x, y - 1, damageStr, 'red', 300);
		onFrame();
		await this.sleep(150);

		this.addEffect(x, y - 2, damageStr, 'red', 200);
		onFrame();
		await this.sleep(150);
	}

	/**
	 * Create a heal animation
	 */
	public async animateHeal(x: number, y: number, amount: number, onFrame: () => void): Promise<void> {
		const healStr = `+${amount}`;

		// Heal number floats up
		this.addEffect(x, y - 1, healStr, 'green', 300);
		onFrame();
		await this.sleep(150);

		this.addEffect(x, y - 2, healStr, 'green', 200);
		onFrame();
		await this.sleep(150);
	}

	/**
	 * Create a death animation
	 */
	public async animateDeath(x: number, y: number, onFrame: () => void): Promise<void> {
		const deathEffects = [
			{ symbol: '💀', color: 'white', duration: 200 },
			{ symbol: '☠️', color: 'grey', duration: 200 },
			{ symbol: '✨', color: 'white', duration: 200 },
			{ symbol: '·', color: 'black', duration: 100 },
		];

		for (const effect of deathEffects) {
			this.addEffect(x, y, effect.symbol, effect.color, effect.duration);
			onFrame();
			await this.sleep(effect.duration);
		}
	}

	/**
	 * Create particle burst effect
	 */
	public async animateParticleBurst(centerX: number, centerY: number, onFrame: () => void): Promise<void> {
		const particles = [
			{ dx: -1, dy: -1 },
			{ dx: 0, dy: -1 },
			{ dx: 1, dy: -1 },
			{ dx: -1, dy: 0 },
			{ dx: 1, dy: 0 },
			{ dx: -1, dy: 1 },
			{ dx: 0, dy: 1 },
			{ dx: 1, dy: 1 },
		];

		// Burst out
		particles.forEach(({ dx, dy }) => {
			this.addEffect(centerX + dx, centerY + dy, '·', 'yellow', 150);
		});
		onFrame();
		await this.sleep(150);

		// Fade
		particles.forEach(({ dx, dy }) => {
			this.addEffect(centerX + dx * 2, centerY + dy * 2, '·', 'grey', 100);
		});
		onFrame();
		await this.sleep(100);
	}

	/**
	 * Sleep utility for animations
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
