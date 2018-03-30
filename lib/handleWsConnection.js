'use strict';

const debug = require('debug')('handleWsConnection');

const valuesToWrite = [ 0, 1, null ];

// const DefaultState = 2;

const handleWsConnection = async function (socket, theStorage, bacnetProcess, switches, languageSet) {
  socket.send('Connection established');

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

        theStorage.write({ languageSet });
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
          theStorage.write({ switches });
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
        socket.send(JSON.stringify({ type: 'readSchedule', value: switches.filter(x => x.id === id).map(z => ({ id: z.id, name: z.name, val: z.weeklySchedule })) }));
        break;
      }
      case 'readObjects': {
        debug('handleWsConnection::readObjects');
        socket.send(JSON.stringfy({ type: 'readObjects', value: JSON.stringify(switches.map(z => ({ id: z.id, name: z.name, val: z.showItem }))) }));
        break;
      }
      case 'readBinaries': {
        debug('handleWsConnection::readBinaries');
        if (switches.length <= 0) {
          return;
        }
        socket.send(JSON.stringify({ type: 'readBinaries', value: { language: languageSet, objects: switches.filter(vals => vals.showItem === true).map(z => ({ id: z.id, name: z.name, objectType: z.objectType })) }}));
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

        debug('handleWsConnection::changes', changed.length);
        if (changed.length === 0) {
          return socket.send(JSON.stringify({ type: 'changes', value: { }}));
        }
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

module.exports = handleWsConnection;
