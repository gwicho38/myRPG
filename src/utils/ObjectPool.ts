/**
 * Generic Object Pool for reusing game objects
 * Reduces garbage collection and improves performance
 */

export class ObjectPool<T> {
	private pool: T[] = [];
	private createFn: () => T;
	private resetFn: (obj: T) => void;
	private maxSize: number;

	/**
	 * Creates a new Object Pool
	 * @param createFn Function to create new objects
	 * @param resetFn Function to reset object state before reuse
	 * @param initialSize Initial pool size
	 * @param maxSize Maximum pool size (0 = unlimited)
	 */
	constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 10, maxSize: number = 100) {
		this.createFn = createFn;
		this.resetFn = resetFn;
		this.maxSize = maxSize;

		// Pre-populate pool
		for (let i = 0; i < initialSize; i++) {
			this.pool.push(this.createFn());
		}
	}

	/**
	 * Acquire an object from the pool
	 * Creates a new one if pool is empty
	 */
	acquire(): T {
		if (this.pool.length > 0) {
			return this.pool.pop()!;
		}
		return this.createFn();
	}

	/**
	 * Release an object back to the pool
	 * @param obj Object to return to pool
	 */
	release(obj: T): void {
		// Don't exceed max size
		if (this.maxSize > 0 && this.pool.length >= this.maxSize) {
			return;
		}

		this.resetFn(obj);
		this.pool.push(obj);
	}

	/**
	 * Get current pool size
	 */
	size(): number {
		return this.pool.length;
	}

	/**
	 * Clear the entire pool
	 */
	clear(): void {
		this.pool = [];
	}
}
