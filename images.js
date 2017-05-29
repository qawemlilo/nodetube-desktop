'use strict';

const request = require('request');
const fs = require('fs');
const path = require('path');
const url = require('url');


module.exports = function (from, pathTo, fn) {
  let filename = path.basename(from);
  let to = path.join(pathTo, filename);

  request.get(from)
    .on('error', function(error) {
      fn(error);
    })
    .on('end', function() {
      fn(false, to);
    })
    .pipe(fs.createWriteStream(to));
};
