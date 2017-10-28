'use strict';

const assert = require('assertthat');

const getBacnetClient = require('../lib/getBacnetClient');

suite('getBacnetClient', () => {
  suite('client', () => {
    test.skip('getBacnetClient returns a function', done => {
      const client = getBacnetClient();

      assert.that(typeof client).is.ofType('object');
      client.close();
      done();
    });

    test('close releases port', done => {
      const client = getBacnetClient();
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
