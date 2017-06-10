
'use strict';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const Tray = electron.Tray;
const Database = require('./app/database');
const path = require('path');

window.$ = window.jQuery = window.require('jquery');
window.Backbone = window.require('backbone');
Backbone.sync = window.require('./app/lib/backbone.sync')(Database);


// models
const { Video, VideosCollection } = require('./app/models/Video');

//views
const VideosList = require('./app/views/VideosList');
const PlayList = require('./app/views/PlayList');
const ToolBar = require('./app/views/ToolBar');
const Menu = require('./app/views/Menu');
const NodeTube = require('./app/views/NodeTube');


Database.getAll()
.then(function (docs) {
  // instantiate collection
  let vidoescollection = new VideosCollection(docs);

  let nodetube = new NodeTube({
    collection: vidoescollection,
    views: {
      PlayList: PlayList,
      VideosList: VideosList,
      Menu: Menu,
      ToolBar: ToolBar
    }
  });

  nodetube.on('download', function (url) {
    ipcRenderer.send('download', url);
  });

  nodetube.on('open-settings', function (url) {
    ipcRenderer.send('open-settings');
  });

  ipcRenderer.on('play', function (event, uid) {

    let model = vidoescollection.get(uid);

    if (model) {
      model.set('playing', true);
    }
  });

  ipcRenderer.on('complete', function (event, data) {
    Database.create(data)
    .then(function () {
      vidoescollection.fetch({
        success: (collection, response, options) => {
          if (vidoescollection.filteredModels) {
            vidoescollection.origModels = collection.clone().models;
          }

          vidoescollection.pager();
        }
      });
    })
    .catch(function (error) {
      console.error(error)
    })
  });
})
.catch(function () {});
