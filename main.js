"use strict";

const {app, ipcMain, BrowserWindow, Menu, shell, dialog, autoUpdater, Tray} = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const download = require('./app/lib/download');
const config = require('./app/config');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;
let window;


function createRootDir() {
  if (!fs.existsSync(config.STORAGE_ROOT)) {
      fs.mkdirSync(config.STORAGE_ROOT);
  }
  if (!fs.existsSync(config.IMAGES_PATH)) {
      fs.mkdirSync(config.IMAGES_PATH);
  }
  if (!fs.existsSync(config.VIDEOS_PATH)) {
      fs.mkdirSync(config.VIDEOS_PATH);
  }
}


require('electron-context-menu')({
    prepend: (params, browserWindow) => [{
        label: 'Rainbow',
        // Only show it when right-clicking images
        visible: params.mediaType === 'input'
    }]
});


function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 450,
    acceptFirstMouse: true,
    center: true,
    fullscreenable: true,
    resizable: false,
    autoHideMenuBar: true
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname,'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  //mainWindow.setAlwaysOnTop(true);

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  createTray()
  createNotificationWindow()

  loadMainMenu();

  // Create the Application's main menu

  //checkForUpdates();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});


ipcMain.on('download', (event, url) => {
  let globalInfo = null;
  let prev = 0;

  let video = download(url, function (error, doc) {

    if (error && globalInfo) {
      window.webContents.send('error', {
        id: globalInfo.uid,
        error: error
      });
    }
    else {
      window.webContents.send('complete', {
        id: globalInfo.uid,
        _id: doc._id
      });

      mainWindow.webContents.send('complete', doc);
    }

    console.log('complete 2')
  });



  video.on('info', function(info, data) {
    showWindow();

    globalInfo = {
      uid: info.uid || info.video_id,
      title: info.title,
      iurlsd: info.iurlsd
    };

    window.webContents.send('info', globalInfo);
  });

  video.on('progress', function(chunkLength, downloaded, total) {
    let cur = Math.floor(downloaded / total * 100);
    if (globalInfo && cur > prev) {
      prev = cur;

      window.webContents.send('progress', {
        id: globalInfo.uid,
        progress: cur
      });
    }
  });
});


ipcMain.on('play', (event, uid) => {
  if (mainWindow && !mainWindow.isFocused()) {
    mainWindow.focus();
  }

  mainWindow.webContents.send('play', uid);
});

ipcMain.on('show-window', () => {
  showWindow()
});


function loadMainMenu() {
  let template = [{
      label: "Application",
      submenu: [
          { label: "About Application", click: () => { shell.openExternal(config.HOME_PAGE_URL) } },
          { label: "Support", click: () => { shell.openExternal(config.GITHUB_URL_ISSUES) } },
          { label: `Check for updates (current: v${config.APP_VERSION})`, click: () => { shell.openExternal(config.UPDATES_URL) } },
          { type: "separator" },
          { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
      ]}, {
      label: "Edit",
      submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]}
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

const createTray = () => {
  if (tray) return;

  tray = new Tray(path.join(__dirname,'app', 'assets', 'img', 'icons', 'png', '16x16.png'))
  tray.on('right-click', toggleWindow)
  tray.on('double-click', toggleWindow)
  tray.on('click', function (event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window && window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  });
  tray.setToolTip(config.APP_NAME);
}


const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}

const createNotificationWindow = () => {

  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  })
  window.loadURL(`file://${path.join(__dirname, 'app', 'pages', 'notifications.html')}`)

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
}

const toggleWindow = () => {
  if (window && window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  if (!mainWindow) {
    createWindow();
  }

  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

/*
function checkForUpdates() {
  if (config.IS_PRODUCTION && process.platform === 'darwin') {

    autoUpdater.setFeedURL(`${config.UPDATES_API}?v=v${config.APP_VERSION}`);

    autoUpdater.addListener("update-downloaded", function(event, releaseNotes, releaseName, releaseDate, updateURL) {
      let index = dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: "Typetalk",
        message: 'The new version has been downloaded. Please restart the application to apply the updates.',
        detail: releaseName + "\n\n" + releaseNotes
      });

      if (index === 1) {
        return false;
      }

      autoUpdater.quitAndInstall();
    });


    autoUpdater.addListener("error", function(error) {});
  }
};*/
