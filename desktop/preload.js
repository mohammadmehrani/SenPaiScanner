const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('scannerAPI', {
  start: (payload) => ipcRenderer.invoke('scanner:start', payload),
  cancel: () => ipcRenderer.invoke('scanner:cancel'),
  onStdout: (cb) => ipcRenderer.on('scanner:stdout', (_evt, chunk) => cb(chunk)),
  onStderr: (cb) => ipcRenderer.on('scanner:stderr', (_evt, chunk) => cb(chunk)),
  onExit: (cb) => ipcRenderer.on('scanner:exit', (_evt, data) => cb(data))
});

