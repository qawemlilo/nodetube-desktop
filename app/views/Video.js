'use strict';

const Backbone = require('backbone');
const moment = require('moment');
const fs = require('fs');
const config = require('../config');

const VideoView = Backbone.View.extend({

    className: 'col-md-3',


    template: function (model) {
      let ago = moment(model.created_at).fromNow();

      return `
        <span class="icon icon-trash red delete-icon hidden"></span>
        <div class="video-thumbnail">
          <img src="${model.iurlsd}" data-src="${config.PLACEHOLDER_ICON}" style="width:100%" onerror="this.onerror=null;this.width=196;this.height=147;this.src=this.dataset.src"/>
        </div>
        <div class="video-info">
          <h4 title="${model.title}">${model.title}</h4>
          <h4 title="${model.title}"><span class="icon icon-clock"></span> ${ago}</h4>
        </div>`;
    },


    events: {
      "click .video-thumbnail": "play",
      "mouseenter": "toggleDelete",
      "mouseleave": "toggleDelete",
      "click .delete-icon": "remove"
    },


    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    },


    play: function (e) {
      this.model.set('playing', true);
    },


    toggleDelete: function (e) {
      let el = this.$('.delete-icon');

      if (el.hasClass('hidden')) {
        el.removeClass('hidden');
      }
      else {
        el.addClass('hidden');
      }
    },


    remove: function (e) {
      let video = this.model.attributes.path;

      this.model.destroy({
        force: true,
        success: function () {
          fs.unlinkSync(video);
        }
      });

      this.$el.remove();
    }
});

module.exports = VideoView;
