'use strict';

const assert = require('assertthat');

const upnpServer = require('../lib/upnpServer');

suite('upnpServer', () => {
  suite('options', () => {
    test('throws an error if Options are missing.', done => {
      assert.that(() =>{
        upnpServer();
      }).is.throwing('Options are missing!');
      done();
    });

    test('throws an error if Port is missing.', done => {
      assert.that(() =>{
        upnpServer({});
      }).is.throwing('Port is missing!');
      done();
    });

    test('throws an error if URL is missing.', done => {
      assert.that(() =>{
        upnpServer({port: 8082});
      }).is.throwing('URL is missing!');
      done();
    });

    test.skip('upnpServer is starting.', done => {
      upnpServer({
        port: 8082,
        url: '/upnp/amazon-ha-bridge/setup.xml'
      });
      done();
    });
  });
});
