'use strict';

const cors = require('cors'),
      express = require('express');

const app = express();

const path = require('path');

const Logger = require('./logger');
const logger = new Logger({ level: 'info' });

const clientDirectory = path.join(__dirname, '..', 'client');

const getApp = function () {
  app.use(cors());
  app.use(logger.express);

  app.use('/', express.static(clientDirectory));

  app.get('/ping', (req, res) => {
    res.json({ ping: 'pong' });
  });

  return app;
};

module.exports = getApp;
