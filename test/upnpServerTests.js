'use strict';

const assert = require('assertthat'),
      sinon = require('sinon'),
      EventEmitter = require('events').EventEmitter;

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
      const spy = sinon.spy(),
            emitter = new EventEmitter();
      // request(peer)
      // .get('search')
      // .end((err, res) => {
      //   assert.that(err).is.null();
      //   done();
      // });
      emitter.on('ready', spy);
      setTimeout(function(){
      	peer.close();
      }, 5000);

      // sinon.assert.calledOnce(spy);
      setTimeout(function() {
        sinon.assert.calledOnce(spy);
        done();
      }, 2000);
      peer.start();
    });
  });
});
