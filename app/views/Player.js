'use strict';

const Backbone = require('backbone');

const Player = Backbone.View.extend({

  className: 'video',


  events: {
    "mouseover": "showFav",
    "mouseout": "hideFav",
    "click .icon": "favToggle"
  },


  active: false,


  template: function (model) {
    let klass = 'icon icon-heart-empty favourite-icon hidden';

    if (model.favourite) {
      klass = 'icon icon-heart red favourite-icon hidden';
    }

    return `
      <span class="${klass}"></span>
      <video width="604" controls autoplay class="video">
        <source src="${model.path}" type="video/mp4">
        Your browser does not support HTML5 video.
      </video>
      <h4 title="${model.author.name} - ${model.title}" style="margin:0px;font-size:14px;margin-left:5px;margin-right:5px;margin-bottom:5px;word-wrap:break-word;line-height:100%;">${model.author.name} - ${model.title}</h4>
      `;
    },


    initialize: function () {
      this.listenTo(this.model, 'sync', (model, val, opts) => {
        this.active = false;
      });

      this.render();
    },


    render: function() {
      this.$el.html(this.template(this.model.attributes));

      if (!this.model.watched) {
        this.model.save({watched: true});
      }

      return this;
    },


    showFav: function() {
      this.$('.favourite-icon').removeClass('hidden');
    },


    hideFav: function() {
      this.$('.favourite-icon').addClass('hidden');
    },


    favToggle: function(e) {
      if (this.active) {
        return false;
      }

      this.active = true;

      let fav = this.model.attributes.favourite ? false : true;
      let el = this.$('.favourite-icon');

      if (fav) {
        el.removeClass('icon-heart-empty').addClass('icon-heart red');
      }
      else {
        el.removeClass('icon-heart red').addClass('icon-heart-empty');
      }

      this.model.save({'favourite': fav});
    }
});

module.exports = Player;
