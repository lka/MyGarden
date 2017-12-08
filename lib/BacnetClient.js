'use strict';

const Bacstack = require('bacstack');
const baEnum = require('bacstack/lib/bacnet-enum');

const debug = require('debug')('BacnetClient');

class BacnetClient extends Bacstack {
  constructor (options) {
    super({ apduTimeout: (options ? options.apduTimeout : undefined) || 6000 });
    this.priorityForWriting = (options ? options.priorityForWriting : undefined) || 12;

    this.devices = [];

    this.on('iAm', function (device) {
      debug(`BACnet iAm received, address: ${device.address}, deviceId: ${device.deviceId}`);
      BacnetClient.searchForBinaryOutputs(this, device);
    });

    if (options && options.sendWhoIs) {
      this.whoIs();
    } else {
      // used only for tests
      this.devices = [{ address: '192.168.31.9', deviceID: 99, binaryOutputs: [{ objectIdentifier: { type: 4, instance: 0 }, objectName: 'irgendwas' }]}];
    }
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
      objectIdentifier: { type: baEnum.BacnetObjectTypes.OBJECT_DEVICE, instance: baEnum.BacnetPropertyIds.MAX_BACNET_PROPERTY_ID },
      propertyReferences: [{ propertyIdentifier: baEnum.BacnetPropertyIds.PROP_ALL }]
    }], (err, value) => {
      if (err) {
        throw new Error(err, err.message);
      }
      const objectList = value.values[0].values.find(x => x.propertyIdentifier === baEnum.BacnetPropertyIds.PROP_OBJECT_LIST);
      const binaryOutputs = objectList.value.filter(x => x.value.type === baEnum.BacnetObjectTypes.OBJECT_BINARY_OUTPUT);
      let count = binaryOutputs.length;

      debug(`BACnetDevice at ${device.address} has ${count} binaryOutputs`);

      binaryOutputs.map(x => x.value).forEach(xxx => {
        self.readProperty(device.address, xxx.type, xxx.instance, baEnum.BacnetPropertyIds.PROP_OBJECT_NAME, null, (error, val) => {
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
            self.emit('gotDevice', self.devices.length);

            debug(`CountDevices: ${self.devices.length}`);

            self.devices.forEach(z => {
              debug(`DeviceAddress: ${z.address}, deviceId: ${z.deviceId}`);
              z.binaryOutputs.forEach(az => {
                debug(`BinaryObject: ${az.objectIdentifier.instance}, objectName: ${az.objectName}`);
              });
            });
          }
        });
      });
    });
  }

  static writeBinaryOutputValue (self, address, objectInstance, value, next) {
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

    debug(`writeBinaryOutputValue(address: ${address} ObjectInstance: ${objectInstance}, value: ${value})`);
    self.writeProperty(address, baEnum.BacnetObjectTypes.OBJECT_BINARY_OUTPUT,
      objectInstance, baEnum.BacnetPropertyIds.PROP_PRESENT_VALUE, self.priorityForWriting,
      [{ type: baEnum.BacnetApplicationTags.BACNET_APPLICATION_TAG_ENUMERATED, value }], err => {
        if (err) {
          return next(err);
        }
        next(null);
      });
  }
}

module.exports = BacnetClient;
