# Findings: Progression, Combat & Persistence (Gatherer #4)

**Category:** `codebase-progression-combat`
**Scope:** Combat, XP/leveling, persistence/save, player-state ownership, loot/items/equip.
**Date:** 2026-06-02
**Repo root:** `/Volumes/mac_extended/repos/neverquest`
**Method:** Static read of source + reachability/usage grep. Every claim cited `file:line`. "Exists" != "wired"; systems labeled **functional / partial / orphaned / dead**.

---

## TL;DR — Core Loop Verdict

The **moment-to-moment combat loop works**, but **two of the four progression/persistence links are broken or half-built**, and the **lose condition is dead**.

| Loop link | Status | Evidence |
|---|---|---|
| explore → **fight** (hit/damage/kill enemies) | **FUNCTIONAL** | `NeverquestBattleManager.atack/takeDamage`, `Enemy.checkPlayerInRange` |
| fight → **gain XP** | **FUNCTIONAL** | `BattleManager.ts:365-369` → `ExpManager.addExp` |
| XP → **level up → stronger** | **PARTIAL / buggy** | `ExpManager.levelUpEntity` works but ignores designed curve; double-counts baseHealth with `AttributesManager` |
| fight → **loot drop → pickup** | **FUNCTIONAL** | `DropSystem.dropItems` → `Item.pickItemLogic` → `addInventory` |
| loot → **equip → permanent stat change** | **DEAD (does not exist)** | No equip path anywhere; only `consume` exists (`InventoryScene.ts:667`) |
| stat points → **allocate → stronger** | **FUNCTIONAL** | `AttributeScene` → `AttributesManager.addAttribute` |
| die → **Game Over / lose condition** | **DEAD** | `GameOverScene` commented out of registration; `launch('GameOverScene')` fails silently |
| session → **save → reload restores progress** | **PARTIAL** | Save/load works within a registered gameplay scene; cross-scene load is fragile; post-death checkpoint-load is **dead** |
| progression → **story flags advance** | **DEAD** | No gameplay scene ever calls `setFlag` — flags are read-only by UI |

**Bottom line:** A player CAN currently walk into MainScene, fight, kill enemies, gain XP, level up, pick up consumables, drink them, allocate stat points, and manually save/load. That is a *minimal* core loop. But **dying does nothing useful, there is no equipment progression, and the narrative never advances from gameplay** — so it is NOT yet coherent enough for a one-chapter playthrough with a beginning/middle/end.

---

## 1. Combat — FUNCTIONAL

### Attack → damage → death flow
- **Player attack entry points** (all functional): mouse left-click `NeverquestKeyboardMouseController.ts:111`, `J` key `:156`, gamepad `NeverquestGamePadController.ts:119`, mobile joystick `JoystickScene.ts:182`. Attack gated on `canAtack && canMove && !isSwimming` (`NeverquestKeyboardMouseController.ts:125-131`) — gating is sound.
- **Attack execution:** `NeverquestBattleManager.atack()` (`NeverquestBattleManager.ts:511`) sets `isAtacking=true`, `canAtack=false` (`:523-524`), creates a hitbox sprite for the player (`:550`), and on each `update` runs `physics.overlap(hitbox, scene.enemies, ...)` (`:570`) calling `takeDamage` on contact (`:576`).
- **Damage calc** (`takeDamage`, `:322`): `randomDamage(atack - defense)` with ±10% variation (`:325,430`), crit check (`:326`, `CRITICAL_MULTIPLIER`), hit/flee check (`:327,406`). Health decremented and clamped to 0 (`:335-341`). Solid.
- **Enemy death:** at `health<=0` for an enemy (`:358,363-376`): logs defeat, awards XP to player via `ExpManager.addExp(atacker, enemyExp)` (`:369`), then after a 100 ms timeout calls `target.dropItems()` and `target.destroyAll()` (`:371-375`). Functional.
- **Enemy AI / aggression:** `Enemy.checkPlayerInRange` (`Enemy.ts:208`) uses `overlapCirc` perception (throttled 200 ms), optional line-of-sight, pathfinding-or-direct chase, and self-attacks the player on overlap via its own `BattleManager` instance (`Enemy.ts:235`). Functional and reasonably complete.

### Enemy spawning — FUNCTIONAL (two mechanisms)
- **Tiled-driven:** `NeverquestEnemyZones` reads the map's `enemies` object layer and pushes `new Enemy(...)` into `scene.enemies` (`NeverquestEnemyZones.ts:111-151`). **MainScene uses this** (`MainScene.ts:140-141`). Requires the active map JSON to contain an `enemies` object layer with `id`/`number` properties — otherwise zero enemies spawn (silent no-op, `:112` guards on length).
- **Programmatic:** `NeverquestProgrammaticEnemyZones` spawns from hard-coded configs (`NeverquestProgrammaticEnemyZones.ts:121-136`), e.g. `CROSSROADS_ENEMY_ZONES` (`:230`). **CrossroadsScene uses both** (`CrossroadsScene.ts:157-161,195-198`).
- Scenes using a zone system: `OverworldScene, CaveScene, TownScene, MainScene, CrossroadsScene, UpsideDownScene` (grep). The five "orphaned" biome scenes (Dungeon/Ice/Volcanic/Sky/Underwater) — verify their spawn wiring in the world-map gatherer's report; this gatherer confirms only MainScene + Crossroads.

**Combat confidence: HIGH.** The combat code paths are complete and internally consistent.

---

## 2. Progression / Leveling — PARTIAL (works, but with two real defects)

### XP gain & level-up — works, but ignores the designed curve
- `ExpManager.addExp` (`ExpManager.ts:76`) adds enemy XP and recursively levels up while `experience >= nextLevelExperience` (`:79-83`).
- `ExpManager.levelUpEntity` (`:90`): `level+1`, `availableStatPoints+1`, `experience=0`, `baseHealth+=10`, and crucially `nextLevelExperience += 100 * level` (`:91-95`).

**DEFECT A — the designed XP curve is unused (DEAD code).** `src/consts/progression/ExperienceCurve.ts` defines a full cumulative table (`LEVEL_XP_REQUIREMENTS`, `:75-96`), `getXpForNextLevel`, `BOSS_XP_REWARDS`, act/level milestones — but it is referenced **only in JSDoc comments** (`ExpManager.ts:11,16`); **no runtime code imports or calls it** (grep for `ExperienceCurve|getXpForLevel|LEVEL_XP_REQUIREMENTS|BOSS_XP_REWARDS` returns only comments + the file itself). Runtime leveling uses the ad-hoc `nextLevelExperience += 100*level` formula instead. The starting `nextLevelExperience=50` (`EntityAttributes.ts:184`) matches the curve's level-2 value by coincidence, then diverges. **Impact:** the carefully designed 20-level / 3-act pacing is not actually in effect; whatever you balance against the curve will be wrong. Confidence: HIGH.

**DEFECT B — baseHealth is mutated by two systems that fight each other.**
- `ExpManager.levelUpEntity` does `baseHealth += 10` on level-up (`ExpManager.ts:94`).
- `AttributesManager.calculateHealth` runs **every `update` tick** (registered `AttributesManager.ts:134`) and **recomputes** `baseHealth = statsCopy.baseHealth + level*10 + vit*3` (`:170-173`), overwriting ExpManager's increment, and on level-up fully heals `health = baseHealth` (`:185`).
Because `AttributesManager` recomputes from a frozen `statsCopy` plus `level*10`, the `+=10` from `ExpManager` is effectively discarded next frame. The two leveling effects are redundant/conflicting. It does not crash, but it makes health-on-level-up non-obvious and means `ExpManager`'s baseHealth change is dead. Confidence: HIGH (both code paths read directly).

### Stat allocation — FUNCTIONAL
- `AttributeScene` reads `availableStatPoints` (`AttributeScene.ts:195,258`) and calls `player.attributesManager.addAttribute(attr, 1, ...)` / `removeAttribute` (`:266-271`).
- `AttributesManager.addAttribute` spends a point and sets `changedAttribute=true` (`:258-263`), which causes the next tick's `calculateAtack/Defense/Crit/Flee/Hit` to recompute derived stats (`:201,193,236,244,253`). So allocating STR raises attack, VIT raises defense/health, etc. **The allocation → stronger link works.**
- **Reachability:** AttributeScene opens via `P` key/gamepad (`NeverquestGamePadController.ts:116`, `AttributeScene.ts:149`) and a HUD icon (`HUDScene.ts:350`). Registered in `index.ts:126`. Reachable.

### Note: `calculateSpeed` is a no-op (`AttributesManager.ts:225-231`, fully commented) — AGI does not affect movement speed. Minor.

**Progression confidence: HIGH on what's wired; the two defects are confirmed, not speculative.**

---

## 3. Persistence / Save — PARTIAL (works in-scene; cross-scene & post-death are fragile/dead)

### What is saved (`createSaveData`, `NeverquestSaveManager.ts:248-282`)
Persists: player `x,y`, a subset of attributes (`level, experience, health, baseHealth, atack, defense, availableStatPoints`), `items`, current `scene` key, timestamp, playtime, **story flags** (`storyFlags.toJSON()`, `:277`), **spell unlocks** (`:278`), **ability unlocks** (`:279`).
**Not saved:** `rawAttributes` (STR/AGI/VIT/DEX/INT) and `bonus` are **omitted** from the saved attributes (`:259-267`). Since derived stats are recomputed from `rawAttributes` every tick (`AttributesManager`), **allocated stat points are effectively lost on reload** beyond what's frozen in `statsCopy` — but `statsCopy` is rebuilt from the (un-restored) `rawAttributes` on scene re-create. **Impact:** stat allocations and equipment-derived bonuses do not reliably survive a reload. Confidence: MEDIUM-HIGH (rawAttributes clearly absent from the save object; full runtime proof would need a live trace).

### Save triggers — wired
- **Autosave:** 30 s checkpoint timer (`:125,220-225`), plus a 5 s startup test save (`:190-194`). Guarded to only save when `player.canMove && !player.isAtacking` (`createCheckpoint`, `:348`). Writes to `checkpointKey` (`neverquest_rpg_checkpoint`).
- **Manual save (Ctrl+S):** `MainScene.ts:162-164` → `saveGame(false)` → writes to `saveKey` (`neverquest_rpg_save`).
- **Manual load (Ctrl+L):** `MainScene.ts:166-172`. **F5** loads checkpoint, **F6** forces checkpoint (`:173-186`).
- **HUD save button:** `HUDScene.ts:447-448`.
- Every gameplay scene instantiates its own `new NeverquestSaveManager(this)` + `create()` (MainScene, Crossroads, all 5 biomes, Cave/Town/Overworld/UpsideDown, MainMenu). Each has the same save/load keybind block.

### Load on "Continue" (MainMenu) — works for the common case
`MainMenuScene.loadGame()` (`MainMenuScene.ts:308-331`): reads `saveKey` save, fades, `scene.start(saveData.scene)`, then after a 100 ms `setTimeout` fetches the target scene and calls `targetScene.saveManager.applySaveData(saveData)` (`:320-328`). This **correctly defers** applying until the new scene exists, so cross-scene continue from the main save *can* work — provided the saved `scene` is a registered scene with a `saveManager`. Confidence: MEDIUM (timing-based via setTimeout; brittle but plausible).

### BUG — `applySaveData` cross-scene branch is self-defeating
`applySaveData` first does `getPlayer()` on the **current** scene and applies position/attributes there (`:394-411`), and **only at the end** does `if (saveData.scene !== this.scene.scene.key) this.scene.scene.start(saveData.scene)` (`:434-436`). When invoked in-scene (Ctrl+L) this is fine. But if ever called from a different scene than the save's scene, it applies data to the wrong player then starts a fresh scene that discards it. The MainMenu path sidesteps this by starting the scene first; the in-scene F5/Ctrl+L paths are fine. **Net: works for the supported paths, but the function is not safe for arbitrary cross-scene application.** Confidence: HIGH.

### DEAD — post-death "Load Checkpoint" is completely broken
`GameOverScene.loadCheckpoint()` (`GameOverScene.ts:222-247`) does:
```ts
const saveManager = this.game.registry.get('saveManager');   // :226
if (saveManager && saveManager.hasCheckpoint()) { ... saveManager.loadCheckpoint(); }  // :228,246
```
- **Nothing ever calls `registry.set('saveManager', ...)`** anywhere in `src` (grep `registry.set` → empty). So `saveManager` is always `undefined` → the else-branch fires → "No checkpoint found." The continue-from-checkpoint after death never works.
- Worse, `NeverquestSaveManager` **has no `hasCheckpoint()` or `loadCheckpoint()` methods** (it has `hasSaveData()` and `loadGame(true)`; grep confirms those names exist only as `GameOverScene` button/handler identifiers). Even if a manager were in the registry, these calls would throw. Confidence: HIGH.

### DEAD — Game Over scene is not registered (lose condition broken)
`BattleManager.handlePlayerDeath` (`NeverquestBattleManager.ts:732-772`) disables controls, plays a death flash, then `scene.scene.launch('GameOverScene', { playerLevel, lastScene })` and pauses the current scene (`:766-771`). But **`GameOverScene` is commented out of both the import and the scene array** (`index.ts:33` and `index.ts:132`). Launching an unregistered scene is a silent no-op in Phaser. **Result: when the player dies, the current scene pauses and the player is soft-locked with no Game Over UI and no restart/checkpoint path.** This is the single most playability-critical break in this category. Confidence: HIGH.

### Does progress survive scene/biome transitions?
**No automatic mechanism.** Save/load is keyed to localStorage and only fires on autosave timer (30 s, in-scene), manual keys, or HUD button. Warps between scenes (handled by `NeverquestWarp`, see world-map gatherer) do **not** trigger a save and do **not** carry the player object across — each scene constructs a fresh `Player`. So crossing a biome boundary without a recent autosave/manual save loses everything since the last save, and the new scene starts a default-stat player unless a save is explicitly applied. **For an open world with multiple scenes this is a critical gap:** there is no "save on warp / carry state across scene" handoff. Confidence: HIGH (no save call found on any warp/transition; player is re-created per scene).

**Persistence confidence: HIGH on the breaks; MEDIUM on the exact runtime behavior of the happy path (timing-based).**

---

## 4. Player-State Ownership / Hazards — mostly clean, a few hazards

Per `CLAUDE.md` ownership table, BattleManager owns `isAtacking`/`isBlocking` and toggles `canAtack`; dialogs own `canMove/canAtack/canBlock`. Observed:

- **OK:** `BattleManager` does NOT touch `canMove` during attacks (`NeverquestBattleManager.ts:13` comment + code), respecting the documented rule.
- **HAZARD 1 — block uses `canBlock===false` as a proxy for "dialog/menu active"** (`stopBlock`, `:487`): on stopping a block it only restores `canMove/canAtack` if `canBlock !== false`. If any other system sets `canBlock=false` for an unrelated reason, the player can get stuck unable to move/attack after a block. Fragile coupling. Confidence: MEDIUM.
- **HAZARD 2 — attack-completion relies on `ANIMATION_COMPLETE` with a setTimeout fallback** (`:625-700`). If the attack animation key is malformed (it's built by string-splitting the current anim key, `:533-535`) and never fires `ANIMATION_COMPLETE`, only the `ATTACK_TIMEOUT_FALLBACK` timer restores `canAtack` (`:671-700`). Heavy `console.log` instrumentation throughout suggests this has been a recurring source of "can't attack" soft-locks. It is currently guarded by the fallback, so it self-heals, but it is brittle. Confidence: MEDIUM.
- **HAZARD 3 — autosave skipped while busy** (`createCheckpoint` guard `:348`): correct for avoiding mid-combat saves, but combined with no save-on-warp it widens the window where progress can be lost.
- **Verbose `console.log` in the combat hot path** (`block/stopBlock/atack`, dozens of logs per attack) — performance/noise concern, not a correctness bug.

---

## 5. Loot / Items / Drops / Equip

### Drop → pickup → inventory — FUNCTIONAL
- `Enemy` mixes in `NeverquestDropSystem` (`Enemy.ts:180`), giving it `dropItems()`. On death `BattleManager` calls it (`:372`).
- `DropSystem.dropItems` (`NeverquestDropSystem.ts:74-96`): rolls each drop's `chance`, spawns `new Item(...)` with a float tween. Works.
- `Item.pickItemLogic` (`Item.ts:84-114`): physics collider with `player.hitZone`, plays `get_items` sound, tweens item to player, then `addInventory` (`:116-134`) pushes/increments `player.items`. Auto-pickup works.

### Equip → stat change — **DEAD (does not exist)**
- The type system models equipment bonuses (`IEquipmentBonus`, `bonus.equipment[]` in `EntityAttributes.ts:46-61,98`) and `AttributesManager` is structured to add equipment bonuses — **but nothing ever writes to `bonus.equipment`** (grep for `equip`, `bonus.equipment.push`, `equipItem` → **empty**). `InventoryScene` exposes only **`consume`** (`InventoryScene.ts:667` → `Item.consume` → `NeverquestConsumableManager`). There is **no equip action, no equipment slots, no weapon/armor stat application** in gameplay.
- **The only working "loot → stronger" path is consumables:** `NeverquestConsumableManager` heals (`:105-109`) and applies **temporary** timed `atack` buffs via `changeStats` (`:159-174,191-194`). No permanent gear progression.

**Impact on core loop:** killing enemies yields consumables (potions/buffs) and XP, but **never gear**. For an ARPG "fight → loot → equip → progress" spine, the equip link is absent — progression is XP/stat-point-only. Confidence: HIGH.

---

## Consolidated Top Blockers (for a one-chapter playthrough)

Ordered by playability impact. All are **re-connect/finish existing systems**, not net-new builds (reuse-first per brief).

1. **[CRITICAL] Lose condition dead — `GameOverScene` not registered.** Player death pauses the scene with no UI/restart. Fix: re-enable import + array entry in `index.ts:33,132`; then GameOver's restart path (`scene.start('MainScene')`, `:218`) works. (`NeverquestBattleManager.ts:766`)
2. **[CRITICAL] Post-death checkpoint load broken — no `saveManager` in registry, and `hasCheckpoint()`/`loadCheckpoint()` don't exist.** Fix: register the active scene's saveManager (`registry.set('saveManager', this.saveManager)`), and either add `hasCheckpoint()`/`loadCheckpoint()` to `NeverquestSaveManager` or repoint `GameOverScene` to `hasSaveData(true)` / `loadGame(true)`. (`GameOverScene.ts:226-246`)
3. **[CRITICAL] Progression never advances the story — no `setFlag` in any gameplay scene.** Story flags are read-only by Journal/QuestLog UI. Without flag-writes on boss-kill / artifact-pickup / area-entry, quests can never complete and there is no narrative spine. Fix: call `storyFlags.setFlag(...)` at boss-defeat (`BattleManager` enemy-death branch could fire an event consumed by the scene) and at warp/area-entry. (cross-ref narrative gatherer; confirmed empty here)
4. **[HIGH] No state handoff across scene/biome transitions.** Player is re-created per scene; warps don't save. Open-world coherence needs save-on-warp (or a persistent player/registry handoff). (`NeverquestSaveManager` never called from a warp)
5. **[HIGH] `rawAttributes` (STR/AGI/VIT/DEX/INT) not persisted** → allocated stat points don't reliably survive reload. Fix: include `rawAttributes` (and resolved `bonus`) in `createSaveData` (`NeverquestSaveManager.ts:259-267`).
6. **[MEDIUM] Designed XP curve is dead code; leveling uses an ad-hoc formula.** Decide: wire `ExperienceCurve.ts` into `ExpManager`, or delete the unused curve. The 3-act pacing won't hold otherwise. (`ExpManager.ts:95` vs `ExperienceCurve.ts`)
7. **[MEDIUM] baseHealth double-mutation between `ExpManager` and `AttributesManager`** — pick one owner. (`ExpManager.ts:94` vs `AttributesManager.ts:170-185`)
8. **[LOW/OPTIONAL] No equipment progression.** Brief excludes crafting/skill-trees; gear is borderline. If "loot → equip" is wanted for coherence, the type scaffolding exists (`bonus.equipment`) but needs an equip action in `InventoryScene` + application in `AttributesManager`. Otherwise document that progression is XP/stat-only and loot = consumables.

---

## Is the core loop + save system functional enough for a one-chapter playthrough?

**Not yet — but the gaps are wiring, not missing engines.** Combat, XP gain, leveling, stat allocation, drops/pickup/consumables, and in-scene manual/auto save all WORK. The blockers are: (a) **death is a soft-lock** (GameOverScene unregistered + dead checkpoint-reload), (b) **the story never advances from play** (no `setFlag` in gameplay), and (c) **no state persistence across the multi-scene open world** (no save-on-warp; rawAttributes not saved). Fix #1–#5 and you have a playable, persisting one-chapter loop with a real lose condition. #6–#8 are polish/coherence.
