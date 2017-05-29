'use strict';

const Backbone = require('backbone');
const moment = require('moment');

const VideoView = Backbone.View.extend({

    className: 'col-md-3',


    template: function (model) {
      let ago = moment(model.created_at).fromNow();

      return `
        <div class="video-thumbnail">
          <img src="${model.thumbnail_url}" style="width:100%" />
        </div>
        <div class="video-info">
          <h4 title="${model.title}">${model.title}</h4>
          <h4 title="${model.title}"><span class="icon icon-clock"></span> ${ago} <span class="icon icon-star-empty pull-right"></span></h4>
        </div>`;
    },


    events: {
      "click .video-thumbnail": "play"
    },


    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    },


    play: function (e) {
      this.model.set('playing', true);
    }
});

module.exports = VideoView;
