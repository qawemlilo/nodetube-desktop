#!/usr/bin/env node

/**
 * Builds app binaries for Mac, Windows, and Linux.
 */

const cp = require('child_process');
const electronPackager = require('electron-packager');
const fs = require('fs');
const mkdirp = require('mkdirp');
const os = require('os');
const path = require('path');
const rimraf = require('rimraf');
const zip = require('cross-zip');
const config = require('./app/config');
const pkg = require('./package.json');
const devDeps = Object.keys(pkg.devDependencies);


const BUILD_NAME = config.APP_NAME + '-v' + config.APP_VERSION;
const BUILD_PATH = path.join(__dirname, 'build');
const DIST_PATH = path.join(__dirname, 'dist');
const NODE_MODULES_PATH = path.join(__dirname, 'node_modules');
const ElectronVersion = require('electron/package.json').version;


function build () {
  console.log('Reinstalling node_modules...')
  //rimraf.sync(NODE_MODULES_PATH)
  //cp.execSync('npm install', { stdio: 'inherit' })
  //cp.execSync('npm dedupe', { stdio: 'inherit' })

  console.log('Nuking dist/ and build/...')
  //rimraf.sync(DIST_PATH)
  //rimraf.sync(BUILD_PATH)

  buildDarwin(printDone)
}

const darwin = {
  // The human-readable copyright line for the app. Maps to the `LegalCopyright` metadata
  // property on Windows, and `NSHumanReadableCopyright` on Mac.
  appCopyright: config.APP_COPYRIGHT,

  // The release version of the application. Maps to the `ProductVersion` metadata
  // property on Windows, and `CFBundleShortVersionString` on Mac.
  appVersion: pkg.version,

  // Package the application's source code into an archive, using Electron's archive
  // format. Mitigates issues around long path names on Windows and slightly speeds up
  // require().
  asar: {
    // A glob expression, that unpacks the files with matching names to the
    // "app.asar.unpacked" directory.
    unpack: 'NodeTube*'
  },

  // The build version of the application. Maps to the FileVersion metadata property on
  // Windows, and CFBundleVersion on Mac. Note: Windows requires the build version to
  // start with a number. We're using the version of the underlying WebTorrent library.
  buildVersion: require('electron/package.json').version,

  // The application source directory.
  dir: './',

  // Pattern which specifies which files to ignore when copying files to create the
  // package(s).
  ignore: [
    '/README.md',
    '/package.js',
    '/build($|/)',
    '/dist($|/)',
    '/release($|/)'
  ].concat(devDeps.map(function(name) {
    return '/node_modules/' + name + '($|/)';
  })),

  // The application name.
  name: config.APP_NAME,

  // The base directory where the finished package(s) are created.
  out: DIST_PATH,

  // Replace an already existing output directory.
  overwrite: true,

  // Runs `npm prune --production` which remove the packages specified in
  // "devDependencies" before starting to package the app.
  prune: true,

  // The Electron version that the app is built with (without the leading 'v')
  electronVersion: ElectronVersion,

  // Build for Mac
  platform: 'darwin',

  // Build x64 binaries only.
  arch: 'x64',

  // The bundle identifier to use in the application's plist (Mac only).
  appBundleId: 'co.za.ragingflame.nodetube',

  // The application category type, as shown in the Finder via "View" -> "Arrange by
  // Application Category" when viewing the Applications directory (Mac only).
  appCategoryType: 'public.app-category.utilities',

  // The bundle identifier to use in the application helper's plist (Mac only).
  helperBundleId: 'co.za.ragingflame.nodetube.nodetube-helper',

  // Application icon.
  icon: config.APP_ICON
}


build();

function buildDarwin (cb) {
  const plist = require('plist');

  console.log('Mac: Packaging electron...');

  electronPackager(Object.assign({}, darwin), function (err, buildPath) {
    if (err) return cb(err)
    console.log('Mac: Packaged electron. ' + buildPath)

    const appPath = path.join(buildPath[0], config.APP_NAME + '.app')
    console.log('appPath ', appPath);
    const contentsPath = path.join(appPath, 'Contents')
    const resourcesPath = path.join(contentsPath, 'Resources')
    const infoPlistPath = path.join(contentsPath, 'Info.plist')
    const infoPlist = plist.parse(fs.readFileSync(infoPlistPath, 'utf8'))

    infoPlist.CFBundleDocumentTypes = [
      {
        CFBundleTypeName: 'Any',
        CFBundleTypeOSTypes: [ '****' ],
        CFBundleTypeRole: 'Editor',
        LSHandlerRank: 'Owner',
        LSTypeIsPackage: false
      }
    ];

    fs.writeFileSync(infoPlistPath, plist.build(infoPlist))

    // Copy torrent file icon into app bundle
    cp.execSync(`cp ${config.APP_ICON} ${resourcesPath}`)

    signApp(function (err) {
      if (err) return cb(err)
      pack(cb)
    });

    function signApp (cb) {
      const sign = require('electron-osx-sign')

      /*
       * Sign the app with Apple Developer ID certificates. We sign the app for 2 reasons:
       *   - So the auto-updater (Squirrrel.Mac) can check that app updates are signed by
       *     the same author as the current version.
       *   - So users will not a see a warning about the app coming from an "Unidentified
       *     Developer" when they open it for the first time (Mac Gatekeeper).
       *
       * To sign an Mac app for distribution outside the App Store, the following are
       * required:
       *   - Xcode
       *   - Xcode Command Line Tools (xcode-select --install)
       *   - Membership in the Apple Developer Program
       */
      const signOpts = {
        app: appPath,
        platform: 'darwin',
        verbose: true,
        sign: 'Mac Developer: qawemlilo@gmail.com (Y82W7MPY89)'
      }

      console.log('Mac: Signing app...')
      sign(signOpts, function (err) {
        if (err) return cb(err)
        console.log('Mac: Signed app.')
        cb(null)
      })
    }

    function pack (cb) {
      packageZip();
      packageDmg(cb);
    }

    function packageZip () {
      // Create .zip file (used by the auto-updater)
      console.log('Mac: Creating zip...')

      const inPath = path.join(buildPath[0], config.APP_NAME + '.app')
      const outPath = path.join(DIST_PATH, BUILD_NAME + '-darwin.zip')
      zip.zipSync(inPath, outPath)

      console.log('Mac: Created zip.')
    }

    function packageDmg (cb) {
      console.log('Mac: Creating dmg...')

      const appDmg = require('appdmg')

      const targetPath = path.join(DIST_PATH, BUILD_NAME + '.dmg')
      rimraf.sync(targetPath)

      // Create a .dmg (Mac disk image) file, for easy user installation.
      const dmgOpts = {
        basepath: config.ROOT_PATH,
        target: targetPath,
        specification: {
          title: config.APP_NAME,
          icon: config.APP_ICON
        }
      }

      const dmg = appDmg(dmgOpts)
      dmg.once('error', cb)
      dmg.on('progress', function (info) {
        if (info.type === 'step-begin') console.log(info.title + '...')
      })
      dmg.once('finish', function (info) {
        console.log('Mac: Created dmg.')
        cb(null)
      })
    }
  })
}



function printDone (err) {
  if (err) console.error(err.message || err)
}
