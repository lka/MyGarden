'use strict';

const flaschenpost = require('flaschenpost');

const Bacstack = require('bacstack');

const logger = flaschenpost.getLogger();

module.exports = class BacnetClient extends Bacstack {
  constructor (options) {
    super(options || { adpuTimeout: 6000 });
    this.devices = [];

    this.on('iAm', device => {
      logger.info('BACnet iAm received');
      /* eslint-disable no-console */
      // console.log('iAm received: ');
      // console.log('address: ', device.address);
      // console.log('deviceId: ', device.deviceId);
      // console.log('maxAdpu: ', device.maxAdpu);
      // console.log('segmentation: ', device.segmentation);
      // console.log('vendorId: ', device.vendorId);
      // console.log('--------------------');
      /* eslint-enable no-console */

      if (this.devices.findIndex(x => x.address === device.address) === -1) {
        this.devices.push({
          address: device.address,
          deviceId: device.deviceId,
          binaryOutputs: []
        });
      }

      this.readPropertyMultiple(device.address, [{
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

        // logger.info('BACnet readPropertyMultiple');
        /* eslint-disable no-console */
        // console.log('count = ', count);
        /* eslint-enable no-console */

        /* eslint-disable no-console */
        // console.log('Länge: ', value.len);
        // console.log('objectIdentifier: ', value.values[0].objectIdentifier);
        // console.log('ListOfResults: ', value.values[0].values);
        // console.log('objectList: ', objectList.value);
        // console.log('binaryOutputs: ', binaryOutputsList);
        /* eslint-enable no-console */

        binaryOutputs.map(x => x.value).forEach(xxx => {
          this.readProperty(device.address, xxx.type, xxx.instance, 77, null, (error, val) => {
            if (error) {
              throw new Error(error, error.message);
            }

            /* eslint-disable no-console */
            // console.log('Länge: ', val.len);
            // console.log('object: ', val.objectId);
            // console.log('valueList: ', val.valueList);
            // console.log('objectName: ', val.valueList[0].value);
            /* eslint-enable no-console */

            const i = this.devices.findIndex(x => x.address === device.address);

            /* eslint-disable no-console */
            // console.log('i = ', i, device.address, devices);
            /* eslint-enable no-console */

            const j = this.devices[i].binaryOutputs.findIndex(x => x.objectIdentifier.type === val.objectId.type &&
               x.objectIdentifier.instance === val.objectId.instance);

            if (j === -1) {
              this.devices[i].binaryOutputs.push({
                objectIdentifier: val.objectId,
                objectName: val.valueList[0].value
              });
            } else {
              this.devices[i].binaryOutputs[j].objectName = val.valueList[0].value;
            }

            count -= 1;
            if (count === 0) {
              this.emit('gotDevice');

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
    });
  }
};
