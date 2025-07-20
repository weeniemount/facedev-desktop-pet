const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  speak: (text) => ipcRenderer.invoke('speak-text', text),
  contextMenu: () => ipcRenderer.send('context-menu'),
  onCustomSpeech: (callback) => ipcRenderer.on('custom-speech', (event, text) => callback(text)),
  submitPrompt: (text) => ipcRenderer.invoke('submit-prompt', text),
  onSetQuestion: (callback) => ipcRenderer.on('set-question', (event, question) => callback(question)),
  moveWindow: (x, y) => ipcRenderer.send('move-window', { x, y }),
  openInBrowser: (url) => ipcRenderer.invoke('open-in-browser', url),
  getScreenBounds: () => ipcRenderer.invoke('get-screen-bounds'),
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  getMovementState: () => ipcRenderer.invoke('get-movement-state'),
  getSpeechState: () => ipcRenderer.invoke('get-speech-state'),
  toggleMovement: () => ipcRenderer.invoke('toggle-movement'),
  toggleSpeech: () => ipcRenderer.invoke('toggle-speech'),
  onStateUpdate: (callback) => ipcRenderer.on('state-update', (event, states) => callback(states)),
  onToggleMovement: (callback) => ipcRenderer.on('toggle-movement-request', () => callback()),
  onToggleSpeech: (callback) => ipcRenderer.on('toggle-speech-request', () => callback()),
  getVersion: () => ipcRenderer.invoke('get-version'),
});
