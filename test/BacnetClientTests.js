'use strict';

const assert = require('assertthat'),
      mockudp = require('mock-udp');

const fs = require('fs'),
      path = require('path');

const BacnetClient = require('../lib/BacnetClient');
const client = new BacnetClient({ transmitWhoIs: false });

// Helper function getDatagram for real bacnet frames (buffers them in global datagrams)
// the bacnet part starts always at offset 42 from the beginning of the wireshark frame
const datagrams = [];

const getDatagram = function (name) {
  let index = datagrams.findIndex(x => x.name === name);

  if (index === -1) {
    /* eslint-disable no-sync */
    const data = fs.readFileSync(path.join(__dirname, 'datagrams', name.concat('.bin')));
    /* eslint-ensable no-sync */

    index = datagrams.length;
    datagrams.push({ name, dataBuffer: data.slice(42, data.length) });
  }

  return datagrams[index].dataBuffer;
};

suite('BacnetClient', () => {
  suiteTeardown(() => {
    setTimeout(() => {
      client.close();
    }, 2100);
  });

  test('is a function', done => {
    assert.that(BacnetClient).is.ofType('function');
    done();
  });

  suite('client-simulation', () => {
    test('whoIs was sent', done => {
      // Create scope to capture UDP requests
      const scope = mockudp('255.255.255.255:47808');

      client.whoIs();

      assert.that(scope.done()).is.true();
      assert.that(new Uint8Array(scope.buffer)).is.equalTo(new Uint8Array(getDatagram('whoIsReq')));
      mockudp.revert();
      done();
    });

    test('iAm was received, readPropertyMultiple(Device-Information), after receiving Device-Information, readProperty(BinaryObject) was sent', done => {
      const address = '192.168.178.9';

      // Create scope to capture UDP readPropertyMultiple request
      const scopeRPMReq = mockudp(`${address}:47808`);

      let eventFired = 0;

      mockudp.intercept();

      client.once('iAm', () => {
        eventFired = 1;
        assert.that(scopeRPMReq.done()).is.true();
        assert.that(new Uint8Array(scopeRPMReq.buffer)).is.equalTo(new Uint8Array(getDatagram('readPropertyMultipleReq')));
        const scopeReadProperty = mockudp(`${address}:47808`);

        client.receiveData(getDatagram('readPropertyMultipleAck'), address);
        assert.that(new Uint8Array(scopeReadProperty.buffer)).is.equalTo(new Uint8Array(getDatagram('readPropertyReq')));
        eventFired = false;
        client.once('gotDevice', () => {
          eventFired = 2;
          mockudp.revert();
          done();
        });
        client.receiveData(getDatagram('readPropertyAck'), address);
      });

      setTimeout(() => {
        assert.that(eventFired).is.equalTo(2);
      }, 200);

      client.receiveData(getDatagram('iAmResponse'), address);
    });

    suite('writeBinaryOutputValue(address, objectInstance, value)', () => {
      suite('incorrect values', () => {
        test('throws an error if address is unknown', done => {
          assert.that(() => {
            BacnetClient.writeBinaryOutput(client, '1234', 0, 1);
          }).is.throwing('Device not found!');
          done();
        });

        test('throws an error if BinaryOutput is unknown', done => {
          assert.that(() => {
            BacnetClient.writeBinaryOutput(client, client.devices[0].address, 1234, 1);
          }).is.throwing('BinaryOutput not found!');
          done();
        });

        test('throws an error if Value is too high', done => {
          assert.that(() => {
            BacnetClient.writeBinaryOutput(client, client.devices[0].address,
              client.devices[0].binaryOutputs[0].objectIdentifier.instance, 2);
          }).is.throwing('Value not allowed!');
          done();
        });
      });

      suite('correct values', () => {
        test('throws no error if Value is 0', done => {
          const address = '192.168.178.9';

          // Create scope to capture UDP readPropertyMultiple request
          const scopeWPReq = mockudp(`${address}:47808`);

          mockudp.intercept();

          assert.that(() => {
            BacnetClient.writeBinaryOutput(client, address, 0, 0);
          }).is.not.throwing();
          setTimeout(() => {
            assert.that(scopeWPReq.done()).is.true();
            assert.that(new Uint8Array(scopeWPReq.buffer)).is.equalTo(new Uint8Array(getDatagram('writePropertyReq')));
            client.receiveData(getDatagram('writePropertyAck'), address);
            mockudp.revert();
            done();
          }, 100);
        });

        test('throws no error if Value is 1', done => {
          const address = '192.168.178.9';

          // Create scope to capture UDP readPropertyMultiple request
          const scopeWPReq = mockudp(`${address}:47808`);

          mockudp.intercept();

          assert.that(() => {
            BacnetClient.writeBinaryOutput(client, address, 0, 1);
          }).is.not.throwing();
          setTimeout(() => {
            const buf = getDatagram('writePropertyReq1');

            buf.writeUInt8(3, 8);
            assert.that(scopeWPReq.done()).is.true();
            assert.that(new Uint8Array(scopeWPReq.buffer)).is.equalTo(new Uint8Array(buf));
            client.receiveData(getDatagram('writePropertyAck'), address);
            mockudp.revert();
            done();
          }, 100);
        });

        test('throws no error if Value is Null', done => {
          const address = '192.168.178.9';

          // Create scope to capture UDP readPropertyMultiple request
          const scopeWPReq = mockudp(`${address}:47808`);

          mockudp.intercept();

          assert.that(() => {
            BacnetClient.writeBinaryOutput(client, address, 0, null);
          }).is.not.throwing();
          setTimeout(() => {
            const buf = getDatagram('writePropertyReqNull');

            buf.writeUInt8(4, 8);
            assert.that(scopeWPReq.done()).is.true();
            assert.that(new Uint8Array(scopeWPReq.buffer)).is.equalTo(new Uint8Array(buf));
            client.receiveData(getDatagram('writePropertyAck'), address);
            mockudp.revert();
            done();
          }, 100);
        });
      });
    });
  });

  suite('client-Test', () => {
    test('whoIs fires event iAm', done => {
      let eventFired = false;

      mockudp.revert();

      client.once('iAm', () => {
        eventFired = true;
        done();
      });

      setTimeout(() => {
        assert.that(eventFired).is.true();
      }, 2000);

      client.whoIs();
    });

    test('discoverDevice fires event', done => {
      let eventFired1 = false;

      client.once('gotDevice', () => {
        eventFired1 = true;
        done();
      });

      setTimeout(() => {
        assert.that(eventFired1).is.true();
      }, 2000);

      client.whoIs();
    });

    test('throws no error with readPropertyMultiple', done => {
      const address = '192.168.178.9';

      assert.that(() => {
        client.readPropertyMultiple(address,
          [{ objectIdentifier: { type: 4, instance: 0 },
            propertyReferences: [{ propertyIdentifier: 8 }]}], (err, value) => {
            /* eslint-disable no-console */
            if (err) {
              console.log(err, err.message);
            }
            console.log('returns:', value);
            /* eslint-enable no-console */
          });
      }).is.not.throwing();
      done();
    });

    suite('writeBinaryOutputValue(address, objectInstance, value)', () => {
      suite('correct values', () => {
        test('throws no error if Value is 0', done => {
          assert.that(() => {
            BacnetClient.writeBinaryOutput(client, client.devices[0].address,
              client.devices[0].binaryOutputs[0].objectIdentifier.instance, 0);
          }).is.not.throwing();
          done();
        });

        test('throws no error if Value is 1', done => {
          assert.that(() => {
            BacnetClient.writeBinaryOutput(client, client.devices[0].address,
              client.devices[0].binaryOutputs[0].objectIdentifier.instance, 1);
          }).is.not.throwing();
          done();
        });

        test('throws no error if Value is NULL', done => {
          assert.that(() => {
            BacnetClient.writeBinaryOutput(client, client.devices[0].address,
              client.devices[0].binaryOutputs[0].objectIdentifier.instance, null);
          }).is.not.throwing('BACnet writeProperty failed');
          done();
        });
      });
    });

    suite('subscribeCOVBinaryOutput(address, objectInstance, nr)', () => {
      suite('correct values', () => {
        test('throws no error if Value is 0', done => {
          assert.that(() => {
            BacnetClient.subscribeCOVBinaryOutput(client, client.devices[0].address,
              client.devices[0].binaryOutputs[0].objectIdentifier.instance, 0);
          }).is.not.throwing();
          done();
        });
      });
    });
  });
});
