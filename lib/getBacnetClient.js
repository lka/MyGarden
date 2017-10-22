'use strict';

const bacstack = require('bacstack');

const getBacnetClient = function () {

  const client = new bacstack({adpuTimeout: 6000});
  var devices = [];

  // Discover Devices
  client.on('iAm', device => {
    console.log('BACnet iAm returns: ');
    console.log('address: ', device.address);
    console.log('deviceId: ', device.deviceId);
    console.log('maxAdpu: ', device.maxAdpu);
    console.log('segmentation: ', device.segmentation);
    console.log('vendorId: ', device.vendorId);
    console.log('--------------------');
    devices.push(device);
  });
  client.whoIs();

  // Read Device Object
  var requestArray = [{
    objectIdentifier: {type: 8, instance: 4194303},
    propertyReferences: [{propertyIdentifier: 8}]
  }];
  client.readPropertyMultiple('192.168.178.9', requestArray, function(err, value) {
    console.log('value: ', value);
  });


  return client;
};

module.exports = getBacnetClient;
