'use strict';

const Backbone = require('backbone');

const Menu = Backbone.View.extend({

  className: 'nav-group',


  tagName: 'nav',


  events: {
    "click a": "changeView"
  },


  template: function () {
    let tmpl = `<h5 class="nav-group-title">Library</h5>
      <a class="nav-group-item active" id="menu-home">
        <span class="icon icon-home"></span>
        Home
      </a>
      <a class="nav-group-item" id="menu-favourites">
        <span class="icon icon-heart"></span>
        Favourites
      </a>
      <a class="nav-group-item" id="menu-recent">
        <span class="icon icon-clock"></span>
        Recently added
      </a>
    `;

    return tmpl;
  },


  initialize: function () {
    this.render();
  },


  render: function () {
    this.$el.empty().html(this.template());
    return this;
  },


  changeView: function (e) {
    let clickedItem = $(e.target);

    this.$el.find('a.active').removeClass('active');
    clickedItem.addClass('active');

    this.trigger('newview', clickedItem.attr('id'));
  }
});

module.exports = Menu;
