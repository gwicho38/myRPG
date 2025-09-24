# 🎮 Luminus RPG - Makefile Build System

A comprehensive Makefile that aggregates all building, testing, and development functionalities for multi-platform distribution.

## 🚀 Quick Start

```bash
# Show all available commands
make help

# Install dependencies and build everything
make install
make build-all

# Start development
make dev
```

## 📋 Main Commands

### 🔧 **Setup & Development**
```bash
make install        # Install all dependencies
make dev           # Start development server
make dev-electron  # Start Electron development
make clean         # Clean build artifacts
make reset         # Clean + reinstall dependencies
```

### 🌐 **Web Builds**
```bash
make build-web     # Build for web deployment
make preview-web   # Build and preview web version
make size-check    # Check build sizes
```

### 🖥️ **Desktop Builds**
```bash
make build-desktop    # Build for current platform
make build-mac        # Build macOS (.dmg, .zip)
make build-win        # Build Windows (.exe, portable)
make build-linux      # Build Linux (AppImage, .deb, .rpm)
make build-all-desktop # Build for all desktop platforms
```

### 📱 **Mobile Builds**
```bash
make sync-mobile      # Sync web build to mobile platforms
make build-ios        # Build iOS app (requires macOS + Xcode)
make build-android    # Build Android app
make open-ios         # Open iOS project in Xcode
make open-android     # Open Android project in Android Studio
```

### 🚀 **Build Combinations**
```bash
make build-all        # Build for all platforms
make build-release    # Clean build for release
make archive          # Create release archives
```

### 🧪 **Testing & Validation**
```bash
make test             # Run tests
make lint             # Run linting
make validate         # Run all validation checks
make test-electron    # Test Electron app locally
make check-deps       # Check for dependency issues
```

### 🛠️ **Utilities**
```bash
make info             # Show project information
make doctor           # Check system requirements
make check-platform   # Show platform information
make list-builds      # List all build outputs
make security-audit   # Run security audit
make update-deps      # Update all dependencies
```

## 🎯 **Platform Requirements**

The Makefile automatically detects your platform and shows relevant information:

```bash
make doctor           # Comprehensive system check
make check-platform   # Platform-specific info
```

## 📁 **Build Outputs**

| Command | Output Location | Description |
|---------|----------------|-------------|
| `make build-web` | `dist/` | Web files for hosting |
| `make build-desktop` | `builds/` | Desktop installers |
| `make build-ios` | iOS project | Open in Xcode |
| `make build-android` | Android project | Open in Android Studio |
| `make archive` | `releases/` | Release archives |

## 🎨 **Features**

### ✨ **Color-Coded Output**
- 🟢 Success messages
- 🟡 Warning/info messages
- 🔴 Error messages
- 🔵 Info/tips

### 📊 **Smart Detection**
- Automatically detects your operating system
- Checks for required tools (Xcode, Android Studio)
- Validates dependencies and project health

### 🔄 **CI/CD Ready**
```bash
make ci-install       # CI dependency installation
make ci-build         # CI build pipeline
make ci-test          # CI test pipeline
```

### 🏥 **Health Checks**
```bash
make doctor           # Complete system health check
```
Shows:
- Node.js, NPM, Git versions
- Platform information
- Xcode availability (macOS)
- Project structure validation
- Dependency status

## 💡 **Examples**

### First-time setup:
```bash
make install
make doctor
make build-web
make dev
```

### Release preparation:
```bash
make build-release
make archive
make list-builds
```

### Mobile development:
```bash
make sync-mobile
make open-ios        # On macOS
make open-android    # Any platform
```

### Troubleshooting:
```bash
make doctor          # Check system
make clean           # Clean builds
make reset           # Full reset
make check-deps      # Check dependencies
```

## 🆚 **Makefile vs NPM Scripts**

| Task | Makefile | NPM Script |
|------|----------|------------|
| **Build web** | `make build-web` | `npm run build:web` |
| **All desktop** | `make build-all-desktop` | 3 separate commands |
| **Development** | `make dev` | `npm run dev` |
| **Clean & build** | `make build-release` | Multiple commands |
| **System check** | `make doctor` | Not available |
| **Help** | `make help` | Manual lookup |

## 🔍 **Help System**

The Makefile includes a comprehensive help system:

```bash
make help             # Show all commands with descriptions
make info             # Project information
make doctor           # System diagnostics
```

Every command includes a description that shows up in `make help`, making it easy to discover functionality.

This Makefile provides a unified interface for all build operations while maintaining compatibility with existing NPM scripts! 🎯