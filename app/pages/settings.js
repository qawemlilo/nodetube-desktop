'use strict';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const config = require('../config');
const settings = require('electron-settings');

window.$ = window.jQuery = window.require('jquery');
window.Backbone = window.require('backbone');


const Preferences = Backbone.Model.extend({
  defaults: {
    quality: "",
    directory: ""
  }
});


const PreferencesView = Backbone.View.extend({
  el: '.window',


  events: {
    "change #videoQuality": "changeVideoQuality",
    "click #videosDir": "changeVideosDir",
    "click .restore-default": "restoreDefault"
  },


  initialize: function () {
    this.listenTo(this.model, 'change:quality', (model) => {
      this.$el.find('#videoQuality').val(model.get('quality'));
    });

    this.listenTo(this.model, 'change:directory', (model) => {
      this.$el.find('#videosDir').attr('placeholder', model.get('directory'));
    });

    this.render();
  },


  render: function() {
    this.$el.find('#videoQuality').val(this.model.get('quality'));
    this.$el.find('#videosDir').attr('placeholder', this.model.get('directory'));
  },


  changeVideoQuality: function(e) {
    let val = $(e.target).val();

    this.model.set('quality', val);
    settings.set('app.video_quality', val);

    ipcRenderer.send('set-video-quality', val);
  },


  changeVideosDir: function(e) {
    ipcRenderer.send('select-dir');
  },


  restoreDefault: function(e) {
    this.model.set('quality', 18);
    this.model.set('directory', config.VIDEOS_PATH_OG);

    ipcRenderer.send('set-video-quality', 18);

    settings.set('app.video_quality', 18);
    settings.set('app.videos_dir', config.VIDEOS_PATH_OG);
  }
});

const referencesModel = new Preferences({
  quality: config.VIDEO_QUALITY,
  directory: config.VIDEOS_PATH
});

const preferencesView = new PreferencesView({
  model: referencesModel
});


ipcRenderer.on('new-dir', function (event, dir) {
  settings.set('app.videos_dir', dir);
  referencesModel.set('directory', dir);
});
