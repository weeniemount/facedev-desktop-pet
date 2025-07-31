const path = require("path");

const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const say = require("say");

let mainWindow;
let movementEnabled = true;
let speechEnabled = true;
let currentMood = "happy"; // New mood state

function createPromptWindow(question) {
  const win = new BrowserWindow({
    alwaysOnTop: true,
    autoHideMenuBar: true,
    frame: false,
    height: 130,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
    width: 300,
  });

  win.loadFile("src/pages/prompt/prompt.html");
  win.webContents.on("did-finish-load", () => {
    win.webContents.send("set-question", question);
  });

  return win;
}

function createAboutWindow() {
  const win = new BrowserWindow({
    alwaysOnTop: true,
    autoHideMenuBar: true,
    frame: false,
    height: 200,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
    width: 400,
  });

  win.loadFile("src/pages/about/about.html");
}

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    alwaysOnTop: true,
    autoHideMenuBar: true,
    frame: false,
    height: 200,
    resizable: false,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
    width: 200,
  });

  app.dock?.hide();

  mainWindow.loadFile("src/pages/pet/pet.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
    app.quit();
  });
});

ipcMain.handle("speak-text", async (event, text) => {
  return new Promise((resolve, reject) => {
    if (!text || text.trim() === "") {
      reject(new Error("Text parameter is required for speech"));
      return;
    }
    say.speak(text, undefined, 1.0, (err) => {
      if (err) reject(err);
      else resolve("spoken");
    });
  });
});

ipcMain.handle("submit-prompt", async (event, text) => {
  mainWindow.webContents.send("custom-speech", text);
  const win = BrowserWindow.fromWebContents(event.sender);
  win.close();
});

ipcMain.handle("ask-question", async (event, question) => {
  mainWindow.webContents.send("answer-question", question);
  const win = BrowserWindow.fromWebContents(event.sender);
  win.close();
});

ipcMain.handle("get-movement-state", () => movementEnabled);
ipcMain.handle("get-speech-state", () => speechEnabled);

ipcMain.handle("toggle-movement", () => {
  movementEnabled = !movementEnabled;
  mainWindow?.webContents.send("state-update", {
    movement: movementEnabled,
    speech: speechEnabled,
  });
  return movementEnabled;
});

ipcMain.handle("toggle-speech", () => {
  speechEnabled = !speechEnabled;
  mainWindow?.webContents.send("state-update", {
    movement: movementEnabled,
    speech: speechEnabled,
  });
  return speechEnabled;
});

ipcMain.handle("get-mood", () => currentMood);

ipcMain.handle("set-mood", (event, mood) => {
  currentMood = mood;
  mainWindow?.webContents.send("mood-update", mood);
  return currentMood;
});

ipcMain.on("context-menu", (event, params) => {
  const menu = Menu.buildFromTemplate([
    {
      click: () => {
        createPromptWindow("What should I say?");
      },
      label: "Speak!",
    },
    {
      click: () => {
        mainWindow.webContents.send("custom-speech", "tell-joke");
      },
      label: "Tell a joke",
    },
    {
      click: () => {
        createPromptWindow("What will you ask me?");
      },
      label: "Ask me a question!",
    },
    { type: "separator" },
    {
      click: async () => {
        movementEnabled = !movementEnabled;
        mainWindow.webContents.send("state-update", {
          movement: movementEnabled,
          speech: speechEnabled,
        });
      },
      label: movementEnabled ? "STOP MOVING!!!" : "START MOVING!!!",
    },
    {
      click: async () => {
        speechEnabled = !speechEnabled;
        mainWindow.webContents.send("state-update", {
          movement: movementEnabled,
          speech: speechEnabled,
        });
      },
      label: speechEnabled ? "STOP TALKING!!!" : "START TALKING!!!",
    },
    { type: "separator" },
    {
      label: "Mood",
      submenu: [
        {
          click: () => mainWindow.webContents.send("set-mood-request", "happy"),
          label: "Happy",
        },
        {
          click: () =>
            mainWindow.webContents.send("set-mood-request", "sleepy"),
          label: "Sleepy",
        },
        {
          click: () =>
            mainWindow.webContents.send("set-mood-request", "excited"),
          label: "Excited",
        },
      ],
    },
    { type: "separator" },
    {
      click: () => {
        createAboutWindow();
      },
      label: "About",
    },
    {
      click: () => app.quit(),
      label: "quit",
    },
  ]);
  menu.popup({ window: mainWindow });
});

ipcMain.on("move-window", (event, { x, y }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const [currentX, currentY] = win.getPosition();
  win.setPosition(currentX + x, currentY + y);
});

ipcMain.handle("open-in-browser", async (event, url) => {
  const { shell } = require("electron");
  try {
    await shell.openExternal(url);
    return "opened";
  } catch (error) {
    throw new Error(`Failed to open URL: ${error.message}`);
  }
});

ipcMain.handle("get-screen-bounds", () => {
  const { screen } = require("electron");
  const primaryDisplay = screen.getPrimaryDisplay();
  return primaryDisplay.workAreaSize;
});

ipcMain.handle("get-window-position", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  return win.getPosition();
});

ipcMain.handle("get-version", () => {
  return app.getVersion();
});
