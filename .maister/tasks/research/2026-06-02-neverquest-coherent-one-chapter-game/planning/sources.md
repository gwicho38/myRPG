# Research Sources — Neverquest Coherent One-Chapter Game

All paths are relative to repo root `/Volumes/mac_extended/repos/neverquest`.
Verified present during planner recon (2026-06-02). Line refs are starting points, not exhaustive.

---

## Codebase Sources — Game Flow (gatherer: `codebase-game-flow`)

### Key files
- `src/index.ts` — Phaser config + scene registration/boot order. **Note the commented-out scenes** (`index.ts:25,33,37,40,41,48,50,51,52,53,107,115-122,130-132`): `CaveScene, GameOverScene, JoystickScene, MobileCheckScene, OverworldScene, UpsideDownScene, SettingScene, TownScene, TutorialScene, VideoPlayerScene`. Active list at `index.ts:101-134`.
- `src/scenes/PreloadScene.ts` — boots `IntroScene` (`:212`).
- `src/scenes/IntroScene.ts` — boots `MainMenuScene` (`:299`).
- `src/scenes/MainMenuScene.ts` — New Game → `MainScene` (`:303`); Continue → `loadGame()` → `saveData.scene` (`:308-326`); `hasSaveData()` gate (`:155,161`).
- `src/scenes/MainScene.ts` — primary gameplay; only outbound `scene.start` is `UpsideDownScene` (`:364`, likely dead); launches `DialogScene`/`HUDScene` (`:116,124`); SaveManager (`:143`).
- `src/scenes/GameOverScene.ts` — restart → `MainScene` (`:218`) / `MainMenuScene` (`:295`). (Registered? commented out at `index.ts:132` — verify.)
- `src/scenes/watchers/SceneToggleWatcher.ts` — generic `scene.launch` helper (`:22`).

### Globs
- `src/index.ts`
- `src/scenes/{Preload,Intro,MainMenu,Main,GameOver}Scene.ts`
- `src/scenes/watchers/*.ts`

### What to extract
Verified reachable scene graph (nodes = registered scenes; edges = `scene.start`/`launch`); orphaned (registered, no inbound edge) and dead (target not registered) classification; win/lose path.

---

## Codebase Sources — Narrative Systems (gatherer: `codebase-narrative-systems`)

### Key files
- `src/plugins/NeverquestStoryFlags.ts` (346 lines) — `enum StoryFlag` (`:28-86`) encodes a **3-act structure** (Awakening / Journey-Crossroads / Reckoning) + sunstone-fragment collection + endings + spell/ability unlocks; `setFlag` (`:127`), persistence (`:300,316`). Instantiated only in JournalScene/QuestLogScene/SaveManager — **verify whether gameplay scenes set flags.**
- `src/scenes/QuestLogScene.ts` (552 lines) — `QUEST_DEFINITIONS` 16 quests across 3 acts (`:47`), `QUEST_FLAG_MAP` quest→flag (`:170`), `new NeverquestStoryFlags(this)` (`:241`). **No scene launches this — verify reachability.**
- `src/plugins/NeverquestNPCManager.ts` (373 lines) — `INPCConfig` (`:30`), `addNPC`/`addNPCs` (`:136,144`), dialog-on-overlap, `CROSSROADS_NPCS` config (`:328`).
- `src/scenes/CrossroadsScene.ts` (617 lines) — "story hub": instantiates NPCManager + `CROSSROADS_NPCS` (`:185-186`), SaveManager (`:164`); outbound to `IceCavernsScene` (`:537`) and `OverworldScene` (`:580`). **Reached only from OverworldScene (commented out) → verify orphaned.**
- `src/scenes/JournalScene.ts` (754 lines) — lore/discovery; `new NeverquestStoryFlags(this)` (`:330`). **No launcher found — verify reachability.**
- `src/plugins/NeverquestDialogBox.ts` (920 lines) — `IDialogChat`, dialog rendering used by NPCManager.
- `src/consts/DB_SEED/Chats.ts`, `src/consts/DB_SEED/DialogTemplate.ts` — dialog content registry.

### Globs
- `src/plugins/Neverquest{StoryFlags,NPCManager,DialogBox}.ts`
- `src/scenes/{QuestLog,Crossroads,Journal,Dialog}Scene.ts`
- `src/consts/DB_SEED/*.ts`

### What to extract
Whether story flags are *written* during gameplay (not just read by UI); 16-quest → StoryFlag → triggering-event mapping; which NPC dialogs advance flags; whether QuestLog/Journal/Crossroads are reachable.

---

## Codebase Sources — World / Map (gatherer: `codebase-world-map`)

### Key files
- `src/plugins/NeverquestMapCreator.ts` (163 lines) — loads Tiled maps by key (e.g., `new NeverquestMapCreator(this, 'overworld')`).
- `src/plugins/NeverquestWarp.ts` (254 lines) — warp zones from Tiled `warps` object layer; `goto` destination property (`:85`), scene-change property (`:88-93`), `createWarps()` (`:120`). **Runtime warp targets live in map JSON, not TS.**
- `src/plugins/NeverquestDungeonGenerator.ts` (197 lines) — procedural dungeon layouts.
- `src/plugins/NeverquestObjectMarker.ts` — interactive map markers.
- Biome scenes: `src/scenes/{Dungeon,IceCaverns,VolcanicDungeons,SkyIslands,UnderwaterTemple}Scene.ts`. Inbound edges: only `IceCavernsScene` (from Crossroads `:537`); others appear to have **no entry point**.
- Commented-out connectors (exist, disconnected): `src/scenes/{Overworld,Town,Cave,Tutorial}Scene.ts`. Overworld loads `'overworld'` map (`OverworldScene.ts:69`) and is the **only** scene that starts Crossroads (`:227`).

### Map & tileset assets (Tiled)
- `src/assets/maps/overworld/{overworld.json,overworld.tmx}` — open-world map (consumer commented out).
- `src/assets/maps/town/{town.json,town.tmx}`, `src/assets/maps/cave/{cave_dungeon.json,.tmx}`, `src/assets/maps/tutorial/{tutorial.json,.tmx}`, `src/assets/maps/dungeon/dungeon.tmx`, `src/assets/maps/larus/{larus.json,.tmx}`.
- `src/assets/maps/tilesets/` — shared tilesets.
- `public/maps`, `public/sprites`, `public/fonts`, `public/sound`, `public/video` — runtime asset roots.
- `src/consts/TilesetGuide.ts`, `src/consts/DungeonTiles.ts`, `src/consts/GameAssets.ts`.

### Globs
- `src/plugins/Neverquest{MapCreator,Warp,DungeonGenerator,ObjectMarker}.ts`
- `src/scenes/{Dungeon,IceCaverns,VolcanicDungeons,SkyIslands,UnderwaterTemple,Overworld,Town,Cave,Tutorial}Scene.ts`
- `src/assets/maps/**/*.json` (inspect `warps`/`goto` object properties)

### What to extract
Map-asset → scene mapping; per-scene warp/scene-change targets (from map JSON + TS); a candidate connected Chapter 1 world graph; missing return/hub loops.

---

## Codebase Sources — Progression / Combat / Save (gatherer: `codebase-progression-combat`)

### Key files
- `src/plugins/NeverquestBattleManager.ts` (774 lines) — combat flow, damage, defeat events (does it set StoryFlags / grant XP on boss kill?).
- `src/plugins/NeverquestSaveManager.ts` (516 lines) — `new NeverquestStoryFlags(this.scene)` (`:162`); persists scene + flags + player state; instantiated by nearly every gameplay scene (`MainScene:143`, `Crossroads:164`, biomes, MainMenu:149). Check checkpoint granularity + what is persisted.
- `src/consts/progression/ExperienceCurve.ts` — XP/level curve.
- `src/consts/player/Player.ts`, `src/entities/Player.ts`, `src/entities/Enemy.ts`, `src/entities/EntityAttributes.ts`.
- `src/plugins/attributes/` (ExpManager and related) — leveling/attribute application.
- Boss configs: `src/consts/enemies/BossEncounterTemplate.ts`, `src/consts/enemies/EnemiesSeedConfig.ts`, plus `*Boss*`/elite entries (e.g., `leviathan.ts`, `fireDragon.ts`, `voidKing`-equivalents).

### Globs
- `src/plugins/Neverquest{BattleManager,SaveManager}.ts`
- `src/plugins/attributes/**/*.ts`
- `src/consts/progression/*.ts`, `src/consts/player/*.ts`, `src/consts/enemies/*.ts`
- `src/entities/*.ts`

### What to extract
XP/level math; what triggers level-ups and whether it gates story; boss-defeat → StoryFlag wiring; whether SaveManager checkpoints the intended Chapter 1 path (scene + flags + player state).

---

## Documentation Sources

### Project docs (present)
- `docs/ARCHITECTURE.md` — tech stack + directory structure (authoritative system overview).
- `docs/ROADMAP.md` — **aspirational** (v0.3–1.0). Use for intent only; do NOT treat as committed scope (risk of scope creep).
- `docs/DEBUG_SYSTEM.md`, `docs/PARTICLE_POOLING.md` — supporting.
- `CLAUDE.md` (repo) — conventions: state-ownership rules, naming, constants-in-`src/consts`, plugin dependency graph, testing/CI gate. **Binding constraints for the design blueprint.**
- `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `BUILD.md`, `TESTING_STRATEGY.md`.
- `TODO.md` — terminal-edition-only (mostly out of scope).

### Non-authoritative / noise (cite with caution)
- `src/plugins/NeverquestBattleManager.ts.backup`, `fix_plan.md`, `HORIZONTAL_BARS_FIX_INSTRUCTIONS.md`, `AGENT_PROMPT.md`.

### Absent
- `.maister/docs/INDEX.md` — **does not exist**; no project-standards index to load.

---

## Configuration Sources
- `package.json` — Phaser `^3.90.0` (`:134`); scripts: `build` (webpack prod), `start`/`dev` (`scripts/start-dev.js`), `test` (jest), `lint` (eslint).
- `tsconfig.json`, `jsdoc.config.json`.
- `webpack/` (dev/prod configs).
- `capacitor.config.ts` (mobile), `playwright.config.ts` (e2e).

---

## External Sources (gatherer: `external-arpg-design`)
- **Phaser 3.90 scene management** — `mcp__plugin_context7` (resolve `phaser`, query scene start/launch/sleep/wake, data passing, scene transitions). Preferred over generic web for engine specifics.
- **2D action-RPG chapter/quest design** — WebSearch/WebFetch: quest-chain structure, act/chapter pacing, narrative gating via flags, hub-and-spoke vs. linear open-world connectivity, checkpoint/save patterns in 2D ARPGs.
- **Treat as corroboration**, not foundation — the in-code 3-act `StoryFlag` scaffold already provides a defensible chapter structure to anchor Q3.
