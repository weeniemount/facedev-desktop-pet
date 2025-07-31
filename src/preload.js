const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  askQuestion: (question) => ipcRenderer.invoke("ask-question", question),
  contextMenu: () => ipcRenderer.send("context-menu"),
  getMood: () => ipcRenderer.invoke("get-mood"),
  getMovementState: () => ipcRenderer.invoke("get-movement-state"),
  getScreenBounds: () => ipcRenderer.invoke("get-screen-bounds"),
  getSpeechState: () => ipcRenderer.invoke("get-speech-state"),
  getVersion: () => ipcRenderer.invoke("get-version"),
  getWindowPosition: () => ipcRenderer.invoke("get-window-position"),
  moveWindow: (x, y) => ipcRenderer.send("move-window", { x, y }),
  onAnswerQuestion: (callback) =>
    ipcRenderer.on("answer-question", (event, question) => callback(question)),
  onCustomSpeech: (callback) =>
    ipcRenderer.on("custom-speech", (event, text) => callback(text)),
  onMoodUpdate: (callback) =>
    ipcRenderer.on("mood-update", (event, mood) => callback(mood)),
  onSetMoodRequest: (callback) =>
    ipcRenderer.on("set-mood-request", (event, mood) => callback(mood)),
  onSetQuestion: (callback) =>
    ipcRenderer.on("set-question", (event, question) => callback(question)),
  onStateUpdate: (callback) =>
    ipcRenderer.on("state-update", (event, states) => callback(states)),
  onToggleMovement: (callback) =>
    ipcRenderer.on("toggle-movement-request", () => callback()),
  onToggleSpeech: (callback) =>
    ipcRenderer.on("toggle-speech-request", () => callback()),
  openInBrowser: (url) => ipcRenderer.invoke("open-in-browser", url),
  setMood: (mood) => ipcRenderer.invoke("set-mood", mood),
  speak: (text) => ipcRenderer.invoke("speak-text", text),
  submitPrompt: (text) => ipcRenderer.invoke("submit-prompt", text),
  toggleMovement: () => ipcRenderer.invoke("toggle-movement"),
  toggleSpeech: () => ipcRenderer.invoke("toggle-speech"),
});
