'use strict';

const Backbone = require('backbone');
const moment = require('moment');
const config = require('../config');

const LinkView = Backbone.View.extend({

  className: "list-group-item",

  tagName: "li",

  template: function (data) {
    let ago = moment(data.created_at).fromNow();

    return `
      <img class="media-object pull-left" src="${data.iurlsd}" data-src="${config.PLACEHOLDER_ICON}"  style="width:64px;height:48px" onerror="this.onerror=null;this.dataset.src">
      <div class="media-body">
        <strong>${data.title}</strong>
        <p>
          ${data.author.name}<br>
          <small><span class="icon icon-clock"></span> ${ago}</small>
        </p>
      </div>`;
  },


  events: {
    "click": "play"
  },


  initialize: function () {
    this.listenTo(this.model, 'change:playing', (model, val, opts) => {
      if (model.attributes.playing) {
        this.$el.addClass('active');
      }
      else {
        this.$el.removeClass('active');
      }
    });

    this.listenTo(this.model, 'destroy', (model, val, opts) => {
      this.remove();
    });
  },


  render: function() {
    this.$el.attr('title', this.model.attributes.title);

    if (this.model.attributes.playing) {
      this.$el.addClass('active');
    }

    this.$el.html(this.template(this.model.attributes));

    return this;
  },


  play: function (e) {
    this.model.set('playing', true);
  }
});

module.exports = LinkView;
