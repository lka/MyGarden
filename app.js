'use strict';

const http = require('http');

const processenv = require('processenv');

const port = processenv('PORT') || 3000;

const getApp = require('./lib/getApp');

//      getBacnetClient = require('./lib/getBacnetClient');

const app = getApp();

const server = http.createServer(app);

server.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`HTTP-Server listening on port ${port}.`);
  /* eslint-enable no-console */
});

// const client = getBacnetClient();
