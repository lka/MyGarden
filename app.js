'use strict';

const http = require('http');

const getApp = require('./lib/getApp');

const app = getApp();

const server = http.createServer(app);

server.listen(3000);
