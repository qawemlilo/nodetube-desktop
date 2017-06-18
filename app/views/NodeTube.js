'use strict';

const Backbone = require('backbone');
const PlayerView = require('./Player');

const Menu = Backbone.View.extend({

  el: '#nodetube',


  PlayList: null,


  VideosList: null,


  Menu: null,


  currentVideo: null,


  currentView: null,


  currentSidebar: null,


  initialize: function (opts) {
    this.PlayList = opts.views.PlayList;
    this.VideosList = opts.views.VideosList;
    this.ToolBar = opts.views.ToolBar;
    this.Menu = opts.views.Menu;
    this.Player = opts.views.Player;
    this.collection = opts.collection;

    let handleVideoPLay = (model, val, opts) =>  {

      if (model.attributes.playing) {
        if (this.currentVideo) {
          this.currentVideo.set('playing', false);
        }

        this.currentVideo = model;

        this.renderVideo(model);
        this.view = 'playing';
      }
    };

    this.collection.on('change:playing', handleVideoPLay);


    this.renderToolBar();
    this.renderHome();
  },


  renderSidebar: function (view) {
    if (this.currentSidebar) {
      this.currentSidebar.remove();
    }

    if (view === 'menu') {
      this.currentSidebar = new this.Menu();

      this.currentSidebar.on('newview', (view) => {
        if (view === 'menu-home') {
          this.renderHome();
        }
        if (view === 'menu-favourites') {
          this.renderFavourites();
        }
        if (view === 'menu-recent') {
          this.renderRecent();
        }
      });
    }
    else if (view === 'playlist') {
      this.currentSidebar = new this.PlayList({
          collection: this.collection
      });
    }

    this.$('#sidebar').html(this.currentSidebar.el);
  },


  renderToolBar: function () {
    let toolbar = new this.ToolBar();

    toolbar.on('download', (url) => {
      this.trigger('download', url);
    });

    toolbar.on('gohome', (url) => {
      if (this.currentVideo) {
        this.currentVideo.set('playing', false);
        this.currentVideo = null;
      }
      this.renderHome();
    });

    toolbar.on('open-settings', (url) => {
      this.trigger('open-settings');
    });
  },


  renderLoading: function (progress = 0) {
    this.$('.progress-bar').val(progress);
    return this;
  },


  showError: function (error) {
    this.currentView.remove();
    this.$('#maincontent').html('<p>Video failed to load</p>');
  },


  renderVideo: function (model) {

    if (this.currentView) {
      this.currentView.remove();
    }

    this.currentView = new PlayerView({
      model: model
    });

    if (this.view !== 'playing') {
      this.renderSidebar('playlist');
    }



    this.$('#maincontent').html(this.currentView.el);
  },


  renderHome: function () {
    if (this.currentView) {
      this.currentView.remove();
    }

    this.collection.origModels = null;
    this.collection.filteredModels = null;

    this.currentView = new this.VideosList({
      collection: this.collection
    });

    this.$('#maincontent').html(this.currentView.el);
    this.renderSidebar('menu');

    this.collection.fetch();

    this.view = 'home';
  },


  renderFavourites: function () {
    this.collection.getFavourites();
    this.view = 'favourites';
  },


  renderRecent: function () {
    this.collection.getRecent();
    this.view = 'recent';
  }
});

module.exports = Menu;
