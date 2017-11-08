'use strict';

const fs = require('fs'),
      path = require('path'),
      stream = require('stream');

const assert = require('assertthat'),
      isolated = require('isolated'),
      uuid = require('uuidv4');

const File = require('../../lib/storages/File');

const PassThrough = stream.PassThrough;

suite('File', () => {
  test('is a function', done => {
    assert.that(File).is.ofType('function');
    done();
  });

  suite('constructor', () => {
    test('throws an error if Options are missing.', done => {
      assert.that(() => {
        /* eslint-disable no-unused-vars */
        const unused = new File();
        /* eslint-enable no-unused-vars */
      }).is.throwing('Options are missing!');
      done();
    });

    test('throws an error if Directory are missing.', done => {
      assert.that(() => {
        /* eslint-disable no-unused-vars */
        const unused = new File({});
        /* eslint-enable no-unused-vars */
      }).is.throwing('Directory is missing!');
      done();
    });

    test('this.directory is set correctly', done => {
      const fileStorage = new File({ directory: 'wrxlbrnft' });

      assert.that(fileStorage.directory).is.equalTo('wrxlbrnft');
      done();
    });
  });

  suite('put', () => {
    const fileStorage = new File({ directory: path.join(__dirname, '..', 'data') });

    test('throws an error if Id is missing.', done => {
      assert.that(() => {
        fileStorage.put(undefined, null, null);
      }).is.throwing('Id is missing!');
      done();
    });

    test('throws an error if Stream is missing.', done => {
      assert.that(() => {
        fileStorage.put('08', undefined, null);
      }).is.throwing('Stream is missing!');
      done();
    });

    test('throws an error if Callback is missing.', done => {
      assert.that(() => {
        fileStorage.put('08', '15', undefined);
      }).is.throwing('Callback is missing!');
      done();
    });

    test('stores the given stream.', done => {
      const id = uuid(),
            passThrough = new PassThrough();

      isolated((errIsolated, directory) => {
        assert.that(errIsolated).is.null();

        const file = new File({ directory });

        file.put(id, passThrough, errPut => {
          assert.that(errPut).is.null();

          fs.readFile(path.join(directory, id), { encoding: 'utf8' }, (errReadFile, data) => {
            assert.that(errReadFile).is.null();
            assert.that(data).is.equalTo('foobar');
            done();
          });
        });

        passThrough.write('foo');
        passThrough.write('bar');
        passThrough.end();
      });
    });
  });
});
