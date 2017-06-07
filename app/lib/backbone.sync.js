"use strict";

module.exports = function (Database) {

   let sync = function (method, model, options) {
    let resp;
    let opts = {};

    if (options.favourite) {
      opts.favourite = options.favourite;
    }

    switch (method) {
      case "read":
        resp = model.id != undefined ? Database.getOne(model.id) : Database.get(opts);
        break;
      case "create":
        resp = Database.create(model.attributes);
        Database.persistence.compactDatafile();
        break;
      case "update":
        resp = Database.update(model.id, model.changedAttributes());
        break;
      case "delete":
        //resp = Database.remove(model.id);
        break;
    }

    if (resp) {
      resp.then(function (data) {
        //Database.persistence.compactDatafile();
        if (options && options.success) {
          options.success.call(model, data, options);
        }

        model.trigger("sync", model, data, options);
      })
      .catch(function (error) {
        model.trigger('error', error)
      });

      if (options && options.complete) {
        options.complete(resp);
      }
    }
    else {
      model.trigger('error', new Error('Unknown request'));
    }

    return resp;
  };

  return sync;
};
