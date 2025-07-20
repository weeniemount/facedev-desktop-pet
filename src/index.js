const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path')
const say = require('say');

let mainwindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 200,
    height: 200,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  app.dock?.hide();

  mainWindow.loadFile('src/index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
});

ipcMain.handle('speak-text', async (event, text) => {
  return new Promise((resolve, reject) => {
    say.speak(text, undefined, 1.0, (err) => {
      if (err) reject(err);
      else resolve('spoken');
    });
  });
});

ipcMain.on('context-menu', (event, params) => {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);
  menu.popup({ window: mainWindow });
});