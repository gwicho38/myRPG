const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        title: 'Luminus RPG',
        icon: path.join(__dirname, 'assets/icon.png'), // You'll need to add an icon
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        }
    });

    // Load the game - use built version by default
    if (process.env.ELECTRON_USE_DEV_SERVER === 'true') {
        // Only use dev server if explicitly requested
        mainWindow.loadURL('http://localhost:8080');
        if (process.env.ELECTRON_DEV_TOOLS === 'true') {
            mainWindow.webContents.openDevTools();
        }
    } else {
        // Use built version (default behavior)
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
        if (process.env.NODE_ENV === 'development' && process.env.ELECTRON_DEV_TOOLS === 'true') {
            mainWindow.webContents.openDevTools();
        }
    }

    // Remove menu bar in production
    if (process.env.NODE_ENV !== 'development') {
        Menu.setApplicationMenu(null);
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

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