@echo off
echo NeverQuest RPG Build Script
echo =======================

:menu
echo.
echo Choose build option:
echo 1. Web build (works everywhere)
echo 2. Desktop build (for current OS)
echo 3. Windows desktop build
echo 4. All desktop builds
echo 5. Mobile sync
echo 6. Development server
echo 7. Exit
echo.

set /p choice="Enter choice (1-7): "

if "%choice%"=="1" goto web
if "%choice%"=="2" goto desktop
if "%choice%"=="3" goto windows
if "%choice%"=="4" goto all-desktop
if "%choice%"=="5" goto mobile
if "%choice%"=="6" goto dev
if "%choice%"=="7" goto exit
goto menu

:web
echo Building for web...
npm run build:web
echo Web build complete! Check 'dist' folder.
goto menu

:desktop
echo Building desktop app...
npm run build:desktop
echo Desktop build complete! Check 'builds' folder.
goto menu

:windows
echo Building Windows app...
npm run build:win
echo Windows build complete! Check 'builds' folder.
goto menu

:all-desktop
echo Building for all desktop platforms...
npm run build:mac
npm run build:win
npm run build:linux
echo All desktop builds complete! Check 'builds' folder.
goto menu

:mobile
echo Syncing mobile builds...
npm run sync:mobile
echo Mobile sync complete! Use 'npm run open:ios' or 'npm run open:android'
goto menu

:dev
echo Starting development server...
npm run dev
goto menu

:exit
echo Goodbye!
pause
exit /b