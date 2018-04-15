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
let userCount = 0;

wss.on("connection", socket => {
  userCount += 1;
  logger.info("New client connected, userCount:", userCount);

  socket.on('close', () => {
    userCount -= 1;
    logger.info("client disconnected, userCount", userCount);
  });

  handleToWSS(socket, wss);

});

wss.on('error', err => logger.info(err))

server.listen(port, () => {
  logger.info('HTTP-Server listening', { port });
});
