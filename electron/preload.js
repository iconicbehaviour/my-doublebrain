import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  takeScreenshot: () => ipcRenderer.invoke('take-screenshot'),
})
