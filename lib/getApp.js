'use strict';

const express = require('express');

const getApp = function() {
  const app = express();

  app.get('/ping', (req, res) => {
    res.json({ ping: 'pong' });
  });
  
  return app;
};

module.exports = getApp;
