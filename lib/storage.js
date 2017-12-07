'use strict';

const express = require('express'),
      uuid = require('uuidv4');

const storages = require('./storages');
const valuesToWrite = [ 0, 1, null ];

const storage = function (options) {
  if (!options) {
    throw new Error('Options are missing!');
  }
  if (!options.storage) {
    throw new Error('Storage is missing!');
  }
  if (!options.options) {
    throw new Error('StorageOptions are missing!');
  }

  const theStorage = new storages[options.storage](options.options);
  const api = express();

  api.post('/device/new', (req, res) => {
    const id = uuid();

    theStorage.put(id, req, err => {
      if (err) {
        return res.sendStatus(500);
      }

      res.json({ id });
    });
  });

  api.post('/binary/:id/:val', (req, res) => {
    const id = req.params.id;
    const val = req.params.val;

    /* eslint-disable no-console */
    console.log('received: ', { id, val });
    /* eslint-enable no-console */

    if (!uuid.is(id)) {
      return res.sendStatus(400);
    }

    if (id > 0 && id < 3) {
      const theValuetoWrite = valuesToWrite[val];

      return res.end('done');
    }
  });

  api.get('/binaries', (req, res) => {
    theStorage.get('binaries', (err, stream) => {
      if (err) {
        return res.sendStatus(404);
      }

      stream.pipe(res);
    });
  });

  api.get('/devices', (req, res) => {
    theStorage.list((err, arr) => {
      if (err) {
        return res.sendStatus(500);
      }

      res.send(arr);
    });
  });

  return api;
};

module.exports = storage;
