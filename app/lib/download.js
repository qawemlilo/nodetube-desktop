'use strict';

const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const DB = require('../database');
const config = require('../config');
const images = require('./images');
const slugify = require('slugify');

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

  let props = {};

  images.download(newDoc.iurlsd, imagesDir)
  .then(function (newPath) {
    props.iurlsd = newPath;
    return images.download(newDoc.iurlmq, imagesDir);
  })
  .then(function (newPath) {
    props.iurlmq = newPath;
    return images.download(newDoc.iurlhq, imagesDir);
  })
  .then(function (newPath) {
    props.iurlhq = newPath;
    return images.download(newDoc.iurlmaxres, imagesDir);
  })
  .then(function (newPath) {
    props.iurlmaxres = newPath;
    return DB.update(newDoc._id, props);
  })
  .then(function (updatedDoc) {
    console.log('downloadImages done')
  })
  .catch(function (error) {
    console.error(error)
  });
}

module.exports  = function (url, opts = {}, done) {

  let download = ytdl(url, {quality: opts.quality || require('../config').VIDEO_QUALITY});
  let writeStream = null;
  let filename = '';

  download.on('info', function (info, data) {
    let videoData = parseInfo(info);

    filename = slugify(videoData.title).replace(/[.,\/#!$%\^&\*;:{}=`~'"]/g,"") + '_' + Date.now() + '.mp4';

    videoData.watched = false;
    videoData.created_at = Date.now();
    videoData.path = path.join(opts.path || config.VIDEOS_PATH, filename);
    videoData.favourite = false;

    DB.get({video_id: videoData.video_id})
    .then(function (docs) {
      if (docs.length) {
        done(new Error('Video already exists'));
      }
      else {
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
      }
    })
    .catch(function (error) {
      done(error);
    });
  });


    return download;
};
