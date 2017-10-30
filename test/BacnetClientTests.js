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

    test('close releases port', done => {
      const client = new BacnetClient();
      let eventFired = false;

      client.on('iAm', () => {
        eventFired = true;
      });

      setTimeout(() => {
        assert.that(eventFired, 'Event did not fire within 2 seconds').is.true();
      }, 2000);
      setTimeout(() => {
        client.close();
      }, 2500);

      client.whoIs();
      done();
    });
  });
});
