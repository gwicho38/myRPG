# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-09-30

### Added

- Node version management with `.nvmrc`
- Enhanced Phaser mock with plugins, gamepad, and physics support
- Mock for phaser3-rex-plugins
- TypeScript strict mode compiler options
- Webpack code splitting (runtime, phaser, vendors, main chunks)
- Content hash in bundle filenames for better caching
- Source maps for production debugging
- GitHub workflows: CI, security scanning, mobile builds, releases
- Dependabot configuration for dependency updates
- Logger utility with performance timing

### Changed

- Upgraded to TypeScript strict mode:
    - `noImplicitAny: true`
    - `alwaysStrict: true`
    - `strictFunctionTypes: true`
    - `strictBindCallApply: true`
    - `noImplicitThis: true`
- Optimized webpack production build with code splitting
- Removed `|| true` flags from CI test commands for proper failure detection
- Enhanced test infrastructure (0 → 46 passing tests)
- Auto-fixed formatting with Prettier
- Added `performance` global to ESLint configuration

### Fixed

- Jest mock scope issue preventing all tests from running
- Linting errors (2 errors → 0 errors)
- webpack-dev-server compatibility issues
- Player walking animations in LuminusAnimationManager constructor
- Test setup configuration for proper mock imports

### Removed

- Duplicate JavaScript versions of TypeScript files:
    - `LuminusAnimationManager.js`
    - `LuminusDialogBox.js`
    - `LuminusMovement.js`
    - `LuminusSaveManager.js`

### Security

- Enabled GitHub security scanning workflows
- Added npm audit in CI pipeline
- CodeQL analysis for JavaScript/TypeScript
- Trivy vulnerability scanning

### Performance

- Bundle split into optimized chunks (2.16 MiB total):
    - Runtime: 1.84 KiB
    - Phaser: 1.42 MiB
    - Vendors: 93.6 KiB
    - Main: 656 KiB
- Console.log statements removed in production builds

## [0.0.1] - 2025-09-21

### Initial Release

- Phaser 3.90.0 game engine integration
- Electron desktop support
- Capacitor mobile support (iOS/Android)
- RPG template with player, enemies, items, and battle system
- Dialog system with typewriter effect
- Dungeon generator
- Save/load system
- Virtual joystick for mobile
- HUD and inventory systems
- Multiple game scenes (town, cave, dungeon, overworld)

[0.1.0]: https://github.com/gwicho38/myRPG/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/gwicho38/myRPG/releases/tag/v0.0.1
