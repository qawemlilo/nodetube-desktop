'use strict';

const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const DB = require('../database');
const config = require('../config');
const images = require('./images');

function parseInfo(info) {
  let data = {
    video_id: info.video_id,
    timestamp: info.timestamp,
    title: info.title,
    uid: info.uid,
    thumbnail_url: info.thumbnail_url,
    author: info.author,
    description: info.description,
    related_videos: info.related_videos,
    video_url: info.video_url,
    iurlsd: info.iurlsd,
    iurlmq: info.iurlmq,
    iurlhq: info.iurlhq,
    iurlmaxres: info.iurlmaxres
  };

  return data;
}


function downloadImages(newDoc, imagesDir) {
  // images to be downloaded
  let iurlsd = newDoc.iurlsd;
  let iurlmq = newDoc.iurlmq;
  let iurlhq = newDoc.iurlhq;
  let iurlmaxres = newDoc.iurlmaxres;

  images.download(iurlsd, imagesDir)
  .then(function (newPath) {
    return DB.update(newDoc._id, {iurlsd: newPath});
  })
  .then(function () {
    return images.download(iurlmq, imagesDir);
  })
  .then(function (newPath) {
    return DB.update(newDoc._id, {iurlmq: newPath});
  })
  .then(function () {
    return images.download(iurlhq, imagesDir);
  })
  .then(function (newPath) {
    return DB.update(newDoc._id, {iurlhq: newPath});
  })
  .then(function () {
    return images.download(iurlmaxres, imagesDir);
  })
  .then(function (newPath) {
    return DB.update(newDoc._id, {iurlmaxres: newPath});
  })
  .catch(function (error) {
    console.error(error)
  });
}

module.exports  = function (url, done) {
    console.log('VIDEO_QUALITY ', require('../config').VIDEO_QUALITY)
    let download = ytdl(url, {quality: require('../config').VIDEO_QUALITY});
    let writeStream = null;
    let filename = '';

    download.on('info', function (info, data) {

        let videoData = parseInfo(info);

        filename = 'video_' + Date.now() + '.mp4';

        videoData.watched = false;
        videoData.created_at = Date.now();
        videoData.path = path.join(config.VIDEOS_PATH, filename);
        videoData.favourite = false;


        DB.create(videoData)
        .then(function (newDoc) {
          // let's create a directory where we'll save images for this video
          let imagesDir = path.join(config.IMAGES_PATH, newDoc._id);

          if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir);
          }

          downloadImages(newDoc, imagesDir);

          // lets create a writable stream to save our file to
          writeStream = fs.createWriteStream(videoData.path);

          console.log('downloading %s ...', filename);

          download.pipe(writeStream);

          download.on('end', function () {
              console.log('download complete %s!', filename);

              done(false, newDoc);
          });
        })
        .catch(function (error) {
          done(error);
        });
    });


    return download;
};
