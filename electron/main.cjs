const { app, BrowserWindow, ipcMain, Notification, Tray, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let tray;

// Garante que apenas uma instância do app esteja rodando
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      backgroundColor: '#050505',
      title: 'NovaesWeb Admin',
      icon: path.join(__dirname, isDev ? '../public/favicon.ico' : '../dist/favicon.ico'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Logo na inicialização, configurar o auto-start
    if (!isDev) {
      app.setLoginItemSettings({
        openAtLogin: true,
        path: app.getPath('exe')
      });
    }

    // Remove menu (professional look)
    mainWindow.setMenuBarVisibility(false);

    if (isDev) {
      mainWindow.loadURL('http://127.0.0.1:8080/admin/login').catch(err => {
        console.error('Failed to load URL:', err);
      });
    } else {
      // Carrega direto do seu site no ar (Atualização Automática!)
      mainWindow.loadURL('https://novaesweb.vercel.app/admin/login').catch(err => {
        console.error('Failed to load Production URL:', err);
      });
    }

    // Se falhar ao carregar, avisar o motivo
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.log('Failed to load:', errorCode, errorDescription);
      const errorPage = `data:text/html,<html><body style="background:black;color:white;padding:40px;font-family:sans-serif">
        <h1 style="color:red">Erro de Conexão!</h1>
        <p>Não foi possível conectar ao servidor da <b>NovaesWeb</b>.</p>
        <p>Verifique sua conexão com a internet ou se o site está no ar.</p>
        <hr style="border-color:rgba(255,255,255,0.1)">
        <p style="font-size:12px;color:gray">Código do erro: ${errorDescription}</p>
        <button onclick="window.location.reload()" style="padding:10px 20px;border-radius:8px;background:red;color:white;border:0;cursor:pointer">Tentar Novamente</button>
      </body></html>`;
      mainWindow.loadURL(errorPage);
    });

    // Ao tentar fechar, apenas esconder a janela (Fica no Tray)
    mainWindow.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
      return false;
    });

    // Logging de carregamento bem sucedido
    mainWindow.webContents.on('did-finish-load', () => {
      console.log('Main window finished loading');
    });
  }

  function createTray() {
    const iconPath = path.join(__dirname, isDev ? '../public/favicon.ico' : '../dist/favicon.ico');
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Abrir Painel Admin', click: () => mainWindow.show() },
      { type: 'separator' },
      { label: 'Sair Completamente', click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);
    tray.setToolTip('NovaesWeb Admin');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => mainWindow.show());
  }

  app.whenReady().then(() => {
    console.log('App ready, creating window and tray...');
    createWindow();
    createTray();
    console.log('Setup complete.');
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Listener para Notificações Nativas
  ipcMain.on('notify', (event, { title, body, url }) => {
    const notification = new Notification({
      title: title || 'NovaesWeb Admin',
      body: body || 'Nova mensagem recebida.',
      icon: path.join(__dirname, isDev ? '../public/favicon.ico' : '../dist/favicon.ico'),
      silent: false
    });

    notification.on('click', () => {
      mainWindow.show();
      if (url) {
        // Envia para o frontend navegar para a URL específica
        mainWindow.webContents.send('navigate-to', url);
      }
    });

    notification.show();
  });
}
