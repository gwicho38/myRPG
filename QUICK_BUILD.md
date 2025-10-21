# 🚀 Quick Build Reference

## Makefile Commands (Recommended)

```bash
# 📋 See all available commands
make help

# 🚀 Quick start
make install       # Install dependencies
make build-web     # Build for web
make build-all     # Build everything
make dev          # Development server

# 🖥️ Desktop builds
make build-desktop # Current platform
make build-mac     # macOS .dmg + .zip
make build-win     # Windows .exe + portable
make build-linux   # Linux AppImage + .deb + .rpm

# 📱 Mobile builds
make sync-mobile   # Prepare mobile builds
make build-ios     # iOS (requires macOS + Xcode)
make build-android # Android (requires Android Studio)
make open-ios      # Open in Xcode
make open-android  # Open in Android Studio

# 🔧 Development & testing
make dev           # Web development server
make dev-electron  # Electron development
make test-electron # Test desktop app
make validate      # Run tests & linting

# 🛠️ Utilities
make clean         # Clean build files
make doctor        # Check system requirements
make size-check    # Check build sizes
make info          # Project information
```

## NPM Commands (Alternative)

```bash
# 🌐 Web (works everywhere)
npm run build:web

# 🖥️ Desktop (current OS)
npm run build:desktop

# 📱 Mobile preparation
npm run sync:mobile

# 🍎 macOS app
npm run build:mac

# 🪟 Windows app
npm run build:win

# 🐧 Linux apps
npm run build:linux

# 📱 iOS (requires Xcode)
npm run build:ios

# 🤖 Android (requires Android Studio)
npm run build:android
```

## Testing

```bash
# 🔧 Development server
make dev           # or npm run dev

# 🖥️ Test desktop app
make test-electron # or npm run electron

# 📱 Open mobile projects
make open-ios      # or npm run open:ios
make open-android  # or npm run open:android
```

## Output Locations

- **Web:** `dist/` folder → Upload to any web server
- **Desktop:** `builds/` folder → Installers for each OS
- **Mobile:** Open in Xcode/Android Studio for final build

## Requirements by Platform

| Platform    | Requirements                            |
| ----------- | --------------------------------------- |
| **Web**     | None (just Node.js)                     |
| **macOS**   | macOS + Xcode                           |
| **Windows** | Windows recommended                     |
| **Linux**   | Any OS with Node.js                     |
| **iOS**     | macOS + Xcode + Apple Developer Account |
| **Android** | Android Studio + JDK 17                 |

## First Time Setup

```bash
git clone <repo>
cd neverquest
npm install
npm run build
```

Done! Now use any build command above. 🎮
