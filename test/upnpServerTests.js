'use strict';

const assert = require('assertthat');

const upnpServer = require('../lib/upnpServer');

suite('upnpServer', () => {
  suite('options', () => {
    test('throws an error if Options are missing.', done => {
      assert.that(() => {
        upnpServer();
      }).is.throwing('Options are missing!');
      done();
    });

    test('throws an error if Port is missing.', done => {
      assert.that(() => {
        upnpServer({});
      }).is.throwing('Port is missing!');
      done();
    });

    test('throws an error if URL is missing.', done => {
      assert.that(() => {
        upnpServer({ port: 8082 });
      }).is.throwing('URL is missing!');
      done();
    });

    test('upnpServer is starting.', done => {
      const peer = upnpServer({
        port: 8082,
        url: '/upnp/amazon-ha-bridge/setup.xml'
      });
      let eventFired = false;

      setTimeout(() => {
        assert.that(eventFired, 'Event did not fire in 100ms').is.true();
        done();
      }, 100);
      peer.on('ready', () => {
        eventFired = true;
      });
      peer.start();
      setTimeout(() => {
        peer.close();
      }, 150);
    });
  });
});
