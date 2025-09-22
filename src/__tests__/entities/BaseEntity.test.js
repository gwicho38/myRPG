import { BaseEntity } from '../../entities/BaseEntity';

describe('BaseEntity', () => {
	it('should have default values', () => {
		expect(BaseEntity.id).toBe(null);
		expect(BaseEntity.isAtacking).toBe(false);
		expect(BaseEntity.canAtack).toBe(true);
		expect(BaseEntity.canMove).toBe(true);
		expect(BaseEntity.canTakeDamage).toBe(true);
		expect(BaseEntity.isBlocking).toBe(false);
		expect(BaseEntity.canBlock).toBe(true);
		expect(BaseEntity.showHitBox).toBe(false);
		expect(BaseEntity.perceptionRange).toBe(75);
		expect(BaseEntity.isSwimming).toBe(false);
		expect(BaseEntity.canSwim).toBe(true);
		expect(BaseEntity.isRunning).toBe(false);
		expect(BaseEntity.baseSpeed).toBe(200);
		expect(BaseEntity.swimSpeed).toBe(100);
		expect(BaseEntity.runSpeed).toBe(300);
	});

	it('should have correct speed values', () => {
		expect(BaseEntity.swimSpeed).toBeLessThan(BaseEntity.baseSpeed);
		expect(BaseEntity.runSpeed).toBeGreaterThan(BaseEntity.baseSpeed);
	});
});