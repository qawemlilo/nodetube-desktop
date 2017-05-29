'use strict';

const Backbone = require('backbone');
const VideoView = require('./Video');

const VideosList = Backbone.View.extend({

  id: 'content',


  initialize: function () {
    this.collection.on('reset', (model, collection, options) => {
      this.render();
    });

    this.collection.on('add', (model, collection, options) => {
      this.$el.append(new VideoView({
        model: model
      }).render().el);
    });

    this.render();
  },


  render: function () {
    this.$el.empty();
    this.collection.each((model) => {
      this.$el.append(new VideoView({
        model:model
      }).render().el);
    });

    return this;
  }
});

module.exports = VideosList;
