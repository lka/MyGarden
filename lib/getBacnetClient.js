'use strict';

const Bacstack = require('bacstack');

const getBacnetClient = function () {
  const requestDeviceObjectMultiple = [{
    objectIdentifier: { type: 8, instance: 4194303 },
    propertyReferences: [{ propertyIdentifier: 8 }]
  }];

  const client = new Bacstack({ adpuTimeout: 6000 });
  const devices = [];

  // Discover Devices
  client.on('iAm', device => {
    /* eslint-disable no-console */
    console.log('BACnet iAm returns: ');
    console.log('address: ', device.address);
    console.log('deviceId: ', device.deviceId);
    console.log('maxAdpu: ', device.maxAdpu);
    console.log('segmentation: ', device.segmentation);
    console.log('vendorId: ', device.vendorId);
    console.log('--------------------');
    /* eslint-enable no-console */
    devices.push(device);

    client.readPropertyMultiple(device.address, requestDeviceObjectMultiple, (err, value) => {
      if (err) {
        throw new Error(err, err.message);
      }
      /* eslint-disable no-console */
      console.log('Länge: ', value.len);
      console.log('objectIdentifier: ', value.values[0].objectIdentifier);
      console.log('ListOfResults: ', value.values[0].values);
      /* eslint-enable no-console */
    });
  });

  return client;
};

module.exports = getBacnetClient;
