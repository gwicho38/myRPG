# Debug System - Quick Reference

## 🎮 For Developers

### Keyboard Shortcuts

- **F9** - Download full debug dump
- **F10** - Print quick dump to console
- **F11** - Toggle performance overlay

### Essential Commands

```javascript
// Help
luminusDebug.help();

// State dumps
luminusDebug.quickDump(); // Console output
luminusDebug.download(); // Download JSON
luminusDebug.copy(); // Copy to clipboard

// Inspect game state
luminusDebug.scenes(); // Active scenes
luminusDebug.player(); // Player state
luminusDebug.enemies(); // Enemy list

// Dev cheats
luminusDebug.teleport(x, y); // Move player
luminusDebug.setHealth(100); // Set HP

// Logging
luminus.setLogLevel('debug'); // More verbose
luminus.enableCategory('Battle'); // Filter logs
luminus.exportLogs(); // Download logs
luminus.showMemory(); // Memory usage
```

## 🤖 For Claude/AI Assistance

When you need help from Claude:

1. **Press F9** to download debug dump
2. **Share the JSON file** with your question
3. Claude can analyze:
    - Complete game state
    - Player/enemy positions
    - Active scenes and plugins
    - Recent errors
    - Performance metrics

## 📝 Log Categories

- `System`, `Scene`, `Player`, `Enemy`, `Battle`
- `Inventory`, `Dialog`, `SaveGame`, `Input`
- `Animation`, `Audio`, `Performance`, `Error`

## 🔧 Common Workflows

### Bug Investigation

```javascript
// 1. Reproduce bug
// 2. Capture state
luminusDebug.download();

// 3. Check errors
const dump = luminusDebug.dump();
dump.errors;

// 4. Check relevant logs
luminus.enableCategory('Battle');
```

### Feature Development

```javascript
// 1. Enable debug logging
luminus.setLogLevel('debug');
luminus.enableCategory('YourFeature');

// 2. Test feature
// 3. Verify state
luminusDebug.quickDump();

// 4. Export logs
luminus.exportLogs();
```

### Performance Check

```javascript
luminus.showMemory();
const dump = luminusDebug.dump();
dump.metadata.performance;
```

## 📖 Full Documentation

See `docs/DEBUG_SYSTEM.md` for complete documentation.
