'use strict';

const request = require('request');
const fs = require('fs');
const path = require('path');
const url = require('url');


module.exports.download = function (from, pathTo) {
  return new Promise(function (resolve, reject) {
    let filename = path.basename(from);
    let to = path.join(pathTo, filename);

    request.get(from)
      .on('error', function(error) {
        reject(error);
      })
      .on('end', function() {
        resolve(to);
      })
      .pipe(fs.createWriteStream(to));
  });
};
