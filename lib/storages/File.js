'use strict';

const fs = require('fs'),
      path = require('path');

class File {
  constructor (options) {
    if (!options) {
      throw new Error('Options are missing!');
    }
    if (!options.directory) {
      throw new Error('Directory is missing!');
    }

    this.directory = options.directory;
  }

  put (id, stream, callback) {
    if (!id) {
      throw new Error('Id is missing!');
    }
    if (!stream) {
      throw new Error('Stream is missing!');
    }
    if (!callback) {
      throw new Error('Callback is missing!');
    }

    const writeStream = fs.createWriteStream(path.join(this.directory, id));

    writeStream.once('error', err => {
      callback(err);
    });

    writeStream.once('close', () => {
      callback(null);
    });

    stream.pipe(writeStream);
  }

  get (id, callback) {
    if (!id) {
      throw new Error('Id is missing!');
    }
    if (!callback) {
      throw new Error('Callback is missing!');
    }

    const readStream = fs.createReadStream(path.join(this.directory, id));

    readStream.once('error', err => {
      callback(err);
    });

    readStream.once('open', () => {
      callback(null, readStream);
    });
  }

  list (callback) {
    if (!callback) {
      throw new Error('Callback is missing!');
    }

    fs.readdir(this.directory, (err, files) => {
      if (err) {
        return callback(err);
      }

      return callback(null, files);
    });
  }
}

module.exports = File;
