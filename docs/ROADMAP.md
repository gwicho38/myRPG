# Neverquest - Feature Roadmap & Development Plan

**Version:** 0.3.0 Planning
**Date:** 2025-10-09
**Status:** Draft

---

## Executive Summary

Neverquest is evolving from a basic dungeon crawler into a feature-rich action RPG with multiple biomes, intelligent AI, atmospheric effects, and roguelike progression. This roadmap outlines features, improvements, and a structured plan for the next major releases.

---

## Current State (v0.2.0)

### Implemented Features ✅
- Procedural dungeon generation with room-based layouts
- Combat system with animations and damage calculations
- Save/load system with checkpoints
- Inventory and equipment management
- Enemy zones with random encounters
- Terminal edition with ASCII graphics
- Debug system with comprehensive logging
- Message log for game events
- Multiple scenes (MainScene, TownScene, CaveScene, OverworldScene, DungeonScene)
- **Minimap system** (bottom-left viewport)

### Known Issues 🐛
- Minimap rendering not displaying tiles (only player marker)
- Exit portals visibility needs improvement
- Performance optimization needed for particle effects
- Test coverage incomplete for newer features

---

## Version 0.3.0 - "Intelligence & Atmosphere" (Q1 2026)

### Priority 1: AI & Pathfinding 🧠

#### A. Intelligent Enemy Movement
**Inspiration:** EasyStarJS example, Vampire Survivors mechanics

**Features:**
- Integrate `easystarjs` library for A* pathfinding
- Enemy AI modes:
  - **Chase:** Smart pathfinding around obstacles when player detected
  - **Patrol:** Predefined patrol routes in rooms
  - **Wander:** Random exploration when idle
  - **Flee:** Escape behavior when low health
  - **Group:** Pack behavior for wolf/goblin groups

**Implementation:**
```typescript
// /src/plugins/NeverquestPathfinding.ts
export class NeverquestPathfinding {
    easystar: EasyStar.js;

    findPath(startX: number, startY: number, endX: number, endY: number): Promise<Path> {
        // Convert tilemap to grid
        // Set walkable tiles
        // Calculate path
    }
}
```

**Files to create:**
- `src/plugins/NeverquestPathfinding.ts`
- `src/plugins/ai/EnemyBehaviors.ts`
- `src/__tests__/plugins/NeverquestPathfinding.test.ts`

**Effort:** 3-4 days

---

#### B. Line-of-Sight System
**Inspiration:** Horror Ray Casting example

**Features:**
- Vision cones for enemies (180° forward arc)
- Occlusion detection (walls block vision)
- Detection states: Unaware → Suspicious → Alert
- Stealth mechanics (hide behind objects)
- Ranged weapon line-of-sight validation

**Use Cases:**
- Stealth gameplay
- Strategic positioning in combat
- Archery mechanics
- Enemy alerting behavior

**Files to create:**
- `src/plugins/NeverquestLineOfSight.ts`
- `src/utils/VisibilityPolygon.ts` (adapt from examples)

**Effort:** 2-3 days

---

### Priority 2: Atmospheric Lighting 🔦

#### Dynamic Lighting System
**Inspiration:** Lighting example from Phaser examples

**Features:**
- Radial gradient lighting following player
- Torch/lantern equipment system
- Light radius based on equipment:
  - No torch: 3 tiles visibility
  - Basic torch: 5 tiles
  - Enchanted lantern: 8 tiles
  - Magical light spells: 10+ tiles
- Flickering effect for atmosphere
- Dark dungeons require light sources
- Day/night cycle in overworld

**Technical Approach:**
```typescript
// /src/plugins/NeverquestLighting.ts
export class NeverquestLighting {
    lightRadius: number = 100;

    create() {
        // Create darkness overlay (black rectangle)
        // Create radial gradient light
        // Set MULTIPLY blend mode
    }

    update() {
        // Follow player position
        // Apply flicker
    }
}
```

**Integration:**
- Add to all game scenes
- Equipment affects light radius
- Consumable torches (burn duration)

**Files to create:**
- `src/plugins/NeverquestLighting.ts`
- `src/items/LightSources.ts`

**Effort:** 2 days

---

### Priority 3: Enhanced Visual Effects ✨

#### Advanced Particle System
**Inspiration:** Particle Storm example

**Spell Effects:**
- **Fireball:** Orange/red particles with explosive burst
- **Ice Shard:** Blue particles with freezing trail
- **Lightning:** Electric arc with branching effect
- **Poison Cloud:** Green mist area-of-effect
- **Healing:** Golden sparkles rising upward

**Combat Effects:**
- Impact particles on hit (color-coded by damage type)
- Critical hit bursts
- Block/parry sparks
- Death animations (fade + particle explosion)
- Blood/damage indicators

**Environmental:**
- Rain in overworld
- Snow in ice caves
- Lava bubbles in volcano dungeons
- Water splashes
- Torch flames

**Files to create:**
- `src/plugins/effects/SpellEffects.ts`
- `src/plugins/effects/CombatEffects.ts`
- `src/consts/ParticleConfigs.ts`

**Effort:** 3 days

---

### Priority 4: Vampire Survivors Mode 🧛

#### Horde Mode Arena
**Inspiration:** Vampire Survivors prototype

**Features:**
- Separate game mode: "Survival Arena"
- Wave-based enemy spawning (increasing difficulty)
- Auto-targeting ranged attacks
- Magnet radius for XP/loot collection
- Timer-based progression
- Leaderboards

**Mechanics:**
- Enemies spawn off-screen in increasing numbers
- Player gains XP from kills
- Level up = choose upgrade (3 random options)
- Survive as long as possible

**Upgrades:**
- Attack speed increase
- Damage boost
- Additional projectiles
- Area-of-effect attacks
- Movement speed
- Health regeneration
- Magnetic radius expansion

**Files to create:**
- `src/scenes/SurvivalArenaScene.ts`
- `src/plugins/WaveSpawner.ts`
- `src/plugins/AutoTargeting.ts`
- `src/plugins/UpgradeSystem.ts`

**Effort:** 4-5 days

---

## Version 0.4.0 - "World Building" (Q2 2026)

### New Biomes & Maps 🗺️

#### 1. Forest Region (Starting Area)
**Existing:** OverworldScene with basic forest

**Enhancements:**
- Dense forest areas with limited visibility
- Forest enemies: Wolves, Bears, Bandits
- Hidden clearings with treasure
- Wandering merchant encounters
- Forest shrine (healing station)

**Tilesets:**
- Multiple tree variations
- Undergrowth and bushes
- Forest paths
- Rock formations
- Forest creatures

---

#### 2. Ice Caverns
**New Biome:** Frozen underground complex

**Features:**
- Slippery ice tiles (reduce friction)
- Frozen enemies (ice elementals, frost spiders)
- Ice puzzles (melt ice blocks with fire spells)
- Frozen treasure chests
- Ice boss: Frost Giant

**Hazards:**
- Ice patches (lose control)
- Falling icicles
- Freezing water pools (damage over time)

**Loot:**
- Frost weapons (+ice damage)
- Cold resistance potions
- Ice shards (crafting material)

---

#### 3. Volcanic Dungeons
**New Biome:** Lava-filled underground

**Features:**
- Lava rivers (instant death)
- Fire enemies (fire elementals, lava golems)
- Heat damage in certain areas
- Obsidian walls
- Volcano boss: Fire Dragon

**Hazards:**
- Lava pools
- Erupting geysers
- Collapsing bridges
- Burning floors

**Loot:**
- Fire weapons (+fire damage)
- Heat resistance armor
- Molten cores (crafting)

---

#### 4. Underwater Temple
**New Biome:** Submerged ruins

**Features:**
- Swimming mechanics (slower movement)
- Water enemies (sharks, water elementals)
- Air bubble checkpoints
- Underwater visibility (darker)
- Temple boss: Leviathan

**Mechanics:**
- Air meter (need to surface periodically)
- Water currents (push player)
- Treasure in deep areas

---

#### 5. Sky Islands
**New Biome:** Floating platforms

**Features:**
- Platform jumping
- Wind currents (push player)
- Flying enemies (harpies, wind elementals)
- Teleportation pads between islands
- Sky boss: Storm Phoenix

**Hazards:**
- Falling off edges (respawn at last checkpoint)
- Lightning strikes
- Strong winds

---

#### 6. Undead Crypts
**New Biome:** Ancient burial grounds

**Features:**
- Undead enemies (zombies, skeletons, ghosts)
- Puzzle-based progression (lever combinations)
- Cursed areas (debuffs)
- Holy weapons effective here
- Crypt boss: Lich King

**Atmosphere:**
- Dark (requires torches)
- Eerie ambient sounds
- Fog effects

---

### Level Progression System

#### World Map Structure
```
Village (Hub) → Forest → Cave → Town → Desert → Ice Caverns → Volcano
                  ↓                             ↓
              Secret Forest Shrine          Sky Islands
                                                ↓
                                        Underwater Temple → Undead Crypts → Final Boss
```

#### Unlock Requirements
- **Forest:** Start here (level 1-5)
- **Cave:** Complete forest dungeon (level 5-10)
- **Town:** Reach level 10
- **Desert:** Complete cave boss (level 10-15)
- **Ice Caverns:** Complete desert trial (level 15-20)
- **Volcano:** Find fire key in ice caverns (level 20-25)
- **Sky Islands:** Complete volcano boss (level 25-30)
- **Underwater Temple:** Hidden entrance in town (level 25-30)
- **Undead Crypts:** Collect 4 ancient seals from other dungeons (level 30-35)
- **Final Boss:** Complete all biomes (level 35+)

#### Difficulty Scaling
- Enemy stats scale with player level
- Each biome has base difficulty level
- Optional "Nightmare Mode" (2x enemy stats, better loot)

---

### Quest & Progression System 📜

**Inspiration:** Level Selection with Stars example

#### Quest Types

**Main Quests:**
- Story-driven progression
- Unlock new areas
- Boss encounters
- Rewarded with key items

**Side Quests:**
- NPC requests
- Fetch quests
- Monster hunting
- Optional rewards

**Daily Quests:**
- Kill X enemies
- Collect Y items
- Complete dungeon run
- Randomized each day

**Achievements:**
- Kill 100 enemies
- Find all secret areas
- Complete game without dying
- Collect all legendary items

#### Quest UI
- Quest log with progress tracking
- Star ratings (1-3 stars based on performance)
- Completion time tracking
- Optional objectives (bonus stars)

**Files to create:**
- `src/plugins/NeverquestQuestSystem.ts`
- `src/data/quests/MainQuests.ts`
- `src/data/quests/SideQuests.ts`
- `src/scenes/QuestLogScene.ts`

---

## Version 0.5.0 - "Polish & Systems" (Q3 2026)

### Enhanced UI/UX 🎨

#### Character Selection Screen
**Inspiration:** Character Selection example

**Features:**
- Scrollable character roster
- Class previews (Warrior, Mage, Rogue, Ranger)
- Starting stats display
- Character customization (name, appearance)
- Physics-based scrolling with inertia

**Classes:**
- **Warrior:** High HP, melee focused
- **Mage:** Low HP, powerful spells
- **Rogue:** Medium HP, stealth and critical hits
- **Ranger:** Medium HP, ranged attacks

---

#### Improved Inventory
**Inspiration:** Draggable with Inertia example

**Features:**
- Grid-based layout with smooth scrolling
- Drag-and-drop equipment
- Item comparison tooltips
- Sorting options (type, rarity, level)
- Quick equip hotkeys
- Physics-based momentum

---

#### Skill Tree
**New Feature:** Talent progression system

**Structure:**
- Three branches per class
- 20 nodes per branch
- Unlock with skill points (gained per level)
- Reset option (for gold cost)

**Example (Warrior):**
- **Defense Tree:** +armor, block chance, damage reduction
- **Offense Tree:** +damage, critical chance, attack speed
- **Utility Tree:** +movement speed, health regen, stamina

---

### Crafting & Economy 💰

#### Crafting System
**New Feature:** Item creation

**Mechanics:**
- Collect materials from enemies/chests
- Recipes found in world
- Crafting stations in town
- Upgrade existing items
- Enchantments

**Recipes:**
- Potion brewing (health, mana, buffs)
- Weapon forging (combine materials)
- Armor crafting
- Enchantment scrolls

---

#### Economy
**Currency:** Gold

**Sources:**
- Enemy drops
- Chest loot
- Quest rewards
- Selling items

**Sinks:**
- Merchant purchases
- Repairs
- Skill resets
- Teleportation fees
- Resurrections

---

### Multiplayer Foundation (Optional) 🌐

#### Co-op Mode
**Technical:** Socket.io or Colyseus

**Features:**
- 2-4 player co-op
- Shared world state
- Loot distribution
- Friendly fire toggle
- Party chat

**Considerations:**
- Server architecture
- Synchronization challenges
- Testing complexity

**Effort:** 2-3 weeks (large undertaking)

---

## Technical Improvements 🔧

### Performance Optimizations

#### Object Pooling
**Inspiration:** Bulletpool example

**Targets:**
- Enemies (reuse instead of destroy/create)
- Projectiles (bullets, arrows, spells)
- Particles
- UI elements

**Expected Gains:**
- Reduced garbage collection
- Smoother frame rate
- Lower memory usage

---

#### Minimap Fix (URGENT)
**Current Issue:** Tiles not rendering, only player marker

**Investigation needed:**
- Check layer iteration
- Verify tile retrieval
- Test with console logging (dev build)
- Validate RenderTexture.fill() calls

**Deadline:** Next sprint (before v0.3.0)

---

### Code Quality

#### Test Coverage Goals
- Unit tests: 85%+ coverage
- Integration tests for all critical systems
- E2E tests for main user flows
- Performance benchmarks

**Focus Areas:**
- Pathfinding algorithms
- Combat calculations
- Save/load integrity
- UI interactions

---

#### Documentation
- API documentation (JSDoc/TSDoc)
- Architecture diagrams
- Contributing guidelines
- Code style guide

---

## Release Timeline

| Version | Target Date | Theme | Key Features |
|---------|------------|-------|--------------|
| **0.2.0** | ✅ Complete | Terminal Edition | ASCII game, Minimap |
| **0.3.0** | Q1 2026 | Intelligence & Atmosphere | Pathfinding AI, Lighting, Enhanced VFX, Survival Mode |
| **0.4.0** | Q2 2026 | World Building | 6 new biomes, Quest system, Level progression |
| **0.5.0** | Q3 2026 | Polish & Systems | UI improvements, Crafting, Economy, Skill trees |
| **0.6.0** | Q4 2026 | Multiplayer (Optional) | Co-op mode, Server infrastructure |
| **1.0.0** | Q1 2027 | Launch | Final polish, Balancing, Full release |

---

## Priority Matrix

### Must Have (v0.3.0)
1. ✅ **Pathfinding AI** - Critical gameplay improvement
2. ✅ **Lighting System** - Core atmosphere feature
3. ✅ **Minimap Fix** - Bug affecting current release
4. ✅ **Enhanced Particles** - Visual polish

### Should Have (v0.4.0)
1. New biomes (at least 3)
2. Quest system
3. Level progression unlocks
4. Improved enemy variety

### Could Have (v0.5.0)
1. Character selection
2. Crafting system
3. Skill trees
4. Economy rebalancing

### Won't Have (Initially)
1. Multiplayer (defer to v0.6.0 or post-1.0)
2. Mobile support
3. Mod support
4. Speedrun timer

---

## Success Metrics

### Technical
- 60 FPS maintained on mid-range hardware
- Load times < 3 seconds
- Zero crash reports
- Test coverage > 85%

### Gameplay
- Average session length > 30 minutes
- Player retention > 60% (return next day)
- Boss encounter completion rate > 40%
- Positive feedback on AI behavior

### Content
- 6+ distinct biomes
- 50+ enemy types
- 100+ items
- 30+ quests
- 10+ bosses

---

## Risk Assessment

### High Risk
- **Pathfinding Performance:** A* can be expensive with many enemies
  - *Mitigation:* Path caching, update throttling, spatial partitioning
- **Multiplayer Complexity:** Significant technical challenge
  - *Mitigation:* Defer to later release, extensive testing

### Medium Risk
- **Scope Creep:** Feature list is ambitious
  - *Mitigation:* Strict prioritization, incremental releases
- **Asset Creation:** Need many sprites/tilesets
  - *Mitigation:* Use free asset packs, procedural generation

### Low Risk
- **Browser Compatibility:** Phaser has good support
- **Save System:** Already implemented successfully

---

## Resources & References

### External Codebases Analyzed
1. **Vampire Survivors Prototype** (emanueleferonato.com)
   - Horde mode mechanics
   - Auto-targeting system
   - Enemy spawning patterns

2. **Phaser Examples Repository** (jojoee.github.io)
   - 73+ game examples reviewed
   - Pathfinding, lighting, particles
   - UI patterns and techniques

3. **Rope Mesh Physics** (reitgames.com)
   - MatterJS integration
   - Advanced physics simulations
   - Visual effects techniques

### Libraries to Integrate
- `easystarjs` - A* pathfinding
- `visibility-polygon` - Line-of-sight calculations
- `matter-js` - Advanced physics (already in Phaser)

### Asset Resources
- OpenGameArt.org
- itch.io (free game assets)
- Kenney.nl (public domain assets)

---

## Next Steps

### Immediate Actions (Week 1)
1. ✅ Fix minimap rendering bug
2. ✅ Install and test easystarjs
3. ✅ Create NeverquestPathfinding plugin stub
4. ✅ Write tests for pathfinding

### Short Term (Weeks 2-4)
1. Implement basic A* pathfinding
2. Integrate with enemy AI
3. Add lighting system
4. Test performance with 50+ enemies

### Medium Term (Months 2-3)
1. Create 2-3 new biomes
2. Implement quest system foundation
3. Enhanced particle effects
4. Survival mode prototype

---

## Conclusion

Neverquest has a solid foundation with procedural generation, combat, and save systems. The roadmap focuses on:

1. **Intelligence** - Smarter AI creates engaging combat
2. **Atmosphere** - Lighting and effects enhance immersion
3. **Content** - New biomes and quests provide variety
4. **Polish** - UI improvements and systems refinement

By following this phased approach, the game will evolve from a dungeon crawler prototype into a feature-rich action RPG with lasting player engagement.

---

**Prepared by:** Claude Code AI Assistant
**Last Updated:** 2025-10-09
**Status:** Living document - update quarterly
