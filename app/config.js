"use strict";

const path = require('path');
const packageJSON = require('../package.json');
const APP_VERSION = packageJSON.version;
const settings = require('electron-settings');
const VIDEO_QUALITY = settings.has('app.video_quality') ? settings.get('app.video_quality') : 18;

module.exports = {
  STORAGE_ROOT: getRootDir(),
  IMAGES_PATH: getImagesDir(),
  VIDEOS_PATH: getVideosDir(),

  VIDEOS_PATH_OG: path.join(getRootDir(), 'videos'),

  VIDEO_QUALITY: VIDEO_QUALITY,

  APP_VERSION:  APP_VERSION,
  APP_NAME:  packageJSON.productName,
  APP_COPYRIGHT: 'Copyright © 2017 Raging Flame Solutions',

  IS_PRODUCTION: isProduction(),

  ANNOUNCEMENT_URL: '',
  AUTO_UPDATE_URL: '',
  CRASH_REPORT_URL: '',

  APP_FILE_ICON: '',
  APP_ICON: path.join(__dirname, 'assets', 'img', 'icons', 'mac', 'icon.icns'),

  GITHUB_URL: 'https://github.com/qawemlilo/nodetube-desktop',
  GITHUB_URL_ISSUES: 'https://github.com/qawemlilo/nodetube-desktop/issues',
  HOME_PAGE_URL: 'https://github.com/qawemlilo/nodetube-desktop',
  UPDATES_URL: 'https://github.com/qawemlilo/nodetube-desktop/releases',
  UPDATES_API: 'https://nodetube.ragingflame.co.za/updates/latest',
  CRASH_REPORT_URL: 'https://nodetube.ragingflame.co.za/crash-report'
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
  if (settings.has('app.videos_dir')) {
    return settings.get('app.videos_dir');
  }

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
