'use strict';

const Backbone = require('backbone');

const Player = Backbone.View.extend({

  className: 'video',


  events: {
    "mouseover": "showFav",
    "mouseout": "hideFav",
    "click .icon": "favToggle"
  },


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
      <h4 style="margin:0px;font-size:16px;margin-left:5px;margin-right:5px;">${model.author.name} - ${model.title}</h4>
      `;
    },

    
    initialize: function () {
      this.render();
    },


    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    },


    showFav: function() {
      this.$('.favourite-icon').removeClass('hidden');
    },


    hideFav: function() {
      this.$('.favourite-icon').addClass('hidden');
    },


    favToggle: function(e) {
      let fav = this.model.attributes.favourite ? false : true;

      if (fav) {
        this.$('.favourite-icon')
        .removeClass('icon-heart-empty')
        .addClass('icon-heart red');
      }
      else {
        this.$('.favourite-icon')
        .removeClass('icon-heart red')
        .addClass('icon-heart-empty');
      }

      this.model.set('favourite', fav);

      this.model.save();
    }
});

module.exports = Player;
