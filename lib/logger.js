'use strict';

const logger = function (options) {
  if (!options) {
    throw new Error('Options are missing!');
  }
  if (!options.level) {
    throw new Error('Level is missing!');
  }
  if (!options.selection) {
    throw new Error('Selection is missing!');
  }

  if (options.selection === 'express') {
    return function (req, res, next) {
      /* eslint-disable no-console */
      console.log(`(${options.level}) ${req.method} ${req.path}`);
      /* eslint-enable no-console */
      next();
    };
  }

  if (options.selection === 'log') {
    return function (text) {
      /* eslint-disable no-console */
      console.log(`(${options.level}) ${text}`);
      /* eslint-enable no-console */
    };
  }
};

module.exports = logger;
