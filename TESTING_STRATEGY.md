# Testing & QA Strategy

## Current Issues (2025-10-01)

### Control System Bugs Identified:

1. **Dialog Space Key Issue** ✅ FIXED
    - Space key was opening dialog inappropriately
    - Root cause: Chat state not properly cleaned up after dialog closed
    - Fix: Added state cleanup in `checkButtonDown()` when closing dialog

2. **Menu Popups Not Showing** 🔄 INVESTIGATING
    - U and I keys should open attribute/inventory menus
    - Key bindings verified in `LuminusKeyboardMouseController.ts:86-92`
    - Scene toggle logic in `SceneToggleWatcher.ts:5-16`
    - Possible causes:
        - Camera positioning/scroll factor issues
        - Z-index/depth ordering problems
        - Scene launch/visibility state issues
    - Next steps: Manual testing to reproduce, add logging to scene lifecycle

3. **Block Toggle Bug** ✅ FIXED
    - Pressing K (block) was toggling movement/attack abilities inappropriately
    - Root cause: `stopBlock()` unconditionally re-enabled abilities
    - This conflicted with dialog system which also disables abilities
    - Fix: Check `canBlock` status before re-enabling abilities in `stopBlock()`
    - Location: `LuminusBattleManager.ts:340-350`

## Root Cause Analysis

### State Management Problems:

Multiple systems are fighting over the same player state flags (`canMove`, `canAtack`, `canBlock`):

- Dialog system
- Battle system (attack/block)
- Menu system
- Swimming/movement system

**Current Architecture (Broken):**

```typescript
// Dialog opens
player.canMove = false;
player.canAtack = false;

// User presses K to block
// ... later releases K
stopBlock() {
    player.canMove = true;  // ❌ WRONG! Dialog is still open
    player.canAtack = true;
}
```

**Solution Needed:**
Use a **state stack** or **capability manager** where each system registers its intent:

```typescript
class PlayerCapabilityManager {
	private disableReasons: Map<string, Set<string>>;

	disable(ability: 'move' | 'attack' | 'block', reason: string) {
		this.disableReasons.get(ability).add(reason);
	}

	enable(ability: 'move' | 'attack' | 'block', reason: string) {
		this.disableReasons.get(ability).delete(reason);
	}

	canUse(ability: 'move' | 'attack' | 'block'): boolean {
		return this.disableReasons.get(ability).size === 0;
	}
}
```

## Testing Strategy Going Forward

### 1. Pre-Commit Checklist (MANDATORY)

Before committing ANY code change:

- [ ] Build succeeds (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Unit tests pass (`npm test`)
- [ ] Manual control test:
    - [ ] Walk in 4 directions with arrow keys
    - [ ] Attack with J key
    - [ ] Block with K key (press and release)
    - [ ] Open inventory with I key
    - [ ] Open attributes with U key
    - [ ] Talk to NPC, advance dialog with Space, close dialog
    - [ ] Verify all abilities restored after dialog

### 2. Integration Test Coverage

**Priority 1: Player Control Integration**

- ✅ Dialog + Block interaction
- ✅ Dialog state cleanup
- ❌ Menu + Dialog interaction
- ❌ Block + Attack interaction
- ❌ Swimming + Combat interaction

**Priority 2: Input Handling**

- ❌ Key conflict resolution (K for block vs. K for menu navigation)
- ❌ Multiple simultaneous key presses
- ❌ Keyboard vs. gamepad input switching

### 3. Test File Organization

```
src/__tests__/
├── unit/              # Isolated component tests
│   ├── plugins/
│   └── entities/
├── integration/       # Multi-component tests
│   └── PlayerControls.integration.test.ts ← WE ARE HERE
└── e2e/              # Full game flow tests (future)
```

### 4. Continuous Testing Workflow

```bash
# Before starting work
npm test -- --watch &  # Run tests in watch mode

# Before committing
npm run lint:fix       # Auto-fix formatting
npm test               # Ensure all pass
npm run build          # Ensure build works

# During PR review
npm run test:coverage  # Check coverage %
```

### 5. Known Gaps in Test Coverage

**Files with NO tests:**

- `LuminusInterfaceController.ts` (menu navigation)
- `LuminusKeyboardMouseController.ts` (input handling)
- `LuminusBattleManager.ts` (combat system)
- `SceneToggleWatcher.ts` (scene transitions)

**Critical paths lacking tests:**

- Scene transitions (Home → Inventory → back)
- Combat during dialog
- Save/load state persistence
- Multiple NPCs overlapping

### 6. TypeScript Errors Blocking Tests

**Current TS errors preventing test execution:**

```
src/plugins/attributes/ExpManager.ts:110 - EmitZoneData type mismatch
```

**Action items:**

1. Fix ExpManager particle system types
2. Re-run integration tests
3. Add tests that currently fail to CI pipeline

## Recommendations

### Immediate (This Sprint):

1. ✅ Fix dialog state cleanup bug
2. ✅ Fix block toggle bug (stopBlock re-enabling during dialog)
3. ✅ Create integration test suite for control interactions
4. ❌ Fix menu scene positioning issues (U/I keys)
5. 🔄 Consider refactoring to `PlayerCapabilityManager` for long-term maintainability

### Short-term (Next 2 Sprints):

1. Add E2E test framework (Playwright or Cypress)
2. Create visual regression tests for UI positioning
3. Add input recording/playback for reproducing bugs
4. Set up CI/CD with automated testing

### Long-term (Technical Debt):

1. Migrate to centralized state management (Redux/MobX)
2. Implement capability/permission system
3. Add telemetry to track control issues in production
4. Create debug mode with visual state indicators

## Testing Commands Reference

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.ts

# Run tests matching pattern
npm test -- -t "dialog"

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Update snapshots
npm test -- -u
```

## Bug Report Template

When reporting control/input bugs, include:

1. **Steps to Reproduce:**
    - Exact key sequence
    - Scene you were in
    - Previous actions

2. **Expected Behavior:**
    - What should happen

3. **Actual Behavior:**
    - What actually happened
    - Screenshot/video if possible

4. **Console Logs:**
    - Paste relevant console output
    - Include timestamps

5. **State Dump:**
    - Player position
    - Active flags (canMove, canAtack, etc.)
    - Open menus/dialogs

## Version History

- **v0.1.1** (2025-10-01): Dialog space key bug fixed, testing strategy created
- **v0.1.0**: TypeScript migration completed
