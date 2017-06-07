'use strict';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const path = require('path');

window.$ = window.jQuery = window.require('jquery');
window.Backbone = window.require('backbone');

Storage.prototype.save = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}

Storage.prototype.get = function(key) {
    return this.getItem(key) ? JSON.parse(this.getItem(key)) : [];
}

Storage.prototype.remove = function(key) {
    this.removeItem(key);
}


const DB_NAME = 'NodeTubeDownloads';

console.log(DB_NAME);

const Download = Backbone.Model.extend({
  defaults: {
    src: "",
    title: "",
    progress: 0,
    _id: null
  }
});


const DownloadsCollection = Backbone.Collection.extend({
  model: Download
});


const DownloadView = Backbone.View.extend({

    className: 'list-group-item',


    tagName: 'li',


    events: {
      "click": "play"
    },


    initialize: function () {
      this.model.on('change:progress', (model) => {
        this.$el.find('.progress-bar').val(model.get('progress'));
      });

      this.model.on('complete', (model) => {
        this.$el.find('.activity').text('Download complete!');
      });
    },


    template: function (data) {
      let activity = data.progress === 100 ? 'Download complete!' : 'Downloading....';
      return `
      <img class="media-object pull-left" src="${data.src}" style="width:64px;">
      <div class="media-body">
        <strong>${data.title}</strong>
        <p class="activity">${activity}</p>
        <x-progressbar class="progress-bar" value="${data.progress}" max="100"></x-progressbar>
      </div>`;
    },


    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    },


    play: function() {
      this.model.trigger('play', this.model.get('_id'));
    }
});


const DownloadsListView = Backbone.View.extend({

  className: "list-group",


  tagName: "ul",


  initialize: function () {
    this.collection.on('add', (model, collection, opts) => {
      this.render();
    });

    this.collection.on('reset', (model, collection, opts) => {
      this.render();
    });

    this.collection.on('refresh', () => {
      this.render();
    });

    this.render();
  },


  render: function () {
    this.$el.empty();

    if (this.collection.length) {
      this.collection.each((model) => {
        this.$el.prepend(new DownloadView({
          model: model
        }).render().el);
      });
    }
    else {
      this.$el.html(`
        <p style="font-size:24px; text-align:center;margin-top:48%;color:#dddddd">
           Empty<br>
          <span class="icon icon-download"></span>
        </p>
      `);
    }

    return this;
  }
});


let collection = new DownloadsCollection(localStorage.get(DB_NAME));

// send play command to player
collection.on('play', function (uid) {
  ipcRenderer.send('play', uid);
});


let notifications = new DownloadsListView({
  collection: collection
});


$('#notification-center').empty().append(notifications.el);

$('.clear-cache').on('click', function () {
    localStorage.remove(DB_NAME);
    collection.reset([]);
});

$('.refresh-cache').on('click', function () {
    collection.trigger('refresh');
});

$('li.list-group-item').on('mouseover', function () {
  $(this).addClass('active');
})
.on('mouseout', function () {
  $(this).removeClass('active') ;
});

ipcRenderer.on('info', function (event, info) {
  collection.add(new Download({
    id: info.uid,
    title: info.title,
    src: info.iurlsd
  }));
});

ipcRenderer.on('progress', function (event, data) {
  let model = collection.get(data.id);

  if (model) {
    model.set('progress', data.progress);
  }
});


ipcRenderer.on('error', function (event, data) {
  console.log(data);
});

ipcRenderer.on('complete', function (event, data) {
  let model = collection.get(data.id);

  if (model) {
    model.set('_id', data._id);
    model.trigger('complete');
  }

  localStorage.save(DB_NAME, collection.toJSON());
});
