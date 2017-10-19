'use strict';

const bacstack = require('bacstack');

const getBacnetClient = function () {

  const client = new bacstack({adpuTimeout: 6000});

  // Discover Devices
  client.on('iAm', function(device) {
    console.log('BACnet iAm returns: ');
    console.log('address: ', device.address);
    console.log('deviceId: ', device.deviceId);
    console.log('maxAdpu: ', device.maxAdpu);
    console.log('segmentation: ', device.segmentation);
    console.log('vendorId: ', device.vendorId);
    console.log('--------------------');
  });
  client.whoIs();

  return client;
};

module.exports = getBacnetClient;
