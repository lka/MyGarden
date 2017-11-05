'use strict';

const assert = require('assertthat'),
      // io = require('socket.io').listen(47808),
      // MockDgram = require('mock-dgram'),
      mockudp = require('mock-udp');
const util = require('util');

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

    test.skip('BacnetClient returns a function', done => {
      assert.that(typeof client).is.ofType('object');
      done();
    });

    test('whoIs was sent', done => {
      // Create scope to capture UDP requests
      const scope = mockudp('255.255.255.255:47808');

      client.whoIs();

      // console.log(scope.buffer);

      assert.that(scope.done(), 'nothing was sent').is.true();
      assert.that(new Uint8Array(scope.buffer), 'buffer contains whoIs').is.equalTo(new Uint8Array([ 129, 11, 0, 8, 1, 0, 16, 8 ]));
      mockudp.revert();
      done();
    });

    test('iAm was received', done => {
      // const udpclient = dgram.createSocket('udp4');
      // const md = new MockDgram();
      const buffer = Buffer.from([ 0x81, 0x0b, 0x00, 0x18,
        0x01, 0x20, 0xff, 0xff, 0x00, 0xff,
        0x10, 0x00, 0xc4, 0x02, 0x00, 0x00, 0x63, 0x22, 0x01, 0xe0, 0x91, 0x00, 0x21, 0x27 ]);

      // const msgIn = {
      //   ip: { src: '192.168.178.9' },
      //   udp: { srcPort: 47808, dataLength: buffer.length },
      //   data: buffer
      // };

      const rinfo = { address: '192.168.178.9',
        family: 'IPv4',
        port: 47808,
        size: buffer.length };

      let eventFired = false;

      // client.me.on('iAm', device => this.discoverDevice(device));
      client.once('iAm', () => {
        eventFired = true;
        done();
      });

      console.log('methods: ', BacnetClient[]);
      console.log('EventListeners: ', client.listenerCount('message'));

      setTimeout(() => {
        assert.that(eventFired, 'Event did not fire within 2 seconds').is.true();
      }, 2000);

      client.emit('message', buffer, rinfo);

      // md.input.write(msgIn);
      // udpclient.send(buffer, 0, buffer.length, rinfo.port, rinfo.address, (err, bytes) => {
      //   if (err) {
      //     throw new Error(err);
      //   }
        /* eslint-disable no-console */
        // console.log(`UDP message received from ${rinfo.address}:${rinfo.port}`);
        console.log('EventListeners: ', util.inspect(client.listenerCount('message')));
        // console.log('Socket: ', util.inspect(client.address()));
        /* eslint-enable no-console */
        // udpclient.close();
      // });
      // done();
    });

    test.skip('whoIs fires event iAm', done => {
      let eventFired = false;

      // client.me.on('iAm', device => this.discoverDevice(device));
      client.once('iAm', () => {
        eventFired = true;
        done();
      });

      setTimeout(() => {
        assert.that(eventFired, 'Event did not fire within 2 seconds').is.true();
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
        assert.that(eventFired1, 'Event did not fire within 2 seconds').is.true();
      }, 2000);

      client.whoIs();
    });
  });
});
