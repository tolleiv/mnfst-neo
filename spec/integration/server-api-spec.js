var app = require('../../app');
var Bluebird = require('bluebird');
var request = require('supertest');
var async = require('async');
var helper = require('../helper');

describe('the server API', function () {

    beforeEach(helper.purgeAll);

    it('can associate files for a server', function (done) {
        async.series([
                function (cb) {
                    request(app)
                        .put('/server/system1.localdom')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\nmanifest/system1.pp")
                        .expect(200, cb);
                },
                function (cb) {
                    helper.assertNodeCount('Server', 1, cb)
                },
                function (cb) {
                    helper.assertNodeCount('File', 2, cb)
                }
            ],
            done);
    });

    it('can set the scoring weight for a server', function (done) {
        async.series([
                function (cb) {
                    request(app)
                        .post('/server/system1.localdom')
                        .set('Content-Type', 'application/json')
                        .send({weight: 5})
                        .expect(200, cb);
                },
                function (cb) {
                    helper.assertServerProperty('system1.localdom', 'weight', 5, cb)
                }
            ],
            done);
    });

    it('reuses existing objects for server and files', function (done) {
        async.series([
                function (cb) {
                    request(app)
                        .put('/server/system2.localdom')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\nmanifest/system2a.pp")
                        .expect(200, cb);
                },

                function (cb) {
                    request(app)
                        .put('/server/system2.localdom')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\nmanifest/system2b.pp")
                        .expect(200, cb);
                },
                function (cb) {
                    helper.assertNodeCount('Server', 1, cb)
                },
                function (cb) {
                    helper.assertNodeCount('File', 3, cb)
                },
                function (cb) {
                    helper.assertServerScore('system2.localdom', 3, cb)
                }
            ],
            done);
    });

    it('can purge files <> server relations', function (done) {
        async.series([
                function (cb) {
                    request(app)
                        .put('/server/system3.localdom')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\nmanifest/system3.pp")
                        .expect(200, cb);
                },
                function (cb) {
                    helper.assertServerScore('system3.localdom', 2, cb)
                },
                function (cb) {
                    request(app)
                        .delete('/server/system3.localdom/files')
                        .expect(200, cb);
                },
                function (cb) {
                    helper.assertNodeCount('Server', 1, cb)
                },
                function (cb) {
                    helper.assertNodeCount('File', 2, cb)
                },
                function (cb) {
                    helper.assertServerScore('system3.localdom', 0, cb)
                }
            ],
            done);
    });

});