'use strict';

const Bacstack = require('bacstack');

const getBacnetClient = function () {
  const client = new Bacstack({ adpuTimeout: 6000 });
  const devices = [];

  // Discover Devices
  client.on('iAm', device => {
    /* eslint-disable no-console */
    // console.log('BACnet iAm returns: ');
    // console.log('address: ', device.address);
    // console.log('deviceId: ', device.deviceId);
    // console.log('maxAdpu: ', device.maxAdpu);
    // console.log('segmentation: ', device.segmentation);
    // console.log('vendorId: ', device.vendorId);
    // console.log('--------------------');
    /* eslint-enable no-console */

    client.readPropertyMultiple(device.address, [{
      objectIdentifier: { type: 8, instance: 4194303 },

      // PROP_ALL = 8 refers to all properties of this object
      propertyReferences: [{ propertyIdentifier: 8 }]
    }], (err, value) => {
      if (err) {
        throw new Error(err, err.message);
      }
      const objectList = value.values[0].values.find(x => x.propertyIdentifier === 76);
      const binaryOutputs = objectList.value.filter(x => x.value.type === 4);
      let count = binaryOutputs.length;

      devices.push({
        address: device.address,
        deviceId: device.deviceId,
        binaryOutputs: []
      });

      /* eslint-disable no-console */
      // console.log('Länge: ', value.len);
      // console.log('objectIdentifier: ', value.values[0].objectIdentifier);
      // console.log('ListOfResults: ', value.values[0].values);
      // console.log('objectList: ', objectList.value);
      // console.log('binaryOutputs: ', binaryOutputsList);
      /* eslint-enable no-console */

      binaryOutputs.map(x => x.value).forEach(xxx => {
        client.readPropertyMultiple(device.address, [{
          objectIdentifier: xxx,
          propertyReferences: [{ propertyIdentifier: 8 }]
        }], (error, val) => {
          if (error) {
            throw new Error(error, error.message);
          }

          /* eslint-disable no-console */
          // console.log('Länge: ', val.len);
          // console.log('objectIdentifier: ', val.values[0].objectIdentifier);
          // console.log('ListOfResults: ', val.values[0].values);
          // console.log('objectName: ', objectName.value[0].value);
          /* eslint-enable no-console */

          const i = devices.indexOf(x => x.deviceID === device.deviceID);

          devices[i].binaryOutputs.push({
            objectIdentifier: val.values[0].objectIdentifier,
            objectName: val.values[0].values.find(y => y.propertyIdentifier === 77)
          });

          count -= 1;
          if (count === 0) {
            // ....emit signal

            /* eslint-disable no-console */
            console.log('CountDevices: ', devices.length);

            devices.forEach(z => {
              console.log('DeviceAddress: ', z.address);
              console.log('deviceId: ', z.deviceId);
              z.binaryOutputs.forEach(az => {
                console.log('objectIdentifier: ', az.objectIdentifier);
                console.log('objectName: ', az.objectName);
              });
            });
            /* eslint-enable no-console */
          }
        });
      });
    });
  });

  return client;
};

module.exports = getBacnetClient;
