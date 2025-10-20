#!/bin/bash

# NeverQuest RPG Build Script for macOS/Linux
# Make executable with: chmod +x build.sh

echo "🎮 NeverQuest RPG Build Script"
echo "=========================="

show_menu() {
    echo ""
    echo "Choose build option:"
    echo "1. 🌐 Web build (works everywhere)"
    echo "2. 🖥️  Desktop build (for current OS)"
    echo "3. 🍎 macOS desktop build"
    echo "4. 🪟 Windows desktop build"
    echo "5. 🐧 Linux desktop build"
    echo "6. 📦 All desktop builds"
    echo "7. 📱 Mobile sync"
    echo "8. 🔧 Development server"
    echo "9. ❌ Exit"
    echo ""
}

while true; do
    show_menu
    read -p "Enter choice (1-9): " choice

    case $choice in
        1)
            echo "🌐 Building for web..."
            npm run build:web
            echo "✅ Web build complete! Check 'dist' folder."
            ;;
        2)
            echo "🖥️ Building desktop app..."
            npm run build:desktop
            echo "✅ Desktop build complete! Check 'builds' folder."
            ;;
        3)
            echo "🍎 Building macOS app..."
            npm run build:mac
            echo "✅ macOS build complete! Check 'builds' folder."
            ;;
        4)
            echo "🪟 Building Windows app..."
            npm run build:win
            echo "✅ Windows build complete! Check 'builds' folder."
            ;;
        5)
            echo "🐧 Building Linux apps..."
            npm run build:linux
            echo "✅ Linux build complete! Check 'builds' folder."
            ;;
        6)
            echo "📦 Building for all desktop platforms..."
            npm run build:mac
            npm run build:win
            npm run build:linux
            echo "✅ All desktop builds complete! Check 'builds' folder."
            ;;
        7)
            echo "📱 Syncing mobile builds..."
            npm run sync:mobile
            echo "✅ Mobile sync complete! Use 'npm run open:ios' or 'npm run open:android'"
            ;;
        8)
            echo "🔧 Starting development server..."
            npm run dev
            ;;
        9)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            ;;
    esac
done