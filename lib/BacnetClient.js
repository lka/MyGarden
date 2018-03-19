'use strict';

const Bacstack = require('bacstack');
const baEnum = require('bacstack/lib/enum');

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
      objectId: { type: baEnum.ObjectTypes.OBJECT_DEVICE, instance: baEnum.PropertyIds.MAX_BACNET_PROPERTY_ID },
      properties: [{ id: baEnum.PropertyIds.PROP_ALL }]
    }], (err, value) => {
      if (err) {
        throw new Error(err, err.message);
      }
      debug('readPropertyMultiple returns value:', value.values[0]);
      const objectList = value.values[0].values.find(x => x.id === baEnum.PropertyIds.PROP_OBJECT_LIST);
      const Objects = objectList.value;

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
    if (objectType === baEnum.ObjectTypes.OBJECT_BINARY_OUTPUT && value !== 0 && value !== 1 && value !== null) {
      throw new Error('Value not allowed!');
    }

    debug(`writeProperty(address: ${self.devices[nr].address}, ObjectType: ${objectType}, ObjectInstance: ${objectInstance}, value: ${value})`);
    self.writeProperty(self.devices[nr].address, { type: objectType, instance: objectInstance }, baEnum.PropertyIds.PROP_PRESENT_VALUE,
      [{ type: baEnum.ApplicationTags.BACNET_APPLICATION_TAG_ENUMERATED, value }], { priority: self.priorityForWriting }, err => {
        if (err) {
          return next(err);
        }
        next(null);
      });
  }

  static writeWeeklySchedule (self, deviceId, objectType, objectInstance, value, next) {
    const nr = self.devices.findIndex(x => x.deviceId === deviceId);

    if (nr === -1) {
      throw new Error('Device not found!');
    }
    if (objectType !== baEnum.ObjectTypes.OBJECT_SCHEDULE) {
      throw new Error('Value not allowed!');
    }

    const transformed = [];

    for (let i = 0; i < 7; ++i) {
      if (value[i] !== undefined) {
        for (let j = 0; j < value[i].length; ++j) {
          value[i][j].time = new Date(value[i][j].time);
        }
        transformed.push(value[i]);
      } else {
        transformed.push(value[i]);
      }
    }

    debug(`writeProperty(address: ${self.devices[nr].address}, ObjectType: ${objectType}, ObjectInstance: ${objectInstance}, value: `, transformed);
    self.writeProperty(self.devices[nr].address, { type: objectType, instance: objectInstance }, baEnum.PropertyIds.PROP_WEEKLY_SCHEDULE,
      [{ type: baEnum.ApplicationTags.BACNET_APPLICATION_TAG_WEEKLY_SCHEDULE, value: transformed }], { arrayIndex: 0xFFFFFFFF, priority: 0 }, err => {
        if (err) {
          return next(err);
        }
        next(null);
      });
  }

  static read (self, deviceId, objectType, objectInstance, property, next) {
    const nr = self.devices.findIndex(x => x.deviceId === deviceId);

    debug(`read(address: ${self.devices[nr].address} ObjectType: ${objectType}, ObjectInstance: ${objectInstance}, Property: ${property})`);
    self.readProperty(self.devices[nr].address, { type: objectType, instance: objectInstance }, property, (error, val) => {
      if (error) {
        return next(error);
      }
      next(null, val);
    });
  }

  static observe (self, deviceId, objectType, objectInstance, index, next) {
    const nr = self.devices.findIndex(x => x.deviceId === deviceId);

    if (nr === -1) {
      return next(new Error('Device not found.', deviceId));
    }

    debug(`subscribeCOV(address: ${self.devices[nr].address} ObjectType: ${objectType} ObjectInstance: ${objectInstance})`);
    self.subscribeCOV(self.devices[nr].address, { type: objectType, instance: objectInstance }, baEnum.PropertyIds.PROP_PRESENT_VALUE, false, false, self.COVTIMEOUT, err => {
      if (err) {
        if (self.timers.findIndex(x => x.deviceId === deviceId && x.objectType === objectType && x.objectInstance === objectInstance) !== -1) {
          return next(null);
        }
        BacnetClient.read(self, deviceId, objectType, objectInstance, baEnum.PropertyIds.PROP_PRESENT_VALUE, (innerErr, val) => {
          if (innerErr) {
            return next(innerErr);
          }
          debug('gotValue to emit', val.values[0].value);
          self.emit('gotCOV', { deviceId, objectType: val.objectId.type, objectId: val.objectId.instance, value: val.values[0].value });
        });
        const timer = setInterval(() => {
          BacnetClient.read(self, deviceId, objectType, objectInstance, baEnum.PropertyIds.PROP_PRESENT_VALUE, (innerErr, val) => {
            if (innerErr) {
              return next(innerErr);
            }
            debug('gotValue to emit', val.values[0].value);
            self.emit('gotCOV', { deviceId, objectType: val.objectId.type, objectId: val.objectId.instance, value: val.values[0].value });
          });
        }, self.POLLINTERVAL);

        self.timers.push({ deviceId, objectType, objectInstance, timer });
      }
      next(null);
    });
  }

  static cancelObservation (self, deviceId, objectType, objectInstance, index, next) {
    const nr = self.devices.findIndex(x => x.deviceId === deviceId);

    if (nr === -1) {
      return next(new Error('Device not found.', deviceId));
    }

    debug(`unsubscribeCOV(address: ${self.devices[nr].address} ObjectType: ${objectType} ObjectInstance: ${objectInstance})`);
    self.subscribeCOV(self.devices[nr].address, { type: objectType, instance: objectInstance }, baEnum.PropertyIds.PROP_PRESENT_VALUE, true, false, self.COVTIMEOUT, err => {
      if (err) {
        const no = self.timers.findIndex(x => x.deviceId === deviceId && x.objectType === objectType && x.objectInstance === objectInstance);

        if (no !== -1) {
          clearInterval(self.timers[no].timer);
          self.timers.splice(no, 1);
        }
      }
      next(null);
    });
  }

  static readName (self, deviceId, objectType, objectInstance, index, next) {
    const nr = self.devices.findIndex(x => x.deviceId === deviceId);

    if (nr === -1) {
      return next(null);
    }

    debug(`readName(address: ${self.devices[nr].address} ObjectType: ${objectType} ObjectInstance: ${objectInstance})`);
    BacnetClient.read(self, deviceId, objectType, objectInstance, baEnum.PropertyIds.PROP_OBJECT_NAME, (innerErr, val) => {
      if (innerErr) {
        return next(null);
      }
      debug('gotName to emit', val.values[0].value);
      self.emit('gotName', { deviceId, objectType: val.objectId.type, objectId: val.objectId.instance, value: val.values[0].value });
    });
    next(null);
  }

  static readSched (self, deviceId, objectType, objectInstance, index, next) {
    const nr = self.devices.findIndex(x => x.deviceId === deviceId);

    if (nr === -1) {
      return next(null);
    }

    debug(`readSched(address: ${self.devices[nr].address} ObjectType: ${objectType} ObjectInstance: ${objectInstance})`);
    BacnetClient.read(self, deviceId, objectType, objectInstance, baEnum.PropertyIds.PROP_WEEKLY_SCHEDULE, (innerErr, val) => {
      if (innerErr) {
        return next(null);
      }
      debug('gotSched to emit', val);
      self.emit('gotSched', { deviceId, objectType: val.objectId.type, objectId: val.objectId.instance, propertyId: val.property.id, value: val.values[0].value });
    });
    next(null);
  }
}

module.exports = BacnetClient;
