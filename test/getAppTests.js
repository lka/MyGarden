'use strict';

const assert = require('assertthat'),
      request = require('supertest');

const getApp = require('../lib/getApp');

suite.skip('getApp', () => {
  suite('GET /ping', () => {
    test('returns a status code 200.', done => {
      const app = getApp();

      request(app).
        get('/ping').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          done();
        });
    });

    test('returns a pong object.', done => {
      const app = getApp();

      request(app).
        get('/ping').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.body).is.equalTo({ ping: 'pong' });
          done();
        });
    });
  });
});
