# Particle Pooling System

## Overview

The Particle Pooling system (`ParticlePool`) provides an efficient way to reuse particle emitters, reducing garbage collection overhead and improving performance during gameplay with many particle effects.

## When to Use Particle Pooling

**Use particle pooling for:**
- ✅ **Burst effects** (level ups, explosions, impacts, spell hits)
- ✅ **Frequent short-lived effects** (combat hits, item pickups, status effects)
- ✅ **Effects that create/destroy emitters repeatedly**

**Do NOT use particle pooling for:**
- ❌ **Continuous ambient effects** (clouds, rain, dust) - these are already efficient
- ❌ **One-time scene setup** (warp portals, exit portals) - no benefit from pooling
- ❌ **Effects that run for the entire scene lifetime**

## Architecture

### ObjectPool (Generic)
Location: `src/utils/ObjectPool.ts`

A generic object pooling system that can be used for any type of object:

```typescript
const pool = new ObjectPool<T>(
    createFn: () => T,      // Function to create new objects
    resetFn: (obj: T) => void,  // Function to reset object state
    initialSize: 10,        // Pre-populate with 10 objects
    maxSize: 100            // Don't store more than 100
);

const obj = pool.acquire();  // Get object from pool
pool.release(obj);           // Return object to pool
```

### ParticlePool (Specialized)
Location: `src/plugins/effects/ParticlePool.ts`

A specialized pool for Phaser particle emitters with helper methods:

```typescript
const pool = new ParticlePool(scene);

// Continuous emission with auto-release
const emitter = pool.emit(
    'particle_texture',
    x, y,
    config,
    1000  // Auto-release after 1 second
);

// One-time burst effect with auto-release
pool.burst(
    'particle_texture',
    x, y,
    50,    // 50 particles
    config
);
```

## Usage Examples

### Example 1: Level Up Effect (Implemented)

**File:** `src/plugins/attributes/ExpManager.ts`

```typescript
import { ParticlePool } from '../effects/ParticlePool';

export class ExpManager {
    private static particlePool: Map<Phaser.Scene, ParticlePool> = new Map();

    private static getParticlePool(scene: Phaser.Scene): ParticlePool {
        if (!this.particlePool.has(scene)) {
            this.particlePool.set(scene, new ParticlePool(scene));
        }
        return this.particlePool.get(scene)!;
    }

    static levelUpEffects(entity: Entity): void {
        const pool = this.getParticlePool(entity.scene);

        const config = {
            lifespan: 300,
            gravityY: 10,
            speed: 20,
            scale: { start: 0, end: 0.15 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
        };

        // Pool automatically releases after particles die
        pool.burst('flares', entity.container.x, entity.container.y, 50, config);
    }
}
```

**Benefits:**
- No manual cleanup needed (auto-release)
- Emitters reused across multiple level-ups
- Reduced garbage collection during combat

### Example 2: Combat Hit Effect (Future Implementation)

```typescript
export class CombatManager {
    private particlePool: ParticlePool;

    constructor(scene: Phaser.Scene) {
        this.particlePool = new ParticlePool(scene);
    }

    onEntityHit(x: number, y: number, damageType: string): void {
        const config = {
            lifespan: 200,
            speed: { min: 50, max: 100 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
        };

        // Different particles for different damage types
        const texture = damageType === 'fire' ? 'fire_particle' : 'hit_particle';

        this.particlePool.burst(texture, x, y, 10, config);
    }
}
```

### Example 3: Spell Trail Effect (Future Implementation)

```typescript
export class SpellManager {
    private particlePool: ParticlePool;
    private activeTrails: Map<string, Phaser.GameObjects.Particles.ParticleEmitter>;

    castFireball(x: number, y: number): void {
        const config = {
            frequency: 50,
            lifespan: 500,
            speed: 20,
            scale: { start: 1, end: 0.3 },
            alpha: { start: 1, end: 0 },
            tint: 0xff4400,
        };

        // Emit particles for 2 seconds (fireball flight time)
        const emitter = this.particlePool.emit('fire', x, y, config, 2000);

        // Store reference if we need to stop it early
        this.activeTrails.set('fireball_' + Date.now(), emitter);
    }
}
```

### Example 4: Manual Release Pattern

```typescript
export class EnvironmentManager {
    private particlePool: ParticlePool;

    createTornado(x: number, y: number): void {
        const config = {
            frequency: 10,
            lifespan: 1000,
            speed: { min: 20, max: 50 },
            angle: { min: 0, max: 360 },
        };

        // Continuous emission (no duration = no auto-release)
        const emitter = this.particlePool.emit('dust', x, y, config);

        // Manually release after 5 seconds
        this.scene.time.delayedCall(5000, () => {
            this.particlePool.release('dust', emitter);
        });
    }
}
```

## Performance Considerations

### Pool Sizing

**Default values:**
- Initial size: 5 emitters
- Max size: 50 emitters

**Adjust based on your needs:**

```typescript
// For games with heavy particle usage (bullet hell, horde mode)
const pool = new ObjectPool(
    createFn,
    resetFn,
    20,   // Start with 20 emitters
    100   // Allow up to 100
);

// For games with light particle usage
const pool = new ObjectPool(
    createFn,
    resetFn,
    3,    // Start with 3 emitters
    20    // Allow up to 20
);
```

### When Pooling Helps Most

**High benefit scenarios:**
- 50+ enemies on screen with hit effects
- Rapid-fire weapons with muzzle flashes
- Horde mode with constant combat
- Spell effects triggered multiple times per second

**Low benefit scenarios:**
- Turn-based combat
- Single boss fights
- Exploration-focused gameplay with rare combat
- Simple games with few effects

### Memory vs Performance Trade-off

**Larger pools:**
- ✅ Less object creation during gameplay
- ✅ More consistent performance
- ❌ Higher baseline memory usage

**Smaller pools:**
- ✅ Lower memory footprint
- ✅ Good for mobile/low-end devices
- ❌ May create new objects during intense scenes

## Testing Particle Pooling

### Performance Benchmarks

```typescript
// Before pooling:
// 100 level-ups = 100 emitters created + 100 emitters destroyed
// GC pressure: HIGH

// After pooling:
// 100 level-ups = 5 emitters created + 0 emitters destroyed
// GC pressure: LOW

console.log('Pool stats:', pool.getStats());
// Output: { 'flares': 5 }  // 5 emitters available
```

### Debug Logging

Enable particle pool debugging:

```typescript
export class ParticlePool {
    private debug = true;  // Set to true for logging

    emit(...): Phaser.GameObjects.Particles.ParticleEmitter {
        if (this.debug) {
            console.log('[ParticlePool] Acquired emitter from pool', {
                texture,
                poolSize: pool.size(),
            });
        }
        // ...
    }
}
```

## Migration Guide

### Before (Direct Creation)

```typescript
const particles = this.scene.add.particles(x, y, 'texture', config);
particles.explode(50, x, y);

setTimeout(() => {
    particles.destroy();  // Manual cleanup
}, 1000);
```

### After (Pooled)

```typescript
const pool = new ParticlePool(this.scene);
pool.burst('texture', x, y, 50, config);
// Auto-cleanup after lifespan!
```

## API Reference

### ParticlePool

#### `constructor(scene: Phaser.Scene)`
Creates a new particle pool for the given scene.

#### `emit(texture, x, y, config, duration?): ParticleEmitter`
Acquires an emitter from the pool and starts continuous emission.
- **duration**: 0 = continuous (manual release needed), >0 = auto-release after duration

#### `burst(texture, x, y, count, config): void`
Emits a one-time burst of particles with automatic cleanup.

#### `release(texture, emitter): void`
Manually returns an emitter to the pool.

#### `clear(): void`
Clears all pools. Call this when transitioning scenes.

#### `getStats(): object`
Returns pool sizes for debugging.

### ObjectPool

#### `constructor(createFn, resetFn, initialSize, maxSize)`
Creates a generic object pool.

#### `acquire(): T`
Gets an object from the pool (creates new if empty).

#### `release(obj: T): void`
Returns an object to the pool.

#### `size(): number`
Returns current pool size.

#### `clear(): void`
Empties the pool.

## Future Enhancements

- [ ] Scene-aware auto-cleanup (clear pools on scene shutdown)
- [ ] Particle effect presets (hit, explosion, levelup, etc.)
- [ ] Performance monitoring and auto-tuning
- [ ] Debug visualization (show pool sizes in-game)
- [ ] Integration with combat system
- [ ] Integration with spell system
- [ ] Texture-based pool stats (track usage per texture)

## Related Issues

- #38: Optimize particle effects with object pooling (COMPLETED)
- #42: Enhanced particle effects for spells and combat (PLANNED)

## References

- Phaser 3 Particle Documentation: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Particles.ParticleEmitter.html
- Object Pool Pattern: https://gameprogrammingpatterns.com/object-pool.html
