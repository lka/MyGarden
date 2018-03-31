'use strict';

const debug = require('debug')('storage');

const concat = require('concat-stream'),
      uuid = require('uuidv4');

const storages = require('./storages');

const PassThrough = require('stream').PassThrough;

// const BacnetClient = require('../lib/BacnetClient');

const DefaultState = 2;
let switches = [];
let languageSet = 'de_DE';

const writeToStorage = function (storage) {
  const passThrough = new PassThrough();

  storage.put('binaries', passThrough, error => {
    if (error) {
      throw new Error(error, error.message);
    }
  });
  passThrough.write(JSON.stringify({ language: languageSet, objects: switches.map(z => ({ id: z.id, deviceId: z.deviceId, objectType: z.objectType, objectId: z.objectId, name: z.name, showItem: z.showItem })) }));
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

  theStorage.get('binaries', (err, stream) => {
    debug('initialize storage: ', options);
    if (err) {
      debug(err);
      switches = [];
    } else {
      stream.pipe(concat(data => {
        const { language, objects } = JSON.parse(data);

        debug('initialize storage: ', objects);
        debug('initialize storage: ', language);
        languageSet = language;
        switches = objects.map(val => ({ id: val.id, deviceId: val.deviceId, objectType: val.objectType, objectId: val.objectId, name: val.name, showItem: val.showItem, state: DefaultState, sticky: true }));
      }));
    }
  });

  options.bacnetProcess.on('message', message => {
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
    if (message.cmd === 'gotSched') {
      debug('gotSched', message.value);
      const nr = switches.findIndex(xx => (xx.deviceId === message.value.deviceId) && (xx.objectType === message.value.objectType) && (xx.objectId === message.value.objectId));

      if (nr !== -1) {
        switches[nr].weeklySchedule = message.value.value;
      }
    }
    if (message.cmd === 'gotObject') {
      debug('gotObject', message.value);
      const nr = switches.findIndex(xx => (xx.deviceId === message.value.deviceId) && (xx.objectType === message.value.objectType) && (xx.objectId === message.value.objectId));

      if (nr === -1) {
        switches.push({ id: uuid(), deviceId: message.value.deviceId, objectType: message.value.objectType, objectId: message.value.objectId, name: message.value.name, showItem: false, state: DefaultState, sticky: false });
        writeToStorage(theStorage);
      }
    }
  });

  return theStorage;
};

module.exports = storage;
