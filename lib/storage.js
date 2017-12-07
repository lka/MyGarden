'use strict';

const debug = require('debug')('storage');

const express = require('express'),
      uuid = require('uuidv4');

const storages = require('./storages');

const BacnetClient = require('../lib/BacnetClient');
const baclient = new BacnetClient();

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

    debug('post /device/new ID:', id);
    theStorage.put(id, req, err => {
      if (err) {
        return res.sendStatus(500);
      }

      res.json({ id });
    });
  });

  api.post('/binary', (req, res) => {
    const id = req.body.id;
    const val = req.body.val;

    debug('post /binary ', { id, val });
    if (!uuid.is(id)) {
      return res.sendStatus(400);
    }

    if (val < 0 || val > 2) {
      return res.sendStatus(400);
    }
    const theValuetoWrite = valuesToWrite[val];

    if (baclient.devices.length > 0) {
      BacnetClient.writeBinaryOutputValue(baclient, baclient.devices[0].address, 0, theValuetoWrite, err => {
        if (err) {
          debug('Error: ', err);

          return res.sendStatus(400);
        }

        return res.end('done');
      });
    }
  });

  api.get('/binaries', (req, res) => {
    debug('get /binaries');
    theStorage.get('binaries', (err, stream) => {
      if (err) {
        return res.sendStatus(404);
      }

      stream.pipe(res);
    });
  });

  api.get('/devices', (req, res) => {
    debug('get /devices');
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
