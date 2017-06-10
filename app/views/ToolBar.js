'use strict';

const Backbone = require('backbone');


const ToolBar = Backbone.View.extend({

  el: '#toolbar',


  events: {
    "keyup .youtube-input": "handleSearch",
    "click .home-btn": "goHome",
    "click .settings-btn": "openPreferences"
  },


  template: function () {
    let tmpl = `
      <x-button class="home-btn" skin="iconic">
        <x-icon name="home"></x-icon>
      </x-button>

      <x-input type="url" class="youtube-input">
        <x-icon name="play-arrow"></x-icon>
        <x-label>YouTube url</x-label>
      </x-input>

      <x-button class="settings-btn" skin="iconic" style="margin-left:390px">
        <x-icon name="settings"></x-icon>
      </x-button>
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


  handleSearch: function (e) {
    if (e.keyCode == 13) {
      let searchBox = $(e.target);
      this.trigger('download', searchBox.val());
      searchBox.val('');
    }
  },


  goHome: function (e) {
    this.trigger('gohome');
  },


  openPreferences: function (e) {
    this.trigger('open-settings');
  }
});

module.exports = ToolBar;
