'use strict';

const bodyParser = require('body-parser'),
      express = require('express');
const assert = require('assertthat'),
      isolated = require('isolated'),
      request = require('supertest'),
      uuid = require('uuidv4');

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

    test('returns a status code 200.', done => {
      isolated((errIsolated, directory) => {
        app.use('/', storage({
          storage: 'File',
          options: { directory }
        }));

        request(app).
          post('/binary').
          send({ id: '20acb396-4d73-4262-8fc6-9c64c1318d62', val: 1 }).
          end((err, res) => {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(200);
            done();
          });
      });
    });
  });

  suite('POST /device/:id', () => {
    test('returns a status code 400.', done => {
      app.use('/', storage({
        storage: 'File',
        options: { directory: '/wrxl' }
      }));

      request(app).
        post('/device/0815').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns a status code 500.', done => {
      app.use('/', storage({
        storage: 'File',
        options: { directory: '/wrxl' }
      }));
      const id = uuid();

      request(app).
        post(`/device/${id}`).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          done();
        });
    });

    test('returns a status code 200.', done => {
      isolated((errIsolated, directory) => {
        app.use('/', storage({
          storage: 'File',
          options: { directory }
        }));
        const id = uuid();

        request(app).
          post(`/device/${id}`).
          end((err, res) => {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(200);
            done();
          });
      });
    });
  });

  suite('GET /device/:id', () => {
    test('returns a status code 400.', done => {
      app.use('/', storage({
        storage: 'File',
        options: { directory: '/wrxl' }
      }));

      request(app).
        get('/device/0815').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns a status code 404.', done => {
      isolated((errIsolated, directory) => {
        app.use('/', storage({
          storage: 'File',
          options: { directory }
        }));
        const id = uuid();

        request(app).
          get(`/device/${id}`).
          end((err, res) => {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(404);
            done();
          });
      });
    });

    test('returns a status code 200.', done => {
      isolated((errIsolated, directory) => {
        app.use('/', storage({
          storage: 'File',
          options: { directory }
        }));
        const id = uuid();

        request(app).
          post(`/device/${id}`).
          end((err, res) => {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(200);

            request(app).
              get(`/device/${id}`).
              end((errGet, resGet) => {
                assert.that(errGet).is.null();
                assert.that(resGet.statusCode).is.equalTo(200);
                done();
              });
          });
      });
    });
  });

  suite('GET /devices', () => {
    test('returns a status code 500.', done => {
      app.use('/', storage({
        storage: 'File',
        options: { directory: '/wrxl' }
      }));

      request(app).
        get('/devices').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          done();
        });
    });

    test('returns a status code 200.', done => {
      isolated((errIsolated, directory) => {
        app.use('/', storage({
          storage: 'File',
          options: { directory }
        }));

        request(app).
          get('/devices').
          end((err, res) => {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(200);
            done();
          });
      });
    });
  });
});
