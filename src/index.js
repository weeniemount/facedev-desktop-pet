const { app, BrowserWindow, Menu, ipcMain } = require('electron');

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