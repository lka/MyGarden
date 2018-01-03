'use strict';

const assert = require('assertthat'),
      mockudp = require('mock-udp');

const BacnetClient = require('../lib/BacnetClient');
const client = new BacnetClient({ transmitWhoIs: false });

suite('BacnetClient with the real Device', () => {
  suiteTeardown(() => {
    setTimeout(() => {
      client.close();
    }, 2100);
  });

  test('is a function', done => {
    assert.that(BacnetClient).is.ofType('function');
    done();
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
            if (err) {
              throw new Error(err);
            }
            done();
          });
      }).is.not.throwing();
    });

    suite('write(address,  objectType, objectInstance, value)', () => {
      suite('correct values', () => {
        test('throws no error if Value is 0', done => {
          assert.that(() => {
            BacnetClient.write(client, client.devices[0].deviceId, 4, 0, 0, err => {
                if (err) {
                  throw new Error(err);
                }
                done();
              });
          }).is.not.throwing();
        });

        test('reads BinaryOutputValue: 0', done => {
          assert.that(() => {
            BacnetClient.read(client, client.devices[0].deviceId, 4, 0, 85, (err, val) => {
              if (err) {
                throw new Error(err);
              }
              assert.that(val.valueList[0].value).is.equalTo(0);
              done();
            });
          }).is.not.throwing();
        });

        test('throws no error if Value is 1', done => {
          assert.that(() => {
            BacnetClient.write(client, client.devices[0].deviceId, 4, 0, 1, err => {
                if (err) {
                  throw new Error(err);
                }
                done();
              });
          }).is.not.throwing();
        });

        test('reads binaryOutputValue: 1', done => {
          assert.that(() => {
            BacnetClient.read(client, client.devices[0].deviceId, 4, 0, 85, (err, val) => {
              if (err) {
                throw new Error(err);
              }
              assert.that(val.valueList[0].value).is.equalTo(1);
              done();
            });
          }).is.not.throwing();
        });

        test('throws no error if Value is NULL', done => {
          assert.that(() => {
            BacnetClient.write(client, client.devices[0].deviceId, 4, 0, null, err => {
                if (err) {
                  throw new Error(err);
                }
                done();
              });
          }).is.not.throwing('BACnet writeProperty failed');
        });

        test('reads binaryOutputValue: 0 or 1', done => {
          assert.that(() => {
            BacnetClient.read(client, client.devices[0].deviceId, 4, 0, 85, (err, val) => {
              if (err) {
                throw new Error(err);
              }
              assert.that(val.valueList[0].value).is.between(0, 1);
              done();
            });
          }).is.not.throwing();
        });
      });
    });

    suite('observe(deviceId, objectType, objectInstance, nr)', () => {
      suite('start observation', () => {
        test('throws no error', done => {
          assert.that(() => {
            BacnetClient.observe(client, client.devices[0].deviceId, 4, 0, 0, err => {
                if (err) {
                  throw new Error(err);
                }
                assert.that(client.timers.length).is.equalTo(1);
                done();
              });
          }).is.not.throwing();
        });
      });
      suite('cancel observation', () => {
        test('throws no error', done => {
          assert.that(() => {
            BacnetClient.cancelObservation(client, client.devices[0].deviceId, 4, 0, 0, err => {
                if (err) {
                  throw new Error(err);
                }
                assert.that(client.timers.length).is.equalTo(0);
                done();
              });
          }).is.not.throwing();
        });
      });
    });
  });
});
