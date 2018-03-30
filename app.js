'use strict';

const http = require('http');
const ws = require("ws");

const childProcess = require('child_process'),
      flaschenpost = require('flaschenpost'),
      processenv = require('processenv'),
      path = require('path');

const port = processenv('PORT') || 3000;
const logger = flaschenpost.getLogger();

const getApp = require('./lib/getApp');
const handleWsConnection = require('./lib/handleWsConnection');

const storage = require('./storage');

//      getBacnetClient = require('./lib/getBacnetClient');

const app = getApp();
// ToDo: this part should be in the websocket.io part

  storage({
    storage: 'File',
    options: { directory: path.join(__dirname, '..', 'data'), transmitWhoIs: true }
  });

// end: this part should be in the websocket.io part

const bacnetProcess = childProcess.fork('bacnetProcess.js', [ options.options ], { cwd: __dirname });



const server = http.createServer(app);
const wss = new ws.Server({ server, path: '/', clientTrackin: false, maxPayload: 1024 });
let userCount = 0;

wss.on("connection", socket => {
  userCount++;

  logger.info("New client connected");
  handleWsConnection(socket, theStorage, bacnetProcess, switches, languageSet);
  socket.once('close', () => {
    logger.info("Client disconnected");
    userCount--;
  });
});

wss.on('error', err => logger.info(err))

server.listen(port, () => {
  logger.info('HTTP-Server listening', { port });
});

// const client = getBacnetClient();
