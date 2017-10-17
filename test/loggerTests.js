'use strict';

const assert = require('assertthat');

const logger = require('../lib/logger');

suite('logger', () => {
  test('throws an error if Options are missing.', done => {
    assert.that(() =>{
      logger();
    }).is.throwing('Options are missing!');
    done();
  });

  test('throws an error if Level missing.', done => {
    assert.that(() =>{
      logger({});
    }).is.throwing('Level is missing!');
    done();
  });

  test('throws no error if Level set.', done => {
    assert.that(() =>{
      logger({ level: 'high' });
    }).is.not.throwing();
    done();
  });
});
