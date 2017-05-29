import Bb from 'backbone';

import {getLocalStorage} from './utils'


Backbone.sync = function(method, model, options) {
  let resp;

  switch (method) {
     case "read":
       resp = model.id != undefined ? Database.getOne(model.id) : Database.getAll();
       break;
     case "create":
       resp = Database.create(model.attributes);
       break;
     case "update":
       resp = Database.update(model.id, model.changedAttributes());
       break;
     case "delete":
       resp = Database.remove(model.id);
       break;
  }

  if (resp) {
    resp.then(function (data) {
      model.trigger("reset", model, data, options);
    })
    .catch(function (error) {
      model.trigger('error', error)
    });
  }
  else {
    model.trigger('error', new Error('Unknown request'));
  }
};

/** Override Backbone's `sync` method to run against localStorage
 * @param {string} method - One of read/create/update/delete
 * @param {Model} model - Backbone model to sync
 * @param {Object} options - Options object, use `ajaxSync: true` to run the
 *  operation against the server in which case, options will also be passed into
 *  `jQuery.ajax`
 * @returns {undefined}
 */
module.exports = function sync(method, model, options = {}) {
  const store = getLocalStorage(model);

  let resp, errorMessage;

  try {
    switch (method) {
       case "read":
         resp = model.id != undefined ? Database.getOne(model.id) : Database.getAll();
         break;
       case "create":
         resp = Database.create(model.attributes);
         break;
       case "update":
         resp = Database.update(model.id, model.changedAttributes());
         break;
       case "delete":
         resp = Database.remove(model.id);
         break;
    }

  } catch (error) {
    errorMessage = error.message;
  }

  if (resp) {
    if (options.success) {
      options.success.call(model, resp, options);
    }
  }
  else {
    errorMessage = errorMessage ? errorMessage : 'Record Not Found';

    if (options.error) {
      options.error.call(model, errorMessage, options);
    }
  }

  // add compatibility with $.ajax
  // always execute callback for success and error
  if (options.complete) {
    options.complete.call(model, resp);
  }
}


var store = model.localStorage || model.collection.localStorage;

  var resp, errorMessage, syncDfd = $.Deferred && $.Deferred(); //If $ is having Deferred - use it.

  try {

    switch (method) {
      case "read":
        resp = model.id != undefined ? store.find(model) : store.findAll();
        break;
      case "create":
        resp = store.create(model);
        break;
      case "update":
        resp = store.update(model);
        break;
      case "delete":
        resp = store.destroy(model);
        break;
    }

  } catch(error) {
    if (error.code === DOMException.QUOTA_EXCEEDED_ERR && window.localStorage.length === 0)
      errorMessage = "Private browsing is unsupported";
    else
      errorMessage = error.message;
  }

  if (resp) {
    model.trigger("sync", model, resp, options);
    if (options && options.success)
      options.success(resp);
    if (syncDfd)
      syncDfd.resolve(resp);

  } else {
    errorMessage = errorMessage ? errorMessage
                                : "Record Not Found";

    if (options && options.error)
      options.error(errorMessage);
    if (syncDfd)
      syncDfd.reject(errorMessage);
  }
