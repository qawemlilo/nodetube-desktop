"use strict";

const path = require('path');
const packageJSON = require('../package.json');
const APP_VERSION = packageJSON.version;


module.exports = {
  STORAGE_ROOT: getRootDir(),
  IMAGES_PATH: getImagesDir(),
  VIDEOS_PATH: getVideosDir(),

  APP_VERSION:  APP_VERSION,
  APP_NAME:  packageJSON.productName,
  IS_PRODUCTION: isProduction(),

  ANNOUNCEMENT_URL: '',
  AUTO_UPDATE_URL: '',
  CRASH_REPORT_URL: '',

  APP_FILE_ICON: '',
  APP_ICON: '',

  GITHUB_URL: 'https://github.com/qawemlilo/nodetube-desktop',
  GITHUB_URL_ISSUES: 'https://github.com/qawemlilo/nodetube-desktop/issues',
  HOME_PAGE_URL: 'https://github.com/qawemlilo/nodetube-desktop',
  UPDATES_URL: 'https://github.com/qawemlilo/nodetube-desktop/releases',
  UPDATES_API: 'https://nodetube.ragingflame.co.za/updates/latest'
};



function getRootDir() {
  let home = (process.platform === 'win32') ? 'USERPROFILE' : 'HOME';
  let rootDir = process.env[home];
  let homeDir = '';

  if (isProduction()) {
    homeDir = '.nodetube';
  }
  else {
    homeDir = '.nodetube';
  }

  return path.join(rootDir, homeDir);
}


function getImagesDir() {
  return path.join(getRootDir(), 'images');
}


function getVideosDir() {
  return path.join(getRootDir(), 'videos');
}


function isProduction () {
  if (!process.versions.electron) {
    // Node.js process
    return false
  }
  if (process.platform === 'darwin') {
    return !/\/Electron\.app\//.test(process.execPath)
  }
  if (process.platform === 'win32') {
    return !/\\electron\.exe$/.test(process.execPath)
  }
  if (process.platform === 'linux') {
    return !/\/electron$/.test(process.execPath)
  }
}
