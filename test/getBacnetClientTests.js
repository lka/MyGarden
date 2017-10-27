'use strict';

const assert = require('assertthat');

const getBacnetClient = require('../lib/getBacnetClient');

suite('getBacnetClient', () => {
  suite('client', () => {
    test.skip('getBacnetClient returns a function', done => {
      const client = getBacnetClient();

      assert.that(typeof client).is.ofType('object');
      done();
    });
  });
});
