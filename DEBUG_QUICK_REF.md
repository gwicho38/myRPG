# Debug System - Quick Reference

## 🎮 For Developers

### Keyboard Shortcuts

- **F9** - Download full debug dump
- **F10** - Print quick dump to console
- **F11** - Toggle performance overlay

### Essential Commands

```javascript
// Help
neverquestDebug.help();

// State dumps
neverquestDebug.quickDump(); // Console output
neverquestDebug.download(); // Download JSON
neverquestDebug.copy(); // Copy to clipboard

// Inspect game state
neverquestDebug.scenes(); // Active scenes
neverquestDebug.player(); // Player state
neverquestDebug.enemies(); // Enemy list

// Dev cheats
neverquestDebug.teleport(x, y); // Move player
neverquestDebug.setHealth(100); // Set HP

// Logging
neverquest.setLogLevel('debug'); // More verbose
neverquest.enableCategory('Battle'); // Filter logs
neverquest.exportLogs(); // Download logs
neverquest.showMemory(); // Memory usage
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
neverquestDebug.download();

// 3. Check errors
const dump = neverquestDebug.dump();
dump.errors;

// 4. Check relevant logs
neverquest.enableCategory('Battle');
```

### Feature Development

```javascript
// 1. Enable debug logging
neverquest.setLogLevel('debug');
neverquest.enableCategory('YourFeature');

// 2. Test feature
// 3. Verify state
neverquestDebug.quickDump();

// 4. Export logs
neverquest.exportLogs();
```

### Performance Check

```javascript
neverquest.showMemory();
const dump = neverquestDebug.dump();
dump.metadata.performance;
```

## 📖 Full Documentation

See `docs/DEBUG_SYSTEM.md` for complete documentation.
