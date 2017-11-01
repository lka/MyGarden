'use strict';

const assert = require('assertthat');

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

    test('whoIs fires event iAm', done => {
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

    test('discoverDevice fires event', done => {
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
