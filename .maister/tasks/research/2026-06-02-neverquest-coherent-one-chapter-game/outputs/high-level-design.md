# High-Level Design: Neverquest "The Awakening" — Coherent Playable Chapter 1

**Date:** 2026-06-03 · **Author:** solution-designer agent · **Research confidence:** HIGH
**Selected approach:** Chapter 1 "The Awakening" — staged hub-and-spoke, thin event-bridge narrative wiring, Registry persistence keystone (from `solution-exploration.md`, Phase 4 converged).
**Architecture style:** Event-driven wiring over a shared in-memory singleton (Phaser Registry), layered on the existing scene/plugin engine. **No new maps, no new mechanics — connect-the-dots on existing assets.**

---

## Design Overview

**Business context.** Neverquest has a complete authored Act-1 "Lucius" narrative (a 31-member `StoryFlag` enum, 16 `QUEST_DEFINITIONS`, lore, spell-unlock cascades) and a working engine (boot, combat, XP, drops, in-scene save, HUD), but the two halves are **severed**: no gameplay code ever writes a story flag, so the authored content is invisible to a player. This delivers a coherent, completable one-chapter game by wiring the existing pieces together for an autonomous overnight build.

**Chosen approach.** A **thin event-bridge** turns gameplay events (intro complete, NPC talked, boss killed, area entered, artifact picked up) into `setFlag` writes against a **single shared `NeverquestStoryFlags` instance** promoted into the **Phaser global Registry**. A new **`NeverquestQuestManager` FSM** (`not-started → active → complete`) maps those flags to quest state and refreshes the `QuestLogScene` UI. The world is **hub-and-spoke**: `larus` (MainScene) is the hub; `DungeonScene` is the mandatory climax spoke (Stage A), `IceCavernsScene` a second spoke (Stage B), reached via **data-only warp objects** in `larus.json` cloned from the already-working `dungeon` warp. The **Registry keystone** is the single highest-leverage edit — one change gives the bridge its shared flag instance, makes flags survive `scene.start`, and unbreaks the dead death-checkpoint load.

**Key decisions:**
- **Registry singletons** (`storyFlags`, `saveManager`) are the keystone — one edit fixes the shared-instance, cross-scene-survival, and dead-death-checkpoint problems at once (ADR-001).
- **Thin event-bridge** reuses the already-emitted-but-unheard `setStoryFlag` event rather than scattering `setFlag()` calls through combat/movement code (ADR-002).
- **Hub-and-spoke via `larus.json` warp objects** clones the proven `dungeon` warp (id=88) as a pure JSON edit (ADR-003).
- **Quest = FSM** driven by the existing `QUEST_FLAG_MAP`, extracted to a constant and consumed by both the FSM and `QuestLogScene` (ADR-005).
- **Staged scope** ships Stage A (hub + Dungeon, full narrative loop) as a guaranteed-green deliverable before Stage B (IceCaverns spoke) (ADR-004).
- **Event/flag names live in `src/consts/Events.ts`** — no magic strings, satisfying `lint:hardcoded` (cross-cutting constraint).

---

## Architecture

### System Context (C4 Level 1)

The player drives gameplay; gameplay must feed the narrative state, which must persist and surface through UI. Today the narrative box is an island.

**BEFORE — severed (today):**
```
                 ┌────────────────────────────────────────┐
[Player] ──────► │  Gameplay Engine                        │
  input          │  MainScene · DungeonScene · IceCaverns  │
                 │  BattleManager · NPCManager · Warp      │
                 └────────────────────────────────────────┘
                          │  (NO flag writes)  ✗
                          ▼
                 ┌────────────────────────────────────────┐
                 │  Narrative State  (ISLAND)              │
                 │  StoryFlags ×3 throwaway instances      │
                 │  QuestLog · Journal · Spell/Ability     │
                 └────────────────────────────────────────┘
                          │  reads its own throwaway flags
                          ▼
                 [QuestLog/Journal UI show empty progress]

   [localStorage] ◄── SaveManager (omits rawAttributes; GameOverScene
                      death-load reads registry 'saveManager' = NEVER SET) ✗
```

**AFTER — wired (this design):**
```
                 ┌────────────────────────────────────────┐
[Player] ──────► │  Gameplay Engine                        │
  input          │  emits domain events ──┐                │
                 └────────────────────────┼────────────────┘
                                          │ 'setStoryFlag'(StoryFlag)
                                          ▼
                 ┌────────────────────────────────────────┐
   PHASER        │  StoryFlagBridge listener  →  setFlag() │
   REGISTRY ───► │  registry['storyFlags']  (1 shared)     │
  (singletons)   │  NeverquestQuestManager FSM             │
                 └────────────────────────────────────────┘
                     │ refresh           │ save-on-warp/death
                     ▼                   ▼
              [QuestLog/Journal     [SaveManager → localStorage]
               show live progress]   registry['saveManager'] SET ✓
                                      → GameOverScene death-load works ✓
```

### Container Overview (C4 Level 2)

Containers = the running Phaser scenes/plugins and the shared Registry. New/changed pieces marked `[NEW]` / `[MOD]`.

```
┌──────────────────────────── Phaser.Game (index.ts) ───────────────────────────┐
│  Scene list [MOD]: + GameOverScene, + TutorialScene re-registered              │
│                                                                                │
│  ┌─────────────── PHASER GLOBAL REGISTRY (game.registry) ──────────────┐       │
│  │  'storyFlags'  : NeverquestStoryFlags   (single shared instance)    │ [NEW] │
│  │  'saveManager' : NeverquestSaveManager  (active scene's manager)    │ [NEW] │
│  │  'questManager': NeverquestQuestManager (FSM, optional handle)      │ [NEW] │
│  └─────────────────────────────────────────────────────────────────────┘      │
│        ▲ set on create / read by all          ▲ read by UI + death-load        │
│        │                                       │                               │
│  ┌─────┴───────────┐  ┌──────────────┐  ┌──────┴──────────┐  ┌──────────────┐  │
│  │ MainScene (hub) │  │ DungeonScene │  │ IceCavernsScene │  │ HUDScene     │  │
│  │  [MOD] register │  │ [MOD] flag   │  │ [MOD] prevScene │  │ [MOD] launch │  │
│  │  registry; warp │  │ on boss kill │  │ =MainScene (SB) │  │ QuestLog/    │  │
│  │  objects (data) │  │  + win beat  │  │                 │  │ Journal      │  │
│  └────────┬────────┘  └──────┬───────┘  └────────┬────────┘  └──────────────┘  │
│           │ NeverquestWarp [MOD: save-on-warp]   │                             │
│           ▼                                       ▼                             │
│  ┌─────────────────────────── PLUGINS (per-scene) ──────────────────────────┐  │
│  │ StoryFlagBridge [NEW]  · NeverquestQuestManager [NEW]                     │  │
│  │ NeverquestBattleManager [MOD: emit boss-defeated/area events]            │  │
│  │ NeverquestNPCManager [MOD: emit npc-talked]                               │  │
│  │ NeverquestSaveManager [MOD: registry.set + rawAttributes/bonus +         │  │
│  │   hasCheckpoint()/loadCheckpoint() shims] · NeverquestStoryFlags         │  │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│           │ toJSON/fromJSON                                                     │
│           ▼                                                                     │
│  [ localStorage : neverquest_rpg_save / _checkpoint / _story_flags ]           │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Container responsibilities (one line each):**
- **Registry** — process-wide source of truth for the shared `storyFlags` and the active `saveManager`; the keystone.
- **MainScene (hub)** — registers the singletons on `create()`; hosts `larus` warps to the spokes; starts the opening quest on New Game.
- **DungeonScene / IceCavernsScene (spokes)** — gameplay biomes that emit `area-entered` and (Dungeon) `boss-defeated`; return to `previousScene`.
- **StoryFlagBridge** — the one `setStoryFlag` listener that writes the shared `StoryFlags`.
- **NeverquestQuestManager** — the FSM mapping flags → quest state, emitting quest-changed for the UI.
- **HUDScene** — overlays `QuestLogScene` / `JournalScene` via `scene.launch`, passing the shared `storyFlags`.

---

## Key Components

| Component | Purpose | Responsibilities | Key interface (grounded in real APIs) | Events in → out | Lives in |
|---|---|---|---|---|---|
| **Registry keystone** | One shared narrative/save state for all scenes | (1) hold single `storyFlags`; (2) hold active `saveManager`; (3) be read by UI + death-load | `scene.registry.set('storyFlags', flags)` / `.get('storyFlags')`; `game.registry.set('saveManager', sm)` | — | `MainScene.create()` sets; consumed in `DungeonScene`, `IceCavernsScene`, `QuestLogScene`, `JournalScene`, `GameOverScene` |
| **StoryFlagBridge** `[NEW]` | Single listener turning events into flag writes | (1) `scene.events.on(Events.SET_STORY_FLAG, fn)`; (2) call `registry.get('storyFlags').setFlag(flag)`; (3) trigger quest re-eval | `create(scene): void` — registers listener; resolves flags via Registry, never `new`s its own | in: `Events.SET_STORY_FLAG(StoryFlag)` → out: `Events.FLAG_WRITTEN(StoryFlag)` | `src/plugins/NeverquestStoryFlagBridge.ts` (new) |
| **NeverquestQuestManager** `[NEW]` | Quest FSM over flags | (1) derive `not-started/active/complete` per quest from `QUEST_FLAG_MAP`; (2) advance on flag-written; (3) emit quest-changed | `getState(questId): TQuestState`; `evaluate(): void`; reads shared `StoryFlags` from Registry | in: `Events.FLAG_WRITTEN` → out: `Events.QUEST_CHANGED(questId,state)` | `src/plugins/NeverquestQuestManager.ts` (new) |
| **NeverquestStoryFlags** `[MOD-]` | Flag store (mostly unchanged) | unchanged store/`setFlag`/`hasFlag`/`toJSON`/`fromJSON`; the `onFlagSet(CAVE_BOSS_DEFEATED)` spell cascade already exists | existing `setFlag(flag)`, `hasFlag(flag)`, `getCurrentAct()`, `toJSON()/fromJSON()` | out (existing): `'spellUnlocked'`, `'sunstoneRestored'` | `src/plugins/NeverquestStoryFlags.ts` |
| **NeverquestSaveManager** `[MOD]` | Persistence + checkpoint shim | (1) `registry.set('saveManager', this)` in `create()`; (2) add `rawAttributes`+`bonus` to `createSaveData`; (3) add `hasCheckpoint()`/`loadCheckpoint()` wrappers; (4) read shared StoryFlags from Registry instead of `new` | add `hasCheckpoint(): boolean` → `this.hasSaveData(true)`; `loadCheckpoint(): boolean` → `applySaveData(loadGame(true))` | — | `src/plugins/NeverquestSaveManager.ts` |
| **NeverquestWarp** `[MOD]` | Scene transition + save-on-warp | before `scene.scene.start(sceneKey, …)`, call active `saveManager.saveGame(true)` (checkpoint) so progress survives the hop | existing `createWarps()`; the scene-warp branch already does `scene.start(key,{previousScene})` | — | `src/plugins/NeverquestWarp.ts` |
| **NeverquestBattleManager** `[MOD]` | Combat → narrative triggers | on Cave-Guardian boss death emit `setStoryFlag(CAVE_BOSS_DEFEATED)` + a `chapterComplete` beat; do NOT manage flags inline elsewhere | existing enemy-died branch (`target.attributes.health <= 0`); add boss check by `entityName`/config | out: `Events.SET_STORY_FLAG`, `Events.CHAPTER_COMPLETE` | `src/plugins/NeverquestBattleManager.ts` |
| **NeverquestNPCManager** `[MOD]` | Dialogue → narrative triggers | on dialog-complete for a tracked NPC, emit `setStoryFlag(MET_ELDER)` (overlap callback stays UI-only per CLAUDE.md) | existing `handleNPCOverlap`; emit on dialog-end, not on overlap frame | out: `Events.SET_STORY_FLAG` | `src/plugins/NeverquestNPCManager.ts` |
| **QuestLogScene** `[MOD]` | Quest UI | consume Registry `storyFlags` (drop the `new NeverquestStoryFlags(this)` at :241); `refresh()` on `Events.QUEST_CHANGED` | existing `init({storyFlags})`, `refresh()`; `QUEST_FLAG_MAP` extracted to consts | in: `Events.QUEST_CHANGED` | `src/scenes/QuestLogScene.ts` |
| **JournalScene** `[MOD]` | Lore UI | consume Registry `storyFlags` (drop `new` at :330) | existing `init({storyFlags})` | — | `src/scenes/JournalScene.ts` |
| **GameOverScene** `[MOD-]` | Death screen | no code change needed once `registry.set('saveManager')` + `hasCheckpoint()/loadCheckpoint()` exist; re-register in `index.ts` | existing `loadCheckpoint()` reads `registry.get('saveManager')` and calls `hasCheckpoint()`/`loadCheckpoint()` | — | `src/scenes/GameOverScene.ts` + `index.ts` |
| **"Chapter 1 Complete" overlay** `[NEW]` | Victory beat | small overlay scene launched on `Events.CHAPTER_COMPLETE`; offers Continue/Menu | `scene.launch('ChapterCompleteScene')` from a `chapterComplete` listener | in: `Events.CHAPTER_COMPLETE` | `src/scenes/ChapterCompleteScene.ts` (new) |

> **Grounded API notes.** `setStoryFlag` is already emitted once at `NeverquestAbilityManager.ts:188` with **0 listeners** — the bridge is its first listener. `QUEST_FLAG_MAP` already exists verbatim in `QuestLogScene.ts:170–187`; the FSM reuses it (extract to `src/consts/progression`). `GameOverScene.ts:226/228/246` already call `registry.get('saveManager')`, `saveManager.hasCheckpoint()`, `saveManager.loadCheckpoint()` — **none exist today**; this design supplies all three. `IEntityAttributes` (`EntityAttributes.ts`) has `rawAttributes`+`bonus`; `createSaveData` (`SaveManager.ts:259–267`) omits both.

---

## Data Flow — One Full Quest Beat (sequence)

Beat traced: **"The Elder's Request" → "Cave Guardian" → Chapter Complete.**

```mermaid
sequenceDiagram
    participant P as Player
    participant NPC as NeverquestNPCManager
    participant BM as NeverquestBattleManager
    participant EV as scene.events bus
    participant BR as StoryFlagBridge
    participant SF as StoryFlags (Registry singleton)
    participant QM as NeverquestQuestManager (FSM)
    participant QL as QuestLogScene (UI)
    participant SM as NeverquestSaveManager
    participant WARP as NeverquestWarp

    Note over P,NPC: Beat 2 — talk to the Elder (hub)
    P->>NPC: overlap + finish dialog (Elder)
    NPC-->>EV: emit setStoryFlag(MET_ELDER)
    EV-->>BR: setStoryFlag(MET_ELDER)
    BR->>SF: setFlag(MET_ELDER)
    SF-->>SF: onFlagSet() side-effects (existing)
    BR-->>EV: emit flagWritten(MET_ELDER)
    EV-->>QM: flagWritten(MET_ELDER)
    QM->>SF: hasFlag(MET_ELDER) → true
    QM-->>EV: emit questChanged('meet_elder','complete')
    EV-->>QL: questChanged → refresh()

    Note over P,WARP: warp to Dungeon (save-on-warp)
    P->>WARP: enter larus 'dungeon' warp
    WARP->>SM: saveGame(checkpoint=true)
    SM->>SF: toJSON() (flags persisted)
    WARP->>WARP: scene.start('DungeonScene',{previousScene:'MainScene'})

    Note over P,QL: Beat 4 — defeat Cave Guardian
    P->>BM: killing blow on Cave Guardian (health<=0, isBoss)
    BM-->>EV: emit setStoryFlag(CAVE_BOSS_DEFEATED)
    EV-->>BR: setStoryFlag(CAVE_BOSS_DEFEATED)
    BR->>SF: setFlag(CAVE_BOSS_DEFEATED)
    SF-->>SF: onFlagSet → setFlag(SPELL_FLAME_WAVE_UNLOCKED) + emit spellUnlocked (existing cascade)
    BR-->>EV: emit flagWritten(CAVE_BOSS_DEFEATED)
    EV-->>QM: flagWritten → questChanged('cave_boss','complete')
    QM->>SF: setFlag(ACT_1_COMPLETE) when all Act-1 quests complete
    BM-->>EV: emit chapterComplete
    EV-->>QL: refresh(); launch ChapterCompleteScene overlay
```

**Reward cascade (already built, now reachable).** Because `StoryFlags.onFlagSet(CAVE_BOSS_DEFEATED)` already sets `SPELL_FLAME_WAVE_UNLOCKED` and emits `spellUnlocked`, the single boss-kill flag write lights up the spell unlock with no new code — this is the high-leverage payoff the bridge unlocks.

---

## Chapter 1 Beat Table

Mapped to **real** `StoryFlag` enum members and **real** `QUEST_DEFINITIONS` ids (Act-1 subset). `[A]`=Stage A, `[B]`=Stage B.

| # | Beat | Trigger event (emitter) | StoryFlag(s) set | Quest affected (id → state) | Scene / warp | Reward / cascade | Stage |
|---|---|---|---|---|---|---|---|
| 1 | Awakening / intro ends | `setStoryFlag(INTRO_COMPLETE)` from IntroScene/MainScene boot | `INTRO_COMPLETE` | `intro` → complete; `meet_elder` → active | MainScene (hub) | QuestLog shows first active quest | A |
| 2 | Speak with the Elder | `setStoryFlag(MET_ELDER)` from NeverquestNPCManager (dialog-complete) | `MET_ELDER` | `meet_elder` → complete; `cave_artifact` → active | MainScene | Dungeon warp pointed out | A |
| 3 | Enter the cave; retrieve artifact | `setStoryFlag(CAVE_ARTIFACT_RETRIEVED)` from artifact pickup (Dungeon) | `CAVE_ARTIFACT_RETRIEVED` | `cave_artifact` → complete; `cave_boss` → active | larus→**DungeonScene** warp (id=88, exists) | save-on-warp checkpoint | A |
| 4 | Defeat the Cave Guardian (boss) | `setStoryFlag(CAVE_BOSS_DEFEATED)` from BattleManager boss-kill | `CAVE_BOSS_DEFEATED` → (cascade) `SPELL_FLAME_WAVE_UNLOCKED` | `cave_boss` → complete | DungeonScene | **Flame Wave spell** (existing `onFlagSet` cascade) + `spellUnlocked` event | A |
| 5 | Chapter 1 Complete | `chapterComplete` from BattleManager after boss flag; QuestManager sets `ACT_1_COMPLETE` | `ACT_1_COMPLETE` (+ optional `COMPLETED_ACT_1`) | all Act-1 quests complete | overlay → return MainScene | "Chapter 1 Complete" overlay | A |
| 6 | (Optional) Explore Ice Caverns spoke | `setStoryFlag` n/a (exploration); `area-entered` telemetry only | — (no Act-1 flag; biome is bonus content) | — | larus→**IceCavernsScene** warp (new clone of id=88) | combat/XP in `spawnFrostEnemies()` (exists at `IceCavernsScene.ts:248`) | B |

> Stage A is a complete, winnable narrative loop (beats 1–5) on two proven maps. Stage B adds beat 6 as a navigable second spoke. Acts 2–3 flags (`ENTERED_CROSSROADS` … `VOID_KING_CONFRONTED`) and their quests are **out of scope** — defined in code, deferred to Ch.2+.

---

## Registry Keystone Design

**Exact keys, owners, consumers:**

| Registry key | Type | Set where | Read where |
|---|---|---|---|
| `storyFlags` | `NeverquestStoryFlags` | `MainScene.create()` after `saveManager.create()` — `this.registry.set('storyFlags', this.saveManager.storyFlags)` (reuse the one SaveManager already creates at `SaveManager.ts:162`) | `StoryFlagBridge`, `NeverquestQuestManager`, `QuestLogScene` (replaces `new` at :241), `JournalScene` (replaces `new` at :330) |
| `saveManager` | `NeverquestSaveManager` | every scene that owns a SaveManager, in `create()` — `this.game.registry.set('saveManager', this.saveManager)` (MainScene, DungeonScene, IceCavernsScene) | `GameOverScene.loadCheckpoint()` (already reads it at :226); `NeverquestWarp` for save-on-warp |
| `questManager` | `NeverquestQuestManager` | `MainScene.create()` (optional convenience handle) | UI scenes that want direct FSM queries |

**Consumption pattern (single source of truth).** Scenes/UI resolve via a Registry getter with a fallback to keep render-safe:
```
const storyFlags = this.registry.get('storyFlags') ?? (() => { const f = new NeverquestStoryFlags(this); f.load(); return f; })();
```
This satisfies assumption **A2** from the exploration (QuestLog/Journal keep rendering even if a Registry value is missing) while eliminating the three throwaway instances in the normal path. The Registry is the Phaser-idiomatic cross-scene store; it survives `scene.start` (which destroys scene-local state), which is exactly why flags now persist across biome hops.

---

## Integration Points

- **Event bus** — `scene.events` (per-scene emitter). Domain events (`setStoryFlag`, `flagWritten`, `questChanged`, `chapterComplete`, `area-entered`) are emitted by gameplay plugins and consumed by the bridge/FSM/UI. The bridge must be attached on the **active gameplay scene** (Main/Dungeon/IceCaverns) so its `events` bus is the one gameplay emits on.
- **localStorage** — persistence boundary via `SaveManager.saveGame`/`loadGame` (`neverquest_rpg_save`, `neverquest_rpg_checkpoint`) and `StoryFlags` (`neverquest_story_flags`). `toJSON/fromJSON` already serialize flags; this design adds `rawAttributes`+`bonus` to the player block.
- **Tiled map data** — `larus.json` `warps` object layer (9 objects today). New warp objects clone id=88 (`goto:"DungeonScene"` string + `scene:bool true`). No new tilesets/GIDs.
- **Phaser Registry** — `game.registry` cross-scene store (the keystone).
- **Scene overlays** — `HUDScene` launches `QuestLogScene`/`JournalScene`/`ChapterCompleteScene` via `scene.launch`, mirroring the existing `scene.launch('HUDScene', …)` pattern in `MainScene.create()`.

---

## Design Decisions

See `decision-log.md` for full MADR records.

| ADR | Decision | Status |
|---|---|---|
| [ADR-001](decision-log.md#adr-001-registry-singleton-persistence-keystone) | Registry singleton persistence keystone (`storyFlags`, `saveManager`) | Accepted |
| [ADR-002](decision-log.md#adr-002-thin-event-bridge-over-inline-setflag-calls) | Thin event-bridge over inline `setFlag` calls | Accepted |
| [ADR-003](decision-log.md#adr-003-hub-and-spoke-via-larusjson-warp-objects) | Hub-and-spoke connectivity via `larus.json` warp objects | Accepted |
| [ADR-004](decision-log.md#adr-004-staged-scope-stage-a-then-stage-b) | Staged scope (Stage A guaranteed, Stage B additive) | Accepted |
| [ADR-005](decision-log.md#adr-005-quest-modeled-as-an-fsm-over-quest_flag_map) | Quest modeled as an FSM over `QUEST_FLAG_MAP` | Accepted |
| [ADR-006](decision-log.md#adr-006-event-and-flag-names-centralized-in-srcconstseventsts) | Event/flag names centralized in `src/consts/Events.ts` | Accepted |

---

## Concrete Examples (Specification by Example)

**Example 1 — Talking to the Elder advances the quest log (event-bridge + FSM).**
*Given* a New Game with `INTRO_COMPLETE` set and `meet_elder` active,
*when* the player finishes the Elder dialog and `NPCManager` emits `setStoryFlag(MET_ELDER)`,
*then* the shared `StoryFlags` has `MET_ELDER`, `QuestManager` reports `meet_elder = complete` and `cave_artifact = active`, and an open `QuestLogScene` shows `[x] The Elder's Request`.

**Example 2 — Boss kill cascades a spell unlock and ends the chapter.**
*Given* the player is in `DungeonScene` fighting the Cave Guardian,
*when* the killing blow lands and `BattleManager` emits `setStoryFlag(CAVE_BOSS_DEFEATED)`,
*then* `StoryFlags.onFlagSet` (existing) also sets `SPELL_FLAME_WAVE_UNLOCKED` and emits `spellUnlocked`, `QuestManager` completes `cave_boss` and sets `ACT_1_COMPLETE`, and the "Chapter 1 Complete" overlay launches.

**Example 3 — Progress survives a biome hop and death (Registry + save round-trip).**
*Given* `MET_ELDER` and `CAVE_ARTIFACT_RETRIEVED` are set and the player warps `larus → DungeonScene`,
*when* save-on-warp runs and the player later dies and chooses "Load Checkpoint",
*then* `GameOverScene` reads `registry.get('saveManager')` (now set), `hasCheckpoint()` returns true, `loadCheckpoint()` restores flags **and** `rawAttributes` (STR/AGI/VIT/DEX/INT), and the QuestLog still shows both completed quests.

---

## File-Change Manifest (Implementation Build Sequence)

Ordered as the build sequence — **keystone first**, then the bridge/FSM, then connectivity, then framing. `[A]`=Stage A, `[B]`=Stage B.

| # | File | Action | Purpose (one line) | Stage |
|---|---|---|---|---|
| 1 | `src/consts/Events.ts` | **CREATE** | Event-name + (re-exported) flag/quest constants; kills magic strings (`lint:hardcoded`) | A |
| 2 | `src/consts/progression/QuestFlagMap.ts` | **CREATE** | Extract `QUEST_FLAG_MAP` + `QUEST_DEFINITIONS` out of `QuestLogScene` for shared use | A |
| 3 | `src/plugins/NeverquestSaveManager.ts` | **MODIFY** | `registry.set('saveManager', this)`; add `rawAttributes`+`bonus` to `createSaveData`; add `hasCheckpoint()`/`loadCheckpoint()`; read shared StoryFlags from Registry | A |
| 4 | `src/scenes/MainScene.ts` | **MODIFY** | `registry.set('storyFlags', saveManager.storyFlags)`; start opening quest on New Game; wire StoryFlagBridge + QuestManager | A |
| 5 | `src/plugins/NeverquestStoryFlagBridge.ts` | **CREATE** | The one `setStoryFlag` listener → writes shared StoryFlags → emits `flagWritten` | A |
| 6 | `src/plugins/NeverquestQuestManager.ts` | **CREATE** | Quest FSM (`not-started→active→complete`) over `QUEST_FLAG_MAP`; emits `questChanged` | A |
| 7 | `src/plugins/NeverquestNPCManager.ts` | **MODIFY** | Emit `setStoryFlag(MET_ELDER)` on Elder dialog-complete (UI-only overlap preserved) | A |
| 8 | `src/plugins/NeverquestBattleManager.ts` | **MODIFY** | Emit `setStoryFlag(CAVE_BOSS_DEFEATED)` + `chapterComplete` on Cave-Guardian boss kill | A |
| 9 | `src/scenes/DungeonScene.ts` | **MODIFY** | Emit `setStoryFlag(CAVE_ARTIFACT_RETRIEVED)` on artifact pickup; `registry.set('saveManager')` | A |
| 10 | `src/scenes/QuestLogScene.ts` | **MODIFY** | Consume Registry `storyFlags` (drop `new` at :241); import shared `QUEST_FLAG_MAP`; `refresh()` on `questChanged` | A |
| 11 | `src/scenes/JournalScene.ts` | **MODIFY** | Consume Registry `storyFlags` (drop `new` at :330) | A |
| 12 | `src/plugins/NeverquestWarp.ts` | **MODIFY** | Save-on-warp: `saveManager.saveGame(true)` before scene `start` | A |
| 13 | `src/scenes/ChapterCompleteScene.ts` | **CREATE** | "Chapter 1 Complete" victory overlay launched on `chapterComplete` | A |
| 14 | `src/scenes/HUDScene.ts` | **MODIFY** | Keybind/button to `scene.launch` QuestLog/Journal passing shared `storyFlags` | A |
| 15 | `src/index.ts` | **MODIFY** | Re-register `GameOverScene` + `TutorialScene` + `ChapterCompleteScene` in scene array | A |
| 16 | `src/assets/maps/larus/larus.json` | **MODIFY** | Add `IceCaverns` warp object (+ destination) cloned from id=88 | B |
| 17 | `src/scenes/IceCavernsScene.ts` | **MODIFY** | `previousScene` default `'CrossroadsScene'` → `'MainScene'` (`:79`); `registry.set('saveManager')` | B |

**Counts: CREATE = 6 · MODIFY = 11 · TOTAL = 17.** (Stage A: 15 files; Stage B: 2 files.)

---

## Test Strategy

New tests follow the existing `src/__tests__/plugins/*` patterns (`phaserMock`). Files like `NeverquestStoryFlags.test.ts`, `NeverquestSaveManager.test.ts`, `NeverquestWarp.test.ts`, `NeverquestNPCManager.test.ts`, `NeverquestBattleManager.test.ts` already exist — extend or sibling them.

**Unit:**
- **QuestManager FSM** (`NeverquestQuestManager.test.ts`, new) — no Phaser scene needed: seed flags → `evaluate()` → assert each quest's `not-started/active/complete`; assert `questChanged` emitted; assert `ACT_1_COMPLETE` derived when all Act-1 flags set.
- **StoryFlagBridge mapping** (`NeverquestStoryFlagBridge.test.ts`, new) — emit `setStoryFlag(X)` on a mock events bus → assert `registry.get('storyFlags').setFlag(X)` called and `flagWritten(X)` re-emitted; assert it never `new`s a StoryFlags.
- **Save round-trip incl. rawAttributes** (extend `NeverquestSaveManager.test.ts`) — `createSaveData()` includes `rawAttributes`+`bonus`; `applySaveData()` restores STR/AGI/VIT/DEX/INT; `hasCheckpoint()`/`loadCheckpoint()` delegate to `hasSaveData(true)`/`applySaveData(loadGame(true))`.
- **Registry keystone** (extend `NeverquestSaveManager.test.ts` / new MainScene test) — `create()` sets `registry['saveManager']`; QuestLog/Journal resolve the shared instance, not a throwaway.

**Integration (`src/__tests__/integration/`):**
- **One quest beat** — emit `setStoryFlag(MET_ELDER)` → bridge → FSM → `questChanged('meet_elder','complete')` end-to-end on a mock scene.
- **Boss → chapter complete** — emit `setStoryFlag(CAVE_BOSS_DEFEATED)` → assert spell cascade (existing) fires AND `chapterComplete` emitted.
- **Warp persistence** — assert `NeverquestWarp` calls `saveGame(true)` before `scene.start` (extend `NeverquestWarp.test.ts`).

**Gates (CLAUDE.md):** `npm test`, `tsc --noEmit`, `eslint`, `npm run lint:hardcoded`, webpack build — all must stay green. The bridge/FSM are deliberately off-scene so the suite runs without booting Phaser.

---

## Out of Scope

Explicit boundaries (carried from `solution-exploration.md` "Deferred Ideas" + cut line §C.4):

- **Acts 2 & 3** — `ENTERED_CROSSROADS` … `VOID_KING_CONFRONTED` flags, fragments, Dark Gate, Void King, 3 endings, and Act-2/3 quests. Defined in code; not wired.
- **CrossroadsScene as hub** — blocked on a missing `crossroads` map (net-new content).
- **Extra biomes** — Volcanic / SkyIslands / UnderwaterTemple as additional spokes (each untraced).
- **Equipment / equip→stat mechanism** — loot stays consume-only; `bonus.equipment` scaffolding remains unused.
- **`ExperienceCurve.ts` cleanup** and **baseHealth double-mutation** — deferred unless they actively corrupt Chapter-1 leveling math during the build.
- **Pause menu, dangling Joystick/Setting scene refs** — guard if they throw; otherwise defer.

These need separate specification before any future implementation; they are **not** prerequisites for a completable Chapter 1.

---

## Success Criteria (measurable)

1. **Completable loop** — a New Game can be played beat 1→5 to the "Chapter 1 Complete" overlay using only `larus` + `DungeonScene` (Stage A).
2. **Narrative reflects gameplay** — every Act-1 `StoryFlag` is written by a real gameplay event, and `QuestLogScene` shows the matching quest as complete within one frame of the event.
3. **Reward cascade reachable** — defeating the Cave Guardian unlocks Flame Wave (existing `onFlagSet` cascade) with no extra code.
4. **Progress survives transitions and death** — flags + `rawAttributes` survive a `larus→Dungeon` warp and a death→Load-Checkpoint cycle (no thrown errors from `GameOverScene`).
5. **Green build** — `npm test`, `tsc --noEmit`, `eslint`, `lint:hardcoded`, and webpack build all pass; no new magic strings.
6. **Stage B is additive** — wiring IceCaverns (warp + `previousScene` fix) does not regress the Stage A loop; the biome spawns enemies (`spawnFrostEnemies()` confirmed at `IceCavernsScene.ts:248`).
