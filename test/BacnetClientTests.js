'use strict';

const assert = require('assertthat'),
      mockudp = require('mock-udp');

// const dgram = require('dgram');

const BacnetClient = require('../lib/BacnetClient');

suite('BacnetClient', () => {
  suite('client', () => {
    const client = new BacnetClient();

    teardown(() => {
      setTimeout(() => {
        client.close();
      }, 2500);
    });

    test('whoIs was sent', done => {
      // Create scope to capture UDP requests
      const scope = mockudp('255.255.255.255:47808');

      client.whoIs();

      assert.that(scope.done()).is.true();
      assert.that(new Uint8Array(scope.buffer)).is.equalTo(new Uint8Array([ 129, 11, 0, 8, 1, 0, 16, 8 ]));
      mockudp.revert();
      done();
    });

<<<<<<< HEAD
    test('iAm was received and readPropertyMultiple was sent', done => {
      const address = '192.168.178.9';

      // Create scope to capture UDP readPropertyMultiple request
      const scope = mockudp(`${address}:47808`);

=======
    test('iAm was received', done => {
      // const udpclient = dgram.createSocket('udp4');
      // const md = new MockDgram();
>>>>>>> 3b17588774919c934faa36b3c56b354b321f260d
      const buffer = Buffer.from([ 0x81, 0x0b, 0x00, 0x18,
        0x01, 0x20, 0xff, 0xff, 0x00, 0xff,
        0x10, 0x00, 0xc4, 0x02, 0x00, 0x00, 0x63, 0x22, 0x01, 0xe0, 0x91, 0x00, 0x21, 0x27 ]);

<<<<<<< HEAD
=======
      // const msgIn = {
      //   ip: { src: '192.168.178.9' },
      //   udp: { srcPort: 47808, dataLength: buffer.length },
      //   data: buffer
      // };

      const rinfo = { address: '192.168.178.9',
        family: 'IPv4',
        port: 47808,
        size: buffer.length };

>>>>>>> 3b17588774919c934faa36b3c56b354b321f260d
      let eventFired = false;

      mockudp.intercept();

      client.once('iAm', () => {
        eventFired = true;
        assert.that(scope.done()).is.true();
        assert.that(new Uint8Array(scope.buffer)).is.equalTo(new Uint8Array([ 129, 10, 0, 19, 1, 4, 2, 117, 0, 14, 12, 2, 63, 255, 255, 30, 9, 8, 31 ]));
        mockudp.revert();
        done();
      });

      setTimeout(() => {
        assert.that(eventFired).is.true();
      }, 2000);

      client.receiveData(buffer, address);
    });

    test.skip('whoIs fires event iAm', done => {
      let eventFired = false;

      client.once('iAm', () => {
        eventFired = true;
        done();
      });

      setTimeout(() => {
        assert.that(eventFired).is.true();
      }, 2000);

      client.whoIs();
    });

    test.skip('discoverDevice fires event', done => {
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
});
