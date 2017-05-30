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
    this.favourites = opts.FavouritesList;

    let handleVideoPLay = (model, val, opts) =>  {

      if (model.attributes.playing) {
        if (this.currentVideo) {
          this.currentVideo.set('playing', false);
        }

        this.currentVideo = model;

        this.renderVideo(model);
      }
    };

    this.collection.on('change:playing', handleVideoPLay);
    this.favourites.on('change:playing', handleVideoPLay);
    this.favourites.on('change:favourite', (model, val, opts) => {
      if (!model.attributes.favourite) {
        model.destroy();
      }
    });

    this.on('progress', (progress) => {
      this.renderLoading(progress);
    });

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
      });
    }
    else if (view === 'playlist') {
      let collection = (this.view === 'favourites') ? this.favourites : this.collection;

      this.currentSidebar = new this.PlayList({
          collection: collection
      });
    }

    this.$('#sidebar').html(this.currentSidebar.el);
  },


  renderToolBar: function () {
    let toolbar = new this.ToolBar();

    toolbar.on('download', (url) => {
      this.trigger('download', url);
      this.renderLoading();
    });

    toolbar.on('gohome', (url) => {
      if (this.currentVideo) {
        this.currentVideo.set('playing', false);
        this.currentVideo = null;
      }
      this.renderHome();
    });
  },


  renderLoading: function (progress = 0) {
    this.currentView.remove();
    this.$('#maincontent').html(`<x-progressbar value="${progress}" max="100"></x-progressbar>`);
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

    this.renderSidebar('playlist');

    this.$('#maincontent').html(this.currentView.el);
  },


  renderHome: function () {
    if (this.currentView) {
      this.currentView.remove();
    }

    this.currentView = new this.VideosList({
      collection: this.collection
    });

    this.collection.fetch({sort: true});

    this.$('#maincontent').html(this.currentView.el);
    this.view = 'home';

    this.renderSidebar('menu');
  },


  renderFavourites: function () {

    if (this.currentView) {
      this.currentView.remove();
    }

    this.currentView = new this.VideosList({
      collection: this.favourites
    });

    this.favourites.fetch({favourite: true});

    this.$('#maincontent').html(this.currentView.el);

    this.view = 'favourites';
  }
});

module.exports = Menu;
