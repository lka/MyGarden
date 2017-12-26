'use strict';

const debug = require('debug')('bacnetProcess');
const BacnetClient = require('../lib/BacnetClient');
const baclient = new BacnetClient({ transmitWhoIs: (process.argv[0] ? process.argv[0].transmitWhoIs : undefined) || true });

process.on('message', message => {
  if (message.cmd === 'exit') {
    /* eslint-disable no-process-exit */
    process.exit(0);
    /* eslint-enable no-process-exit */
  }
  if (message.cmd === 'write') {
    BacnetClient.write(baclient, message.value.deviceId, message.value.objectType, message.value.objectId, message.value.value, err => {
      if (err) {
        debug('Error: ', err);
      }
    });
  }
  if (message.cmd === 'observe') {
    BacnetClient.observe(baclient, message.value.deviceId, message.value.objectType, message.value.objectId, 0, err => {
      if (err) {
        debug('Err:', err.message);
      }
    });
  }
  if (message.cmd === 'read') {
    BacnetClient.readName(baclient, message.value.deviceId, message.value.objectType, message.value.objectId, 0, err => {
      if (err) {
        debug('Err:', err.message);
      }
    });
  }
  if (message.cmd === 'whoIs') {
    baclient.whoIs();
  }
});

baclient.on('gotName', res => {
  debug('gotName', res);
  process.send({ cmd: 'gotName', value: res });
});

baclient.on('gotCOV', res => {
  debug('gotCOV', res);
  process.send({ cmd: 'gotCOV', value: res });
});

baclient.on('gotDevice', () => {
  baclient.devices.forEach(z => {
    debug(`DeviceAddress: ${z.address}, deviceId: ${z.deviceId}`);
    z.Objects.forEach(az => {
      debug(`Object: objectType: ${az.objectIdentifier.type} objectId: ${az.objectIdentifier.instance}, name: ${az.objectName}`);
      process.send({ cmd: 'gotObject', value: { deviceId: z.deviceId, objectType: az.objectIdentifier.type, objectId: az.objectIdentifier.instance, name: az.objectName }});
    });
  });
});
