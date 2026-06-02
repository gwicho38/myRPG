# Requirements: Coherent Playable One-Chapter ARPG — Checklist & Gap Map

**Gatherer:** #5 `requirements-coherence`
**Date:** 2026-06-02
**Question:** What does it TAKE for Neverquest to be a coherent, playable, one-chapter game?

This is a **requirements-definition** deliverable. It (a) derives the minimum checklist a
player-facing one-chapter ARPG must satisfy, and (b) gives a first-pass status guess for each
requirement against Neverquest's apparent current state (from the brief + docs + light grep
confirmation). Deep wiring traces are owned by gatherers 1–4; status guesses here are flagged
`[VERIFY w/ G#]` where a deeper trace should confirm.

**Status legend:** Present (works end-to-end) · Partial (exists but not wired / incomplete) · Missing (absent).
**Priority legend:** **P0** = must-have for the build to read as "a coherent one-chapter game"
(without it, the chapter cannot be completed or the player is lost); **P1** = should-have
(coherent but rough without it); **P2** = nice-to-have polish.

---

## 0. Definition: what "one chapter" means in scope terms

A defensible Chapter-1 scope target for a 2D ARPG, sized to be shippable by reconnecting
existing assets (not building new biomes):

| Dimension | Chapter-1 target | Rationale |
|-----------|------------------|-----------|
| Playtime | ~20–45 min for a first-time player | Long enough to feel like a chapter, short enough to finish in 1–2 sessions. |
| Areas | 1 hub + 2–3 connected combat areas | Enough traversal to feel like a world; few enough to wire + test. The code already scaffolds a hub (`CrossroadsScene`) + 5 biomes. |
| Quests | 1 main quest chain of 3–5 steps (+0–2 optional side) | Matches the existing 3-act `StoryFlag` scaffold; QuestLog already defines 16 quests across 3 acts (over-scoped — trim to Act 1). |
| Bosses | 1 chapter climax boss | A single defeat-to-win gate is the minimum stakes. Boss configs exist (`fireDragon`, `leviathan`, etc.). |
| Ending | An explicit "Chapter 1 complete" resolution screen | Gives the player a defined victory state and a stopping point. |

> Anchor: the in-code `enum StoryFlag` already encodes a 3-act structure (Awakening /
> Journey-Crossroads / Reckoning) per the brief — Chapter 1 = **Act 1 (Awakening)** plus the
> first step into the Crossroads hub. Reuse it; do not invent a new structure.

---

## 1. Onboarding / first 10 minutes

What must exist so a brand-new player goes title → playing-with-purpose without confusion.

| # | Requirement | Priority | Status | Rationale / evidence |
|---|-------------|----------|--------|----------------------|
| 1.1 | Title screen with New Game / Continue | **P0** | Present | `MainMenuScene` renders New Game + "Load Game" (Continue) with a `hasSaveData()` gate (`MainMenuScene.ts:152,155,161`). |
| 1.2 | New Game lands the player in a real playable scene | **P0** | Partial | New Game → `MainScene` (`MainMenuScene.ts:303`). MainScene runs, but its narrative/quest framing is absent (see §3). Player spawns with no stated goal. |
| 1.3 | Intro / context (who am I, what's the stakes) | **P0** | Partial | `IntroScene` exists and runs in boot flow (→ `MainMenuScene`), but it is engine intro, not story setup. The 3-act lore lives in `StoryFlags`/`JournalScene` but is not surfaced at start. `[VERIFY w/ G2]` |
| 1.4 | Controls tutorial (move / attack / interact / open menu) | **P0** | Missing | `TutorialScene.ts` exists but is **commented out** of the scene list (`index.ts:52,119`) → unreachable. No in-game control teaching in the active flow. |
| 1.5 | A clear first goal / objective prompt | **P0** | Missing | No quest is started or surfaced on New Game; no `completeQuest`/`startQuest` wiring found (see §3.3). Player has no "go here / do this." |
| 1.6 | Pause/menu discoverable from minute one | **P1** | Partial | HUD launches (`MainScene.ts:124`) with inventory/attributes shortcuts, but no explicit pause overlay (see §7.4). |

**Onboarding verdict:** the *entry* (title → MainScene) works, but the player arrives with **no
tutorial and no first goal** — the two things that make the first 10 minutes coherent. Both are
P0 and currently missing-in-flow despite assets (`TutorialScene`) existing.

---

## 2. Core gameplay loop (the repeatable verb loop + feedback)

The moment-to-moment "move → fight → loot → progress → repeat" with readable feedback.

| # | Requirement | Priority | Status | Rationale / evidence |
|---|-------------|----------|--------|----------------------|
| 2.1 | Move (responsive locomotion) | **P0** | Present | `NeverquestMovement` owns `isSwimming/isRunning`/speed (per repo CLAUDE.md state table). |
| 2.2 | Fight (attack/block, enemies, damage) | **P0** | Present | `NeverquestBattleManager` (774 lines) handles combat flow, damage, defeat events (`BattleManager.ts:360–366`). |
| 2.3 | Loot / pickups + inventory | **P1** | Present | `InventoryScene` registered + HUD inventory shortcut (`HUDScene.ts:361`). Item defs exist (recent commit "add missing item definitions"). |
| 2.4 | Progress (XP / level-up) | **P0** | Present | `ExpManager` + `ExperienceCurve` exist; battle grants exp (`ENEMY_DEFEATED_WITH_EXP`, `BattleManager.ts:366`). `[VERIFY w/ G4 that level-up applies]` |
| 2.5 | Combat feedback (hit reaction, damage numbers, defeat msg) | **P1** | Present | `HUDScene.log` emits `ENEMY_DEFEATED`/`PLAYER_DEFEATED` messages; `NeverquestEntityTextDisplay` + PhaserJuice in dependency graph. |
| 2.6 | Loop is anchored to a goal (not aimless grinding) | **P0** | Missing | The verbs work, but nothing ties "fight/loot" to advancing a quest or unlocking the next area (see §3, §4). The loop spins without forward narrative pull. |

**Core-loop verdict:** the **verbs are present and functional**; what's missing (P0) is the
*purpose wrapper* — kills/loot don't feed a progression spine, so the loop is a tech demo of
combat rather than a chapter.

---

## 3. Narrative spine (one-chapter arc + quest tracking)

Inciting incident → 2–4 beats → climax/boss → resolution that ends the chapter, with a quest log.

| # | Requirement | Priority | Status | Rationale / evidence |
|---|-------------|----------|--------|----------------------|
| 3.1 | A story structure / act scaffold | **P0** | Partial | `enum StoryFlag` encodes a full 3-act structure incl. endings (`NeverquestStoryFlags.ts:28–86`). Strong scaffold — but only a scaffold. |
| 3.2 | Story flags actually **written** during gameplay | **P0** | Missing | Only emitter of progress is `NeverquestAbilityManager.ts:188` (`emit('setStoryFlag', …)` on ability unlock) — and **no scene/plugin listens for `'setStoryFlag'`** (grep found 0 listeners). Flags are read by UI (`Journal`, `QuestLog`) but effectively never advance in play. **Top coherence break.** |
| 3.3 | Quest system that starts / advances / completes quests | **P0** | Missing | `QUEST_DEFINITIONS` (16 quests) + `QUEST_FLAG_MAP` exist (`QuestLogScene.ts:47,170`), but no `startQuest`/`advanceQuest`/`completeQuest` logic found anywhere (grep = 0 hits). QuestLog is a **static display**, not a live tracker. |
| 3.4 | Quest log reachable in-game | **P0** | Missing | No scene calls `launch('QuestLogScene')` / `'JournalScene'` (grep = 0). Both registered but **unreachable UI**. Player can't see objectives. |
| 3.5 | Inciting incident at chapter start | **P0** | Missing | No opening story beat triggered on New Game (ties to §1.3/§1.5). |
| 3.6 | 2–4 mid-chapter beats tied to areas/quests | **P1** | Missing | Beats are *defined* in flags/quests but not *triggered* by gameplay events (depends on §3.2/§3.3). |
| 3.7 | A chapter climax / boss gate | **P0** | Partial | Boss configs exist (`BossEncounterTemplate`, `fireDragon`, `leviathan`); BattleManager handles defeat. But **boss-defeat → StoryFlag → chapter-end is not wired** `[VERIFY w/ G4]`. |
| 3.8 | A resolution that explicitly ends the chapter | **P0** | Missing | No "Chapter 1 complete" / ending screen in the main game. The only victory screen is in `SurvivalModeScene` (`:868 showVictory()`), which is a separate mode, not the story. |

**Narrative verdict:** **the most under-wired pillar.** The *content and structure exist*
(3-act flags, 16 quests, boss configs, lore in Journal) but the **connective tissue is absent**:
flags aren't set, quests don't progress, the quest log can't be opened, and there is no
chapter-end. This is overwhelmingly a **wiring problem, not a content problem** — which matches
the brief's reuse-first thesis.

---

## 4. World coherence (connected, purposeful traversal)

A hub + connected areas, gated by story, with return loops and no orphaned/dead areas.

| # | Requirement | Priority | Status | Rationale / evidence |
|---|-------------|----------|--------|----------------------|
| 4.1 | A hub the player returns to | **P0** | Partial | `CrossroadsScene` is built as the story hub (NPCs + `CROSSROADS_NPCS`, SaveManager). But it's reached only from `OverworldScene`, which is **commented out** (`index.ts:41`) → hub is **orphaned/unreachable** in the active build. `[VERIFY w/ G1/G3]` |
| 4.2 | 2–3 combat areas reachable from the hub | **P0** | Partial | 5 biome scenes are registered (`Dungeon, IceCaverns, Volcanic, SkyIslands, UnderwaterTemple`), but only `IceCaverns` has a known inbound edge (from Crossroads `:537`). The rest appear to have **no entry point** → orphans. `[VERIFY w/ G3]` |
| 4.3 | Hub→area→hub **return** loops (no dead ends) | **P0** | Missing/Partial | Biomes lack confirmed return-to-hub warps in the active flow; warp targets live in Tiled map JSON (`NeverquestWarp` reads `goto`). Likely missing return loops. `[VERIFY w/ G3 via map JSON]` |
| 4.4 | Area unlocks/gating tied to story progress | **P1** | Missing | Depends on story flags being set (§3.2). With flags unwired, gating can't function. |
| 4.5 | The intended chapter path is end-to-end reachable | **P0** | Missing | Given §4.1 (hub orphaned) + §4.2 (biomes orphaned), there is **no confirmed reachable hub→biome→boss→end path** in the active build. This is the central coherence failure for "playable." |
| 4.6 | No registered-but-dead scene-start targets | **P1** | Partial | `MainScene`'s only outbound `scene.start` is `UpsideDownScene`, which is **commented out** (`index.ts:107`) → dead warp. Also death→`GameOverScene` is a dead reference (see §5.2). |

**World verdict:** the **content (hub + 5 biomes + maps) exists but is disconnected.** Most of
"build out the open world / make it playable" is **re-enabling and connecting existing scenes +
authoring warp targets**, not creating new areas. The hub being unreachable is a P0 blocker.

---

## 5. Win / lose + stakes

| # | Requirement | Priority | Status | Rationale / evidence |
|---|-------------|----------|--------|----------------------|
| 5.1 | Player can die (lose state) | **P0** | Present | `BattleManager.handlePlayerDeath()` triggers on HP depletion (`BattleManager.ts:360–362,732`). |
| 5.2 | Game-over screen + restart/continue path | **P0** | Missing (broken) | `handlePlayerDeath` calls `scene.launch('GameOverScene')` (`BattleManager.ts:766`), but **`GameOverScene` is commented OUT of the scene list** (`index.ts:132`) → launching an unregistered scene at runtime. Death handling is a **dead reference**. `GameOverScene.ts` file exists; just needs re-registering. |
| 5.3 | A defined chapter-complete victory state | **P0** | Missing | No chapter-end/victory in the main story (only `SurvivalModeScene` has its own `showVictory`). Without this there is no "win," so the chapter has no end (ties to §3.8). |
| 5.4 | Stakes legible to the player (why fighting matters) | **P1** | Missing | Follows from narrative wiring (§3) being absent. |

**Win/lose verdict:** lose is implemented but **its screen is unreachable (P0 bug)**; win
(chapter complete) **does not exist for the main game (P0 gap)**. A chapter with no defined end
and a broken death screen cannot read as a coherent game.

---

## 6. Persistence (save / continue across sessions)

| # | Requirement | Priority | Status | Rationale / evidence |
|---|-------------|----------|--------|----------------------|
| 6.1 | Save game state (scene + player + flags) | **P0** | Present | `NeverquestSaveManager` persists scene + flags + player; auto-checkpoint timer (`SaveManager.ts:120–130,163,205+`). Instantiated by most gameplay scenes. |
| 6.2 | Continue resumes the saved scene | **P0** | Present | `MainMenuScene.loadGame()` jumps to `saveData.scene` (`MainMenuScene.ts:308–326`), gated by `hasSaveData()`. |
| 6.3 | Checkpoints at meaningful transitions | **P1** | Partial | Auto-checkpoint is time-based (30s interval, flagged "for testing"), not transition-based. Works, but granularity is crude for a chapter. `[VERIFY w/ G4]` |
| 6.4 | Saved story progress actually reflects play | **P0** | Partial | Save persists `storyFlags`, but since flags barely advance in play (§3.2), what's saved is near-empty progress. Fixing §3.2 makes this meaningful. |

**Persistence verdict:** the **save/continue plumbing is the most complete pillar** — present and
wired. Its value is currently undermined only because there's little story progress to persist
(§3.2). Once narrative is wired, persistence largely works as-is.

---

## 7. Moment-to-moment polish floor (feels like a game, not a tech demo)

| # | Requirement | Priority | Status | Rationale / evidence |
|---|-------------|----------|--------|----------------------|
| 7.1 | HUD (health, etc.) during gameplay | **P0** | Present | `MainScene` launches `HUDScene` with player+map (`MainScene.ts:124`); `NeverquestHealthBar` in dependency graph. |
| 7.2 | Audio: music + SFX cues | **P1** | Present | BGM in menu (`forest`) and gameplay (`path_to_lake_land`); SFX (`start_game`, portal, electric) (`MainScene.ts:132–346`, `MainMenuScene.ts:130–317`). |
| 7.3 | UI screens reachable (inventory, attributes) | **P1** | Present | HUD shortcuts launch `InventoryScene`/`AttributeScene` (`HUDScene.ts:349–361`). |
| 7.4 | Pause / in-game menu | **P1** | Missing | No explicit pause overlay or `scene.pause` toggle found in `MainScene`/`HUDScene`. A chapter played across sessions wants a pause. |
| 7.5 | Transition feedback (loading/area transitions) | **P2** | Partial | Portal sound + scene swaps exist; no confirmed transition/loading screen. |
| 7.6 | Consistent input affordances (control hints) | **P2** | Partial | HUD shows icon shortcuts; no first-run control hints (ties to §1.4). |

**Polish verdict:** the **polish floor is largely met** (HUD, audio, UI screens). The notable
gap is **pause/menu (P1)**. This pillar is the *least* of the concerns.

---

## 8. Cut line — explicitly OUT of scope for ONE chapter

Defer to later releases (ROADMAP v0.4–0.6+). Pulling any of these in is **scope creep** that
will block shipping a coherent Chapter 1.

| Out-of-scope item | Where it belongs | Why cut now |
|-------------------|------------------|-------------|
| Extra biomes beyond the 2–3 Chapter-1 needs | v0.4 "World Building" | 5 biomes already scaffolded; Chapter 1 only needs to *connect* 2–3, not add more. |
| Crafting system | v0.5 "Polish & Systems" | Not required for a coherent combat+story loop. |
| Economy / gold / merchants | v0.5 | Loot+XP progression is sufficient for one chapter. |
| Skill trees / talent system | v0.5 | XP/level + abilities already provide progression. |
| Character/class selection | v0.5 | One default playable character is fine for Chapter 1. |
| Survival / horde mode | v0.3 (separate mode, already exists) | It's a side mode with its own victory; keep it out of the story spine (don't conflate its `showVictory` with chapter-end). |
| Multiplayer / co-op | v0.6+ | Explicitly excluded by the brief. |
| Pathfinding AI, dynamic lighting, advanced VFX | v0.3 atmosphere | Nice atmosphere, not coherence-critical. Current combat works without them. |
| Terminal / ASCII edition | n/a (out per brief) | Web build is the playable target. |
| Day/night cycle, weather | v0.3/0.4 | Pure polish. |

---

## P0 must-have summary (the coherence-critical set)

Ordered roughly by leverage (fix these and the chapter becomes completable):

| P0 requirement | Status | One-line fix direction (reuse-first) |
|----------------|--------|--------------------------------------|
| §3.2 Story flags set during gameplay | **Missing** | Add a `'setStoryFlag'` listener (none exists) + emit on key gameplay events (area enter, boss kill). |
| §3.3 Quest start/advance/complete logic | **Missing** | Add `startQuest/advanceQuest/completeQuest` driving `QUEST_FLAG_MAP`; QuestLog already has the data. |
| §3.4 Quest log reachable | **Missing** | Add a HUD/key binding to `launch('QuestLogScene')` (scene already registered). |
| §4.1 Hub reachable | **Partial/orphaned** | Re-enable a path into `CrossroadsScene` (currently only via commented-out `OverworldScene`). |
| §4.2 Biomes reachable from hub | **Partial/orphaned** | Author warp `goto` targets so 2–3 biomes connect to the hub (only IceCaverns connected today). |
| §4.5 End-to-end chapter path reachable | **Missing** | Compose hub→biome(s)→boss→end into one verified traversable graph. |
| §1.4 Controls tutorial in flow | **Missing** | Re-register `TutorialScene` (commented out) and route New Game through it once. |
| §1.5 A stated first goal | **Missing** | Start the Act-1 opening quest on New Game and surface it. |
| §5.2 Game-over screen works | **Missing (broken ref)** | Re-register `GameOverScene` (commented out) — `handlePlayerDeath` already targets it. |
| §5.3 Chapter-complete victory state | **Missing** | Add a "Chapter 1 complete" resolution triggered by the climax boss flag. |
| §3.7 Boss → chapter-end wiring | **Partial** | Wire boss-defeat → StoryFlag → §5.3 ending. |

**P0 pillars that are already OK:** §1.1 title menu, §2.1–2.5 core combat loop verbs+feedback,
§2.4 XP, §5.1 player death trigger, §6.1–6.2 save/continue, §7.1 HUD.

---

## Cross-cutting conclusion

Against the minimum-coherence bar, Neverquest's profile is lopsided in a way that is *good news*
for the brief's reuse-first goal:

- **Strong / present:** the *engine-level* pillars — combat loop, movement, HUD, audio, XP,
  and (notably) **save/continue** — are functional.
- **The coherence gap is almost entirely in the connective/narrative layer:** story flags are
  read but **never written** (no `setStoryFlag` listener), quests have data but **no
  progression logic**, the **quest log and the story hub are unreachable**, biomes are
  **orphaned**, there is **no chapter-end**, and the **game-over screen is a dead reference**.
- Therefore "make it a coherent one-chapter game" is predominantly a **wiring + re-enabling
  exercise** (connect orphaned scenes, add flag/quest progression, add chapter start+end,
  re-register Tutorial/GameOver) on top of largely-complete systems — **not** a content or
  art build. This is consistent with, and corroborates, the planner's reachability thesis.

`[VERIFY]` tags mark where gatherers 1 (flow), 3 (world/maps), and 4 (progression/save) should
confirm the exact wiring; nothing in this requirements pass contradicts the planner recon, and
the light grep checks above reinforce every Missing/Partial P0 above.
