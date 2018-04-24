'use strict';

const debug = require('debug')('storeAndTransferData');
const WebSocket = require('ws');

const concat = require('concat-stream'),
      uuid = require('uuidv4');

const storages = require('./storages');

const childProcess = require('child_process'),
      PassThrough = require('stream').PassThrough;

const valuesToWrite = [ 0, 1, null ];
const DefaultState = 2;
let switches = [];
let languageSet = 'de_DE';
let webSocketServer;

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

const handleWsConnection = async function (socket, wss, theStorage, bacnetProcess) {
  webSocketServer = wss;
  socket.on('message', message => {
    let msg;
    let id;
    let val;
    let searchIndex;

    try {
      msg = JSON.parse(message);
    } catch (error) {
      return error;
    }

    switch (msg.type) {
      case 'writeBinary': {
        id = msg.value.id;
        val = msg.value.val;
        debug('handleWsConnection::writeBinary ', { id, val });
        const theValuetoWrite = valuesToWrite[val];

        searchIndex = switches.findIndex(x => x.id === id);

        if (searchIndex !== -1) {
          bacnetProcess.send({ cmd: 'write',
            value: { deviceId: switches[searchIndex].deviceId, objectType: switches[searchIndex].objectType, objectId: switches[searchIndex].objectId, value: theValuetoWrite }
          });
        }
        break;
      }
      case 'cancel': {
        for (let i = 0; i < switches.length; i++) {
          if (switches[i].objectType === 4) {
            bacnetProcess.send({ cmd: 'cancelObservation',
              value: { deviceId: switches[i].deviceId, objectType: switches[i].objectType, objectId: switches[i].objectId }
            });
          }
        }
        break;
      }
      case 'writeLanguage': {
        languageSet = msg.value.language;

        debug('handleWsConnection::writeLanguage', languageSet);

        writeToStorage(theStorage);
        break;
      }
      case 'writeObjects': {
        debug('handleWsConnection::writeObjects', msg);
        const objects = msg.value;
        let changed = false;

        for (let i = 0; i < objects.length; i++) {
          const index = switches.findIndex(z => z.id === objects[i].id);

          if (index !== -1) {
            if (switches[index].showItem !== objects[i].val) {
              switches[index].showItem = objects[i].val;
              changed = true;
            }
            if (switches[index].name !== objects[i].name) {
              switches[index].name = objects[i].name;
              changed = true;
            }
          }
        }

        if (changed) {
          writeToStorage(theStorage);
        }
        break;
      }
      case 'writeSchedule': {
        id = msg.value.id;
        val = msg.value.val;
        debug('handleWsConnection::writeSchedule ', { id, val });
        searchIndex = switches.findIndex(x => x.id === id);

        if (searchIndex !== -1) {
          bacnetProcess.send({ cmd: 'writeWeeklySchedule',
            value: { deviceId: switches[searchIndex].deviceId, objectType: switches[searchIndex].objectType, objectId: switches[searchIndex].objectId, value: val }
          });
        }
        break;
      }
      case 'readSchedule': {
        id = msg.value.id;
        const i = switches.findIndex(x => x.id === id);

        debug('handleWsConnection::readSchedule::switches.length = ', switches.length, id);
        bacnetProcess.send({ cmd: 'readSched',
          value: { deviceId: switches[i].deviceId, objectType: switches[i].objectType, objectId: switches[i].objectId, property: 123 }
        });
        break;
      }
      case 'readObjects': {
        debug('handleWsConnection::readObjects');
        socket.send(JSON.stringify({ type: 'readObjects', value: switches.map(z => ({ id: z.id, name: z.name, val: z.showItem })) }));
        break;
      }
      case 'readBinaries': {
        debug('handleWsConnection::readBinaries');
        if (switches.length <= 0) {
          return;
        }
        socket.send(JSON.stringify({ type: 'readBinaries', value: { language: languageSet, objects: switches.filter(vals => vals.showItem === true).map(z => ({ id: z.id, name: z.name, objectType: z.objectType, state: z.state })) }}));
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
            switches[i].sticky = true;
          }
        }
        break;
      }
      case 'changes': {
        const changed = switches.filter(valx => valx.sticky === true).map(z => ({ id: z.id, name: z.name, state: z.state }));

        debug('handleWsConnection::changes.switch = ', changed);
        socket.send(JSON.stringify({ type: 'changes', value: changed }));
        for (let i = 0; i < switches.length; i++) {
          if (switches[i].sticky === true) {
            switches[i].sticky = false;
          }
        }
        break;
      }
      case 'discoverDevices': {
        debug('handleWsConnection::discoverDevices');
        bacnetProcess.send({ cmd: 'whoIs' });
        break;
      }
      default:
        break;
    }
  });
};

const wssBroadcast = data => {
  if ((webSocketServer !== undefined) && (webSocketServer.clients !== undefined)) {
    webSocketServer.clients.forEach(x => {
      if (x.readyState === WebSocket.OPEN) {
        x.send(data);
      }
    });
  }
};

const storeAndTransferData = function (options) {
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

  const handleToWSS = (socket, wss) => handleWsConnection(socket, wss, theStorage, bacnetProcess);

  process.on('exit', () => {
    bacnetProcess.send({ cmd: 'exit' });
  });

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

  bacnetProcess.on('message', message => {
    if (message.cmd === 'gotCOV') {
      debug('gotCOV', message.value);
      const nr = switches.findIndex(xx => (xx.deviceId === message.value.deviceId) && (xx.objectType === message.value.objectType) && (xx.objectId === message.value.objectId));

      if (nr !== -1) {
        const changed = [{ id: switches[nr].id, name: switches[nr].name, state: message.value.value }];

        debug('handleWsConnection::changes.switch = ', changed);
        wssBroadcast(JSON.stringify({ type: 'changes', value: changed }));
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
        const value = JSON.stringify({ type: 'readScheduleResponse', value: { id: switches[nr].id, name: switches[nr].name, val: switches[nr].weeklySchedule }});

        wssBroadcast(value);
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

  return handleToWSS;
};

module.exports = storeAndTransferData;
