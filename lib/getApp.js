'use strict';

const bodyParser = require('body-parser'),
      cors = require('cors'),
      express = require('express'),
      flaschenpost = require('flaschenpost'),
      morgan = require('morgan');

const path = require('path');

const storage = require('./storage');

const app = express();

// const clientDirectory = path.join(__dirname, '..', 'client');
const clientDirectory = path.join(__dirname, '..', 'dist');

const getApp = function () {
  app.use(cors());
  app.use(morgan('combined', {
    stream: new flaschenpost.Middleware('info')
  }));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use('/', express.static(clientDirectory));

  app.use('/', storage({
    storage: 'File',
    options: { directory: path.join(__dirname, '..', 'data'), transmitWhoIs: true }
  }));

  return app;
};

module.exports = getApp;
