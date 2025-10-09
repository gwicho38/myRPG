const { app, BrowserWindow, Menu, dialog, shell, autoUpdater } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let isDev = process.env.NODE_ENV === 'development';

// Enhanced error handling
process.on('uncaughtException', (error) => {
	console.error('Uncaught Exception:', error);
	dialog.showErrorBox('Application Error', `An unexpected error occurred: ${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

function createWindow() {
	try {
		// Get screen dimensions for better window sizing
		const { screen } = require('electron');
		const primaryDisplay = screen.getPrimaryDisplay();
		const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

		// Calculate optimal window size (80% of screen, minimum 800x600)
		const windowWidth = Math.max(800, Math.floor(screenWidth * 0.8));
		const windowHeight = Math.max(600, Math.floor(screenHeight * 0.8));

		mainWindow = new BrowserWindow({
			width: windowWidth,
			height: windowHeight,
			minWidth: 800,
			minHeight: 600,
			title: 'Luminus RPG',
			icon: getAppIcon(),
			show: false, // Don't show until ready
			webPreferences: {
				nodeIntegration: false,
				contextIsolation: true,
				webSecurity: true,
				enableRemoteModule: false,
				allowRunningInsecureContent: false,
				experimentalFeatures: false,
			},
			titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
			frame: true,
			resizable: true,
			maximizable: true,
			minimizable: true,
			closable: true,
		});

		// Center the window
		mainWindow.center();

		// Show window when ready to prevent visual flash
		mainWindow.once('ready-to-show', () => {
			mainWindow.show();

			// Focus the window
			if (mainWindow) {
				mainWindow.focus();
			}
		});

		// Load the game
		loadGame();

		// Handle window events
		mainWindow.on('closed', () => {
			mainWindow = null;
		});

		// Handle external links
		mainWindow.webContents.setWindowOpenHandler(({ url }) => {
			shell.openExternal(url);
			return { action: 'deny' };
		});

		// Security: Prevent navigation to external URLs
		mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
			const parsedUrl = new URL(navigationUrl);
			if (parsedUrl.origin !== 'file://' && parsedUrl.origin !== 'http://localhost:8080') {
				event.preventDefault();
			}
		});

		// Handle certificate errors
		mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
			if (isDev) {
				// In development, ignore certificate errors
				event.preventDefault();
				callback(true);
			} else {
				// In production, use default behavior
				callback(false);
			}
		});
	} catch (error) {
		console.error('Failed to create window:', error);
		dialog.showErrorBox('Window Creation Error', `Failed to create application window: ${error.message}`);
		app.quit();
	}
}

function loadGame() {
	try {
		if (process.env.ELECTRON_USE_DEV_SERVER === 'true') {
			// Development server
			console.log('Loading from development server...');
			mainWindow.loadURL('http://localhost:8080');

			if (isDev || process.env.ELECTRON_DEV_TOOLS === 'true') {
				mainWindow.webContents.openDevTools();
			}
		} else {
			// Production build
			const indexPath = path.join(__dirname, 'dist/index.html');

			// Check if dist folder exists
			if (!fs.existsSync(path.join(__dirname, 'dist'))) {
				throw new Error('Dist folder not found. Please run "npm run build" first.');
			}

			// Check if index.html exists
			if (!fs.existsSync(indexPath)) {
				throw new Error('index.html not found in dist folder. Please run "npm run build" first.');
			}

			console.log('Loading from production build...');
			mainWindow.loadFile(indexPath);

			if (isDev && process.env.ELECTRON_DEV_TOOLS === 'true') {
				mainWindow.webContents.openDevTools();
			}
		}
	} catch (error) {
		console.error('Failed to load game:', error);
		dialog.showErrorBox('Game Loading Error', `Failed to load the game: ${error.message}`);
	}
}

function getAppIcon() {
	// Try different icon paths
	const iconPaths = [
		path.join(__dirname, 'assets/icon.png'),
		path.join(__dirname, 'favicon.png'),
		path.join(__dirname, 'src/assets/sprites/logo.png'),
	];

	for (const iconPath of iconPaths) {
		if (fs.existsSync(iconPath)) {
			return iconPath;
		}
	}

	return undefined; // Use default icon
}

function createMenu() {
	const template = [
		{
			label: 'File',
			submenu: [
				{
					label: 'New Game',
					accelerator: 'CmdOrCtrl+N',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.send('menu-new-game');
						}
					},
				},
				{
					label: 'Save Game',
					accelerator: 'CmdOrCtrl+S',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.send('menu-save-game');
						}
					},
				},
				{
					label: 'Load Game',
					accelerator: 'CmdOrCtrl+O',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.send('menu-load-game');
						}
					},
				},
				{ type: 'separator' },
				{
					label: 'Exit',
					accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
					click: () => {
						app.quit();
					},
				},
			],
		},
		{
			label: 'View',
			submenu: [
				{
					label: 'Reload',
					accelerator: 'CmdOrCtrl+R',
					click: () => {
						if (mainWindow) {
							mainWindow.reload();
						}
					},
				},
				{
					label: 'Force Reload',
					accelerator: 'CmdOrCtrl+Shift+R',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.reloadIgnoringCache();
						}
					},
				},
				{
					label: 'Toggle Developer Tools',
					accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.toggleDevTools();
						}
					},
				},
				{ type: 'separator' },
				{
					label: 'Actual Size',
					accelerator: 'CmdOrCtrl+0',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.setZoomLevel(0);
						}
					},
				},
				{
					label: 'Zoom In',
					accelerator: 'CmdOrCtrl+Plus',
					click: () => {
						if (mainWindow) {
							const currentZoom = mainWindow.webContents.getZoomLevel();
							mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
						}
					},
				},
				{
					label: 'Zoom Out',
					accelerator: 'CmdOrCtrl+-',
					click: () => {
						if (mainWindow) {
							const currentZoom = mainWindow.webContents.getZoomLevel();
							mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
						}
					},
				},
				{ type: 'separator' },
				{
					label: 'Toggle Fullscreen',
					accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
					click: () => {
						if (mainWindow) {
							mainWindow.setFullScreen(!mainWindow.isFullScreen());
						}
					},
				},
			],
		},
		{
			label: 'Game',
			submenu: [
				{
					label: 'Pause/Resume',
					accelerator: 'Space',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.send('menu-pause-toggle');
						}
					},
				},
				{
					label: 'Settings',
					accelerator: 'CmdOrCtrl+,',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.send('menu-settings');
						}
					},
				},
			],
		},
		{
			label: 'Help',
			submenu: [
				{
					label: 'About Luminus RPG',
					click: () => {
						dialog.showMessageBox(mainWindow, {
							type: 'info',
							title: 'About Luminus RPG',
							message: 'Luminus RPG',
							detail: 'A modern Action RPG built with Phaser and Electron\nVersion: 0.1.1',
						});
					},
				},
			],
		},
	];

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

// Auto-updater configuration
function setupAutoUpdater() {
	if (isDev) {
		console.log('Auto-updater disabled in development mode');
		return;
	}

	// Configure auto-updater - disable for now as it requires proper setup
	// autoUpdater.setFeedURL({
	//     provider: 'github',
	//     owner: 'SkyAlpha',
	//     repo: 'luminus-rpg',
	//     private: false,
	//     token: process.env.GITHUB_TOKEN // Optional: for private repos
	// });

	// Check for updates on startup - disabled for now
	// autoUpdater.checkForUpdatesAndNotify();

	// Check for updates every hour - disabled for now
	// setInterval(() => {
	//     autoUpdater.checkForUpdatesAndNotify();
	// }, 60 * 60 * 1000);

	// Handle update events
	autoUpdater.on('checking-for-update', () => {
		console.log('Checking for update...');
	});

	autoUpdater.on('update-available', (info) => {
		console.log('Update available:', info);
		if (mainWindow) {
			mainWindow.webContents.send('update-available', info);
		}
	});

	autoUpdater.on('update-not-available', (info) => {
		console.log('Update not available:', info);
	});

	autoUpdater.on('error', (err) => {
		console.error('Auto-updater error:', err);
	});

	autoUpdater.on('download-progress', (progressObj) => {
		let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
		log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
		log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
		console.log(log_message);

		if (mainWindow) {
			mainWindow.webContents.send('download-progress', progressObj);
		}
	});

	autoUpdater.on('update-downloaded', (info) => {
		console.log('Update downloaded:', info);

		// Show update notification
		const response = dialog.showMessageBoxSync(mainWindow, {
			type: 'info',
			title: 'Update Available',
			message: 'A new version has been downloaded. Restart the application to apply the update.',
			buttons: ['Restart Now', 'Later'],
			defaultId: 0,
			cancelId: 1,
		});

		if (response === 0) {
			autoUpdater.quitAndInstall();
		}
	});
}

// App event handlers
app.whenReady().then(() => {
	createWindow();
	createMenu();
	setupAutoUpdater();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
	contents.on('new-window', (event, navigationUrl) => {
		event.preventDefault();
		shell.openExternal(navigationUrl);
	});
});

// Handle app protocol for security
app.setAsDefaultProtocolClient('luminus-rpg');

// Prevent navigation to external URLs
app.on('web-contents-created', (event, contents) => {
	contents.on('will-navigate', (event, navigationUrl) => {
		const parsedUrl = new URL(navigationUrl);
		if (parsedUrl.origin !== 'file://' && parsedUrl.origin !== 'http://localhost:8080') {
			event.preventDefault();
		}
	});
});
