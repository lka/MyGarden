'use strict';

const assert = require('assertthat');

const Logger = require('../lib/logger');

suite('logger', () => {
  test('throws an error if Options are missing.', done => {
    assert.that(() => {
      /* eslint-disable no-new */
      new Logger();
      /* eslint-enable no-new */
    }).is.throwing('Options are missing!');
    done();
  });

  test('throws an error if Level missing.', done => {
    assert.that(() => {
      /* eslint-disable no-new */
      new Logger({});
      /* eslint-enable no-new */
    }).is.throwing('Level is missing!');
    done();
  });

  test('throws no error if Level set.', done => {
    assert.that(() => {
      /* eslint-disable no-new */
      new Logger({ level: 'high' });
      /* eslint-enable no-new */
    }).is.not.throwing();
    done();
  });

  test('express can be called, throws no error and calls done.', done => {
    const logger = new Logger({ level: 'info' });

    assert.that(() => {
      logger.express({ method: 'PUSH', path: 'somewhere' }, { res: 'strange' }, done);
    }).is.not.throwing();
  });
});
