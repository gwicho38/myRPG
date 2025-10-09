# Instructions for Fixing Horizontal Black Bars in Terminal Game

## Problem Description

The terminal game displays horizontal black bars on the screen. These are likely caused by:

1. Empty terminal areas showing the default background color (black)
2. Viewport size mismatch between configured size and actual terminal dimensions
3. No background fill for empty spaces in the map rendering

## Current Codebase State

- The game is a CLI-only RPG built with TypeScript and blessed.js
- Entry point: `npm run terminal` (runs `tsx terminal-main.ts`)
- Main files: `src/terminal/TerminalGame.ts`, `src/terminal/TerminalRenderer.ts`, `src/terminal/TerminalMap.ts`
- The game compiles and runs successfully

## Intended Solution

**Goal**: Eliminate horizontal black bars by ensuring the terminal UI fills the entire screen with a consistent background color.

### Approach 1: Set Default Background Color (Recommended)

1. **Modify `src/terminal/TerminalRenderer.ts`**:
    - In the `TerminalRenderer` constructor, add `bg: 'green'` to the style object of each box element (gameBox, statusBox, logBox, debugBox)
    - This will set a green background for all UI panels

2. **Modify `src/terminal/TerminalMap.ts`**:
    - In the `render()` method, when rendering empty areas (outside map bounds), use a space character `' '` instead of trying to set background colors in text
    - The box background color will handle the empty area coloring

### Approach 2: Ensure Viewport Fills Screen

1. **Modify `src/terminal/TerminalGame.ts`**:
    - In the `render()` method, calculate the actual game box dimensions
    - Use `this.renderer.gameBox.width` and `this.renderer.gameBox.height` to determine viewport size
    - Ensure the map rendering fills the entire available space

### Approach 3: Precise Layout (If needed)

1. **Modify `src/terminal/TerminalRenderer.ts`**:
    - Add a method to calculate precise pixel dimensions
    - Use `Math.floor()` for exact positioning to avoid rounding gaps
    - Ensure all UI elements connect without gaps

## Key Points

- **DO NOT** use `{color-bg}` syntax in text content - blessed.js doesn't support this
- **DO** use `bg: 'color'` in the style objects of blessed.js elements
- **DO** use simple space characters `' '` for empty areas
- **DO** test with `npm run terminal:test` to ensure compilation
- **DO** test with `npm run terminal` to verify the fix works

## Expected Result

- No horizontal black bars visible
- Consistent green background throughout the terminal
- Game assets (player, enemies, map tiles) visible and properly colored
- Clean, seamless terminal interface

## Files to Modify

1. `src/terminal/TerminalRenderer.ts` - Add background colors to box styles
2. `src/terminal/TerminalMap.ts` - Ensure empty areas use spaces
3. `src/terminal/TerminalGame.ts` - Calculate proper viewport size (if needed)

## Testing

- Run `npm run terminal:test` to verify compilation
- Run `npm run terminal` to test the visual fix
- The game should display with a green background and no black bars
