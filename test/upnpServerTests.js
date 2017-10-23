'use strict';

const assert = require('assertthat');

const upnpServer = require('../lib/upnpServer');

suite('upnpServer', () => {
  suite('options', () => {
    test('throws an error if Options are missing.', done => {
      assert.that(() =>{
        const peer = upnpServer();
      }).is.throwing('Options are missing!');
      done();
    });

    test('throws an error if Port is missing.', done => {
      assert.that(() =>{
        const peer = upnpServer({});
      }).is.throwing('Port is missing!');
      done();
    });

    test('throws an error if URL is missing.', done => {
      assert.that(() =>{
        const peer = upnpServer({port: 8082});
      }).is.throwing('URL is missing!');
      done();
    });

    test('upnpServer is starting.', done => {
      const peer = upnpServer({
        port: 8082,
        url: '/upnp/amazon-ha-bridge/setup.xml'
      });
      var eventFired = false;
      setTimeout(function(){
        assert.that(eventFired, 'Event did not fire in 100ms').is.true();
        done();
      }, 100);
      peer.on('ready', function() {
        eventFired = true;
      });
      peer.start();
      setTimeout(function(){
      	peer.close();
      }, 150);
    });
  });
});
