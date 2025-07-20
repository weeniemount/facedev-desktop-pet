const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ttsAPI', {
  speak: (text) => ipcRenderer.invoke('speak-text', text)
});
