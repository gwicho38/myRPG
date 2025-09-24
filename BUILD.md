# Luminus RPG - Multi-Platform Build Guide

This guide covers how to package and distribute your Luminus RPG game for all major platforms: Web, Desktop (macOS, Windows, Linux), and Mobile (iOS, Android).

## Prerequisites

### Required Software
- **Node.js** 18+ with npm
- **Git** for version control

### Platform-Specific Requirements

#### Desktop (Electron)
- No additional requirements - works on any platform with Node.js

#### macOS Desktop
- **Xcode Command Line Tools** (for native dependencies)
- **macOS** (for building .dmg files)

#### Windows Desktop
- **Windows** (recommended for building .exe files)
- **Visual Studio Build Tools** (may be needed for native dependencies)

#### iOS
- **macOS** with Xcode 14+
- **iOS Simulator** or physical iOS device
- **Apple Developer Account** (for App Store distribution)

#### Android
- **Android Studio** with SDK 33+
- **Java Development Kit (JDK) 17**
- **Android device** or emulator for testing

## Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd luminus-rpg
npm install
```

2. **Build the web version first:**
```bash
npm run build
```

## Platform Builds

### 🌐 Web Build
The simplest deployment option - works in any modern browser.

```bash
# Build for web
npm run build:web

# The output will be in ./dist/
# Deploy these files to any web server
```

**Deployment Options:**
- Upload `dist/` folder to any web hosting service
- Use GitHub Pages: `npm run publish-git`
- Use Netlify, Vercel, or similar static hosting

### 🖥️ Desktop Builds (Electron)

#### Test Desktop App Locally
```bash
# Run in development mode
npm run electron:dev

# Run production build locally
npm run electron
```

#### Build for All Desktop Platforms
```bash
# Build for current platform
npm run build:desktop

# Build for specific platforms
npm run build:mac     # macOS .dmg and .zip
npm run build:win     # Windows .exe and portable
npm run build:linux   # Linux AppImage, .deb, .rpm
```

**Output:** Check the `builds/` folder for platform-specific installers.

### 📱 Mobile Builds (Capacitor)

#### Prepare Mobile Build
```bash
# Sync web build with mobile platforms
npm run sync:mobile
```

#### iOS Build
```bash
# Build iOS app (requires macOS)
npm run build:ios

# Or open in Xcode for manual build/deployment
npm run open:ios
```

**iOS Distribution:**
1. Open the project in Xcode: `npm run open:ios`
2. Set up signing certificates and provisioning profiles
3. Build and archive for App Store or TestFlight

#### Android Build
```bash
# Build Android APK
npm run build:android

# Or open in Android Studio
npm run open:android
```

**Android Distribution:**
1. Open Android Studio: `npm run open:android`
2. Generate signed APK/AAB for Google Play Store
3. Or install directly on device for testing

## Quick Start Commands

### 🎯 **Makefile (Recommended)**

| Platform | Command | Output |
|----------|---------|---------|
| **Web** | `make build-web` | `dist/` folder |
| **macOS** | `make build-mac` | `builds/*.dmg, *.zip` |
| **Windows** | `make build-win` | `builds/*.exe` |
| **Linux** | `make build-linux` | `builds/*.AppImage, *.deb, *.rpm` |
| **iOS** | `make build-ios` | Xcode project |
| **Android** | `make build-android` | Android Studio project |
| **All Platforms** | `make build-all` | Everything above |

**See all commands:** `make help`

### 📦 **NPM Scripts (Alternative)**

| Platform | Command | Output |
|----------|---------|---------|
| **Web** | `npm run build:web` | `dist/` folder |
| **macOS** | `npm run build:mac` | `builds/*.dmg, *.zip` |
| **Windows** | `npm run build:win` | `builds/*.exe` |
| **Linux** | `npm run build:linux` | `builds/*.AppImage, *.deb, *.rpm` |
| **iOS** | `npm run build:ios` | Xcode project |
| **Android** | `npm run build:android` | Android Studio project |

## Development Workflow

1. **Make changes** to your game in `src/`
2. **Test locally:**
   ```bash
   make dev             # Web development server
   make dev-electron    # Desktop development
   # Or use: npm run dev / npm run electron:dev
   ```
3. **Build and test:**
   ```bash
   make build-web       # Build web version
   make test-electron   # Test desktop version
   # Or use: npm run build / npm run electron
   ```
4. **Deploy:** Use the appropriate build command for your target platform

**💡 Pro tip:** Use `make help` to see all available commands with descriptions!

## File Structure After Setup

```
luminus-rpg/
├── src/                 # Your game source code
├── dist/               # Web build output
├── builds/             # Desktop builds output
├── ios/                # iOS project (Capacitor)
├── android/            # Android project (Capacitor)
├── electron-main.js    # Electron main process
├── capacitor.config.ts # Mobile app configuration
└── BUILD.md           # This file
```

## Troubleshooting

### Common Issues

**Build fails with "webpack command not found":**
```bash
npm install
npm run build
```

**Electron app doesn't start:**
- Make sure you ran `npm run build` first
- Check that `dist/` folder exists

**iOS build issues:**
- Ensure Xcode is installed and updated
- Run `pod install` in `ios/App/` directory
- Check iOS deployment target compatibility

**Android build issues:**
- Verify Android SDK is installed
- Check ANDROID_HOME environment variable
- Ensure JDK 17 is installed

**Mobile app shows blank screen:**
- Verify `dist/` folder has the latest build
- Run `npm run sync:mobile` to update mobile projects
- Check browser console for errors in mobile dev tools

### Performance Tips

- **Web:** Use `npm run distwatch` to preview builds locally
- **Mobile:** Use `npm run serve:mobile` for live reloading during development
- **Desktop:** Use `npm run electron:dev` for faster development iteration

## Distribution Checklist

### Before Publishing:
- [ ] Test on target platforms
- [ ] Update version in `package.json`
- [ ] Add app icons (see platform-specific requirements)
- [ ] Configure signing certificates (mobile/desktop)
- [ ] Test installation process
- [ ] Prepare store listings (mobile)

### Web Deployment:
- [ ] Build with `npm run build:web`
- [ ] Test in multiple browsers
- [ ] Configure HTTPS if needed
- [ ] Set up CDN if required

### Desktop Distribution:
- [ ] Code sign applications (macOS/Windows)
- [ ] Test installer/uninstaller
- [ ] Prepare release notes
- [ ] Upload to distribution platform

### Mobile App Stores:
- [ ] Prepare app store assets (screenshots, descriptions)
- [ ] Test on actual devices
- [ ] Submit for review
- [ ] Monitor for rejections/feedback

## Support

For build issues, check:
1. [Electron Builder Documentation](https://www.electron.build/)
2. [Capacitor Documentation](https://capacitorjs.com/docs)
3. [Webpack Documentation](https://webpack.js.org/)

For game-specific issues, refer to the main project documentation.