import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import screenshot from 'screenshot-desktop'

const __dirname = dirname(fileURLToPath(import.meta.url))
const goalsFile = join(app.getPath('userData'), 'goal.json')

let mainWindow

function createWindow() {
  console.log('Creating window...')
  mainWindow = new BrowserWindow({
    width: 350,
    height: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
    alwaysOnTop: true,
    frame: true,
    resizable: true,
    movable: true,
    opacity: 0.95,
  })

  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV

  if (isDev) {
    console.log('Loading from dev server...')
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('save-goal', (event, goal) => {
  try {
    writeFileSync(goalsFile, JSON.stringify({ goal, date: new Date().toISOString() }))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('load-goal', (event) => {
  try {
    if (existsSync(goalsFile)) {
      const data = JSON.parse(readFileSync(goalsFile, 'utf-8'))
      return data
    }
    return { goal: '', date: null }
  } catch (error) {
    return { goal: '', date: null, error: error.message }
  }
})

ipcMain.handle('take-screenshot', async (event) => {
  try {
    const img = await screenshot()
    return { success: true, image: img.toString('base64') }
  } catch (error) {
    console.error('Screenshot error:', error)
    return { success: false, error: error.message }
  }
})

app.on('ready', () => {
  console.log('App ready event fired')
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
