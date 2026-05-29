const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let activeProc = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#05060a',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // For now, load a minimal local HTML.
  // Later this will load the Next.js production build.
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function spawnScanner({ binaryPath, args }) {
  if (activeProc) {
    try { activeProc.kill('SIGKILL'); } catch (_) {}
    activeProc = null;
  }

  activeProc = spawn(binaryPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });

  activeProc.stdout.on('data', (chunk) => {
    // Expect JSONL lines.
    const text = chunk.toString('utf8');
    mainWindow?.webContents.send('scanner:stdout', text);
  });

  activeProc.stderr.on('data', (chunk) => {
    const text = chunk.toString('utf8');
    mainWindow?.webContents.send('scanner:stderr', text);
  });

  activeProc.on('close', (code) => {
    mainWindow?.webContents.send('scanner:exit', { code });
    activeProc = null;
  });
}

ipcMain.handle('scanner:start', async (_evt, payload) => {
  const { binaryPath, args } = payload;
  spawnScanner({ binaryPath, args });
  return { ok: true };
});

ipcMain.handle('scanner:cancel', async () => {
  if (activeProc) {
    try { activeProc.kill('SIGKILL'); } catch (_) {}
    activeProc = null;
  }
  return { ok: true };
});

