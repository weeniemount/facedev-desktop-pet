import { app, BrowserWindow } from 'electron';


app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 100,
    height: 100,
    transparent: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    app.quit();
  });
});