
'use strict';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const Database = require('./database');



window.$ = window.jQuery = window.require('jquery');
window.Backbone = window.require('backbone');
Backbone.sync = window.require('./backbone.sync')(Database);

// models
const { Video, VideosCollection } = require('./nodetube/js/models/Video');

//views
const VideosList = require('./nodetube/js/views/VideosList');
const PlayList = require('./nodetube/js/views/PlayList');
const ToolBar = require('./nodetube/js/views/ToolBar');
const Menu = require('./nodetube/js/views/Menu');
const NodeTube = require('./nodetube/js/views/NodeTube');


Database.getAll()
.then(function (docs) {
  // instantiate collection
  let vidoescollection = new VideosCollection(docs);
  let favouritescollection = new VideosCollection(docs.filter(x => x.favourite));

  let nodetube = new NodeTube({
    collection: vidoescollection,
    FavouritesList: favouritescollection,
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

  ipcRenderer.on('complete', function (event, doc) {
    if (!doc) {
      return nodetube.showError(new Error('Document not found'));
    }

    let video = new Video(doc)

    vidoescollection.add(video)

    nodetube.renderVideo(video);
  });

  ipcRenderer.on('error', function (event, error) {
    nodetube.showError(error);
  });

  ipcRenderer.on('progress', function (event, progress) {
    nodetube.trigger('progress', progress);
  });

})
.catch(function () {
});
