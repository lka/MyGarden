'use strict';

const assert = require('assertthat'),
      mockudp = require('mock-udp');

// const dgram = require('dgram');

const BacnetClient = require('../lib/BacnetClient');
const client = new BacnetClient();

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
      assert.that(new Uint8Array(scope.buffer)).is.equalTo(new Uint8Array([ 129, 11, 0, 8, 1, 0, 16, 8 ]));
      mockudp.revert();
      done();
    });

    test('iAm was received, readPropertyMultiple(Device-Information), after receiving Device-Information, readProperty(BinaryObject) was sent', done => {
      const address = '192.168.178.9';

      // Create scope to capture UDP readPropertyMultiple request
      const scopeRPMReq = mockudp(`${address}:47808`);

      const iAmResponse = Buffer.from([ 0x81, 0x0b, 0x00, 0x18,
        0x01, 0x20, 0xff, 0xff, 0x00, 0xff,
        0x10, 0x00, 0xc4, 0x02, 0x00, 0x00, 0x63, 0x22, 0x01, 0xe0, 0x91, 0x00, 0x21, 0x27 ]);
      const readPropertyMultipleRequest = Buffer.from([ 129, 10, 0, 19, 1, 4, 2, 117, 0, 14, 12, 2, 63, 255, 255, 30, 9, 8, 31 ]);
      const readPropertyMultipleResponse = Buffer.from([ 0x81, 0x0a, 0x01, 0x73, 0x01, 0x00, 0x30, 0x00, 0x0e, 0x0c, 0x02, 0x00, 0x00, 0x63,
        0x1e, 0x29, 0x0a, 0x4e, 0x22, 0x4e, 0x20, 0x4f, 0x29, 0x0b, 0x4e, 0x22, 0xea, 0x60, 0x4f, 0x29,
        0x0c, 0x4e, 0x75, 0x07, 0x00, 0x31, 0x2e, 0x32, 0x37, 0x2e, 0x31, 0x4f, 0x29, 0x18, 0x4e, 0x10,
        0x4f, 0x29, 0x1c, 0x4e, 0x74, 0x00, 0x42, 0x4d, 0x52, 0x4f, 0x29, 0x1e, 0x4e, 0xc4, 0x02, 0x00,
        0x00, 0x63, 0x21, 0x28, 0x65, 0x06, 0xc0, 0xa8, 0xb2, 0x25, 0xf2, 0x55, 0x4f, 0x29, 0x2c, 0x4e,
        0x74, 0x00, 0x31, 0x2e, 0x32, 0x4f, 0x29, 0x38, 0x4e, 0xa4, 0x75, 0x0b, 0x0b, 0x06, 0x4f, 0x29,
        0x39, 0x4e, 0xb4, 0x0b, 0x1e, 0x18, 0x00, 0x4f, 0x29, 0x3a, 0x4e, 0x75, 0x07, 0x00, 0x42, 0x4d,
        0x52, 0x34, 0x31, 0x30, 0x4f, 0x29, 0x3e, 0x4e, 0x22, 0x01, 0xe0, 0x4f, 0x29, 0x46, 0x4e, 0x75,
        0x07, 0x00, 0x42, 0x4d, 0x52, 0x34, 0x31, 0x30, 0x4f, 0x29, 0x49, 0x4e, 0x21, 0x05, 0x4f, 0x29,
        0x4b, 0x4e, 0xc4, 0x02, 0x00, 0x00, 0x63, 0x4f, 0x29, 0x4c, 0x4e, 0xc4, 0x02, 0x00, 0x00, 0x63,
        0xc4, 0x01, 0x40, 0x00, 0x00, 0xc4, 0x04, 0x40, 0x00, 0x00, 0xc4, 0x01, 0x40, 0x00, 0x01, 0xc4,
        0x04, 0x40, 0x00, 0x01, 0xc4, 0x01, 0x40, 0x00, 0x02, 0xc4, 0x04, 0x40, 0x00, 0x02, 0xc4, 0x01,
        0x40, 0x00, 0x03, 0xc4, 0x04, 0x40, 0x00, 0x03, 0xc4, 0x01, 0x40, 0x00, 0x04, 0xc4, 0x04, 0x40,
        0x00, 0x04, 0xc4, 0x01, 0x00, 0x00, 0x00, 0x4f, 0x29, 0x4d, 0x4e, 0x75, 0x0b, 0x00, 0x42, 0x4d,
        0x52, 0x34, 0x31, 0x30, 0x5f, 0x23, 0x39, 0x39, 0x4f, 0x29, 0x4f, 0x4e, 0x91, 0x08, 0x4f, 0x29,
        0x60, 0x4e, 0x85, 0x05, 0x07, 0xfc, 0x87, 0x50, 0x00, 0x4f, 0x29, 0x61, 0x4e, 0x85, 0x06, 0x00,
        0xa0, 0xcb, 0xc8, 0x3c, 0xe8, 0x4f, 0x29, 0x62, 0x4e, 0x21, 0x01, 0x4f, 0x29, 0x6b, 0x4e, 0x91,
        0x00, 0x4f, 0x29, 0x70, 0x4e, 0x91, 0x00, 0x4f, 0x29, 0x77, 0x4e, 0x31, 0xc4, 0x4f, 0x29, 0x78,
        0x4e, 0x21, 0x27, 0x4f, 0x29, 0x79, 0x4e, 0x75, 0x19, 0x00, 0x4b, 0x69, 0x65, 0x62, 0x61, 0x63,
        0x6b, 0x26, 0x50, 0x65, 0x74, 0x65, 0x72, 0x20, 0x47, 0x6d, 0x62, 0x48, 0x26, 0x43, 0x6f, 0x20,
        0x4b, 0x47, 0x4f, 0x29, 0x8b, 0x4e, 0x21, 0x04, 0x4f, 0x29, 0x9b, 0x4e, 0x21, 0x0c, 0x4f, 0x29,
        0xa7, 0x4e, 0x21, 0x40, 0x4f, 0x29, 0xc4, 0x4e, 0x91, 0x02, 0x4f, 0x29, 0xca, 0x4e, 0x1e, 0x21,
        0x00, 0x60, 0x1f, 0x4f, 0x29, 0xcb, 0x4e, 0x2e, 0xa4, 0x75, 0x0a, 0x16, 0x07, 0xb4, 0x0f, 0x17,
        0x2e, 0x00, 0x2f, 0x4f, 0x1f ]);
      const readPropertyReq = Buffer.from([ 0x81, 0x0a, 0x00, 0x11, 0x01, 0x04, 0x02, 0x75, 0x01, 0x0c, 0x0c, 0x01, 0x00, 0x00, 0x00, 0x19, 0x4d ]);
      const readPropertyResponse = Buffer.from([ 0x81, 0x0a, 0x00, 0x34, 0x01, 0x00, 0x30, 0x01, 0x0c, 0x0c, 0x01, 0x00, 0x00, 0x00,
        0x19, 0x4d, 0x3e, 0x75, 0x20, 0x00, 0x2f, 0x2f, 0x30, 0x30, 0x31, 0x2f, 0x30, 0x30, 0x2f, 0x30,
        0x33, 0x2f, 0x50, 0x2e, 0x31, 0x31, 0x2f, 0x43, 0x44, 0x4f, 0x2f, 0x4b, 0x2f, 0x46, 0x42, 0x5f,
        0x42, 0x4f, 0x2e, 0x30, 0x31, 0x3f ]);
      let eventFired = 0;

      mockudp.intercept();

      client.once('iAm', () => {
        eventFired = 1;
        assert.that(scopeRPMReq.done()).is.true();
        assert.that(new Uint8Array(scopeRPMReq.buffer)).is.equalTo(new Uint8Array(readPropertyMultipleRequest));
        const scopeReadProperty = mockudp(`${address}:47808`);

        client.receiveData(readPropertyMultipleResponse, address);
        assert.that(new Uint8Array(scopeReadProperty.buffer)).is.equalTo(new Uint8Array(readPropertyReq));
        eventFired = false;
        client.once('gotDevice', () => {
          eventFired = 2;
          mockudp.revert();
          done();
        });
        client.receiveData(readPropertyResponse, address);
      });

      setTimeout(() => {
        assert.that(eventFired).is.equalTo(2);
      }, 200);

      client.receiveData(iAmResponse, address);
    });
  });

  suite.skip('client-Test', () => {
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
  });

  suite('writeBinaryOutputValue(address, objectInstance, value)', () => {
    suite('incorrect values', () => {
      test('throws an error if address is unknown', done => {
        assert.that(() => {
          BacnetClient.writeBinaryOutputValue(client, '1234', 0, 1);
        }).is.throwing('Device not found!');
        done();
      });

      test('throws an error if BinaryOutput is unknown', done => {
        assert.that(() => {
          BacnetClient.writeBinaryOutputValue(client, client.devices[0].address, 1234, 1);
        }).is.throwing('BinaryOutput not found!');
        done();
      });

      test('throws an error if Value is too high', done => {
        assert.that(() => {
          BacnetClient.writeBinaryOutputValue(client, client.devices[0].address,
            client.devices[0].binaryOutputs[0].objectIdentifier.instance, 2);
        }).is.throwing('Value not allowed!');
        done();
      });

      test('throws no error if Value is 1', done => {
        assert.that(() => {
          BacnetClient.writeBinaryOutputValue(client, client.devices[0].address,
            client.devices[0].binaryOutputs[0].objectIdentifier.instance, 0);
        }).is.not.throwing();
        done();
      });
    });
  });
});
