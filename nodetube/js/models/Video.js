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
    favourite: false
  },

  comparator: function(model) {
    console.log('comparator called')
    return (model.get('created_at').getTime());
  },

  sort: true
});

const VideosCollection = Backbone.Collection.extend({

  model: Video

});


module.exports.Video = Video;
module.exports.VideosCollection = VideosCollection;
