'use strict';

const Bacstack = require('bacstack');

class BacnetClient {
  constructor (options) {
    this.client = new Bacstack(options || { adpuTimeout: 6000 });
    this.devices = [];
    this.client.on('iAm', device => this.discoverDevice(device));
  }

  // Discover Devices
  discoverDevice (device) {
    /* eslint-disable no-console */
    // console.log('BACnet iAm returns: ');
    // console.log('address: ', device.address);
    // console.log('deviceId: ', device.deviceId);
    // console.log('maxAdpu: ', device.maxAdpu);
    // console.log('segmentation: ', device.segmentation);
    // console.log('vendorId: ', device.vendorId);
    // console.log('--------------------');
    /* eslint-enable no-console */

    this.client.readPropertyMultiple(device.address, [{
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

      /* eslint-disable no-console */
      // console.log('count = ', count);
      /* eslint-enable no-console */

      this.devices.push({
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
        this.client.readPropertyMultiple(device.address, [{
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
          // console.log('objectName: ', val.values[0].values.find(y => y.propertyIdentifier === 77).value[0].value);
          /* eslint-enable no-console */

          const i = this.devices.findIndex(x => x.address === device.address);

          /* eslint-disable no-console */
          // console.log('i = ', i, device.address, devices);
          /* eslint-enable no-console */

          this.devices[i].binaryOutputs.push({
            objectIdentifier: val.values[0].objectIdentifier,
            objectName: val.values[0].values.find(y => y.propertyIdentifier === 77).value[0].value
          });

          count -= 1;
          if (count === 0) {
            // ....emit signal

            /* eslint-disable no-console */
            console.log('CountDevices: ', this.devices.length);

            this.devices.forEach(z => {
              console.log('DeviceAddress: ', z.address);
              console.log('deviceId: ', z.deviceId);
              console.log('[');
              z.binaryOutputs.forEach(az => {
                console.log('objectIdentifier: ', az.objectIdentifier);
                console.log('objectName: ', az.objectName);
              });
              console.log(']');
            });
            /* eslint-enable no-console */
          }
        });
      });
    });
  }
}

module.exports = BacnetClient;
