'use strict';

const Bacstack = require('bacstack');
const baEnum = require('bacstack/lib/bacnet-enum');

const debug = require('debug')('BacnetClient');

class BacnetClient extends Bacstack {
  constructor (options) {
    super({ apduTimeout: (options ? options.apduTimeout : undefined) || 6000 });
    this.priorityForWriting = (options ? options.priorityForWriting : undefined) || 12;
    this.transmitWhoIs = (options ? options.transmitWhoIs : undefined) || false;
    this.COVTIMEOUT = (options ? options.covTimeout : undefined) || 360000;
    this.POLLINTERVAL = (options ? options.pollInterval : undefined) || 2000;
    this.devices = [];
    this.timers = [];

    this.on('iAm', function (device) {
      debug(`BACnet iAm received, address: ${device.address}, deviceId: ${device.deviceId}`);
      BacnetClient.searchForObjects(this, device);
    });

    if (this.transmitWhoIs) {
      debug('this.transmitWhoIs: ', this.transmitWhoIs);
      this.whoIs();

    // } else {
    //   // used only for tests
    //   this.devices = [{ address: '192.168.31.9', deviceID: 99, binaryOutputs: [{ objectIdentifier: { type: 4, instance: 0 }, objectName: 'irgendwas' }]}];
    }
  }

  static searchForObjects (self, device) {
    if (self.devices.findIndex(x => x.address === device.address) === -1) {
      self.devices.push({
        address: device.address,
        deviceId: device.deviceId,
        Objects: []
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
      const Objects = objectList.value;

      // const binaryOutputs = objectList.value.filter(x => x.value.type === baEnum.BacnetObjectTypes.OBJECT_BINARY_OUTPUT);
      const DeviceIndex = self.devices.findIndex(x => x.address === device.address);

      debug(`BACnetDevice at ${device.address} has Objects`, Objects);

      Objects.map(x => x.value).forEach(xxx => {
        self.devices[DeviceIndex].Objects.push({
          objectIdentifier: { type: xxx.type, instance: xxx.instance },
          objectName: ''
        });
      });
      self.emit('gotDevice', self.devices.length);
    });
  }

  static write (self, deviceId, objectType, objectInstance, value, next) {
    const nr = self.devices.findIndex(x => x.deviceId === deviceId);

    if (nr === -1) {
      throw new Error('Device not found!');
    }
    if (objectType === baEnum.BacnetObjectTypes.OBJECT_BINARY_OUTPUT && value !== 0 && value !== 1 && value !== null) {
      throw new Error('Value not allowed!');
    }

    debug(`writeProperty(address: ${self.devices[nr].address}, ObjectType: ${objectType}, ObjectInstance: ${objectInstance}, value: ${value})`);
    self.writeProperty(self.devices[nr].address, objectType,
      objectInstance, baEnum.BacnetPropertyIds.PROP_PRESENT_VALUE, self.priorityForWriting,
      [{ type: baEnum.BacnetApplicationTags.BACNET_APPLICATION_TAG_ENUMERATED, value }], err => {
        if (err) {
          return next(err);
        }
        next(null);
      });
  }

  static read (self, deviceId, objectType, objectInstance, property, next) {
    const nr = self.devices.findIndex(x => x.deviceId === deviceId);

    debug(`read(address: ${self.devices[nr].address} ObjectType: ${objectType}, ObjectInstance: ${objectInstance}, Property: ${property})`);
    self.readProperty(self.devices[nr].address, objectType, objectInstance, property, null, (error, val) => {
      if (error) {
        return next(error);
      }
      next(null, val);
    });
  }

  static observe (self, deviceId, objectType, objectInstance, index, next) {
    const nr = self.devices.findIndex(x => x.deviceId === deviceId);

    if (nr === -1) {
      // throw new Error('Device not found!');
      return next(null);
    }

    debug(`subscribeCOV(address: ${self.devices[nr].address} ObjectType: ${objectType} ObjectInstance: ${objectInstance})`);
    self.subscribeCOV(self.devices[nr].address, { type: objectType, instance: objectInstance }, baEnum.BacnetPropertyIds.PROP_PRESENT_VALUE, false, false, self.COVTIMEOUT, err => {
      if (err) {
        // return next(err);
        self.timers.push(setInterval(() => {
          BacnetClient.read(self, deviceId, objectType, objectInstance, baEnum.BacnetPropertyIds.PROP_PRESENT_VALUE, (innerErr, val) => {
            if (innerErr) {
              // throw new Error(innerErr);
              return next(null);
            }
            debug('gotValue to emit', val.valueList[0].value);
            self.emit('gotCOV', { deviceId, objectType: val.objectId.type, objectId: val.objectId.instance, value: val.valueList[0].value });
          });
        }, self.POLLINTERVAL));
      }
      next(null);
    });
  }

  static readName (self, deviceId, objectType, objectInstance, index, next) {
    const nr = self.devices.findIndex(x => x.deviceId === deviceId);

    if (nr === -1) {
      // throw new Error('Device not found!');
      return next(null);
    }

    debug(`readName(address: ${self.devices[nr].address} ObjectType: ${objectType} ObjectInstance: ${objectInstance})`);
    BacnetClient.read(self, deviceId, objectType, objectInstance, baEnum.BacnetPropertyIds.PROP_OBJECT_NAME, (innerErr, val) => {
      if (innerErr) {
        // throw new Error(innerErr);
        return next(null);
      }
      debug('gotName to emit', val.valueList[0].value);
      self.emit('gotName', { deviceId, objectType: val.objectId.type, objectId: val.objectId.instance, value: val.valueList[0].value });
    });
    next(null);
  }
}

module.exports = BacnetClient;
