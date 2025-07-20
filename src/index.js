const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path')
const say = require('say');

let mainWindow;

function createPromptWindow(question) {
  const win = new BrowserWindow({
    width: 300,
    height: 130,
    frame: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('src/pages/prompt/prompt.html');
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('set-question', question);
  });

  return win;
}

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

  mainWindow.loadFile('src/pages/pet/pet.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
});

ipcMain.handle('speak-text', async (event, text) => {
  return new Promise((resolve, reject) => {
    if (!text || text.trim() === '') {
      reject(new Error('Text parameter is required for speech'));
      return;
    }
    say.speak(text, undefined, 1.0, (err) => {
      if (err) reject(err);
      else resolve('spoken');
    });
  });
});

ipcMain.handle('submit-prompt', async (event, text) => {
  mainWindow.webContents.send('custom-speech', text);
  const win = BrowserWindow.fromWebContents(event.sender);
  win.close();
});

ipcMain.on('context-menu', (event, params) => {
	const menu = Menu.buildFromTemplate([
		{
			label: 'Speak!',
			click: () => {
				createPromptWindow('What should I say?');
			},
		},
		{ type: 'separator' },
		{
			label: 'quit',
			click: () => app.quit(),
		},
	]);
	menu.popup({ window: mainWindow });
});