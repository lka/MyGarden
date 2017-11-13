'use strict';

const http = require('http');

const flaschenpost = require('flaschenpost'),
      processenv = require('processenv');

const port = processenv('PORT') || 3000;
const logger = flaschenpost.getLogger();

const getApp = require('./lib/getApp');

//      getBacnetClient = require('./lib/getBacnetClient');

const app = getApp();

const server = http.createServer(app);

server.listen(port, () => {
  logger.info('HTTP-Server listening', { port });
});

// const client = getBacnetClient();
