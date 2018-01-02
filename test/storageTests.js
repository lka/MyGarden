'use strict';

const bodyParser = require('body-parser'),
      express = require('express');
const path = require('path');
const assert = require('assertthat'),
      isolated = require('isolated'),
      request = require('supertest');

const storage = require('../lib/storage');
const app = express();

suite('storage', () => {
  app.use(bodyParser.json());

  suite('options', () => {
    test('throws an error if Options are missing.', done => {
      assert.that(() => {
        storage();
      }).is.throwing('Options are missing!');
      done();
    });

    test('throws an error if Storage is missing.', done => {
      assert.that(() => {
        storage({});
      }).is.throwing('Storage is missing!');
      done();
    });

    test('throws an error if StorageOptions are missing.', done => {
      assert.that(() => {
        storage({ storage: 'File' });
      }).is.throwing('StorageOptions are missing!');
      done();
    });
  });

  suite('POST /binary', () => {
    test('returns a status code 400 with wrong uuid.', done => {
      app.use('/', storage({
        storage: 'File',
        options: { directory: '/wrxl' }
      }));

      request(app).
        post('/binary').
        send({ id: '0', val: 1 }).
        set({ 'Content-Type': 'application/json' }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns a status code 400 with wrong value.', done => {
      isolated((errIsolated, directory) => {
        assert.that(errIsolated).is.null();

        app.use('/', storage({
          storage: 'File',
          options: { directory }
        }));

        request(app).
          post('/binary').
          send({ id: '20acb396-4d73-4262-8fc6-9c64c1318d62', val: 3 }).
          end((err, res) => {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(400);
            done();
          });
      });
    });
  });

  suite('GET /binaries', () => {
    test('returns a status code 404.', done => {
      isolated((errIsolated, directory) => {
        assert.that(errIsolated).is.null();

        app.use('/', storage({
          storage: 'File',
          options: { directory }
        }));

        request(app).
          get('/binaries').
          end((err, res) => {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(404);
            done();
          });
      });
    });

    test('returns a status code 200.', done => {
      isolated({ files: path.join(__dirname, '..', 'data', 'binaries') }, (errIsolated, directory) => {
        assert.that(errIsolated).is.null();
        app.use('/', storage({
          storage: 'File',
          options: { directory }
        }));

        // initialization of storage needs 100 ms, so test it after this
        setTimeout(() => {
          request(app).
            get(`/binaries`).
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              done();
            });
        }, 100);
      });
    });
  });

  suite('GET /changes', () => {
    test('returns a status code 200 without data.', done => {
      app.use('/', storage({
        storage: 'File',
        options: { directory: '/wrxl' }
      }));

      setTimeout(() => {
        request(app).
          get('/changes').
          end((err, res) => {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(200);
            assert.that(res.body).is.equalTo({ ok: 'OK' });
            done();
          });
      }, 100);
    });

    test('returns a status code 200.', done => {
      isolated({ files: path.join(__dirname, '..', 'data', 'binaries') }, (errIsolated, directory) => {
        app.use('/', storage({
          storage: 'File',
          options: { directory }
        }));

        setTimeout(() => {
          request(app).
            get('/changes').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              assert.that(res.text).is.containing('id');
              done();
            });
        }, 100);
      });
    });
  });
});
