const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  speak: (text) => ipcRenderer.invoke('speak-text', text),
  contextMenu: () => ipcRenderer.send('context-menu')
});
