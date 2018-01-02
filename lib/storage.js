'use strict';

const debug = require('debug')('storage');

const concat = require('concat-stream'),
      express = require('express'),
      uuid = require('uuidv4');

const storages = require('./storages');

const PassThrough = require('stream').PassThrough;

// const BacnetClient = require('../lib/BacnetClient');
const childProcess = require('child_process');

const valuesToWrite = [ 0, 1, null ];
const DefaultState = 2;
let switches = [];

const writeToStorage = function (storage) {
  const passThrough = new PassThrough();

  storage.put('binaries', passThrough, error => {
    if (error) {
      throw new Error(error, error.message);
    }
  });
  passThrough.write(JSON.stringify(switches.map(z => ({ id: z.id, deviceId: z.deviceId, objectType: z.objectType, objectId: z.objectId, name: z.name }))));
  passThrough.end();
};

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

  const bacnetProcess = childProcess.fork('bacnetProcess.js', [ options.options ], { cwd: __dirname });

  theStorage.get('binaries', (err, stream) => {
    debug('initialize storage: ', options);
    if (err) {
      debug(err);
      switches = [];
    } else {
      stream.pipe(concat(data => {
        const theArr = JSON.parse(data);

        debug('initialize storage: ', theArr);
        switches = theArr.map(val => ({ id: val.id, deviceId: val.deviceId, objectType: val.objectType, objectId: val.objectId, name: val.name, state: DefaultState, sticky: true }));
      }));
    }
  });

  const api = express();

  api.post('/binary', (req, res) => {
    const id = req.body.id;
    const val = req.body.val;

    debug('post /binary ', { id, val });
    if (!uuid.is(id)) {
      return res.sendStatus(400);
    }

    if (val < 0 || val > DefaultState) {
      return res.sendStatus(400);
    }
    const theValuetoWrite = valuesToWrite[val];
    const searchIndex = switches.findIndex(x => x.id === id);

    if (searchIndex !== -1) {
      bacnetProcess.send({ cmd: 'write',
        value: { deviceId: switches[searchIndex].deviceId, objectType: switches[searchIndex].objectType, objectId: switches[searchIndex].objectId, value: theValuetoWrite }
      });

      return res.sendStatus(200);
    }
  });

  api.get('/binaries', (req, res) => {
    debug('get /binaries::switches.length = ', switches.length);
    if (switches.length <= 0) {
      return res.sendStatus(404);
    }
    res.send(JSON.stringify(switches.map(z => ({ id: z.id, name: z.name }))));
    for (let i = 0; i < switches.length; i++) {
      if (switches[i].name === '') {
        bacnetProcess.send({ cmd: 'read',
          value: { deviceId: switches[i].deviceId, objectType: switches[i].objectType, objectId: switches[i].objectId }
        });
      }
      if (switches[i].objectType === 4) {
        bacnetProcess.send({ cmd: 'observe',
          value: { deviceId: switches[i].deviceId, objectType: switches[i].objectType, objectId: switches[i].objectId }
        });
      }
    }
  });

  api.get('/changes', (req, res) => {
    const changed = switches.filter(val => val.sticky === true).map(z => ({ id: z.id, name: z.name, state: z.state }));

    debug('get /changes::changed.length = ', changed.length);
    if (changed.length === 0) {
      return res.send({ ok: 'OK' });
    }
    debug('get /changes::switch = ', changed);
    res.send(changed);
    for (let i = 0; i < switches.length; i++) {
      if (switches[i].sticky === true) {
        switches[i].sticky = false;
      }
    }
  });

  api.get('/discoverDevices', (req, res) => {
    bacnetProcess.send({ cmd: 'whoIs' });
    res.sendStatus(200);
  });

  bacnetProcess.on('message', message => {
    if (message.cmd === 'gotCOV') {
      debug('gotCOV', message.value);
      const nr = switches.findIndex(xx => (xx.deviceId === message.value.deviceId) && (xx.objectType === message.value.objectType) && (xx.objectId === message.value.objectId));

      if (nr !== -1) {
        if (switches[nr].state !== message.value.value) {
          switches[nr].state = message.value.value;
          switches[nr].sticky = true;
        }
      }
    }
    if (message.cmd === 'gotName') {
      debug('gotName', message.value);
      const nr = switches.findIndex(xx => (xx.deviceId === message.value.deviceId) && (xx.objectType === message.value.objectType) && (xx.objectId === message.value.objectId));

      if (nr !== -1) {
        if (switches[nr].name !== message.value.value) {
          switches[nr].name = message.value.value;
          switches[nr].sticky = true;
          writeToStorage(theStorage);
        }
      }
    }
    if (message.cmd === 'gotObject') {
      debug('gotObject', message.value);
      const nr = switches.findIndex(xx => (xx.deviceId === message.value.deviceId) && (xx.objectType === message.value.objectType) && (xx.objectId === message.value.objectId));

      if (nr === -1) {
        switches.push({ id: uuid(), deviceId: message.value.deviceId, objectType: message.value.objectType, objectId: message.value.objectId, name: message.value.name, state: DefaultState, sticky: false });
        writeToStorage(theStorage);
      }
    }
  });

  process.on('exit', () => {
    bacnetProcess.send({ cmd: 'exit' });
  });

  return api;
};

module.exports = storage;
