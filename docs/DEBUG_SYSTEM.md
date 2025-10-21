# Neverquest Debug System

This document describes the comprehensive debugging and development utilities available in Neverquest. These tools are designed to make it easy to understand the game state, debug issues, and develop new features efficiently.

## Quick Start

### For Developers

1. **Start the dev server**: `make dev` or `npm run dev`
2. **Open the game**: Browser automatically opens to `http://localhost:8080`
3. **Open browser console**: Press F12
4. **Access debug tools**: Type `neverquestDebug.help()` or press F9

### For Claude/AI Assistance

When you need to share your game state with Claude for debugging or feature development:

1. Press **F9** to download a complete debug dump
2. Share the JSON file with Claude
3. Or use **F10** for a quick console dump and copy/paste the output

## Debug Helper (`neverquestDebug`)

The Debug Helper provides comprehensive game state information and development utilities.

### Keyboard Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| **F9** | Full Debug Dump & Download | Creates a complete game state dump and downloads it as JSON |
| **F10** | Quick Console Dump | Prints a formatted summary to the browser console |
| **F11** | Toggle Performance Overlay | Shows/hides FPS and performance metrics (if available) |

### Console Commands

All commands are available via `window.neverquestDebug` or just `neverquestDebug`:

#### Information Commands

```javascript
// Get help
neverquestDebug.help()

// Get full state dump object
const state = neverquestDebug.dump()

// Print formatted dump to console
neverquestDebug.quickDump()

// List active scenes
neverquestDebug.scenes()
// Example output: ["PreloadScene", "MainScene", "HUDScene"]

// Get player information
neverquestDebug.player()
// Example output: { position: {x: 400, y: 300}, health: 100, level: 5, ... }

// Get enemy information
neverquestDebug.enemies()
// Example output: [{ id: "enemy_0", position: {x: 500, y: 400}, health: 50, ... }]
```

#### Export Commands

```javascript
// Download dump as JSON file
neverquestDebug.download()

// Copy dump to clipboard
neverquestDebug.copy()
```

#### Development/Cheat Commands

```javascript
// Teleport player to position
neverquestDebug.teleport(400, 300)

// Set player health
neverquestDebug.setHealth(100)

// Give item to player (when implemented)
neverquestDebug.giveItem("potion", 5)
```

## Logger (`neverquest`)

The Logger provides structured logging with categories and log levels.

### Console Commands

```javascript
// Get help
neverquest.log  // Access the logger instance

// Set log level (ERROR, WARN, INFO, DEBUG, TRACE)
neverquest.setLogLevel('debug')
neverquest.setLogLevel('trace')

// Enable/disable specific categories
neverquest.enableCategory('Battle')
neverquest.disableCategory('Animation')

// Show all logging categories
neverquest.showCategories()

// Export logs as file
neverquest.exportLogs()

// Clear log buffer
neverquest.clearLogs()

// Show memory usage
neverquest.showMemory()
```

### Log Categories

The following categories are available for filtering logs:

- `System` - Core system events
- `Scene` - Scene lifecycle and transitions
- `Player` - Player actions and state changes
- `Enemy` - Enemy AI and behavior
- `Battle` - Combat and damage calculations
- `Inventory` - Item management
- `Dialog` - Dialog system
- `SaveGame` - Save/load operations
- `Input` - Keyboard/mouse/gamepad input
- `Animation` - Animation events
- `Audio` - Sound and music
- `Network` - Network operations (if applicable)
- `Performance` - Performance metrics
- `Error` - Error events

### Usage in Code

```typescript
import { logger, GameLogCategory } from './utils/Logger';

// Log at different levels
logger.info(GameLogCategory.PLAYER, 'Player moved to new position', { x: 100, y: 200 });
logger.warn(GameLogCategory.BATTLE, 'Low health warning', { health: 10 });
logger.error(GameLogCategory.SYSTEM, 'Failed to load scene', { sceneName: 'MainScene' });
logger.debug(GameLogCategory.ANIMATION, 'Animation frame updated', { frame: 5 });

// Performance timing
const endTimer = logger.startTimer('LoadAssets');
// ... do work ...
endTimer(); // Logs: "LoadAssets took 123.45ms"

// Memory usage
logger.logMemoryUsage();
```

## Debug Dump Structure

The debug dump JSON contains the following sections:

### Metadata
```json
{
  "metadata": {
    "timestamp": "2025-10-02T14:30:00.000Z",
    "version": "0.1.1",
    "userAgent": "Mozilla/5.0...",
    "viewport": { "width": 1920, "height": 1080 },
    "performance": {
      "memory": {
        "usedJSHeapSize": "45.23 MB",
        "totalJSHeapSize": "60.00 MB",
        "limit": "2048.00 MB"
      },
      "fps": 60,
      "frameTime": 16.67
    }
  }
}
```

### Phaser Information
```json
{
  "phaser": {
    "version": "3.80.1",
    "config": { /* Phaser game config */ },
    "stats": {
      "fps": 60,
      "delta": 16
    }
  }
}
```

### Scenes
```json
{
  "scenes": [
    {
      "key": "MainScene",
      "isActive": true,
      "isVisible": true,
      "isSleeping": false,
      "gameObjectCount": 42,
      "pluginCount": 8,
      "plugins": ["NeverquestMovement", "NeverquestBattleManager", ...],
      "children": 42
    }
  ]
}
```

### Player
```json
{
  "player": {
    "position": { "x": 400, "y": 300 },
    "attributes": { "strength": 10, "defense": 5, ... },
    "inventory": 5,
    "speed": 200,
    "isSwimming": false,
    "isRunning": false,
    "canMove": true,
    "canAtack": true,
    "health": 100,
    "maxHealth": 100,
    "level": 5
  }
}
```

### Enemies
```json
{
  "enemies": [
    {
      "id": "enemy_0",
      "position": { "x": 500, "y": 400 },
      "health": 50,
      "entityName": "Goblin",
      "isActive": true
    }
  ]
}
```

### Errors and Logs
```json
{
  "errors": [
    {
      "timestamp": "2025-10-02T14:29:58.000Z",
      "message": "TypeError: Cannot read property...",
      "stack": "Error\n    at ...",
      "data": { /* error context */ }
    }
  ],
  "logs": [
    {
      "timestamp": "2025-10-02T14:30:00.000Z",
      "level": 2,
      "category": "Player",
      "message": "Player moved",
      "data": { "x": 400, "y": 300 }
    }
  ]
}
```

## Using Debug Dumps with Claude

When working with Claude on bug fixes or new features:

1. **Reproduce the issue** in the game
2. **Press F9** to create a debug dump
3. **Share the JSON file** with Claude along with:
   - Description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
4. Claude can then analyze the complete game state and provide targeted fixes

### Example Session

```
User: "The player is taking damage even when not in combat. Here's my debug dump..."

Claude: Looking at your debug dump:
- Player position: {x: 400, y: 300}
- Active scenes: ["MainScene", "HUDScene"]
- Enemies: 0 active enemies
- Recent errors show NeverquestBattleManager.takeDamage() being called

The issue appears to be in NeverquestBattleManager.ts:257 where...
```

## Development Workflow

### Feature Development

1. **Start dev server**: `make dev`
2. **Enable debug logging**: `neverquest.setLogLevel('debug')`
3. **Enable specific categories**: `neverquest.enableCategory('Battle')`
4. **Implement feature**
5. **Test and dump state**: Press F10 to verify
6. **Export logs if needed**: `neverquest.exportLogs()`

### Bug Fixing

1. **Reproduce the bug**
2. **Capture state**: Press F9
3. **Check recent errors**: Look at `errors` array in dump
4. **Check logs**: Look at `logs` array for relevant category
5. **Identify root cause** from state dump
6. **Implement fix**
7. **Verify**: Press F10 to confirm fix

### Performance Optimization

1. **Enable memory logging**: `neverquest.showMemory()`
2. **Monitor FPS**: Check `metadata.performance.fps` in dumps
3. **Profile specific operations**:
```typescript
const endTimer = logger.startTimer('ExpensiveOperation');
expensiveOperation();
endTimer();
```
4. **Compare dumps** before and after optimizations

## Configuration

### Changing Log Level

In browser console:
```javascript
neverquest.setLogLevel('trace')  // Most verbose
neverquest.setLogLevel('debug')
neverquest.setLogLevel('info')   // Default
neverquest.setLogLevel('warn')
neverquest.setLogLevel('error')  // Least verbose
```

Log levels are persisted in localStorage.

### Filtering Log Categories

```javascript
// Disable all except specific categories
neverquest.disableCategory('*')
neverquest.enableCategory('Battle')
neverquest.enableCategory('Player')

// Re-enable all
neverquest.enableCategory('*')
```

## Production Considerations

- Debug utilities are automatically disabled in production builds
- Console commands are not available in production
- Only ERROR and WARN logs are sent to remote logging in production
- F9/F10/F11 shortcuts are disabled in production

## Troubleshooting

### Debug commands not available

Check browser console for initialization message:
```
🎮 Neverquest Debug Helper initialized
   Use neverquestDebug.help() for available commands
```

If missing, check that dev server is running in development mode.

### F9 not working

- Ensure game window has focus
- Check browser console for errors
- Try using `neverquestDebug.download()` directly

### Performance issues

- Reduce log level: `neverquest.setLogLevel('warn')`
- Disable verbose categories: `neverquest.disableCategory('Animation')`
- Clear log buffer: `neverquest.clearLogs()`

## API Reference

See inline documentation in:
- `/src/utils/DebugHelper.ts` - Debug dump system
- `/src/utils/Logger.ts` - Logging system

## Examples

### Example 1: Debugging Player Movement

```javascript
// Enable movement logging
neverquest.enableCategory('Input')
neverquest.setLogLevel('debug')

// Check player state
neverquestDebug.player()

// Teleport to test position
neverquestDebug.teleport(100, 100)

// Download full dump
neverquestDebug.download()
```

### Example 2: Debugging Battle System

```javascript
// Enable battle logging
neverquest.enableCategory('Battle')
neverquest.enableCategory('Enemy')

// Check enemies
neverquestDebug.enemies()

// Set player health for testing
neverquestDebug.setHealth(10)

// Monitor state
neverquestDebug.quickDump()
```

### Example 3: Performance Analysis

```javascript
// Show current memory
neverquest.showMemory()

// Get full performance data
const dump = neverquestDebug.dump()
console.log(dump.metadata.performance)

// Export logs for analysis
neverquest.exportLogs()
```

## Best Practices

1. **Use appropriate log levels** - Don't log everything at INFO level
2. **Categorize logs properly** - Use the correct GameLogCategory
3. **Include context in logs** - Pass relevant data as the third parameter
4. **Dump state before reporting bugs** - Always include a dump with bug reports
5. **Clean up debug code** - Remove test teleports and cheats before committing
6. **Use timers for performance** - Wrap expensive operations with `logTimer()`
7. **Export dumps regularly during development** - Keep a history of working states

## Future Enhancements

Planned features for the debug system:

- [ ] Visual overlay showing player stats and state
- [ ] Replay system to record and playback game sessions
- [ ] Network tab for monitoring multiplayer/API calls
- [ ] Plugin state inspection
- [ ] Scene graph visualization
- [ ] Memory leak detection
- [ ] Automated bug report generation

## Contributing

When adding new features, please:

1. Add appropriate logging with correct categories
2. Update this documentation if adding new debug commands
3. Test that debug dumps include relevant new state
4. Ensure production builds don't include debug code
