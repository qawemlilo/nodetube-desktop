'use strict';

const Backbone = require('backbone');
const LinkView = require('./Link');

const PlayList = Backbone.View.extend({

  className: "list-group",


  tagName: "ul",


  initialize: function () {
    this.render();
  },


  render: function () {
    this.$el.empty();

    this.collection.each((model) => {
      this.$el.append(new LinkView({
        model: model
      }).render().el);
    });

    return this;
  }
});

module.exports = PlayList;
