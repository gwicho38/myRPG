# Decision Log — Neverquest "The Awakening" (Chapter 1)

MADR-format Architecture Decision Records for the load-bearing design choices.
Companion to `high-level-design.md`. Alternatives already analyzed in `solution-exploration.md` are referenced, not re-argued.

**Context shared by all ADRs:** Phaser 3 + TypeScript; Jest tests, eslint, `tsc --noEmit`, `lint:hardcoded`, and webpack build must stay green; this design feeds an **autonomous overnight build**, so decisions privilege **risk** and **simplicity**. Repo CLAUDE.md rules apply: overlap callbacks = UI only, each system owns its flags, event-driven preferred, constants in `src/consts`, no hardcoded strings.

---

## ADR-001: Registry singleton persistence keystone

### Status
Accepted

### Context
Three independent defects share one root cause: (a) three throwaway `new NeverquestStoryFlags()` instances exist (`SaveManager.ts:162`, `QuestLogScene.ts:241`, `JournalScene.ts:330`) so no shared narrative state exists; (b) flags do not survive `scene.start` because scene-local state is destroyed on transition; (c) `GameOverScene.loadCheckpoint()` reads `registry.get('saveManager')` (`:226`) which is **never set**, and calls `saveManager.hasCheckpoint()`/`loadCheckpoint()` which **do not exist** — death-checkpoint load is dead. The event-bridge (ADR-002) also requires a single shared flag instance to write to.

### Decision Drivers
- One edit should resolve the shared-instance, cross-scene-survival, and dead-death-checkpoint problems together (highest leverage).
- Must reuse the existing `SaveManager.toJSON/fromJSON` flag serialization, not replace it.
- Must be the Phaser-idiomatic cross-scene mechanism.
- Must not break QuestLog/Journal rendering if a value is absent (assumption A2).

### Considered Options
1. **Registry singletons** — promote one `storyFlags` and the active `saveManager` into `game.registry`; scenes/UI read from it (with a `new`-fallback for safety). Add `hasCheckpoint()`/`loadCheckpoint()` wrappers and `rawAttributes`+`bonus` serialization. *(solution-exploration DA4 Alt 4A/4C)*
2. **Init-data only** — pass a serialized player+flags blob through `scene.start(key, data)` and rehydrate per scene. *(DA4 Alt 4B)*
3. **GameProgressManager** — a new manager owning flags + quests + save in one object. *(DA2 Alt 2C)*

### Decision Outcome
Chosen option: **Registry singletons (Option 1)**, because it is the single highest-leverage edit — it simultaneously gives ADR-002 its shared flag instance, makes flags survive `scene.start`, and unbreaks the death-checkpoint — while reusing the existing SaveManager serialization.

### Consequences
#### Good
- One keystone fixes three P0s; cross-scene continuity is automatic.
- `GameOverScene` needs no logic change once the Registry key + the two method shims exist.
- Reuses `toJSON/fromJSON`; adding `rawAttributes`+`bonus` is a localized `createSaveData` edit.

#### Bad
- Must replace three `new NeverquestStoryFlags()` call sites with Registry reads (focused multi-file edit).
- `rawAttributes` round-trip must be proven by a save→reload test (assumption A3).
- Registry is global mutable state; the `new`-fallback is required to keep UI render-safe.

---

## ADR-002: Thin event-bridge over inline setFlag calls

### Status
Accepted

### Context
No gameplay code writes story flags — the reward half of the narrative loop (quests, lore, spell cascades) is built but unreachable. Notably, `setStoryFlag` is **already emitted** at `NeverquestAbilityManager.ts:188` with **0 listeners**. Gameplay triggers (intro end, NPC dialog complete, boss kill, artifact pickup) must drive flag writes without violating the repo's "each system owns its flags / overlap callbacks = UI only / event-driven" rules.

### Decision Drivers
- Reuse the already-emitted `setStoryFlag` event rather than invent plumbing.
- Keep narrative writes out of combat/movement code (state-ownership rule).
- The wiring must be unit-testable off-scene for an unattended build.

### Considered Options
1. **Thin event-bridge** — one `setStoryFlag` listener writes the shared StoryFlags; gameplay sites only `emit`. A small QuestManager FSM consumes flag-written. *(DA2 Alt 2A)*
2. **Inline `setFlag()`** — call `storyFlags.setFlag(...)` directly at each trigger site. *(DA2 Alt 2B)*
3. **GameProgressManager** — centralize flags+quests+save; gameplay calls into it. *(DA2 Alt 2C)*

### Decision Outcome
Chosen option: **Thin event-bridge (Option 1)**, because it reuses the existing `setStoryFlag` emit, honors the repo's event-driven + state-ownership doctrine, and yields an FSM unit-testable without booting Phaser.

### Consequences
#### Good
- Maximum reuse: gives the orphaned `setStoryFlag` emit its first listener.
- Trigger sites stay decoupled — they only `emit`, never touch StoryFlags.
- Bridge + FSM are testable on a mock events bus.

#### Bad
- Two new moving parts (bridge + FSM) vs. zero for inline calls.
- Event/flag names must be centralized (ADR-006) to avoid magic-string lint failures.

---

## ADR-003: Hub-and-spoke via larus.json warp objects

### Status
Accepted

### Context
The world's biomes are orphaned. A proven warp exists: `larus.json` object id=88 (`name:"dungeon"`, props `goto:"DungeonScene"` string + `scene:bool true`) drives `NeverquestWarp` → `scene.start(key,{previousScene})` (`NeverquestWarp.ts:194–199`). `IceCavernsScene` is already registered in `index.ts:109` and spawns enemies (`spawnFrostEnemies()` at `:248`) but has no inbound warp and defaults `previousScene='CrossroadsScene'` (`:79`). The author-intended `CrossroadsScene` hub is blocked on a non-existent `crossroads` map.

### Decision Drivers
- Reuse the one proven warp toolchain as a pure data edit; no new scene logic.
- Match the literature's hub-and-spoke prescription for a solo one-chapter build.
- Keep a future Crossroads hub a cheap drop-in (forward-compat).

### Considered Options
1. **larus warp objects (hub-and-spoke)** — clone id=88 for `IceCavernsScene`; fix biome `previousScene→MainScene`; route returns through a `previousScene` convention. *(DA3 Alt 3A + 3C)*
2. **Re-enable OverworldScene/CrossroadsScene authored hub.** *(DA3 Alt 3B)*

### Decision Outcome
Chosen option: **larus warp objects (Option 1)**, because it reuses the proven warp pattern as a pure JSON edit, matches the hub-and-spoke prescription, and keeps the Crossroads upgrade path open at zero cost.

### Consequences
#### Good
- Pure data change for the second spoke; no new scene code or art.
- `DungeonScene.previousScene` already defaults to `'MainScene'` — Stage A needs no biome edit.
- Future Crossroads drops in without rewiring biomes.

#### Bad
- Hand-editing Tiled JSON (coords/GIDs/property schema) is finicky; must mirror id=88 exactly.
- "Open world" is centralized (hub) rather than continuous.

---

## ADR-004: Staged scope — Stage A then Stage B

### Status
Accepted

### Context
The #1 risk for this overnight build is scope creep (per the literature, the dominant indie-killer). The full narrative loop is winnable on two already-working maps (`larus` + `DungeonScene`); the IceCaverns second spoke carries one residual dependency (its enemy-spawn path). The build must guarantee a shippable, green result even if later work is cut short.

### Decision Drivers
- Guarantee a completable, green Chapter 1 independent of any risky add-on.
- Make the second spoke purely additive, not load-bearing.
- Hold the cut line: no new maps, no equipment, no Acts 2/3.

### Considered Options
1. **Staged: Stage A (hub + Dungeon, full loop) then Stage B (IceCaverns spoke).** *(DA1 Alt 1B with 1A as fallback)*
2. **Single-stage minimal (Dungeon-only).** *(DA1 Alt 1A)*
3. **Fuller (Crossroads + all 5 biomes).** *(DA1 Alt 1C)*

### Decision Outcome
Chosen option: **Staged (Option 1)**, because Stage A is a guaranteed-green complete chapter on proven maps, and Stage B adds a real second spoke additively (its `spawnFrostEnemies()` is confirmed, resolving the U4/A1 spawn caveat).

### Consequences
#### Good
- A whole coherent chapter ships even if Stage B is cut.
- The "open world" claim becomes real via the cheapest possible second spoke.
- Every in-scope item is connect-the-dots wiring.

#### Bad
- Two-stage sequencing adds light build-order discipline.
- Stage B touches one more scene (`previousScene` fix) and the map JSON.

---

## ADR-005: Quest modeled as an FSM over QUEST_FLAG_MAP

### Status
Accepted

### Context
`QuestLogScene` already holds both `QUEST_DEFINITIONS` (16 quests) and `QUEST_FLAG_MAP` (quest-id → `StoryFlag`) at `:47` and `:170`, but it only renders a boolean `completed` derived from `hasFlag`. There is no notion of an *active* (started-but-not-done) quest, and the map is private to the UI scene, so gameplay/FSM cannot reuse it.

### Decision Drivers
- Reuse the existing `QUEST_FLAG_MAP`/`QUEST_DEFINITIONS` rather than redefine quests.
- Provide a three-state model (`not-started → active → complete`) the UI and triggers can both consult.
- Keep the FSM unit-testable without a scene.

### Considered Options
1. **NeverquestQuestManager FSM** over an extracted shared `QUEST_FLAG_MAP`; `active` derived from prerequisite flags, `complete` from the quest's own flag. *(DA2 Alt 2A, FSM half)*
2. **Keep boolean-only in QuestLogScene** — no active state, map stays private.
3. **Fold quests into a GameProgressManager.** *(DA2 Alt 2C)*

### Decision Outcome
Chosen option: **NeverquestQuestManager FSM (Option 1)**, because it reuses the existing map/definitions, adds the missing `active` state the chapter needs, and is testable in isolation (seed flags → assert states).

### Consequences
#### Good
- Reuses authored quest data verbatim; FSM is pure logic over flags.
- `active` state enables a meaningful quest log and chapter pacing.
- `ACT_1_COMPLETE` is derivable when all Act-1 quests complete.

#### Bad
- Extracting `QUEST_FLAG_MAP`/`QUEST_DEFINITIONS` to `src/consts/progression` touches `QuestLogScene` (import swap).
- FSM transition rules must be defined carefully to avoid skipping `active`.

---

## ADR-006: Event and flag names centralized in src/consts/Events.ts

### Status
Accepted

### Context
Event names are currently magic strings (`'setStoryFlag'`, `'spellUnlocked'`, `'spellwheelclosed'`) scattered across plugins. The repo enforces `npm run lint:hardcoded` and CLAUDE.md forbids hardcoded strings. The event-bridge (ADR-002) and FSM (ADR-005) will introduce several new event names plus references to `StoryFlag` enum values and quest ids.

### Decision Drivers
- Satisfy `lint:hardcoded` and the no-magic-strings rule.
- Single definition prevents emitter/listener name drift (the exact bug behind the orphaned `setStoryFlag`).
- Keep `StoryFlag`/quest constants importable by gameplay, bridge, FSM, and UI alike.

### Considered Options
1. **Centralize in `src/consts/Events.ts`** (event names) + `src/consts/progression/QuestFlagMap.ts` (quest map/defs); re-export `StoryFlag` for ergonomic imports.
2. **Inline string literals** at each emit/listen site.

### Decision Outcome
Chosen option: **Centralize (Option 1)**, because it eliminates magic strings, guarantees emitter/listener name agreement, and gives every layer one import for events/flags/quests.

### Consequences
#### Good
- Passes `lint:hardcoded`; no emitter/listener drift.
- One place to add a new event when a new flag trigger is wired.

#### Bad
- Existing emit sites (`AbilityManager:188`, MainScene `spellwheelclosed`) should migrate to the constant for consistency (small, optional churn).
