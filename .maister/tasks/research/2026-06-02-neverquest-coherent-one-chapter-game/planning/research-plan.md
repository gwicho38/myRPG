# Research Plan: Neverquest — Coherent Playable One-Chapter Game

**Date:** 2026-06-02
**Research type:** Mixed (technical + requirements + design/literature)
**Brief:** `.maister/tasks/research/2026-06-02-neverquest-coherent-one-chapter-game/planning/research-brief.md`
**Repo root:** `/Volumes/mac_extended/repos/neverquest`

---

## 1. Research Overview

### Question
> "Continue building Neverquest into a coherent game with a one-chapter story — build out the open world and overall make it playable."

### Sub-questions and per-sub-question methodology

| # | Sub-question | Research type | Methodology |
|---|--------------|--------------|-------------|
| Q1 | What systems exist (scenes, story flags, quests, NPCs, world/map, progression, save) and how are they wired into the boot/game loop? Which are functional vs. orphaned/stubbed? | **Technical** | Codebase analysis with iterative deepening: enumerate → trace runtime wiring (instantiation + `scene.start`/`launch` graph) → classify reachable vs. orphaned, with `file:line` citations. |
| Q2 | What does a "coherent, playable, one-chapter" build minimally require (onboarding, narrative spine, connected open world, win/lose, progression, core loop)? | **Requirements** | Requirements synthesis: derive the minimum-coherent-ARPG checklist from the brief's success criteria, cross-referenced against the existing 3-act StoryFlag scaffold and 16-quest QuestLog already in the code. |
| Q3 | How should story/quest progression, open-world scene connectivity, and chapter start→end structure be architected to tie existing systems into one coherent playthrough, reusing what exists? | **Design / Literature** | Design synthesis grounded in (a) the existing `NeverquestStoryFlags`/`NeverquestWarp`/`NeverquestNPCManager` APIs and (b) established 2D action-RPG chapter/quest/world-gating patterns (literature). Output a reuse-first blueprint. |

### Boundaries
- **In:** inventory + wiring of existing systems; the real reachable scene graph; gap analysis; a scoped Chapter 1 definition using existing scenes/maps/assets; a design blueprint for story/quest/world wiring + save/checkpoint integration.
- **Out:** multiplayer, terminal edition, net-new biomes/art, crafting/economy/skill-trees (unless minimally required for coherence), deep perf work. (Per brief Excluded list.)

---

## 2. Methodology

### Primary approach
**Iterative-deepening codebase analysis + requirements/design synthesis, cross-referenced.**

The decisive analytical move is **reachability analysis**: build the actual runtime scene graph (who calls `scene.start`/`scene.launch` on whom) and overlay which scenes/plugins are registered in `src/index.ts`. A system can be "implemented" yet **orphaned** (registered but never navigated to) or **dead** (referenced as a target but not registered). The brief's success hinges on distinguishing *exists* from *wired and reachable*.

### Initial reachability evidence (from planner recon — gatherers must verify and extend)
This is a starting map, not the final answer. Gatherers must confirm each edge with `file:line` and find any edges the planner missed.

- **Active boot flow:** `PreloadScene` → `IntroScene` (`PreloadScene.ts:212`) → `MainMenuScene` (`IntroScene.ts:299`) → `MainScene` (`MainMenuScene.ts:303`). `MainMenuScene.loadGame()` can jump to `saveData.scene` (`MainMenuScene.ts:320`).
- **MainScene's only outbound `scene.start`** is `UpsideDownScene` (`MainScene.ts:364`) — **but `UpsideDownScene` is commented OUT of the scene list** (`index.ts:107`). Likely **dead warp** → must verify.
- **CrossroadsScene** (the "story hub" with NPCs + StoryFlags) is reached ONLY from `OverworldScene` (`OverworldScene.ts:227`) — **but `OverworldScene` is commented OUT** (`index.ts:41`). So the narrative hub appears **orphaned/unreachable** in the active build → must verify.
- **IceCavernsScene** is reached only from Crossroads (`CrossroadsScene.ts:537`); the other four biomes (`DungeonScene`, `VolcanicDungeonsScene`, `SkyIslandsScene`, `UnderwaterTempleScene`) have **no inbound `scene.start`** found → candidate **orphans**.
- **`NeverquestStoryFlags`** is instantiated only in `JournalScene.ts:330`, `QuestLogScene.ts:241`, `NeverquestSaveManager.ts:162` — **not in gameplay scenes**, so story flags may never advance during play → must verify whether biome/boss events set flags.
- **`QuestLogScene` / `JournalScene`** are registered but no scene calls `scene.launch('QuestLogScene')` / `'JournalScene'` → candidate **unreachable UI**.
- **Orphaned-but-present map assets:** `src/assets/maps/{overworld,town,cave,tutorial,larus}` exist, but the scenes that load `'overworld'`/`'town'`/etc. are commented out → reusable open-world content is disconnected.

### Fallback strategies
- If a scene's reachability is ambiguous from static `grep`, fall back to reading the scene's `create()`/transition handlers and any `NeverquestWarp` `goto`/scene-change property usage (`NeverquestWarp.ts:120+`).
- If runtime behavior can't be inferred statically (e.g., warp targets read from Tiled object properties), inspect the Tiled `.json` map's `warps`/`goto` object properties directly.
- If external ARPG-design sources are thin/unreliable, anchor Q3 on the existing in-code 3-act scaffold (it already encodes a defensible chapter structure) and treat literature as corroboration, not foundation.

### Analysis framework
- **Technical (Q1):** component identification → runtime-wiring trace → reachable/orphaned/dead classification → flow map.
- **Requirements (Q2):** minimum-coherence checklist → presence/absence against current state → prioritized gap list.
- **Design (Q3):** reuse inventory → connectivity model (hub-and-spoke vs. linear) → chapter beat → flag → quest → scene mapping → save/checkpoint integration → decision log.

---

## 3. Data Sources

(Full inventory with paths in `planning/sources.md`. Summary by type below.)

- **Codebase — game flow:** `src/index.ts` (scene list + boot order), `PreloadScene`, `IntroScene`, `MainMenuScene`, `MainScene`, `GameOverScene`, `src/scenes/watchers/SceneToggleWatcher.ts`.
- **Codebase — narrative:** `NeverquestStoryFlags.ts`, `NeverquestNPCManager.ts` (+ `CROSSROADS_NPCS`), `NeverquestDialogBox.ts`, `QuestLogScene.ts`, `JournalScene.ts`, `CrossroadsScene.ts`, `src/consts/DB_SEED/{Chats,DialogTemplate}.ts`.
- **Codebase — world/map:** `NeverquestMapCreator.ts`, `NeverquestWarp.ts`, `NeverquestDungeonGenerator.ts`, `NeverquestObjectMarker.ts`, biome scenes (`DungeonScene`, `IceCavernsScene`, `VolcanicDungeonsScene`, `SkyIslandsScene`, `UnderwaterTempleScene`), commented-out connectors (`OverworldScene`, `TownScene`, `CaveScene`, `TutorialScene`), `src/assets/maps/*`, `src/consts/TilesetGuide.ts`.
- **Codebase — progression/combat/save:** `NeverquestBattleManager.ts`, `NeverquestSaveManager.ts`, `src/consts/progression/ExperienceCurve.ts`, `src/consts/player/Player.ts`, `ExpManager`, `src/entities/{Player,Enemy}.ts`, `src/consts/enemies/*Boss*`.
- **Docs:** `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `CLAUDE.md`, `TODO.md`, `README.md`, `CHANGELOG.md`. (No `.maister/docs/INDEX.md` exists — none to read.)
- **Config:** `package.json` (Phaser `^3.90.0`, scripts), `tsconfig.json`, `webpack/`, `capacitor.config.ts`, `playwright.config.ts`.
- **External:** Phaser 3.90 scene-management docs (via context7 `mcp__plugin_context7`), and 2D action-RPG chapter/quest/world-gating design references (WebSearch/WebFetch).

---

## 4. Research Phases (sequencing — what to read first)

**Phase 1 — Reachability spine (do FIRST, highest leverage).**
Trace the active scene graph from `src/index.ts` outward. Confirm the broken edges listed in §2. Deliver a verified reachable/orphaned/dead classification for every registered scene. Everything else depends on this map.

**Phase 2 — Narrative-data wiring.**
Confirm whether `NeverquestStoryFlags` flags are actually set during gameplay (not just read by UI), whether quests advance, and whether `CROSSROADS_NPCS`/dialog drive flag changes. Map the 16 quests → `StoryFlag` → triggering scene/event.

**Phase 3 — World/open-world connectivity.**
Map each existing map asset to its scene, and each scene's warp/`goto` targets. Determine which biomes/maps can form a connected Chapter 1 world and where the connectivity is missing (e.g., no hub→biome→hub return loop in the active build).

**Phase 4 — Progression/combat/save coherence.**
Confirm XP/level curve, boss/defeat events, and that `NeverquestSaveManager` persists scene + flags + player state across the intended Chapter 1 path (checkpoints at transitions).

**Phase 5 — Requirements + design synthesis (after evidence is in).**
Produce the minimum-coherence checklist (Q2), then the reuse-first Chapter 1 definition and wiring blueprint (Q3), each tied back to Phase 1–4 evidence and to ARPG-design patterns.

**Phase 6 — Verification / cross-reference.**
Reconcile findings across gatherers; resolve contradictions; flag any claim lacking a `file:line` citation; confirm the proposed Chapter 1 path is end-to-end reachable using only existing (or trivially re-enabled) scenes/maps.

---

## 5. Gathering Strategy

### Instances: 6 (recommended)

Rationale for 6 (within the 4–8 band): the codebase splits cleanly into four cohesive technical concerns (flow, narrative, world, progression/save) that each warrant a dedicated deep trace, plus one requirements synthesis and one external/literature track. Fewer than 6 would force one gatherer to straddle unrelated subsystems (diluting the reachability trace that everything depends on); more than 6 would fragment the four technical concerns and create overlap. The four codebase gatherers can run fully in parallel (disjoint file sets); requirements and external have no codebase dependency and also run in parallel.

| # | Category ID | Focus (one line) | Tools | Output Prefix |
|---|-------------|------------------|-------|---------------|
| 1 | `codebase-game-flow` | Boot order + the real `scene.start`/`launch` reachability graph; classify reachable vs. orphaned vs. dead; win/lose flow. | Glob, Grep, Read | `analysis/findings/codebase-game-flow-*.md` |
| 2 | `codebase-narrative-systems` | StoryFlags (3-act enum), QuestLog (16 quests), NPCManager/`CROSSROADS_NPCS`, DialogBox, Journal, Crossroads — do flags actually advance in play? | Glob, Grep, Read | `analysis/findings/codebase-narrative-systems-*.md` |
| 3 | `codebase-world-map` | MapCreator, Warp (`goto`/scene-change props), DungeonGenerator, biome scenes, Tiled maps in `src/assets/maps/*`, tilesets; connectivity + orphaned maps. | Glob, Grep, Read | `analysis/findings/codebase-world-map-*.md` |
| 4 | `codebase-progression-combat` | XP/level curve, BattleManager, boss/defeat events, player state ownership, SaveManager checkpoint/scene persistence. | Glob, Grep, Read | `analysis/findings/codebase-progression-combat-*.md` |
| 5 | `requirements-coherence` | Minimum bar for a playable one-chapter ARPG: onboarding, core loop, narrative spine, connected world, win condition; gap list vs. current state. | Read, Grep | `analysis/findings/requirements-coherence-*.md` |
| 6 | `external-arpg-design` | Literature: chapter/quest structure, hub-and-spoke vs. linear open-world connectivity, narrative gating via flags in 2D action RPGs / Phaser scene management. | WebSearch, WebFetch, context7 | `analysis/findings/external-arpg-design-*.md` |

### Cross-cutting instructions for all gatherers
- Cite every factual claim with `file:line`. "Exists" ≠ "wired"; explicitly label each system **functional / orphaned / dead**.
- Reuse-first: when noting a gap, prefer "re-enable/connect existing X" over "build new Y" (per brief constraints).
- Gatherers 1–4 own disjoint file sets (no overlap). Gatherer 5 consumes the brief + current-state signals; gatherer 6 consumes no repo files.

### Orchestrator decision points
1. **Confirm 6 vs. 4 (default) instances.** If the orchestrator must use the 4-category default, collapse: merge gatherers 2+3 into a `codebase`/`world+narrative` track and 4 into it, keep `requirements` and `external`, and add `configuration`. The 6-way split is strongly preferred because the reachability trace (gatherer 1) is the linchpin and should not share a budget.
2. **External depth:** `external-arpg-design` is corroboration, not foundation (Q3 can stand on the in-code 3-act scaffold). If web sources are weak, down-scope gatherer 6 rather than block synthesis.
3. **No `.maister/docs/INDEX.md` exists** — there is no project-standards index to load; rely on `CLAUDE.md` + `docs/`.

---

## 6. Success Indicators (tied to brief success criteria)

| Brief criterion | Done when… |
|-----------------|-----------|
| **1. Current-state map** | Every registered scene + each narrative/world/progression/save plugin is classified functional/orphaned/dead with `file:line` evidence, and the verified reachable scene graph is drawn (incl. the broken Crossroads/Overworld/biome edges). |
| **2. Coherence gap list** | A prioritized list of concrete gaps (e.g., "narrative hub unreachable", "story flags never set in gameplay", "biomes have no entry point", "QuestLog/Journal not launchable", "no win condition reachable") each tied to evidence. |
| **3. Chapter 1 definition** | A scoped, reuse-first Chapter 1: start point, narrative beats mapped to existing `StoryFlag`s, a quest chain mapped to existing QuestLog entries, the specific existing biomes/maps used, and a reachable climax/end — buildable without net-new biomes/art. |
| **4. Design blueprint** | High-level wiring architecture (story→flag→quest→scene→warp→save) with a decision log, explicitly reusing existing plugin APIs, ready to feed `/maister:development`. |

---

## 7. Known Risks / Pitfalls

- **Orphaned scenes mistaken for "missing."** Many systems exist but are unreachable (Crossroads, biomes, QuestLog, Journal) or dead (Overworld/UpsideDown commented out). The plan must distinguish *re-connect existing* from *build new* — most of Chapter 1 is likely a wiring problem, not a content problem.
- **Static-only reachability blind spots.** Warps read targets from Tiled object properties (`goto`/scene-change) at runtime; `grep` for `scene.start('X')` will miss those. Gatherer 3 must inspect map `.json` warp properties, not just TS.
- **Story flags read but never written.** UI scenes read flags; if no gameplay scene *sets* them, quests can never complete. This is a top-suspected coherence break — verify before designing on top of it.
- **Scope creep into ROADMAP v0.4+.** ROADMAP is aspirational (multiplayer, crafting, many biomes). Hold Chapter 1 to the brief's minimum-coherence bar; exclude crafting/economy/skill-trees unless strictly required.
- **`NeverquestBattleManager.ts.backup` and `fix_plan.md`/`HORIZONTAL_BARS_FIX_INSTRUCTIONS.md` noise.** Treat `.backup` and ad-hoc fix docs as non-authoritative; cite only live source.
- **Two physical repo paths** (`/Volumes/mac_extended/repos/neverquest` and `/Users/home/repos/neverquest`). If both are the same checkout, concurrent-agent commit-commingling risk applies (see `CLAUDE.md`); analysis is read-only so low risk, but downstream `/maister:development` should use a worktree.

---

## 8. Expected Outputs (downstream)

- Research report: current-state map + coherence gap list (criteria 1–2).
- Chapter 1 definition: scoped narrative/world/quest plan reusing existing assets (criterion 3).
- Design blueprint with decision log for story/quest/world/save wiring, ready for `/maister:development` (criterion 4).
