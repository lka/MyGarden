'use strict';

const cors = require('cors'),
      express = require('express'),
      flaschenpost = require('flaschenpost'),
      morgan = require('morgan');

const path = require('path');

const storage = require('./storage');

const app = express();

const clientDirectory = path.join(__dirname, '..', 'client');

const getApp = function () {
  app.use(cors());
  app.use(morgan('combined', {
    stream: new flaschenpost.Middleware('info')
  }));

  app.use('/', express.static(clientDirectory));

  app.use('/', storage({
    storage: 'File',
    options: { directory: path.join(__dirname, '..', 'data') }
  }));

  // app.get('/ping', (req, res) => {
  //   res.json({ ping: 'pong' });
  // });

  return app;
};

module.exports = getApp;
