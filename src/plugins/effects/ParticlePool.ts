/**
 * Particle Pool for reusing particle emitters
 * Improves performance by avoiding constant creation/destruction
 */

import Phaser from 'phaser';
import { ObjectPool } from '../../utils/ObjectPool';

export class ParticlePool {
	private scene: Phaser.Scene;
	private pools: Map<string, ObjectPool<Phaser.GameObjects.Particles.ParticleEmitter>>;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.pools = new Map();
	}

	/**
	 * Get or create a pool for a specific particle texture
	 * @param texture Particle texture key
	 * @param config Default particle configuration
	 */
	private getPool(
		texture: string,
		config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig
	): ObjectPool<Phaser.GameObjects.Particles.ParticleEmitter> {
		if (!this.pools.has(texture)) {
			const pool = new ObjectPool<Phaser.GameObjects.Particles.ParticleEmitter>(
				// Create function
				() => {
					const particles = this.scene.add.particles(0, 0, texture, config);
					particles.setDepth(50); // Above most game objects
					return particles;
				},
				// Reset function
				(emitter) => {
					emitter.stop();
					emitter.setPosition(0, 0);
					emitter.setVisible(false);
					// Clear any active particles (Phaser 3.60+)
					if (emitter.killAll) {
						emitter.killAll();
					}
				},
				5, // Initial size
				50 // Max size
			);
			this.pools.set(texture, pool);
		}
		return this.pools.get(texture)!;
	}

	/**
	 * Acquire a particle emitter from the pool
	 * @param texture Particle texture key
	 * @param x X position
	 * @param y Y position
	 * @param config Particle configuration
	 * @param duration How long to emit (0 = continuous)
	 */
	emit(
		texture: string,
		x: number,
		y: number,
		config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig,
		duration: number = 0
	): Phaser.GameObjects.Particles.ParticleEmitter {
		const pool = this.getPool(texture, config);
		const emitter = pool.acquire();

		// Configure and position
		emitter.setPosition(x, y);
		emitter.setVisible(true);
		emitter.setConfig(config);
		emitter.start();

		// Auto-release after duration if specified
		if (duration > 0) {
			this.scene.time.delayedCall(duration, () => {
				this.release(texture, emitter);
			});
		}

		return emitter;
	}

	/**
	 * Emit a burst of particles (one-time effect)
	 * @param texture Particle texture key
	 * @param x X position
	 * @param y Y position
	 * @param count Number of particles
	 * @param config Particle configuration
	 */
	burst(
		texture: string,
		x: number,
		y: number,
		count: number,
		config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig
	): void {
		const pool = this.getPool(texture, config);
		const emitter = pool.acquire();

		emitter.setPosition(x, y);
		emitter.setVisible(true);
		emitter.setConfig(config);
		emitter.explode(count, x, y);

		// Auto-release after particles die
		const maxLifespan = Array.isArray(config.lifespan)
			? Math.max(...(config.lifespan as number[]))
			: ((config.lifespan || 1000) as number);

		this.scene.time.delayedCall(maxLifespan + 100, () => {
			this.release(texture, emitter);
		});
	}

	/**
	 * Release a particle emitter back to the pool
	 * @param texture Particle texture key
	 * @param emitter The emitter to release
	 */
	release(texture: string, emitter: Phaser.GameObjects.Particles.ParticleEmitter): void {
		const pool = this.pools.get(texture);
		if (pool) {
			pool.release(emitter);
		}
	}

	/**
	 * Clear all pools
	 */
	clear(): void {
		this.pools.forEach((pool) => pool.clear());
		this.pools.clear();
	}

	/**
	 * Get stats for debugging
	 */
	getStats(): { [texture: string]: number } {
		const stats: { [texture: string]: number } = {};
		this.pools.forEach((pool, texture) => {
			stats[texture] = pool.size();
		});
		return stats;
	}
}
