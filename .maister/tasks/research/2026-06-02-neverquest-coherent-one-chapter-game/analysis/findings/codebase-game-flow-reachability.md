# Codebase Findings — Game Flow / Scene Reachability

**Category:** `codebase-game-flow` (Gatherer #1)
**Research question:** Build Neverquest into a coherent playable one-chapter game with a connected open world.
**Method:** Built the real runtime scene graph from `src/index.ts` (registration) + a repo-wide grep of every `scene.start/launch/run/switch/stop/pause` call, then traced each edge to source and verified warp wiring against the Tiled map data (`larus.json`).

---

## TL;DR — Reachability Verdict

The shippable game today is a **two-room loop**: `MainScene ⇄ DungeonScene`. Everything else built for the "open world" (5 elemental biomes, the Crossroads hub, the Overworld, Survival mode, GameOver) is **unreachable** — either orphaned (registered but nothing starts it) or dead (its only entry point is a commented-out scene). There is **no win condition and no chapter end**; the only "ending" is death, and death itself is broken because `GameOverScene` is launched from 4 places but is commented out of the scene registry.

| Metric | Value |
|---|---|
| Scenes registered in `index.ts` | 19 |
| Scenes commented out (exist on disk, not loaded) | 10 |
| Gameplay biomes reachable in normal play | **2** (MainScene, DungeonScene) |
| Elemental biomes reachable | **0 of 4** (Ice/Volcanic/Sky/Underwater all orphaned) |
| Hub (Crossroads) reachable | **No** (only entry is from commented-out OverworldScene) |
| Win / chapter-complete path | **None exists** |
| Death handling | **Broken** (launches unregistered `GameOverScene`) |

---

## Scene Reachability Table

Classification key:
- **FUNCTIONAL** — registered AND a reachable scene starts it.
- **ORPHANED** — registered but no reachable scene starts it (dead in practice).
- **DEAD** — something starts it, but that starter is itself unreachable (commented-out scene), OR it is launched by name but is not registered.
- **UNREGISTERED** — exists on disk, commented out of `index.ts` scene array.

| Scene | Registered? | Started by (file:line) | Classification |
|---|---|---|---|
| `PreloadScene` | Yes | Boot (first in scene array, `index.ts:107`) | **FUNCTIONAL** (entry) |
| `IntroScene` | Yes | `PreloadScene.ts:212` (`scene.start('IntroScene')`) | **FUNCTIONAL** |
| `MainMenuScene` | Yes | `IntroScene.ts:299` (`scene.start('MainMenuScene')`) | **FUNCTIONAL** |
| `MainScene` | Yes | `MainMenuScene.ts:303` (New Game); `GameOverScene.ts:218` | **FUNCTIONAL** (primary gameplay) |
| `DungeonScene` | Yes | Tiled warp in `larus.json` (`goto:'DungeonScene', scene:true`) wired via `NeverquestWarp.ts:199`; default return `previousScene='MainScene'` | **FUNCTIONAL** |
| `IceCavernsScene` | Yes | `CrossroadsScene.ts:537` — but Crossroads is unreachable | **ORPHANED** (started only by dead hub) |
| `VolcanicDungeonsScene` | Yes | Nothing. No `.start('VolcanicDungeonsScene')` anywhere | **ORPHANED** |
| `SkyIslandsScene` | Yes | Nothing. No `.start('SkyIslandsScene')` anywhere | **ORPHANED** |
| `UnderwaterTempleScene` | Yes | Nothing. No `.start('UnderwaterTempleScene')` anywhere | **ORPHANED** |
| `CrossroadsScene` | Yes | `OverworldScene.ts:227` ONLY — and OverworldScene is commented out (`index.ts:120`) | **DEAD** (only starter is unregistered) |
| `SurvivalModeScene` | Yes | Nothing. Only a doc-comment example at `SurvivalModeScene.ts:225` | **ORPHANED** |
| `DialogScene` | Yes | `launch` from every gameplay scene (e.g. `MainScene.ts:116`) | **FUNCTIONAL** (UI) |
| `HUDScene` | Yes | `launch` from every gameplay scene (e.g. `MainScene.ts:124`) | **FUNCTIONAL** (UI) |
| `InventoryScene` | Yes | `HUDScene` / input toggles | **FUNCTIONAL** (UI) |
| `AttributeScene` | Yes | `HUDScene.ts:350` (`launch`) | **FUNCTIONAL** (UI) |
| `QuestLogScene` | Yes | UI toggle (registered, opened via input) | **FUNCTIONAL** (UI) |
| `CharacterStatsScene` | Yes | UI toggle | **FUNCTIONAL** (UI) |
| `JournalScene` | Yes | UI toggle | **FUNCTIONAL** (UI) |
| `SpellWheelScene` | Yes | `NeverquestKeyboardMouseController.ts:246` (`launch`) | **FUNCTIONAL** (UI) |
| `GameOverScene` | **No** (commented `index.ts:132`) | Launched by name from `NeverquestBattleManager.ts:766`, `SkyIslandsScene.ts:507`, `VolcanicDungeonsScene.ts:312`, `UnderwaterTempleScene.ts:463` | **DEAD** (launched but unregistered → fails) |
| `UpsideDownScene` | **No** (commented `index.ts:111`) | Target of `MainScene.ts:364` (`scene.start('UpsideDownScene')`) but its trigger `createUpsideDownPortal()` is commented out at `MainScene.ts:147` | **DEAD/UNREGISTERED** |
| `OverworldScene` | **No** (commented `index.ts:120`) | `CrossroadsScene.ts:580` | **UNREGISTERED** |
| `TownScene` | **No** (commented `index.ts:115`) | — | **UNREGISTERED** |
| `CaveScene` | **No** (commented `index.ts:23`) | — | **UNREGISTERED** |
| `TutorialScene` | **No** (commented `index.ts:121`) | — | **UNREGISTERED** |
| `MobileCheckScene` | **No** (commented) | — | **UNREGISTERED** |
| `JoystickScene` | **No** (commented `index.ts:127`) | `scene.get('JoystickScene')` in MainScene/Crossroads/Cave returns null; `launch('JoystickScene')` in `SurvivalModeScene.ts:372` | **UNREGISTERED** (dangling refs) |
| `SettingScene` | **No** (commented) | `HUDScene.ts:388` `launch(this.settingSceneName)` | **UNREGISTERED** (dangling ref) |
| `VideoPlayerScene` | **No** (commented) | `NeverquestVideoOpener.ts:61` | **UNREGISTERED** (dangling ref) |

---

## Runtime Flow Diagram (boot → gameplay → attempted end)

```mermaid
flowchart TD
    Boot([Boot / index.ts scene array]) --> Preload[PreloadScene]
    Preload -->|PreloadScene.ts:212| Intro[IntroScene]
    Intro -->|IntroScene.ts:299| Menu[MainMenuScene]
    Menu -->|New Game MainMenuScene.ts:303| Main[MainScene<br/>map: larus]
    Menu -->|Load Game MainMenuScene.ts:320| Save{{saveData.scene}}

    Main -->|larus 'dungeon' warp<br/>NeverquestWarp.ts:199| Dungeon[DungeonScene]
    Dungeon -->|exit portal DungeonScene.ts:362<br/>previousScene='MainScene'| Main

    Main -. createUpsideDownPortal commented<br/>MainScene.ts:147 .-> Upside[/UpsideDownScene<br/>UNREGISTERED/]
    Main -. scene.start target exists<br/>MainScene.ts:364 .-> Upside

    %% Dead hub + orphaned biomes
    OW[/OverworldScene<br/>UNREGISTERED/] -.->|OverworldScene.ts:227| Cross[CrossroadsScene<br/>DEAD: no live entry]
    Cross -.->|CrossroadsScene.ts:537| Ice[IceCavernsScene ORPHANED]
    Cross -.->|CrossroadsScene.ts:580| OW
    Volc[VolcanicDungeonsScene<br/>ORPHANED: no entry]
    Sky[SkyIslandsScene<br/>ORPHANED: no entry]
    UW[UnderwaterTempleScene<br/>ORPHANED: no entry]
    Surv[SurvivalModeScene<br/>ORPHANED: no entry]

    %% Broken death
    Battle[NeverquestBattleManager death<br/>:766] -.->|launch GameOverScene| GO[/GameOverScene<br/>UNREGISTERED -> fails/]
    Ice -.->|SkyIslands/Volcanic/Underwater<br/>launch GameOverScene| GO

    classDef live fill:#1b5e20,stroke:#0a0,color:#fff;
    classDef dead fill:#7f1d1d,stroke:#a00,color:#fff;
    class Preload,Intro,Menu,Main,Dungeon live;
    class Upside,OW,Cross,Ice,Volc,Sky,UW,Surv,GO dead;
```

**The entire green subgraph is the actual playable game.** Everything red is built content that the player can never reach in a normal session.

---

## Concrete Coherence Breaks (with citations)

1. **Crossroads hub is orphaned by a commented-out gatekeeper.**
   `CrossroadsScene` is started *only* from `OverworldScene.ts:227`, and `OverworldScene` is commented out of the registry at `index.ts:120`. So the "central hub connecting all major regions" (`CrossroadsScene.ts:37`) is never instantiated. (high confidence — exhaustive grep: the only non-import, non-comment occurrence of `.start('CrossroadsScene'` is `OverworldScene.ts:227`.)

2. **4 of 5 elemental biomes have zero entry points.**
   `VolcanicDungeonsScene`, `SkyIslandsScene`, `UnderwaterTempleScene` are never the argument of any `scene.start(...)` anywhere in `src/` (grep returned only their registration line in `index.ts`, doc `@see` comments, and their own internal `console.log`s). `IceCavernsScene` *is* started (`CrossroadsScene.ts:537`) but only from the dead hub. Net: **0 of 4 elemental biomes are reachable.** (high confidence.)

3. **MainScene's "Upside Down" exit is doubly dead.** `MainScene.ts:364` does `scene.start('UpsideDownScene')`, but (a) the only trigger, `createUpsideDownPortal()`, is commented out at `MainScene.ts:147`, so the portal zone is never created; and (b) `UpsideDownScene` is commented out of the registry at `index.ts:111`. Even if the portal existed, the start would fail. (high confidence.)

4. **MainScene's REAL exit is to DungeonScene — the planner's preliminary claim is REFUTED.** The planner believed "MainScene's only exit is the dead warp to UpsideDownScene." In fact the `larus.json` map's `warps` object layer contains an object `dungeon` with properties `{goto:'DungeonScene', scene:true}`. `NeverquestWarp.ts:199` reads the `goto` value and calls `scene.start('DungeonScene')`. `DungeonScene` **is** registered (`index.ts:109`) and returns to `MainScene` via its exit portal (`DungeonScene.ts:362`, default `previousScene='MainScene'`). So MainScene has a working exit; the playable loop is `MainScene ⇄ DungeonScene`. (high confidence — verified by parsing `larus.json` object layers directly.)

5. **Death handling is broken everywhere.** `GameOverScene` is `launch`ed from `NeverquestBattleManager.ts:766` (the generic player-death path), `SkyIslandsScene.ts:507`, `VolcanicDungeonsScene.ts:312`, `UnderwaterTempleScene.ts:463` — but `GameOverScene` is commented out of the registry at `index.ts:132`. Launching an unregistered scene key is a no-op/error in Phaser, so the player never sees a game-over screen and the death flow stalls. (high confidence.)

6. **No win / chapter-complete path exists.** No scene contains a victory/chapter-end transition. The only terminal transitions found are: back-to-`previousScene` exits, the broken `GameOverScene`, and `GameOverScene → MainMenuScene` (`GameOverScene.ts:295`) which is itself unreachable. There is no "you finished Chapter 1" state. (high confidence — grep of all `scene.start` targets yields no victory/credits/ending scene.)

7. **Biome exits dump into the dead hub.** All elemental biomes default `previousScene = 'CrossroadsScene'` (e.g. `IceCavernsScene.ts:79`, `VolcanicDungeonsScene.ts:83`, `SkyIslandsScene.ts:97`) and their exit portals call `scene.start(this.previousScene)` (`IceCavernsScene.ts:565`, etc.). So even if a biome were reachable, exiting it would try to start the dead `CrossroadsScene`. `UnderwaterTempleScene` is worse: its default is `previousScene='TownScene'` (`UnderwaterTempleScene.ts:96`), and `TownScene` is unregistered. (high confidence.)

8. **Dangling scene references that will error if hit.** `JoystickScene` (unregistered) is `scene.get`'d in MainScene/Crossroads/Cave (returns null) and `launch`ed in `SurvivalModeScene.ts:372`; `SettingScene` is `launch`ed from `HUDScene.ts:388`; `VideoPlayerScene` from `NeverquestVideoOpener.ts:61`. These point at commented-out scenes. (medium-high confidence — references confirmed; runtime failure inferred from Phaser semantics, not executed.)

---

## Boot & Control Handoff (how the player actually starts playing)

Verified chain (all high confidence, each edge cited above):
`PreloadScene` (loads assets, web fonts) → `IntroScene` (tween sequence) → `MainMenuScene` (New Game button) → `MainScene`.

In `MainScene.create()` the player becomes controllable: `NeverquestMapCreator` builds the `larus` tilemap (`MainScene.ts:99-103`), the camera follows `this.player.container` (`MainScene.ts:106`), warps are wired from the Tiled map (`MainScene.ts:111-112`), and `DialogScene`+`HUDScene` are launched (`MainScene.ts:116,124`). Player spawn comes from the map's `spawn` object layer (the `larus` map has a 1-object `spawn` layer). Control is keyboard/mouse via `NeverquestKeyboardMouseController`; the gamepad/`JoystickScene` path is dead (unregistered), so touch/gamepad onboarding is effectively absent. (`Load Game` reads `saveData.scene` and starts it — `MainMenuScene.ts:320` / `NeverquestSaveManager.ts:435` — but since only MainScene/DungeonScene are reachable, only those keys can ever be saved.)

---

## Confidence Summary

| Claim | Confidence | How verified |
|---|---|---|
| Boot chain Preload→Intro→Menu→MainScene | High | Direct `scene.start` citations at each hop |
| Playable loop = MainScene ⇄ DungeonScene | High | `larus.json` warp parsed + `NeverquestWarp.ts:199` + DungeonScene return |
| Crossroads is dead (only entry = commented OverworldScene) | High | Exhaustive grep; confirms planner claim |
| 4/5 elemental biomes orphaned (0 reachable) | High | Grep returns no `.start` for Volcanic/Sky/Underwater; Ice only from dead hub |
| MainScene exit is DungeonScene, NOT (only) UpsideDown | High — **refutes planner** | Parsed `larus.json` object layers |
| GameOver / death flow broken | High | 4 launch sites + commented registration |
| No win / chapter-end path | High | No victory transition in any scene |
| Dangling Joystick/Setting/VideoPlayer refs error at runtime | Medium-high | Refs confirmed statically; runtime failure inferred |
