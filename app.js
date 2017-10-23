'use strict';

const http = require('http'),
      processenv = require('processenv');

const port = processenv('PORT') || 3000;

const getApp = require('./lib/getApp'),
      getBacnetClient = require('./lib/getBacnetClient');

const app = getApp();

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`HTTP-Server listening on port ${port}.`)
});

// const client = getBacnetClient();
