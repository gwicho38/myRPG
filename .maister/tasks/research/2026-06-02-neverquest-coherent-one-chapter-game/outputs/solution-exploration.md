# Solution Exploration: Neverquest — Coherent Playable One-Chapter Game

**Date:** 2026-06-02
**Author:** solution-brainstormer agent
**Inputs:** `outputs/research-report.md`, `analysis/synthesis.md` (+ direct working-tree re-verification on branch `test/logger-interfacecontroller-coverage`)
**Research type:** mixed | **Research confidence:** HIGH
**Downstream constraint:** This feeds an **autonomous overnight implementation build**. Bias toward **reuse-first, low-risk, testable** alternatives that **keep the build green** (Phaser 3 + TS, Jest). Follow repo CLAUDE.md: overlap callbacks = UI only; each system owns its flags; constants in `src/consts`; no hardcoded strings.

---

## Problem Reframing

### Research Question
> "Continue building Neverquest into a coherent game with a one-chapter story — build out the open world and overall make it playable."

### Core finding (the reframe that drives every alternative below)
Neverquest is a **WIRING problem, not a content problem.** The engine pillars work (boot, combat, XP/leveling, drops, in-scene save, HUD). A complete authored 3-act "Lucius" arc (31-flag enum, 16 quests, 21 lore, 5 hub dialogs, spell-unlock cascades) already exists in code but is **severed from gameplay at exactly one seam per layer**: *no gameplay code ever writes a story flag.* The reward half of the narrative loop is built; the trigger half is missing. **A small number of flag-write triggers therefore have very high leverage** — they cascade already-built quest/lore/spell behavior to life.

Re-verified directly this session:
- Every `setFlag` call is internal to `NeverquestStoryFlags.ts`; the lone `setStoryFlag` emit (`NeverquestAbilityManager.ts:188`) has **0 listeners**.
- **Three** separate `new NeverquestStoryFlags()` instances exist (`JournalScene:330`, `QuestLogScene:241`, `SaveManager:162`) — per-scene throwaways, not a shared instance. *This is the keystone defect.*
- `registry.get('saveManager')` is read in `GameOverScene:226` but `registry.set('saveManager')` is **never called** → death-checkpoint load is dead.
- `createSaveData` (`SaveManager:248–277`) serializes `attributes` + `scene` + `story` but **omits `rawAttributes` and `bonus`**.
- `larus.json` (`src/assets/maps/larus/larus.json`) carries the working `goto:DungeonScene` warp. `GameOverScene`/`TutorialScene`/`OverworldScene` are commented out of the `index.ts` scene array; **`IceCavernsScene` and `CrossroadsScene` are already registered** (imported + in the array) — IceCaverns merely lacks an inbound warp.

### How Might We questions (generated from findings — used to structure exploration, not user-validated)
- **HMW-1** scope a Chapter 1 that is *coherently completable end-to-end tonight* using only existing maps?
- **HMW-2** make gameplay events *write* story flags so the already-built quest/lore/spell systems light up, as an auditable FSM?
- **HMW-3** connect the orphaned biomes into a navigable "open world" with the least new content?
- **HMW-4** make progress (flags + stats + position) survive biome transitions and death?
- **HMW-5** draw a crisp fix-vs-defer line through the 11 P0 gaps so the overnight build ships a whole chapter instead of half of everything?

---

## Decision Area 1 — Chapter 1 Scope

**HMW-1.** How much of the world does Chapter 1 traverse?

### Alt 1A — Minimal vertical slice: `larus` hub + DungeonScene only
**Description.** Ship the *entire narrative loop* (awaken → Elder → clear Dungeon for artifact → Cave Guardian boss → "Chapter 1 Complete") using only the two maps that already form the working `MainScene ⇄ DungeonScene` loop. No biome warps added at all.
**Strengths.** Lowest possible risk — touches zero unproven scene wiring; the loop already runs (report §A.1 green path). Every minute of build time goes to the high-leverage narrative wiring (Decision Area 2). Trivially testable. Cannot regress the green path.
**Weaknesses.** Barely an "open world" — one hub, one spoke. Under-delivers on the explicit "build out the open world" half of the question. ~12–18 min playtime; thin.
**Best when.** Build time is very tight, or the narrative-wiring work (DA-2) proves harder than expected and you need a guaranteed-shippable fallback.
**Evidence.** Report §A.1 (green path is the entire playable game today); §C.1 (larus is the one fully-working map); synthesis §3.4 (reuse larus as hub = lowest scope).

### Alt 1B — Recommended: `larus` hub + Dungeon + 1 already-registered biome (IceCaverns) [+ optional 2nd elemental]
**Description.** The §C "The Awakening" design: larus = hub, DungeonScene = mandatory climax spoke, **IceCavernsScene = second spoke** added via one larus warp object + a `previousScene→MainScene` fix. Optionally wire one more elemental biome (Volcanic) if the IceCaverns spawn trace (OQ1/U4) passes quickly and build time remains.
**Strengths.** Delivers a genuine hub-and-spoke "open world" feel with **zero new maps**. IceCaverns is the cheapest possible 2nd spoke — re-verified: it is *already imported and in the `index.ts` array* (line 109); only an inbound warp + `previousScene` default are missing. Hits ~20–35 min target. Matches both the code's half-done shape and the literature's hub-and-spoke prescription.
**Weaknesses.** Carries one verification dependency: IceCaverns enemy-spawn wiring is not fully traced (U4) — only MainScene + Crossroads are confirmed to use the zone-spawn system. If IceCaverns spawns no enemies, the spoke is an empty room.
**Best when.** The default. Build can afford a single biome-spawn trace before committing, and wants the "open world" claim to be real without new art.
**Evidence.** Report §C.1–C.2; §B P0-5; synthesis §4 (F→G→H connectivity sub-chain); re-verified `index.ts:109` IceCaverns already registered; OQ1/U4 (spawn-trace caveat).

### Alt 1C — Fuller: re-enable OverworldScene + CrossroadsScene authored hub with all 5 biomes
**Description.** Finish the abandoned hub-and-spoke refactor: uncomment `OverworldScene`, route it into `CrossroadsScene` as the authored hub, and wire all five elemental biomes as spokes.
**Strengths.** Maximal "open world"; uses the *intended* hub the original author designed; most content-rich playthrough if it worked.
**Weaknesses.** **Blocked on a missing asset** — `CrossroadsScene` loads a `crossroads` map that does not exist on disk and is not in GameAssets (report §A.2, re-verified). Authoring that map is net-new content work, explicitly out of scope and the #1 scope-creep risk (OQ6). Five untraced biome-spawn paths multiply U4 risk fivefold. High chance of a red build overnight.
**Best when.** A later chapter (Ch.2+) with real schedule and an authored Crossroads map — **not** an overnight reuse-first build.
**Evidence.** Report §A.2 (Crossroads broken: missing map); §C.4 cut line; synthesis §3.4 ("rather than finish the Crossroads refactor — blocked on a missing map — reuse larus"); OQ6 (scope creep = #1 indie killer).

### ✅ Recommendation — DA1: **Alt 1B** (larus + Dungeon + IceCaverns), with **1A as the guaranteed fallback** if the IceCaverns spawn trace fails.
*Rationale: real open-world feel with zero new maps and the cheapest possible 2nd spoke (already-registered), while 1A stays in reserve to protect a green overnight build.*

---

## Decision Area 2 — Narrative Wiring Architecture (the keystone)

**HMW-2.** How do gameplay events write story flags, and how do quests advance as an FSM?

### Alt 2A — Thin event-bridge + QuestManager FSM (reuse the existing unused `setStoryFlag` event)
**Description.** Add one listener for the **already-emitted-but-unheard** `setStoryFlag` event, and emit that same event from gameplay trigger sites (intro-end, NPC-talk-complete, boss-kill, area-enter, artifact-pickup). The listener writes to a **single shared** `NeverquestStoryFlags` instance. A small `QuestManager` FSM (`not-started→active→complete`) maps flags to quest state via a `QUEST_FLAG_MAP` constant.
**Strengths.** Maximum reuse — `NeverquestAbilityManager.ts:188` *already emits* `setStoryFlag`; this alt just gives it a listener and more emitters. Event-driven, which the repo CLAUDE.md explicitly prefers. Decouples trigger sites from flag storage (trigger sites only `emit`, never touch StoryFlags directly) → keeps overlap-callback/state-ownership rules intact. The FSM is unit-testable in isolation (emit event → assert flag set → assert quest advanced) without running Phaser scenes.
**Weaknesses.** Two moving parts (bridge + FSM) to introduce. Event-name/flag-name must be centralized in constants to avoid the exact "magic string" smell CLAUDE.md forbids.
**Best when.** You want testable, decoupled wiring that honors the repo's event-driven + state-ownership doctrine. (This is the overnight-friendly choice.)
**Evidence.** Report §D.1; §B P0-1/P0-2; synthesis §4 (A→B→C critical path) & §3.2 (reward-built/trigger-missing asymmetry); re-verified `setStoryFlag` emit at `AbilityManager:188` with 0 listeners.

### Alt 2B — Embed `setFlag` calls directly at each trigger site
**Description.** Call `storyFlags.setFlag(...)` inline at each gameplay trigger (in BattleManager, NPCManager, scene `init`, pickup handler).
**Strengths.** Fewest indirections; trivially obvious control flow; no new event plumbing.
**Weaknesses.** Couples every gameplay system to the StoryFlags object and forces each to hold a reference to the *one shared* instance — fragile given the per-scene-throwaway problem. Violates the repo's "each system owns its own flags / event-driven" guidance by scattering narrative writes across combat/movement code. Hard to unit-test without standing up each subsystem. Scatters narrative logic, making the FSM hard to reason about.
**Best when.** A throwaway prototype where wiring speed beats maintainability — not this build.
**Evidence.** Report §D.1 (prefers the bridge); CLAUDE.md state-ownership + event-driven rules; synthesis §4 (keystone is a *single shared* instance, which inline calls make harder to guarantee).

### Alt 2C — Centralized `GameProgressManager` owning flags + quests + save in the Registry
**Description.** One new manager in the Phaser Registry that owns the shared StoryFlags, the quest FSM, *and* save orchestration; gameplay systems call into it.
**Strengths.** Single source of truth; naturally solves the shared-instance keystone *and* the cross-scene persistence problem in one object; clean public API.
**Weaknesses.** Largest net-new surface of the three; risks re-implementing/duplicating the existing `NeverquestSaveManager` (which already serializes flags via `toJSON`/`fromJSON`) rather than reusing it. More to get right in one overnight pass; bigger blast radius if buggy. Tempting scope magnet.
**Best when.** A deliberate refactor sprint where consolidating SaveManager + StoryFlags + quests is the goal — over-built for shipping Chapter 1 tonight.
**Evidence.** Report §D.1/§D.3 (SaveManager already owns a StoryFlags instance at `:162` and serializes it — reuse, don't replace); synthesis §1 C9 (SaveManager is the most complete pillar).

### ✅ Recommendation — DA2: **Alt 2A** (thin event-bridge + QuestManager FSM), with the **shared StoryFlags instance promoted to the Registry** (see DA-4).
*Rationale: reuses the already-emitted `setStoryFlag` event, honors the repo's event-driven + state-ownership rules, and yields an FSM that is unit-testable without booting scenes — ideal for a green overnight build.*

---

## Decision Area 3 — World Connectivity Model

**HMW-3.** How are biomes reached from the hub?

### Alt 3A — Pure hub-and-spoke via larus warp objects
**Description.** Add `warps` objects to `larus.json` (`{goto:"DungeonScene"|"IceCavernsScene", scene:true}`) pointing at existing scenes; fix each biome's `previousScene` default to `MainScene`. larus is the sole hub.
**Strengths.** Reuses the **proven** warp toolchain — the working `larus→Dungeon` warp (id=88) is the exact pattern (`NeverquestWarp.ts:199` → `scene.start(sceneKey,{previousScene})`). Pure data edit (map JSON object layer) + one default fix; no new scene logic. The literature explicitly recommends hub-and-spoke for a solo one-chapter build. Lowest connectivity risk.
**Weaknesses.** Editing Tiled JSON by hand is finicky (object coordinates, GIDs, property schema) — must mirror the existing id=88 warp's exact property shape. "Open world" is centralized rather than continuous.
**Best when.** The default for an overnight build — proven pattern, data-only change, matches both code and literature.
**Evidence.** Report §D.2; §B P0-4/P0-5; re-verified `larus/larus.json` holds the `DungeonScene` warp and `NeverquestWarp.ts:199` start pattern; synthesis §6 (G6 prescribes hub-and-spoke).

### Alt 3B — Re-enable OverworldScene/CrossroadsScene authored hub
**Description.** Make Crossroads the connectivity hub (ties to DA 1C).
**Strengths.** Author-intended topology; richer if the map existed.
**Weaknesses.** Same blocker as 1C — the `crossroads` map does not exist on disk. Net-new content; high red-build risk.
**Best when.** Ch.2+, after authoring the map. Not tonight.
**Evidence.** Report §A.2 (missing crossroads map); synthesis §3.4.

### Alt 3C — Hybrid (larus hub now; warp objects authored so a future Crossroads can drop in)
**Description.** Ship 3A, but name/structure the larus warp objects and biome `previousScene` handling so a future authored Crossroads hub can be inserted without rewiring biomes.
**Strengths.** Zero extra cost tonight; leaves a clean seam for Ch.2 without committing to the missing map now. Pure forward-compatibility discipline.
**Weaknesses.** Requires light design foresight on warp/`previousScene` naming; negligible risk if it's just naming hygiene.
**Best when.** You want 3A's safety now and a cheap Crossroads upgrade path later — essentially free.
**Evidence.** Synthesis §3.4 (abandoned hub-and-spoke refactor); report §C.4 (Crossroads deferred, not deleted).

### ✅ Recommendation — DA3: **Alt 3A**, executed with **3C's forward-compat hygiene** (route biome exits through a `previousScene`/return convention so a future Crossroads is a drop-in).
*Rationale: reuses the one proven warp pattern as a pure data edit, matches the literature's hub-and-spoke prescription, and costs nothing to keep the Crossroads upgrade path open.*

---

## Decision Area 4 — Cross-Scene Persistence

**HMW-4.** How does progress (flags + stats + position) survive biome transitions and death?

### Alt 4A — Registry-persistent singleton StoryFlags + saveManager ref + save-on-warp
**Description.** Put the **single shared** StoryFlags instance and a `saveManager` reference into the Phaser **Registry** (`registry.set('storyFlags', …)`, `registry.set('saveManager', this.saveManager)`); scenes/UI read from the Registry instead of `new`-ing their own. Trigger a save in `NeverquestWarp` before `scene.start`. Add `rawAttributes` + `bonus` to `createSaveData`.
**Strengths.** **One keystone fixes three P0s at once** (synthesis §4): it (a) gives DA-2 its shared flag instance, (b) makes flags survive `scene.start`, and (c) `registry.set('saveManager')` alone unbreaks the dead death-checkpoint load (`GameOverScene:226` already *reads* the key — re-verified it's never set). Reuses the existing `SaveManager.toJSON/fromJSON` flag serialization. Registry is the literature-prescribed Phaser idiom for cross-scene state.
**Weaknesses.** Must replace the three `new NeverquestStoryFlags()` call sites (`JournalScene:330`, `QuestLogScene:241`, `SaveManager:162`) with Registry reads — a focused but multi-file edit. `rawAttributes` fix needs a save→reload test to prove (U2/U3).
**Best when.** The default — it is the architectural keystone the whole report and synthesis point at.
**Evidence.** Report §D.3; §B P0-10/P1-1/P1-2; synthesis §4 (keystone A) & §1 C8/C9; re-verified 3× StoryFlags instantiation + `registry.get('saveManager')` with no setter + `createSaveData` omitting `rawAttributes`.

### Alt 4B — Serialize/deserialize player state into scene `init` data on every warp
**Description.** Pass a serialized player+flags blob as the `scene.start(key, data)` payload; each scene rehydrates from `init(data)`.
**Strengths.** No Registry; explicit data flow; works within the existing `previousScene` init-data channel.
**Weaknesses.** Re-derives state on every hop (error-prone); doesn't address the dead death-checkpoint (which specifically reads the Registry `saveManager` key); leaves three throwaway StoryFlags instances. Heavier per-scene boilerplate; the existing `setTimeout(100ms)` cross-scene apply is already flagged brittle (U1) and this keeps that style.
**Best when.** Registry is unavailable or state is tiny — not the case here.
**Evidence.** Report OQ2 (brittle setTimeout apply); synthesis §1 C8 (death-load reads Registry, so init-data alone can't fix it).

### Alt 4C — Both (Registry as live source of truth + serialize through SaveManager on warp/death)
**Description.** Registry holds the live shared instances (4A); persistence to disk goes through the existing `SaveManager` on warp and on death.
**Strengths.** Belt-and-suspenders: live continuity *and* durable save; init-data still carries spawn/`previousScene`. Most robust for an actual open world.
**Weaknesses.** Slightly more wiring than 4A alone; must avoid double-writing flags (Registry instance is canonical; SaveManager serializes *that* instance).
**Best when.** You want both fast in-session continuity and crash/death durability — the realistic open-world target.
**Evidence.** Report §D.3 (Registry + save-on-warp together); synthesis §4 (E→I: persist-via-SaveManager feeds save-on-warp).

### ✅ Recommendation — DA4: **Alt 4C** = **4A keystone (Registry singletons + `registry.set('saveManager')`) + save-through-existing-SaveManager on warp/death**, including the `rawAttributes`/`bonus` serialization fix.
*Rationale: the Registry keystone simultaneously unblocks DA-2's shared flags, cross-scene flag survival, and the dead death-checkpoint, while reusing SaveManager's existing toJSON/fromJSON for durability.*

---

## Decision Area 5 — Fix-vs-Defer Line Through the 11 P0 Gaps

**HMW-5.** Which P0s are in Chapter 1 scope vs. deferred?

### Alt 5A — Strict P0-only cut (narrative spine + connectivity + unbreak death)
**Description.** Fix the connective/narrative/win-lose P0s required for *one* completable loop; defer everything cosmetic or system-expanding.
**IN (Chapter 1):** P0-1 flag-writes · P0-2 quest FSM · P0-3 expose QuestLog/Journal via `scene.launch` · P0-4 larus=hub · P0-5 1–2 biome warps · P0-6 compose+verify the graph · P0-7 "Chapter 1 Complete" overlay · P0-8 boss-flag→end · P0-9 re-register GameOverScene (unbreak death) · P0-10 `registry.set('saveManager')` (death-checkpoint) · P0-11 re-register TutorialScene. **Plus the persistence sub-fixes** P1-1 save-on-warp + P1-2 `rawAttributes` (they're *prerequisites* for P0-6/P0-10 to actually hold across an open world).
**DEFER (Ch.2+):** P2-3 equipment mechanism · extra biomes (Volcanic/Sky/Underwater) · Crossroads hub + Act-2/Act-3 content · P2-1 ExperienceCurve dead-code cleanup · P2-2 baseHealth double-mutation · P1-5 pause menu · P1-6 dangling Joystick/Setting refs (guard if they throw, else defer).
**Strengths.** Sharpest scope; every fix is connect-the-dots; protects the green build; directly honors the cut line (§C.4) and the #1 risk (OQ6 scope creep).
**Weaknesses.** Ships two *known* low-risk bugs (P2-2 baseHealth double-mutation; rawAttributes only if the test reveals more). Equipment loot stays consume-only (loot loop half-rewarding).
**Best when.** The default for an overnight reuse-first build.
**Evidence.** Report §B (full P0/P1/P2); §C.4 cut line; synthesis §5 (U-register) & OQ6.

### Alt 5B — P0 + opportunistic cheap P2 cleanups (ExperienceCurve, baseHealth)
**Description.** 5A plus delete/neutralize `ExperienceCurve.ts` dead code (P2-1) and pick one owner for baseHealth (P2-2) since both are isolated and have clear fixes.
**Strengths.** Removes two confusing defects while the code is open; both are low-risk and well-localized (synthesis C13). Leaves a cleaner codebase for Ch.2.
**Weaknesses.** Two extra edits = two extra chances to redden the build overnight; touches progression math (baseHealth) which interacts with combat/leveling tests — slightly higher regression surface than pure connectivity.
**Best when.** Build time is comfortable and the test suite covers leveling/health well enough to catch a regression.
**Evidence.** Report §B P2-1/P2-2; synthesis §1 C13 (isolated/low-risk) — but note these are *single-source* (G4) facts.

### Alt 5C — P0 + equipment mechanism (close the loot loop)
**Description.** 5A plus implement equip→stat-change (P2-3 / C10) so loot drops matter.
**Strengths.** Makes the reward loop feel complete; scaffolding (`bonus.equipment`) exists.
**Weaknesses.** Net-new mechanic = real design+impl+test scope; touches the same `bonus`/attributes path as the rawAttributes fix; clear scope creep against §C.4 and OQ6. Highest red-build risk of the three.
**Best when.** A dedicated progression sprint — explicitly *not* Chapter 1.
**Evidence.** Report §B P2-3 ("defer unless wanted"); §C.4; synthesis C10.

### ✅ Recommendation — DA5: **Alt 5A** (strict P0-only + the two persistence sub-fixes P1-1/P1-2), with **P2-2 baseHealth** promoted into scope *only if* it actively corrupts the chapter's leveling/health math during the build (otherwise defer).
*Rationale: ships one whole coherent chapter instead of half of everything; every in-scope item is connect-the-dots wiring; equipment and extra-biome work are the named scope-creep traps to hold the line against.*

---

## Trade-Off Analysis (5 perspectives × recommended picks)

Rated **High / Med / Low**. For risk, **Low = good (low risk)**.

| Decision → Pick | Technical Feasibility | User Impact | Simplicity | Risk (Low=good) | Scalability |
|---|---|---|---|---|---|
| **DA1: 1B** larus+Dungeon+IceCaverns | High (IceCaverns already registered; +1 warp) | High (real open-world feel, ~20–35 min) | High (zero new maps) | Low–Med (one biome spawn trace, U4) | Med (more spokes via same pattern) |
| **DA2: 2A** event-bridge + FSM | High (reuses emitted `setStoryFlag`) | High (quests/lore/spells light up) | Med (2 parts, but decoupled) | Low (unit-testable off-scene) | High (new flags = new emit lines) |
| **DA3: 3A+3C** larus warps, fwd-compat | High (proven warp toolchain, data edit) | Med (hub-and-spoke nav) | High (JSON object layer) | Low (mirror working id=88 warp) | High (Crossroads drop-in later) |
| **DA4: 4C** Registry keystone + save | High (Registry is Phaser idiom) | High (progress survives world+death) | Med (replace 3 `new` sites) | Med (rawAttributes needs reload test) | High (singletons scale to all scenes) |
| **DA5: 5A** strict P0-only | High (all connect-the-dots) | High (one *complete* chapter) | High (sharp scope) | Low (no new mechanics) | High (clean base for Ch.2) |

**Cross-cutting trade-offs.**
- *Simplicity vs. open-world richness (DA1):* 1B accepts one spawn-trace dependency to earn a real second spoke; 1A is the simpler fallback if that trace fails.
- *Simplicity vs. maintainability (DA2):* 2A adds one indirection (event bridge) but buys testability and CLAUDE.md compliance — worth it for an unattended build.
- *Single keystone, triple payoff (DA4):* the Registry change is the highest-leverage edit in the whole plan — it unblocks DA-2 *and* persistence *and* the dead death-checkpoint.
- *Risk discipline (DA5):* the lowest-risk path is also the most coherent deliverable — the strict cut ships a whole chapter, not fragments.

**Perspective the recommendations privilege (given the overnight-build constraint):** **Risk** and **Simplicity** are weighted highest, because an unattended build must stay green; **User Impact** is satisfied by the high-leverage cascade (few triggers → much built behavior) rather than by new content.

---

## User Preferences

No interactive user-preference dialogue was provided to this agent; alternatives were generated **purely from evidence**. The orchestrator will run user convergence (Phase 4) after this exploration. The brief did, however, encode hard **build constraints** that functioned as fixed preferences and shaped every recommendation:
- **Reuse-first, low-risk, testable**, must **keep the build green** (Phaser 3 + TS, Jest).
- Must follow repo **CLAUDE.md**: overlap callbacks = UI only; each system owns its flags; constants in `src/consts`; no hardcoded strings.
- Feeds an **autonomous overnight implementation** — favors fewer, safer, well-tested edits over breadth.

---

## Recommended Approach — "The Awakening" wired the reuse-first way

**Stitched combination (one coherent Chapter 1 implementation):**

1. **Lay the keystone (DA4: 4C).** Promote a **single** `NeverquestStoryFlags` instance and the `saveManager` ref into the Phaser **Registry**; replace the three throwaway `new NeverquestStoryFlags()` sites (`JournalScene:330`, `QuestLogScene:241`, `SaveManager:162`) with Registry reads. `registry.set('saveManager', this.saveManager)` on scene create (this alone unbreaks death-checkpoint, P0-10). Add `rawAttributes`+`bonus` to `createSaveData`.
2. **Wire the narrative spine (DA2: 2A).** Add a `setStoryFlag` **listener** that writes the Registry StoryFlags; **emit** that event from gameplay triggers (intro-end, NPC-talk-complete, **Cave-Guardian boss-kill**, area-enter, artifact-pickup). Add a small **QuestManager FSM** (`not-started→active→complete`) driven by a `QUEST_FLAG_MAP` constant. Event names + flag keys live in `src/consts` (no magic strings).
3. **Connect the open world (DA3: 3A+3C).** Add larus warp objects → `DungeonScene` (exists) + `IceCavernsScene`; fix biome `previousScene→MainScene` through a return convention that keeps a future Crossroads a drop-in. (DA1: 1B scope.)
4. **Frame the chapter (DA5: 5A).** Re-register `GameOverScene` + `TutorialScene` in `index.ts`; expose QuestLog/Journal via `scene.launch` + HUD keybind (mirror the Attribute-scene pattern); start the Act-1 opening quest on New Game; on the boss flag, launch the one net-new piece of UI — a **"Chapter 1 Complete"** overlay.
5. **Persist across the world (DA4 cont.).** Save-on-warp through the existing `SaveManager` so flags+stats+position survive every hop and death.

**Build order (from synthesis §4 critical path):** Registry keystone (A) → flag-write triggers (B) → {quest FSM (C) + boss→end (J)} ‖ {larus warps (G) → biome `previousScene` (H) → save-on-warp (I)} ‖ {re-register GameOver/Tutorial (K) → checkpoint-load fix (L)}. The three sub-chains parallelize after A.

**Confidence in this recommendation: HIGH** — it is the architecture both the code's half-done shape *and* the external literature independently prescribe, and the load-bearing facts were re-verified against the working tree this session.

**Key trade-offs accepted.** Only one real second spoke (not five biomes); one net-new UI overlay; two known low-risk defects (baseHealth double-mutation; equipment stays consume-only) deferred to Ch.2.

**Key assumptions (if wrong, the recommendation shifts).**
- *A1.* IceCavernsScene actually spawns enemies (U4/OQ1). **If false → fall back to DA1 Alt 1A** (Dungeon-only) and keep the full narrative loop.
- *A2.* Promoting StoryFlags to the Registry and replacing the 3 `new` sites doesn't break QuestLog/Journal rendering (they currently read their own instance). **If false → narrow the change to a getter-with-Registry-fallback.**
- *A3.* `createSaveData` adding `rawAttributes` round-trips cleanly on reload (U2/U3). **If false → gate behind a reload test before relying on it.**
- *A4.* The Tiled warp-object property schema can be hand-authored to match working warp id=88 (DA3). **If false → script the JSON edit from the existing warp object as a template.**

---

## Why Not the Others

- **DA1 — Alt 1A (Dungeon-only):** under-delivers the explicit "open world" ask when a real second spoke is nearly free (IceCaverns already registered). *Kept as the fallback, not the plan.*
- **DA1 — Alt 1C (5 biomes/Crossroads):** blocked on a non-existent `crossroads` map and 5× untraced spawn paths → net-new content + likely red overnight build. The named #1 scope-creep trap.
- **DA2 — Alt 2B (inline setFlag):** couples combat/movement code to StoryFlags, fights the repo's event-driven + state-ownership rules, and is hard to unit-test off-scene.
- **DA2 — Alt 2C (GameProgressManager):** largest net-new surface; risks duplicating the existing SaveManager flag serialization; over-built for one chapter.
- **DA3 — Alt 3B (Crossroads hub):** same missing-map blocker as 1C.
- **DA4 — Alt 4B (init-data only):** doesn't fix the death-checkpoint (which reads the Registry key), leaves 3 throwaway flag instances, and perpetuates the brittle setTimeout apply.
- **DA5 — Alt 5B (cleanups):** baseHealth/ExperienceCurve are single-source (G4) facts touching progression math — extra regression surface for an unattended build; defer unless they actively corrupt Chapter-1 leveling.
- **DA5 — Alt 5C (equipment):** a net-new mechanic = real design/impl/test scope and clear scope creep against the cut line.

---

## Deferred Ideas

Captured per scope guardrails; **none incorporated into the alternatives** (they would expand the problem beyond the research question).

| Idea | Classification | Why deferred / why worth later |
|---|---|---|
| Equipment/equip→stat mechanism (close loot loop) | Stretch | Scaffolding (`bonus.equipment`) exists; real new mechanic — Ch.2 progression sprint. |
| Volcanic / SkyIslands / UnderwaterTemple as additional spokes | Stretch | Built but orphaned + untraced spawns; add once the IceCaverns spawn pattern is proven. |
| Authored CrossroadsScene hub + Act-2/Act-3 (Sunstone fragments, Dark Gate, Void King, 3 endings) | Out-of-scope | Needs a net-new `crossroads` map; this is Chapters 2–3. |
| `ExperienceCurve.ts` wire-in or deletion (P2-1) | Out-of-scope (cleanup) | Dead code; cosmetic; remove in a dedicated cleanup PR. |
| baseHealth double-mutation single-owner fix (P2-2) | Stretch | Low-risk but progression-math; promote into scope only if it corrupts Chapter-1 leveling. |
| Pause/in-game menu (P1-5) | Out-of-scope | Quality-of-life; not required for a completable chapter. |
| SurvivalModeScene integration | Out-of-scope | Separate game mode; has its own victory path already. |
| Multiplayer / terminal edition | Out-of-scope | Explicitly excluded by the brief. |

---

## Scope Guardrail Note

The **#1 risk is scope creep** (OQ6, ~70%+ indie-killer per the literature). The cut line (report §C.4) must hold through the overnight build: **no new maps, no equipment mechanic, no extra biomes beyond the one verified second spoke, no Crossroads/Act-2/Act-3.** Every in-scope item is *connect-the-dots wiring on existing assets*. If the build runs ahead of schedule, the correct next move is **harden and test the chapter loop** (the save→reload and biome-spawn traces, U1–U4), **not** pull a deferred idea forward.
