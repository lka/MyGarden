'use strict';

const http = require('http');
const ws = require("ws");

const flaschenpost = require('flaschenpost'),
      processenv = require('processenv'),
      path = require('path');

const port = processenv('PORT') || 3000;
const logger = flaschenpost.getLogger();

const getApp = require('./lib/getApp');

const storeAndTransferData = require('./lib/storeAndTransferData');

//      getBacnetClient = require('./lib/getBacnetClient');

const app = getApp();
// ToDo: this part should be in the websocket.io part

const handleToWSS = storeAndTransferData({
    storage: 'File',
    options: { directory: path.join(__dirname, 'data'), transmitWhoIs: true }
  });

const server = http.createServer(app);
const wss = new ws.Server({ server, path: '/', clientTrackin: false, maxPayload: 10240 });

wss.on("connection", socket => {
  logger.info("New client connected");
  // socket.send(JSON.stringify({ type: 'Connection established' }));

  handleToWSS(socket, wss);
  socket.on('close', () => {
    logger.info("client disconnected");
  });
});

wss.on('error', err => logger.info(err))

server.listen(port, () => {
  logger.info('HTTP-Server listening', { port });
});

// const client = getBacnetClient();
