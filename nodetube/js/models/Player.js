'use strict';

const Backbone = require('backbone');

const Player = Backbone.Model.extend({
  defaults: {
    type: "video/mp4",
    width: "570",
    src: "",
    path:""
  }
});


module.exports = Player;
