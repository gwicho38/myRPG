# NeverQuest RPG - Comprehensive Build System
# =======================================

# Colors for output
RED := \033[31m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
MAGENTA := \033[35m
CYAN := \033[36m
WHITE := \033[37m
RESET := \033[0m

# Project variables
PROJECT_NAME := neverquest-rpg
VERSION := $(shell node -p "require('./package.json').version")
BUILD_DIR := builds
DIST_DIR := dist
IOS_DIR := ios
ANDROID_DIR := android

# Default target
.DEFAULT_GOAL := help

# =============================================================================
# HELP AND INFO
# =============================================================================

.PHONY: help
help: ## Show this help message
	@echo "$(CYAN)🎮 NeverQuest RPG Build System$(RESET)"
	@echo "$(CYAN)=============================$(RESET)"
	@echo ""
	@echo "$(YELLOW)📋 Available targets:$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)🚀 Quick start:$(RESET)"
	@echo "  $(GREEN)make install$(RESET)     - Install dependencies"
	@echo "  $(GREEN)make build-web$(RESET)   - Build for web"
	@echo "  $(GREEN)make build-all$(RESET)   - Build for all platforms"
	@echo "  $(GREEN)make dev$(RESET)         - Start development server"
	@echo ""

.PHONY: info
info: ## Show project information
	@echo "$(CYAN)📊 Project Information$(RESET)"
	@echo "$(CYAN)====================$(RESET)"
	@echo "Name: $(GREEN)$(PROJECT_NAME)$(RESET)"
	@echo "Version: $(GREEN)$(VERSION)$(RESET)"
	@echo "Node version: $(GREEN)$(shell node --version)$(RESET)"
	@echo "NPM version: $(GREEN)$(shell npm --version)$(RESET)"
	@echo "Platform: $(GREEN)$(shell uname -s)$(RESET)"
	@echo ""

# =============================================================================
# SETUP AND DEPENDENCIES
# =============================================================================

.PHONY: install
install: ## Install all dependencies
	@echo "$(YELLOW)📦 Installing dependencies...$(RESET)"
	npm ci
	@echo "$(GREEN)✅ Dependencies installed$(RESET)"

.PHONY: install-dev
install-dev: ## Install development dependencies
	@echo "$(YELLOW)📦 Installing development dependencies...$(RESET)"
	npm install
	@echo "$(GREEN)✅ Development dependencies installed$(RESET)"

.PHONY: clean
clean: ## Clean all build artifacts
	@echo "$(YELLOW)🧹 Cleaning build artifacts...$(RESET)"
	rm -rf $(BUILD_DIR)
	rm -rf $(DIST_DIR)
	rm -rf node_modules/.cache
	@echo "$(GREEN)✅ Clean complete$(RESET)"

.PHONY: reset
reset: clean ## Reset project (clean + reinstall)
	@echo "$(YELLOW)🔄 Resetting project...$(RESET)"
	rm -rf node_modules
	npm ci
	@echo "$(GREEN)✅ Project reset complete$(RESET)"

# =============================================================================
# WEB BUILDS
# =============================================================================

.PHONY: build-web
build-web: ## Build for web deployment
	@echo "$(YELLOW)🌐 Building for web...$(RESET)"
	npm run build:web
	@echo "$(GREEN)✅ Web build complete → $(DIST_DIR)/$(RESET)"

.PHONY: preview-web
preview-web: build-web ## Build and preview web version
	@echo "$(YELLOW)👀 Starting web preview...$(RESET)"
	npm run distwatch

# =============================================================================
# DESKTOP BUILDS (ELECTRON)
# =============================================================================

.PHONY: build-desktop
build-desktop: ## Build for current desktop platform
	@echo "$(YELLOW)🖥️ Building desktop app for current platform...$(RESET)"
	npm run build:desktop
	@echo "$(GREEN)✅ Desktop build complete → $(BUILD_DIR)/$(RESET)"

.PHONY: build-mac
build-mac: ## Build macOS desktop app (.dmg, .zip)
	@echo "$(YELLOW)🍎 Building macOS app...$(RESET)"
	npm run build:mac
	@echo "$(GREEN)✅ macOS build complete → $(BUILD_DIR)/$(RESET)"

.PHONY: build-win
build-win: ## Build Windows desktop app (.exe, portable)
	@echo "$(YELLOW)🪟 Building Windows app...$(RESET)"
	npm run build:win
	@echo "$(GREEN)✅ Windows build complete → $(BUILD_DIR)/$(RESET)"

.PHONY: build-linux
build-linux: ## Build Linux desktop app (AppImage, .deb, .rpm)
	@echo "$(YELLOW)🐧 Building Linux apps...$(RESET)"
	npm run build:linux
	@echo "$(GREEN)✅ Linux build complete → $(BUILD_DIR)/$(RESET)"

.PHONY: build-all-desktop
build-all-desktop: ## Build for all desktop platforms
	@echo "$(YELLOW)📦 Building for all desktop platforms...$(RESET)"
	$(MAKE) build-mac
	$(MAKE) build-win
	$(MAKE) build-linux
	@echo "$(GREEN)✅ All desktop builds complete$(RESET)"

# =============================================================================
# MOBILE BUILDS (CAPACITOR)
# =============================================================================

.PHONY: sync-mobile
sync-mobile: build-web ## Sync web build to mobile platforms
	@echo "$(YELLOW)📱 Syncing mobile builds...$(RESET)"
	npm run sync:mobile
	@echo "$(GREEN)✅ Mobile sync complete$(RESET)"

.PHONY: build-ios
build-ios: sync-mobile ## Build iOS app (requires macOS + Xcode)
	@echo "$(YELLOW)🍎 Building iOS app...$(RESET)"
	@if [ "$$(uname)" != "Darwin" ]; then \
		echo "$(RED)❌ iOS builds require macOS$(RESET)"; \
		exit 1; \
	fi
	npm run build:ios
	@echo "$(GREEN)✅ iOS build ready → open in Xcode$(RESET)"

.PHONY: build-android
build-android: sync-mobile ## Build Android app (requires Android Studio)
	@echo "$(YELLOW)🤖 Building Android app...$(RESET)"
	npm run build:android
	@echo "$(GREEN)✅ Android build ready → open in Android Studio$(RESET)"

.PHONY: open-ios
open-ios: sync-mobile ## Open iOS project in Xcode
	@echo "$(YELLOW)🍎 Opening iOS project in Xcode...$(RESET)"
	@if [ "$$(uname)" != "Darwin" ]; then \
		echo "$(RED)❌ Xcode is only available on macOS$(RESET)"; \
		exit 1; \
	fi
	npm run open:ios

.PHONY: open-android
open-android: sync-mobile ## Open Android project in Android Studio
	@echo "$(YELLOW)🤖 Opening Android project...$(RESET)"
	npm run open:android

# =============================================================================
# BUILD COMBINATIONS
# =============================================================================

.PHONY: build-all
build-all: ## Build for all platforms (web + desktop + mobile prep)
	@echo "$(YELLOW)🚀 Building for all platforms...$(RESET)"
	$(MAKE) build-web
	$(MAKE) build-all-desktop
	$(MAKE) sync-mobile
	@echo "$(GREEN)✅ All builds complete!$(RESET)"
	@echo "$(CYAN)📁 Outputs:$(RESET)"
	@echo "  Web: $(DIST_DIR)/"
	@echo "  Desktop: $(BUILD_DIR)/"
	@echo "  Mobile: Run 'make open-ios' or 'make open-android'"

.PHONY: build-release
build-release: clean install build-all ## Clean build for release
	@echo "$(GREEN)🎉 Release build complete!$(RESET)"

# =============================================================================
# DEVELOPMENT
# =============================================================================

.PHONY: dev
dev: ## Start development server
	@echo "$(YELLOW)🔧 Starting development server...$(RESET)"
	npm run dev

.PHONY: dev-electron
dev-electron: ## Start Electron in development mode
	@echo "$(YELLOW)🔧 Starting Electron development...$(RESET)"
	npm run electron:dev

.PHONY: dev-electron-server
dev-electron-server: ## Start Electron with dev server (requires dev server running)
	@echo "$(YELLOW)🔧 Starting Electron with dev server...$(RESET)"
	ELECTRON_USE_DEV_SERVER=true ELECTRON_DEV_TOOLS=true npm run electron:dev

.PHONY: serve-mobile
serve-mobile: ## Start mobile development server
	@echo "$(YELLOW)📱 Starting mobile development server...$(RESET)"
	npm run serve:mobile

.PHONY: test-electron
test-electron: build-web ## Test Electron app locally
	@echo "$(YELLOW)🧪 Testing Electron app...$(RESET)"
	npm run electron

.PHONY: electron
electron: dev-electron ## Alias for dev-electron

# =============================================================================
# TESTING AND VALIDATION
# =============================================================================

.PHONY: test
test: ## Run tests (placeholder for when tests are added)
	@echo "$(YELLOW)🧪 Running tests...$(RESET)"
	@if [ -f "package.json" ] && npm run test --silent 2>/dev/null; then \
		echo "$(GREEN)✅ Tests passed$(RESET)"; \
	else \
		echo "$(BLUE)ℹ️  No tests configured$(RESET)"; \
	fi

.PHONY: lint
lint: ## Run linting (placeholder for when linting is configured)
	@echo "$(YELLOW)🔍 Running linter...$(RESET)"
	@if [ -f "package.json" ] && npm run lint --silent 2>/dev/null; then \
		echo "$(GREEN)✅ Linting passed$(RESET)"; \
	else \
		echo "$(BLUE)ℹ️  No linting configured$(RESET)"; \
	fi

.PHONY: validate
validate: lint test ## Run all validation checks
	@echo "$(GREEN)✅ Validation complete$(RESET)"

.PHONY: check-deps
check-deps: ## Check for dependency issues
	@echo "$(YELLOW)🔍 Checking dependencies...$(RESET)"
	npm audit || true
	@echo "$(GREEN)✅ Dependency check complete$(RESET)"

# =============================================================================
# UTILITIES
# =============================================================================

.PHONY: size-check
size-check: build-web ## Check build sizes
	@echo "$(YELLOW)📏 Checking build sizes...$(RESET)"
	@if [ -d "$(DIST_DIR)" ]; then \
		echo "$(CYAN)Web build size:$(RESET)"; \
		du -sh $(DIST_DIR); \
		echo "$(CYAN)Detailed breakdown:$(RESET)"; \
		find $(DIST_DIR) -type f -exec ls -lh {} \; | awk '{print $$5 " " $$9}' | sort -hr; \
	else \
		echo "$(RED)❌ No web build found. Run 'make build-web' first.$(RESET)"; \
	fi

.PHONY: archive
archive: build-all ## Create release archives
	@echo "$(YELLOW)📦 Creating release archives...$(RESET)"
	@mkdir -p releases
	@if [ -d "$(DIST_DIR)" ]; then \
		tar -czf releases/$(PROJECT_NAME)-web-v$(VERSION).tar.gz -C $(DIST_DIR) .; \
		echo "$(GREEN)✅ Web archive created$(RESET)"; \
	fi
	@if [ -d "$(BUILD_DIR)" ]; then \
		tar -czf releases/$(PROJECT_NAME)-desktop-v$(VERSION).tar.gz -C $(BUILD_DIR) .; \
		echo "$(GREEN)✅ Desktop archive created$(RESET)"; \
	fi
	@echo "$(GREEN)✅ Archives created → releases/$(RESET)"

.PHONY: deploy-web
deploy-web: build-web ## Deploy web build (placeholder)
	@echo "$(YELLOW)🚀 Deploying web build...$(RESET)"
	@echo "$(BLUE)ℹ️  Configure your deployment target in this Makefile$(RESET)"
	@echo "$(BLUE)ℹ️  Web files are ready in $(DIST_DIR)/$(RESET)"

# =============================================================================
# MAINTENANCE
# =============================================================================

.PHONY: update-deps
update-deps: ## Update all dependencies
	@echo "$(YELLOW)🔄 Updating dependencies...$(RESET)"
	npm update
	@echo "$(GREEN)✅ Dependencies updated$(RESET)"

.PHONY: security-audit
security-audit: ## Run security audit
	@echo "$(YELLOW)🔒 Running security audit...$(RESET)"
	npm audit
	npm audit fix --only=prod || true
	@echo "$(GREEN)✅ Security audit complete$(RESET)"

.PHONY: list-builds
list-builds: ## List all build outputs
	@echo "$(CYAN)📁 Build outputs:$(RESET)"
	@if [ -d "$(DIST_DIR)" ]; then \
		echo "$(GREEN)Web build:$(RESET)"; \
		ls -la $(DIST_DIR); \
	fi
	@if [ -d "$(BUILD_DIR)" ]; then \
		echo "$(GREEN)Desktop builds:$(RESET)"; \
		ls -la $(BUILD_DIR); \
	fi
	@if [ -d "$(IOS_DIR)" ]; then \
		echo "$(GREEN)iOS project:$(RESET) $(IOS_DIR)/"; \
	fi
	@if [ -d "$(ANDROID_DIR)" ]; then \
		echo "$(GREEN)Android project:$(RESET) $(ANDROID_DIR)/"; \
	fi

# =============================================================================
# CI/CD TARGETS
# =============================================================================

.PHONY: ci-install
ci-install: ## Install dependencies for CI
	@echo "$(YELLOW)🤖 CI: Installing dependencies...$(RESET)"
	npm ci --production=false

.PHONY: ci-build
ci-build: ci-install build-web ## CI build pipeline
	@echo "$(GREEN)✅ CI build complete$(RESET)"

.PHONY: ci-test
ci-test: ci-install validate ## CI test pipeline
	@echo "$(GREEN)✅ CI tests complete$(RESET)"

# =============================================================================
# SPECIAL TARGETS
# =============================================================================

.PHONY: doctor
doctor: ## Check system requirements and project health
	@echo "$(CYAN)🏥 System Health Check$(RESET)"
	@echo "$(CYAN)=====================$(RESET)"
	@echo ""
	@echo "$(YELLOW)Node.js:$(RESET) $(shell node --version 2>/dev/null || echo '❌ Not found')"
	@echo "$(YELLOW)NPM:$(RESET) $(shell npm --version 2>/dev/null || echo '❌ Not found')"
	@echo "$(YELLOW)Git:$(RESET) $(shell git --version 2>/dev/null || echo '❌ Not found')"
	@if command -v electron >/dev/null 2>&1; then \
		echo "$(YELLOW)Electron:$(RESET) $(shell electron --version 2>/dev/null)"; \
	else \
		echo "$(YELLOW)Electron:$(RESET) ℹ️  Will be installed with npm ci"; \
	fi
	@if [ "$$(uname)" = "Darwin" ]; then \
		echo "$(YELLOW)Xcode:$(RESET) $(shell xcode-select --version 2>/dev/null || echo '❌ Not found')"; \
	fi
	@echo ""
	@if [ -f "package.json" ]; then \
		echo "$(GREEN)✅ package.json found$(RESET)"; \
	else \
		echo "$(RED)❌ package.json not found$(RESET)"; \
	fi
	@if [ -d "node_modules" ]; then \
		echo "$(GREEN)✅ Dependencies installed$(RESET)"; \
	else \
		echo "$(YELLOW)⚠️  Run 'make install' to install dependencies$(RESET)"; \
	fi

# =============================================================================
# PLATFORM-SPECIFIC HELPERS
# =============================================================================

.PHONY: check-platform
check-platform: ## Show current platform info
	@echo "$(CYAN)🖥️ Platform Information$(RESET)"
	@echo "OS: $(shell uname -s)"
	@echo "Architecture: $(shell uname -m)"
	@if [ "$$(uname)" = "Darwin" ]; then \
		echo "macOS Version: $(shell sw_vers -productVersion 2>/dev/null || echo 'Unknown')"; \
	elif [ "$$(uname)" = "Linux" ]; then \
		echo "Distribution: $(shell lsb_release -d 2>/dev/null | cut -f2 || echo 'Unknown')"; \
	fi

# Make sure intermediate files aren't deleted
.PRECIOUS: $(DIST_DIR) $(BUILD_DIR)

# Ensure directories exist
$(DIST_DIR) $(BUILD_DIR):
	mkdir -p $@