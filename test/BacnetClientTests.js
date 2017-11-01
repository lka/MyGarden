'use strict';

const assert = require('assertthat');

const BacnetClient = require('../lib/BacnetClient');

suite('BacnetClient', () => {
  suite('client', () => {
    test.skip('BacnetClient returns a function', done => {
      const client = new BacnetClient();

      assert.that(typeof client).is.ofType('object');
      client.close();
      done();
    });

    test('whoIs fires event iAm', done => {
      let eventFired = false;
      const client = new BacnetClient();

      // client.me.on('iAm', device => this.discoverDevice(device));
      client.on('iAm', () => {
        eventFired = true;

        // console.log('iAm event received', device);
        done();
      });

      setTimeout(() => {
        assert.that(eventFired, 'Event did not fire within 2 seconds').is.true();
      }, 2000);
      setTimeout(() => {
        client.close();
      }, 2500);

      client.whoIs();
    });

    test.skip('discoverDevice fires event', done => {
      let eventFired1 = false;
      const client = new BacnetClient();

      // client.me.on('iAm', device => this.discoverDevice(device));
      client.on('gotDevice', () => {
        eventFired1 = true;
        done();

        // console.log('iAm received', device);
      });

      setTimeout(() => {
        assert.that(eventFired1, 'Event did not fire within 2 seconds').is.true();
      }, 2000);
      setTimeout(() => {
        client.close();
      }, 2500);

      // client.discoverDevice({ address: '192.168.178.9' });
    });
  });
});
