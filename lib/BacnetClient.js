'use strict';

const Bacstack = require('bacstack'),
      flaschenpost = require('flaschenpost');

const logger = flaschenpost.getLogger();

class BacnetClient extends Bacstack {
  constructor (options) {
    super({ apduTimeout: (options ? options.apduTimeout : undefined) || 6000 });
    this.priorityForWriting = (options ? options.priorityForWriting : undefined) || 12;
    this.devices = [];

    this.on('iAm', device => {
      logger.info(`BACnet iAm received, address: ${device.address}, deviceId: ${device.deviceId}`);

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

        logger.info(`BACnetDevice at ${device.address} has ${count} binaryOutputs`);

        binaryOutputs.map(x => x.value).forEach(xxx => {
          this.readProperty(device.address, xxx.type, xxx.instance, 77, null, (error, val) => {
            if (error) {
              throw new Error(error, error.message);
            }

            const i = this.devices.findIndex(x => x.address === device.address);

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

              logger.info(`CountDevices: ${this.devices.length}`);

              this.devices.forEach(z => {
                logger.info(`DeviceAddress: ${z.address}, deviceId: ${z.deviceId}`);
                z.binaryOutputs.forEach(az => {
                  logger.info(`deviceId: ${z.deviceId}:BinaryObject: ${az.objectIdentifier.instance}, objectName: ${az.objectName}`);
                });
              });
            }
          });
        });
      });
    });
  }

  put (address, objectInstance, value) {
    const nr = this.devices.findIndex(x => x.address === address);

    if (nr === -1) {
      throw new Error('Device not found!');
    }
    if (this.devices[nr].findIndex(x => x.objectIdentifier.instance === objectInstance) === -1) {
      throw new Error('BinaryOutput not found!');
    }
    if (value !== 0 || value !== 1 || value !== null) {
      throw new Error('Value not allowed!');
    }

    const theValue = value === null ? { type: this.bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_NULL } :
      { type: this.bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_BOOLEAN, value };

    this.writeProperty(address, 4, objectInstance, 28, this.priorityForWriting, [
      theValue
    ], (err, val) => {
      if (err) {
        throw new Error('');
      }
      /* eslint-disable no-console */
      console.log('value', val);
      /* eslint-enable no-consloe */
    });
  }
}

module.exports = BacnetClient;
