'use strict';

class Logger {
  constructor (options) {
    if (!options) {
      throw new Error('Options are missing!');
    }
    if (!options.level) {
      throw new Error('Level is missing!');
    }

    this.level = options.level;
  }

  /* eslint-disable class-methods-use-this */
  express (req, res, next) {
    if (!req) {
      throw new Error('request is missing!');
    }
    if (!req.method) {
      throw new Error('method is missing!');
    }
    if (!res) {
      throw new Error('response is missing!');
    }
    /* eslint-disable no-console */
    console.log('(express) ', req.method, req.path);
    /* eslint-enable no-console */
    next();
  }
  /* eslint-enable class-methods-use-this */

  log (text, arr) {
    if (!text) {
      throw new Error('text is missing!');
    }
    /* eslint-disable no-console */
    console.log(`(${this.level}) ${text}`, arr);
    /* eslint-enable no-console */
  }
}

module.exports = Logger;
