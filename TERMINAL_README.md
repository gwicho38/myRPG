# Luminus RPG - Terminal Edition

A text-based version of Luminus RPG that runs in modern terminal emulators like Kitty, Ghostty, iTerm2, and more!

## Features

- **ULTRA-VISIBLE player character** - **🧙‍♂️ Wizard emoji** in yellow **[brackets]** on bright RED background - impossible to miss!
- **Optimized graphics** using simple ASCII for tiles (. for floors, █ for walls) and emoji for characters
- **Full game mechanics** including movement, combat, and exploration
- **Roguelike dungeon** generation with varied enemies and treasures
- **Real-time HUD** displaying player stats, health bars, and experience bars
- **Event log** showing combat results and game actions with emoji indicators
- **Mouse support** for scrolling through logs
- **Visual effects** including health bars, damage indicators, and victory notifications

## Requirements

- Node.js (v16 or higher recommended)
- A modern terminal emulator that supports:
    - Unicode characters
    - ANSI color codes
    - Terminal escape sequences
    - Mouse input (optional)

### Recommended Terminal Emulators

- **Kitty** - Full support for all features
- **Ghostty** - Full support for all features
- **iTerm2** (macOS) - Full support
- **Alacritty** - Full support
- **Windows Terminal** - Full support
- **Warp** - Full support

## Installation

```bash
# Install dependencies
npm install

# Verify installation
tsx terminal-test.ts
```

## Running the Game

```bash
# Start the terminal version
npm run terminal

# Start with debug mode
npm run terminal:debug
```

## Controls

| Key                        | Action                |
| -------------------------- | --------------------- |
| **Arrow Keys** or **WASD** | Move player           |
| **Space**                  | Attack adjacent enemy |
| **H**                      | Show help             |
| **Q** or **Escape**        | Quit game             |

## Game Elements

### Map Symbols

- **[🧙‍♂️]** - **YOUR PLAYER** (wizard in **yellow [brackets]** on **RED BACKGROUND** - you literally can't miss it!)
- █ - Walls (simple grey blocks)
- . - Floor/walkable area (simple dots for minimal visual clutter)
- 🚪 - Doors
- ≈ - Water
- 💎 - Treasure
- 🔥 - Torches
- 🌿 - Grass

### Enemies

- 🐀 - Rat - 20 HP, 3 ATK
- 🦇 - Bat - 15 HP, 5 ATK
- 👹 - Ogre - 50 HP, 8 ATK
- 👺 - Goblin - 25 HP, 6 ATK
- 👻 - Ghost - 30 HP, 7 ATK
- 🐉 - Dragon - 100 HP, 15 ATK

## HUD Layout

The terminal UI is divided into three main sections:

```
┌─────────────────────┬──────────┐
│                     │          │
│     Game View       │  Status  │
│                     │   Panel  │
│                     │          │
├─────────────────────┴──────────┤
│         Event Log               │
└─────────────────────────────────┘
```

### Game View (Left Panel)

- Shows the dungeon map centered on your character
- Displays enemies and interactive objects
- Updates in real-time as you move

### Status Panel (Right Panel)

- Player HP (Health Points)
- Player Level and Experience
- Character attributes (STR, AGI, VIT, DEX, INT)
- Attack and Defense stats
- Enemy count
- Current position coordinates

### Event Log (Bottom Panel)

- Game messages and combat results
- Scrollable history (up to 100 messages)
- Color-coded messages for different event types

## Architecture

The terminal version shares core game logic with the web version but uses a completely different rendering system:

### Key Components

- **TerminalRenderer** (`src/terminal/TerminalRenderer.ts`)
    - Manages the blessed screen and UI layout
    - Handles rendering of game view, status, and logs

- **TerminalGame** (`src/terminal/TerminalGame.ts`)
    - Main game loop and logic
    - Input handling
    - Combat and movement system

- **TerminalMap** (`src/terminal/TerminalMap.ts`)
    - Dungeon generation and rendering
    - Tile-based map system
    - Entity positioning

- **TerminalEntity** (`src/terminal/entities/TerminalEntity.ts`)
    - Shared entity logic compatible with web version
    - Character representation for terminal display

## Development

### Adding New Features

1. **New Enemy Types**: Add to `enemyTypes` array in `TerminalGame.ts`
2. **New Tiles**: Update `TILE_SYMBOLS` and `TILE_COLORS` in `TerminalMap.ts`
3. **Custom Dungeons**: Modify `generateDungeon()` method in `TerminalMap.ts`

### Debug Mode

Run with debug mode to see additional information:

```bash
npm run terminal:debug
```

This adds a debug panel showing:

- Frame rate information
- Entity positions
- Game state details

## Troubleshooting

### Game doesn't start

- Ensure your terminal supports Unicode and ANSI colors
- Try a different terminal emulator
- Check Node.js version: `node --version` (should be v16+)

### Visual glitches

- Resize your terminal window to at least 100x40 characters
- Enable true color support in your terminal settings
- Try disabling any terminal multiplexers (tmux/screen)

### Input not working

- Make sure your terminal has focus
- Some terminals may require enabling mouse support in settings
- Try keyboard-only controls (WASD instead of arrow keys)

## Terminal-Specific Limitations

Compared to the web version:

- **Graphics**: ASCII/Unicode characters instead of sprites
- **Animation**: Limited to text-based effects
- **Sound**: No audio support in terminal version
- **Performance**: Depends on terminal emulator capabilities

## Future Enhancements

- [ ] Color customization and themes
- [ ] Save/Load game state
- [ ] Multiplayer via terminal sharing
- [ ] Integration with existing game saves from web version
- [ ] More complex dungeon layouts
- [ ] Quest and dialogue system

## License

Same as the main Luminus RPG project - MIT License

---

**Enjoy your terminal adventure!** 🎮⌨️
