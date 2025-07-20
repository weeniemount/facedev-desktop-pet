const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path')

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 200,
    height: 200,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname.concat('/src/'), 'preload.js')
    },
  });

  app.dock?.hide();

  mainWindow.loadFile('src/index.html');

  ipcMain.on('context-menu', (event, params) => {
    const menu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => app.quit(),
      },
    ]);
    menu.popup({ window: mainWindow });
  });

  mainWindow.on('closed', () => {
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