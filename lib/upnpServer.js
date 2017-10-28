'use strict';

// const fs = require('fs');

const ssdp = require('peer-ssdp');

const Logger = require('./logger');
const logger = new Logger({ level: 'info' });

const upnpServer = function (options) {
  if (!options) {
    throw new Error('Options are missing!');
  }
  if (!options.port) {
    throw new Error('Port is missing!');
  }
  if (!options.url) {
    throw new Error('URL is missing!');
  }

  const peer = ssdp.createPeer();

  //  const interval;
  /**
 * handle peer ready event. This event will be emitted after `peer.start()` is called.
 */
  peer.on('ready', () => {
    // handle ready event
    logger.log('UPNP server listening on port 1900.');

    //	send ssdp:alive messages every 1s
    //	{{networkInterfaceAddress}} will be replaced before
    //	sending the SSDP message with the actual IP Address of the corresponding
    //	Network interface. This is helpful for example in UPnP for LOCATION value
    // 	  interval = setInterval(function(){
    // 		  peer.alive({
    // 			  NT: "urn:schemas-upnp-org:device:basic:1",
    // 			  SERVER: "node.js/0.10.28 UPnP/1.1",
    // 			  ST: "urn:schemas-upnp-org:device:basic:1",
    // 			  USN: "uuid:f40c2981-7329-40b7-8b04-27f187aecfb5",
    // 			  LOCATION: "http://{{networkInterfaceAddress}}:{{options.port}}{{options.url}}",
    // 		  });
    // 	  }, 1000);
    // //	shutdown peer after 10 s and send a ssdp:byebye message before
    // 	  setTimeout(function(){
    // 		  clearInterval(interval);
    // //		  Close peer. After peer is closed the `close` event will be emitted.
    // 		  peer.close();
    // 	  }, 10000);
  });

  // handle SSDP NOTIFY messages.
  // param headers is JSON object containing the headers of the SSDP NOTIFY message as key-value-pair.
  // param address is the socket address of the sender
  peer.on('notify', (headers, address) => {
    // handle notify event
    logger.log('NOTIFY:', headers, address);
  });

  // handle SSDP M-SEARCH messages.
  // param headers is JSON object containing the headers of the SSDP M-SEARCH message as key-value-pair.
  // param address is the socket address of the sender
  peer.on('search', (headers, address) => {
    // handle search request
    // reply to search request
    // {{networkInterfaceAddress}} will be replaced with the actual IP Address of the corresponding
    // sending the SSDP message with the actual IP Address of the corresponding
    // Network interface.
    logger.log('SEARCH:', headers, address);

    // test

    if (headers.ST && headers.MAN === '"ssdp:discover"') {
      peer.reply({
        NT: 'urn:schemas-upnp-org:device:basic:1',
        SERVER: 'node.js/0.10.28 UPnP/1.1',
        ST: 'urn:schemas-upnp-org:device:basic:1',
        USN: 'uuid:Socket-1_0-221438K0100073::urn:Belkin:device:**',
        LOCATION: 'http://{{networkInterfaceAddress}}:{{options.port}}{{options.url}}'
      }, address);
    }
  });

  // handle SSDP HTTP 200 OK messages.
  // param headers is JSON object containing the headers of the SSDP HTTP 200 OK  message as key-value-pair.
  // param address is the socket address of the sender
  peer.on('found', (headers, address) => {
    // handle found event
    logger.log('FOUND:', headers, address);
  });

  // handle peer close event. This event will be emitted after `peer.close()` is called.
  peer.on('close', () => {
    // handle close event
    logger.log('CLOSING.');
  });

  // Start peer. Afer peer is ready the `ready` event will be emitted.
  //  peer.start();
  return peer;
};

module.exports = upnpServer;
