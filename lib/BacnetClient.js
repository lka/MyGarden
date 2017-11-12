'use strict';

const Bacstack = require('bacstack'),
      flaschenpost = require('flaschenpost');

const logger = flaschenpost.getLogger();

class BacnetClient extends Bacstack {
  constructor (options) {
    super({ apduTimeout: (options ? options.apduTimeout : undefined) || 6000 });
    this.priorityForWriting = (options ? options.priorityForWriting : undefined) || 12;
    this.devices = [];

    this.on('iAm', function (device) {
      logger.info(`BACnet iAm received, address: ${device.address}, deviceId: ${device.deviceId}`);
      BacnetClient.searchForBinaryOutputs(this, device);
    });
  }

  static searchForBinaryOutputs (self, device) {
    if (self.devices.findIndex(x => x.address === device.address) === -1) {
      self.devices.push({
        address: device.address,
        deviceId: device.deviceId,
        binaryOutputs: []
      });
    }

    self.readPropertyMultiple(device.address, [{
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

      logger.info(`BACnetDevice at ${device.address} has ${count} binaryOutputs`);

      binaryOutputs.map(x => x.value).forEach(xxx => {
        self.readProperty(device.address, xxx.type, xxx.instance, 77, null, (error, val) => {
          if (error) {
            throw new Error(error, error.message);
          }

          const i = self.devices.findIndex(x => x.address === device.address);

          const j = self.devices[i].binaryOutputs.findIndex(x => x.objectIdentifier.type === val.objectId.type &&
               x.objectIdentifier.instance === val.objectId.instance);

          if (j === -1) {
            self.devices[i].binaryOutputs.push({
              objectIdentifier: val.objectId,
              objectName: val.valueList[0].value
            });
          } else {
            self.devices[i].binaryOutputs[j].objectName = val.valueList[0].value;
          }

          count -= 1;
          if (count === 0) {
            self.emit('gotDevice');

            logger.info(`CountDevices: ${this.devices.length}`);

            self.devices.forEach(z => {
              logger.info(`DeviceAddress: ${z.address}, deviceId: ${z.deviceId}`);
              z.binaryOutputs.forEach(az => {
                logger.info(`deviceId: ${z.deviceId}:BinaryObject: ${az.objectIdentifier.instance}, objectName: ${az.objectName}`);
              });
            });
          }
        });
      });
    });
  }

  static writeBinaryOutputValue (self, address, objectInstance, value) {
    const nr = self.devices.findIndex(x => x.address === address);

    if (nr === -1) {
      throw new Error('Device not found!');
    }
    if (self.devices[nr].binaryOutputs.findIndex(x => x.objectIdentifier.instance === objectInstance) === -1) {
      throw new Error('BinaryOutput not found!');
    }
    if (value !== 0 && value !== 1 && value !== null) {
      throw new Error('Value not allowed!');
    }

    self.writeProperty(address, 4, objectInstance, 85, self.priorityForWriting, [ value === null ? { type: 0 } : { type: 1, value } ], (err, val) => {
      if (err) {
        throw new Error('BACnet writeProperty failed', err);
      }
      /* eslint-disable no-console */
      console.log('value', val);
      /* eslint-enable no-consloe */
    });
  }
}

module.exports = BacnetClient;
