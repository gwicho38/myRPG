# Research Brief: Neverquest — Coherent Playable One-Chapter Game

**Date:** 2026-06-02
**Research type:** Mixed (technical + requirements + design)
**Status:** Phase 1, Step 1 (Initialize) complete

---

## Research Question

> "Continue building Neverquest into a coherent game with a one-chapter story — build out the open world and overall make it playable."

Decomposed into sub-questions:

1. **Technical (current state):** What game systems already exist (scenes, story flags, quests, NPCs, world/map, progression, save), how are they wired into the boot/game loop, and which are functional vs. orphaned/stubbed?
2. **Requirements (target state):** What does a "coherent, playable, one-chapter" build minimally require — onboarding, a narrative spine, connected open world, win/lose conditions, progression, and a satisfying core loop?
3. **Design (path):** How should the story/quest system, world/scene connectivity (open world), and chapter structure be architected to tie existing systems into one coherent playthrough, reusing what exists?

---

## Scope

### Included
- Inventory of existing gameplay systems: scenes, `NeverquestStoryFlags`, `QuestLogScene`, `NeverquestNPCManager`, `NeverquestSaveManager`, `NeverquestWarp`, `NeverquestMapCreator`, `CrossroadsScene` (story hub), biome scenes, combat, progression/XP.
- The actual runtime flow: boot → intro → main → menu → biomes; how the player moves between areas (warps), and where flow breaks.
- Gap analysis: current state vs. "coherent playable one-chapter game."
- Recommended Chapter 1 scope: which existing biomes/scenes, narrative beats, quest chain, and world connectivity to ship.
- Architecture/design for: story/quest progression, open-world scene connectivity, chapter start→end structure, save/checkpoint integration.

### Excluded
- Multiplayer / co-op (roadmap v0.6+).
- Terminal/ASCII edition (web build is the playable target).
- Net-new biomes beyond what Chapter 1 needs (reuse existing scaffolded biomes).
- New art/asset production pipeline (reuse existing assets).
- Crafting, economy, skill trees (roadmap v0.5) — only if minimally required for coherence.
- Deep performance optimization (separate concern unless it blocks playability).

### Constraints
- Stack: Phaser 3 + TypeScript, Jest tests, Webpack. Must follow repo `CLAUDE.md` conventions.
- Reuse existing plugins/scenes/entities; prefer editing over creating new files.
- State ownership rules: overlap callbacks = UI only; each system owns its flags; event-driven where possible.
- Constants in `src/consts/`; types in `src/types/`; no hardcoded strings.
- Tests required for new functionality; CI must pass (local `act` gate for this private repo).

---

## Success Criteria

1. **Current-state map**: evidence-based inventory of which systems exist, are wired, and are functional vs. orphaned (with `file:line` citations).
2. **Coherence gap list**: concrete gaps between current state and a playable one-chapter game, prioritized.
3. **Chapter 1 definition**: a recommended, scoped narrative + world layout using existing assets (start point, beats, quest chain, areas, climax/end).
4. **Design blueprint**: high-level architecture for story/quest/world-progression wiring, with decision log, ready to feed `/maister:development`.

---

## Methodology (to be refined in Step 2 by research-planner)

Mixed methodology: codebase analysis (iterative deepening) for current state + requirements synthesis for the target + literature (action-RPG chapter/quest design patterns) for the design, then cross-referenced synthesis.
