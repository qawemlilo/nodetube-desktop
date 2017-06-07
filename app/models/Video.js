'use strict';

const Backbone = require('backbone');

const Video = Backbone.Model.extend({
  idAttribute: "_id",

  defaults: {
    playing: false,
    video_id: "",
    title: "",
    uid: "",
    thumbnail_url: "",
    author: {},
    description: "",
    related_videos: [],
    video_url: "",
    iurlsd: "",
    iurlmq: "",
    iurlhq: "",
    iurlmaxres: "",
    timestamp: "",
    created_at: new Date(),
    favourite: false,
    watched: false
  }
});

const VideosCollection = Backbone.Collection.extend({

  comparator: function(model) {
    return -model.get('created_at');
  },


  sortOrder: 'desc',


  limit: 9,


  model: Video,



  initialize: function () {
      this.filteredModels = null;
      this.currentPage = 1;
      this.allFetched = false;
  },


  getFavourites: function () {
    let models = this.origModels ? this.origModels : this.models;

    let favourites = models.filter(function (video) {
        return video.get('favourite');
    });

    this.filteredModels = favourites;
    this.pager();
  },


  getRecent: function () {
    let recent = this.origModels ? this.origModels : this.models;

    let notwatched = recent.filter(function (video) {
        return !video.get('watched');
    });

    this.filteredModels = notwatched.length ? notwatched.slice(0, this.limit) : recent.slice(0, this.limit);
    this.pager();
  },


  pager: function () {
    if (!this.origModels) {
      this.origModels = this.clone().models;
    }

    if (this.filteredModels) {
      this.models = this.filteredModels;
    }
    else {
      this.models = this.origModels;
    }

    this.reset(this.models.slice(0));
  }

});


module.exports.Video = Video;
module.exports.VideosCollection = VideosCollection;
