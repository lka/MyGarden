'use strict';

const express = require('express'),
      path = require('path');

const logger = require('./logger');

const clientDirectory = path.join(__dirname, '..', 'client');

const getApp = function() {
  const app = express();

  app.use(logger({ level: 'info'}));

  app.use('/', express.static(clientDirectory));

  app.get('/ping', (req, res) => {
    res.json({ ping: 'pong' });
  });

  return app;
};

module.exports = getApp;
