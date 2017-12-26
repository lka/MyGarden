'use strict';

const debug = require('debug')('storage');

const concat = require('concat-stream'),
      express = require('express'),
      uuid = require('uuidv4');

const storages = require('./storages');

const PassThrough = require('stream').PassThrough;

const BacnetClient = require('../lib/BacnetClient');

const valuesToWrite = [ 0, 1, null ];
const DefaultState = 2;
let switches = [];

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
  const baclient = new BacnetClient({ transmitWhoIs: (options ? options.options.transmitWhoIs : undefined) || true });

  theStorage.get('binaries', (err, stream) => {
    debug('initialize storage: ', options);
    if (err) {
      debug(err);
      switches = [];
    } else {
      stream.pipe(concat(data => {
        const theArr = JSON.parse(data);

        debug('initialize storage: ', theArr);
        switches = theArr.map(val => ({ id: val.id, deviceId: val.deviceId, binaryOutputObject: val.binaryOutputObject, name: val.name, state: DefaultState, sticky: true }));
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

    if (baclient.devices.length > 0) {
      const searchIndex = switches.findIndex(x => x.id === id);

      BacnetClient.writeBinaryOutput(baclient, switches[searchIndex].deviceId, switches[searchIndex].binaryOutputObject, theValuetoWrite, err => {
        if (err) {
          debug('Error: ', err);

          return res.sendStatus(400);
        }

        return res.end('done');
      });
    }
  });

  api.get('/binaries', (req, res) => {
    debug('get /binaries::switches.length = ', switches.length);
    if (switches.length) {
      res.send(JSON.stringify(switches.map(z => ({ id: z.id, name: z.name }))));
      for (let i = 0; i < switches.length; i++) {
        BacnetClient.subscribeCOVBinaryOutput(baclient, switches[i].deviceId,
          switches[i].binaryOutputObject, 0, err => {
            if (err) {
              /* eslint-disable no-console */
              console.log('Err:', err.message);
              /* eslint-enable no-console */
            }
          });
      }
    } else {
      res.sendStatus(404);
    }

    // theStorage.get('binaries', (err, stream) => {
    //   if (err) {
    //     return res.sendStatus(404);
    //   }
    //   stream.pipe(res);

    // stream.pipe(concat(data => {
    //   const theArr = JSON.parse(data);
    //
    //   debug(theArr);
    //   switches = theArr.map(val => ({ id: val.id, name: val.name, state: DefaultState, sticky: false }));
    // }));
    // });
  });

  api.get('/changes', (req, res) => {
    debug('get /changes::switches.length = ', switches.length);
    if (switches.length) {
      debug('get /changes::switch = ', switches.filter(val => val.sticky === true).map(z => ({ id: z.id, state: z.state })));
      res.send(switches.filter(val => val.sticky === true).map(z => ({ id: z.id, state: z.state })));
      for (let i = 0; i < switches.length; i++) {
        if (switches[i].sticky === true) {
          switches[i].sticky = false;
        }
      }
    } else {
      res.sendStatus(200);
    }
  });

  api.get('/discoverDevices', (req, res) => {
    baclient.whoIs();
    res.sendStatus(200);
  });

  baclient.on('gotCOV', res => {
    debug('got subscribedCOV', res);
    const nr = switches.findIndex(xx => (xx.deviceId === res.deviceId) && (xx.binaryOutputObject === res.objectId));

    if (nr !== -1) {
      if (switches[nr].state !== res.value) {
        switches[nr].state = res.value;
        switches[nr].sticky = true;
      }
    }
  });

  baclient.on('gotDevice', () => {
    let sticky = false;

    baclient.devices.forEach(z => {
      debug(`DeviceAddress: ${z.address}, deviceId: ${z.deviceId}`);
      z.binaryOutputs.forEach(az => {
        debug(`BinaryObject: ${az.objectIdentifier.instance}, objectName: ${az.objectName}`);
        if (switches.findIndex(xx => xx.name === az.objectName) === -1) {
          switches.push({ id: uuid(), deviceId: z.deviceId, binaryOutputObject: az.objectIdentifier.instance, name: az.objectName, state: DefaultState, sticky: false });
          sticky = true;
        }
      });
    });
    if (sticky) {
      const passThrough = new PassThrough();

      theStorage.put('binaries', passThrough, error => {
        if (error) {
          throw new Error(error, error.message);
        }
      });
      passThrough.write(JSON.stringify(switches.map(z => ({ id: z.id, deviceId: z.deviceId, binaryOutputObject: z.binaryOutputObject, name: z.name }))));
      passThrough.end();
    }
  });

  return api;
};

module.exports = storage;
