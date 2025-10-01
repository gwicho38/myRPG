import { LuminusBattleManager } from '../../plugins/LuminusBattleManager';

describe('LuminusBattleManager', () => {
	let battleManager: LuminusBattleManager;
	let mockEntity: any;

	beforeEach(() => {
		battleManager = new LuminusBattleManager();

		// Create a mock entity with all required properties
		mockEntity = {
			id: 'test-entity-1',
			canAtack: true,
			isAtacking: false,
			canMove: true,
			isBlocking: false,
			canBlock: true,
			showHitBox: false,
			isSwimming: false,
			speed: 200,
			baseSpeed: 200,
			container: {
				body: {
					setVelocity: jest.fn(),
				},
			},
			anims: {
				play: jest.fn(),
				stop: jest.fn(),
				currentAnim: null,
			},
			setTint: jest.fn(),
			clearTint: jest.fn(),
			takeDamage: jest.fn(),
		};
	});

	describe('atack', () => {
		it('should initiate attack when entity can attack', () => {
			battleManager.atack(mockEntity);
			expect(mockEntity.isAtacking).toBe(true);
			expect(mockEntity.canMove).toBe(false);
		});

		it('should not attack if entity cannot attack', () => {
			mockEntity.canAtack = false;
			battleManager.atack(mockEntity);
			expect(mockEntity.isAtacking).toBe(false);
			expect(mockEntity.canMove).toBe(true);
		});

		it('should not attack if already attacking', () => {
			mockEntity.isAtacking = true;
			mockEntity.canMove = false;
			battleManager.atack(mockEntity);
			// Should remain in attacking state
			expect(mockEntity.isAtacking).toBe(true);
			expect(mockEntity.canMove).toBe(false);
		});

		it('should not attack while blocking', () => {
			mockEntity.isBlocking = true;
			battleManager.atack(mockEntity);
			expect(mockEntity.isAtacking).toBe(false);
		});

		it('should not attack while swimming', () => {
			mockEntity.isSwimming = true;
			battleManager.atack(mockEntity);
			expect(mockEntity.isAtacking).toBe(false);
		});
	});

	describe('block', () => {
		it('should initiate blocking when entity can block', () => {
			battleManager.block(mockEntity);
			expect(mockEntity.isBlocking).toBe(true);
			expect(mockEntity.canMove).toBe(false);
			expect(mockEntity.canAtack).toBe(false);
			expect(mockEntity.setTint).toHaveBeenCalledWith(0x808080);
			expect(mockEntity.container.body.setVelocity).toHaveBeenCalledWith(0);
		});

		it('should not block if entity cannot block', () => {
			mockEntity.canBlock = false;
			battleManager.block(mockEntity);
			expect(mockEntity.isBlocking).toBe(false);
			expect(mockEntity.canMove).toBe(true);
			expect(mockEntity.setTint).not.toHaveBeenCalled();
		});

		it('should not block if already blocking', () => {
			mockEntity.isBlocking = true;
			const setTintCalls = mockEntity.setTint.mock.calls.length;
			battleManager.block(mockEntity);
			// Should not call setTint again
			expect(mockEntity.setTint.mock.calls.length).toBe(setTintCalls);
		});

		it('should not block while attacking', () => {
			mockEntity.isAtacking = true;
			battleManager.block(mockEntity);
			expect(mockEntity.isBlocking).toBe(false);
		});
	});

	describe('stopBlock', () => {
		it('should stop blocking and restore entity state', () => {
			// First start blocking
			battleManager.block(mockEntity);
			expect(mockEntity.isBlocking).toBe(true);

			// Then stop
			battleManager.stopBlock(mockEntity);
			expect(mockEntity.isBlocking).toBe(false);
			expect(mockEntity.canMove).toBe(true);
			expect(mockEntity.canAtack).toBe(true);
			expect(mockEntity.clearTint).toHaveBeenCalled();
		});

		it('should handle stopping when not blocking', () => {
			mockEntity.isBlocking = false;
			battleManager.stopBlock(mockEntity);
			expect(mockEntity.isBlocking).toBe(false);
			expect(mockEntity.clearTint).not.toHaveBeenCalled();
		});
	});

	describe('takeDamage', () => {
		it('should apply damage to entity', () => {
			battleManager.takeDamage(mockEntity, 10);
			expect(mockEntity.takeDamage).toHaveBeenCalledWith(10);
		});

		it('should reduce damage while blocking', () => {
			mockEntity.isBlocking = true;
			battleManager.takeDamage(mockEntity, 10);
			// Should apply reduced damage while blocking
			expect(mockEntity.takeDamage).toHaveBeenCalled();
		});
	});
});
