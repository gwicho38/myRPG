# Findings: Narrative & Quest Systems — Wiring State

**Gatherer:** #2 (`codebase-narrative-systems`)
**Date:** 2026-06-02
**Scope:** StoryFlags, QuestLog, NPCManager, DialogBox/DialogScene, Journal, Crossroads, story/dialog content.
**Method:** Static read + whole-codebase grep for WRITE vs READ of every narrative primitive. All claims cite `file:line`.

---

## TL;DR (THE KEY ANSWER)

**The narrative system is a READ-ONLY SHELL. No quest can be started or completed in-game today.**

- `StoryFlag`s are **never written by any gameplay code**. The only `setFlag(...)` callers in the entire repo are inside `NeverquestStoryFlags.ts` itself (the public method definition + an internal spell-unlock cascade). Grep across `src/` (excluding tests) for `setFlag(` returns **7 hits, all in `NeverquestStoryFlags.ts`** (`NeverquestStoryFlags.ts:127,249,255,261,268,275` + the docstring at `:105`). Zero from scenes, NPCs, combat, or dialog.
- `recordChoice(...)` (the branching-ending mechanism) is **never called anywhere** outside its own definition (`NeverquestStoryFlags.ts:158`).
- Because quest completion = "is this flag set?" (`QuestLogScene.ts:408-414`), and **no flag is ever set**, every quest is permanently incomplete and the player is permanently locked in "Act 1" (`NeverquestStoryFlags.getCurrentAct()` returns 1 unless `ENTERED_CROSSROADS`/`DARK_GATE_OPENED` are set — neither ever is) (`NeverquestStoryFlags.ts:232-240`).
- The two UI scenes that surface narrative state — `QuestLogScene` and `JournalScene` — are **registered but unreachable**: no `scene.launch`/`scene.start` for either exists anywhere in the codebase, and the HUD exposes no button/keybind to open them.
- `CrossroadsScene` (the "story hub" holding the 4 quest-giver NPCs) is **registered but orphaned**: its only inbound edge is from `OverworldScene` (`OverworldScene.ts:227`), which is commented OUT of the scene list (`index.ts:41,117`).

**Net effect:** rich authored story content exists (full Lucius/Sunstone/Void-King arc, 21 lore entries, 16 quests, 5 story dialogs), but it is **disconnected from the playable game**. This is a **wiring problem, not a content problem.** Confidence: **High (95%)** — based on exhaustive grep of write-sites + registration/launch-site analysis.

---

## 1. Inventory of Narrative Systems & Wiring State

| System | File | What it does | State |
|---|---|---|---|
| `NeverquestStoryFlags` | `src/plugins/NeverquestStoryFlags.ts` | 31-member `StoryFlag` enum (3 acts + fragments + endings + spell/ability unlocks); `setFlag/hasFlag/recordChoice`; localStorage persistence; `getCurrentAct`, `getFragmentCount`, `canOpenDarkGate` | **READ-ONLY / never advanced.** Instantiated in 3 places (`QuestLogScene:241`, `JournalScene:330`, `SaveManager:162`); only ever READ. Not a Phaser-registered plugin; each instance is independent. |
| `QuestLogScene` | `src/scenes/QuestLogScene.ts` | Renders 16 quests across 3 acts; completion derived from `QUEST_FLAG_MAP` → `hasFlag` (`:170-187, 408-414`) | **ORPHANED UI.** Registered (`index.ts:124`); **no launcher anywhere.** Pure display; cannot start/complete a quest. |
| `JournalScene` | `src/scenes/JournalScene.ts` | 21 lore entries across 5 categories, each gated by an `unlockFlag` (`:60-259`); displayed if `hasFlag(unlockFlag)` (`:597-598`) | **ORPHANED UI.** Registered (`index.ts:126`); **no launcher anywhere.** All entries permanently undiscovered (their flags never set). |
| `NeverquestNPCManager` + `CROSSROADS_NPCS` | `src/plugins/NeverquestNPCManager.ts` | Spawns NPCs programmatically; overlap shows dialog box w/ `zone.chat` (`:247-258`); `CROSSROADS_NPCS` defines Merchant/Knight/Oracle/Guardian (`:328-373`) | **DIALOG-ONLY, NO QUEST WIRING.** NPC overlap sets `dialogBox.chat` and shows the action prompt — **no quest-giver callback, no `setFlag`.** Talking to the Merchant does NOT set `MET_MERCHANT`, etc. Only instantiated in `CrossroadsScene` (orphaned) + `OverworldScene`(commented out). |
| `NeverquestDialogBox` | `src/plugins/NeverquestDialogBox.ts` | Renders branching-portrait dialog; emits `dialogComplete` (`:808`); `openDialogModal(text, callback?)` runs `callback` once on `dialogComplete` (`:507-515`) | **FUNCTIONAL renderer, hook UNUSED for story.** The completion callback exists but NPCManager never passes one → dialog completion never advances flags. |
| `DialogScene` | `src/scenes/DialogScene.ts` | Overlay scene; wraps `NeverquestTiledInfoBox` for Tiled-map dialog triggers | **FUNCTIONAL but Tiled-only.** Launched by every gameplay scene (e.g. `MainScene:116`). Drives **map-object** dialogs, not the Sunstone story NPCs. No flag wiring (`NeverquestTiledInfoBox` has zero `StoryFlag` references). |
| `CrossroadsScene` | `src/scenes/CrossroadsScene.ts` | Act-2 hub: spawns the 4 story NPCs (`:182-188`), warps to IceCaverns (`:537`) and Overworld (`:580`) | **ORPHANED + flag-less.** Registered (`index.ts:113`) but only reachable from commented-out `OverworldScene` (`OverworldScene.ts:227`). Despite its docstring ("Uses flags for NPC dialogs", "Gates Dark Lands access"), it **never instantiates StoryFlags** and the "Gate Guardian"/north gate is **not actually locked** by `canOpenDarkGate()`. |
| Story content (data) | `src/consts/DB_SEED/chats/*`, `JournalScene LORE_ENTRIES`, `QuestLogScene QUEST_DEFINITIONS` | Authored prose: intro, 5 Crossroads dialogs, 21 lore, 16 quests | **PRESENT & high quality, DISCONNECTED.** See §3. |

---

## 2. THE KEY ANSWER — Can a quest be started & completed today? (One quest traced end-to-end)

**Trace: Quest `meet_elder` → flag `MET_ELDER` (Act 1).**

| Step | Expected | Reality | Evidence |
|---|---|---|---|
| 1. Quest "started" | Player meets elder; quest becomes active | No concept of "started" — quest is active iff `act <= currentAct && !completed` (`QuestLogScene.ts:328`). It is "active" by default but invisible (scene unreachable). | `QuestLogScene.ts:328-344` |
| 2. Progress / completion trigger | Talking to the elder NPC sets `StoryFlag.MET_ELDER` | **No code sets `MET_ELDER`.** No `setFlag(StoryFlag.MET_ELDER)` exists. Elder isn't even spawned in any reachable scene. | grep `setFlag(` → only `NeverquestStoryFlags.ts` |
| 3. Completion reflected | `QuestLogScene` shows `[x]` for the quest | `getQuestsWithStatus()` → `hasFlag(MET_ELDER)` → always `false` → permanently `[ ]` | `QuestLogScene.ts:170-187, 408-414` |
| 4. Reward | Lore unlock (`char_village_elder`, `world_ancient_kingdoms`), spell/ability unlock | Lore gated on `MET_ELDER` (`JournalScene.ts:69,107`) → never unlocks. No XP/item reward is tied to flags. | `JournalScene.ts:60-108` |
| 5. View result | Player opens Quest Log / Journal | **Cannot** — neither scene has a launcher; HUD has no button. | §1; HUD launches only Attribute/Inventory/Settings (`HUDScene.ts:348,360,386`) |

**Chain is broken at Step 2 for EVERY quest** (the flag is never written) **and again at Step 5** (the viewer is unreachable). The same holds for the only "natural" trigger points that exist in reachable gameplay:
- **Boss defeat → flag:** `NeverquestBattleManager.ts` has **zero** `StoryFlag`/`setFlag` references → killing the cave/biome boss never sets `CAVE_BOSS_DEFEATED`. (grep returned nothing.)
- **Intro → flag:** `IntroScene` just `scene.start('MainMenuScene')` (`IntroScene.ts:299`); it never sets `INTRO_COMPLETE`.
- **Entering hub → flag:** `CrossroadsScene` never sets `ENTERED_CROSSROADS` (no StoryFlags instance in the file).

**Conclusion:** **No quest can be started or completed in-game today.** The machinery to *display* progress exists and is correct; the machinery to *produce* progress (flag writes at gameplay events) is entirely absent, and the display UI is itself unreachable.

---

## 3. Existing Story Content That Can Anchor Chapter 1 (reuse-first)

The authored content is coherent and substantial — a complete 3-act arc. **All of it is reusable; the work is wiring, not writing.**

### Protagonist & framing
- **Lucius** (player), portraits `lucius_portrait_beard` / `lucius_portrait_beardless`. Intro establishes a **time-travel "future self" hook** — Lucius meets a "Beardless Lucius" from the future who hints at a great treasure (`IntroductionChat.ts:30-60`). The Oracle later ties this to the Sunstone and Lucius's hidden true origin (`OracleVision.ts:42-104`).

### The spine (3 acts, in code)
- **Act 1 — The Awakening:** Awaken → meet Elder → retrieve cave artifact → defeat Cave Guardian. Flags `INTRO_COMPLETE, MET_ELDER, CAVE_ARTIFACT_RETRIEVED, CAVE_BOSS_DEFEATED, ACT_1_COMPLETE` (`NeverquestStoryFlags.ts:30-34`). Quests `intro, meet_elder, cave_artifact, cave_boss` (`QuestLogScene.ts:49-76`).
- **Act 2 — The Journey (Crossroads hub):** Reach Crossroads → meet Merchant/Fallen-Knight(Aldric)/Oracle → collect **3 Sunstone fragments** (Ruins/Temple/Gate) → restore Sunstone. Flags + 8 quests (`QuestLogScene.ts:79-134`). Fragment collection unlocks spells via `onFlagSet` cascade (Frost Nova, Chain Lightning) (`NeverquestStoryFlags.ts:253-263`).
- **Act 3 — The Reckoning:** Open Dark Gate → enter Citadel → defeat Shadow Guardian → confront Void King → 3 endings (Heroic / Sacrifice / Hidden) (`NeverquestStoryFlags.ts:50-59, 185-202`; `QuestLogScene.ts:137-164`).

### Ready-to-use dialog (5 story conversations, `src/consts/DB_SEED/chats/`)
- `CrossroadsWelcome` (id 10) — "Mysterious Voice" sets the 3-fragment objective (`CrossroadsWelcome.ts:50-77`).
- `MerchantGreeting` (id 11) — Zephyr; foreshadows Ruins bandits, Temple wolves, Ice Peaks, Mount Pyreus.
- `FallenKnightEncounter` (id 12) — **Sir Aldric**, redemption-arc ally; offers to guide to the Ruins.
- `OracleVision` (id 13) — prophecy; names the 3 endings; foreshadows Ice/Volcano/Underwater/Sky biomes.
- `GateGuardian` (id 14) — gatekeeps Act 3; "return when you have all three fragments."
- (Note an **id mismatch risk:** `CROSSROADS_NPCS` references chatIds 11-14 but NOT 10; `CrossroadsWelcome` (10) has no NPC/trigger wired — likely intended as an on-entry cutscene.)

### Lore corpus (21 entries, `JournalScene.ts:60-259`)
World history (Ancient Kingdoms, Void War, Crossroads, Dark Gate), characters (Elder, Sir Marcus/Aldric, Oracle, Merchant, Void King), items (Sunstone + 3 fragments), creatures (Shadow Scout/Guardian, Cave Guardian), locations (Village, Cave, Ruins, Temple, Citadel). Each entry already mapped to its unlock flag → a flag-write at the corresponding gameplay beat makes the Journal "fill in" automatically.

### Spell/ability rewards already wired to flags (`NeverquestStoryFlags.onFlagSet`, `:245-287`)
Setting a single story flag cascades into spell unlocks (e.g., `CAVE_BOSS_DEFEATED` → Flame Wave; fragments → Frost Nova / Chain Lightning; `ENTERED_CITADEL` → Poison Cloud) and emits `spellUnlocked` events that `NeverquestSpellManager` already listens for (`NeverquestSpellManager.ts:81`). **So the reward half of the loop is built** — it just needs the flag-write trigger.

---

## 4. Where the chain breaks (precise, for the design blueprint)

Minimum wiring needed to make the existing content playable (reuse-first; no new content):

1. **Write flags at gameplay events.** Add `setFlag(...)` calls at: intro end (`INTRO_COMPLETE`), NPC dialog completion (`MET_*`), boss defeat in `NeverquestBattleManager` (`CAVE_BOSS_DEFEATED`, etc.), fragment pickup (`FRAGMENT_*`), scene entry (`ENTERED_CROSSROADS`/`ENTERED_CITADEL`). Use a **single shared StoryFlags instance** (e.g. expose `SaveManager.storyFlags`, which is already created at `SaveManager.ts:162` and persisted at `:277,415-417`) rather than the current pattern of per-scene throwaway instances.
2. **Wire NPC dialog → flag.** `NeverquestNPCManager.handleNPCOverlap`/dialog completion currently has no callback (`NeverquestNPCManager.ts:247-258`); add an optional `onComplete`/`questFlag` per NPC config and call `storyFlags.setFlag` on `dialogComplete` (the event already fires at `NeverquestDialogBox.ts:808`).
3. **Make the narrative UI reachable.** Add HUD buttons/keybinds to `scene.launch('QuestLogScene', { storyFlags })` and `JournalScene` (mirror the existing Attribute-book pattern at `HUDScene.ts:347-356`). The `init({ storyFlags })` props already exist (`QuestLogScene.ts:222`, `JournalScene.ts:310`).
4. **Reconnect the hub.** Either re-enable `OverworldScene` (`index.ts:41,117`) as the Act-1→Act-2 bridge, OR add a direct warp from the reachable `MainScene` to `CrossroadsScene` (currently `MainScene`'s only outbound `scene.start` is the dead `UpsideDownScene` — see gatherer #1's flow trace).
5. **Actually gate the Dark Gate.** `CrossroadsScene` north gate should check `storyFlags.canOpenDarkGate()` (`NeverquestStoryFlags.ts:225`) before transitioning to Act 3.

---

## 5. Confidence per claim

| Claim | Confidence | Basis |
|---|---|---|
| No gameplay code writes any StoryFlag | **High (95%)** | Exhaustive grep `setFlag(`/`recordChoice(` across `src/` excl. tests → all hits internal to `NeverquestStoryFlags.ts`. |
| QuestLog & Journal are unreachable | **High (95%)** | No `scene.launch/start('QuestLogScene'|'JournalScene')` anywhere; HUD launches only Attribute/Inventory/Settings (`HUDScene.ts`). |
| CrossroadsScene orphaned | **High (90%)** | Only inbound edge from `OverworldScene:227`, which is commented out (`index.ts:41,117`). (Cross-check w/ gatherer #1 for any dynamic warp into it.) |
| NPC dialog never advances flags | **High (95%)** | `NeverquestNPCManager` has no StoryFlags ref / no completion callback; DialogBox callback hook unused by NPCManager. |
| BattleManager never sets story flags | **High (90%)** | grep `StoryFlag|setFlag` in `NeverquestBattleManager.ts` → none. (Did not exhaustively read all 774 lines; high but not certain.) |
| Story content is complete & reusable | **High (95%)** | Direct read of all 5 Crossroads chats + 21 lore + 16 quests + intro. |
| CrossroadsWelcome (id 10) has no trigger wired | **Medium (70%)** | `CROSSROADS_NPCS` uses ids 11-14 only; did not find a trigger for 10, but a Tiled object in `crossroads.json` could reference it (out of this gatherer's file set — flag for gatherer #3/world-map). |

---

## 6. Handoffs / cross-gatherer notes
- **Gatherer #1 (game-flow):** confirm whether any dynamic warp (`NeverquestWarp` `goto`/scene-change Tiled prop) reaches `CrossroadsScene`/biomes; confirm `OverworldScene` is truly dead. My static trace says Crossroads is orphaned.
- **Gatherer #3 (world-map):** check `crossroads.json` for a dialog object referencing chatId 10 (`CrossroadsWelcome`) and any `warps` that change the picture.
- **Gatherer #4 (progression/save):** confirm `SaveManager` persists `story` payload (`SaveManager.ts:277,415-417`) — it does — so once flags are written, they will save/load correctly; the single missing piece is the write trigger.
