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
  getWindowPosition: () => ipcRenderer.invoke('get-window-position')
});
