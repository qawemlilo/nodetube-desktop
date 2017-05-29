"use strict";

const {app, ipcMain, BrowserWindow, Menu} = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const download = require('./download');
const config = require('./config');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


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

createRootDir();

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 450,
    acceptFirstMouse: true,
    center: true,
    fullscreenable: true,
    resizable: false
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
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
  let video = download(url, function (error, doc) {

    if (error) {
      event.sender.send('error', error);
    }
    else {
      event.sender.send('complete', doc);
    }
  });

  video.on('progress', function(chunkLength, downloaded, total) {
    event.sender.send('progress', (downloaded / total * 100).toFixed(2));
  });
});
