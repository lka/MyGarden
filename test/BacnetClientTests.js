'use strict';

const assert = require('assertthat'),
      mockudp = require('mock-udp');

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
      mockudp.revert();
      done();
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
