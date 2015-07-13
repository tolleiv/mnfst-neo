var app = require('../../app');
var Bluebird = require('bluebird');
var request = require('supertest');
var async = require('async');
var helper = require('../helper');

describe('the file API', function () {

    beforeEach(helper.purgeAll);

    it('can calculate a basic score for a single file', function (done) {
        async.series([
                function (cb) {
                    request(app)
                        .put('/server/system1.localdom')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\nmanifest/system1.pp")
                        .expect(200, cb);
                },
                function (cb) {
                    request(app)
                        .put('/server/system2.localdom')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\nmanifest/system2.pp")
                        .expect(200, cb);
                },
                function (cb) {
                    request(app)
                        .get('/files/score')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp")
                        .expect(/^2$/)
                        .expect(200, cb);
                }
            ],
            done);
    });
    it('can calculate a basic score for multiple files', function (done) {
        async.series([
                function (cb) {
                    request(app)
                        .put('/server/system3.localdom')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\nmanifest/system3.pp")
                        .expect(200, cb);
                },
                function (cb) {
                    request(app)
                        .put('/server/system4.localdom')
                        .set('Content-Type', 'text/plain')
                        .send("manifest/system4.pp\nmodule/apache/manifest/apache.pp\nmanifest/base.pp")
                        .expect(200, cb);
                },
                function (cb) {
                    request(app)
                        .put('/server/system5.localdom')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\nmanifest/system5.pp\nmanifest/base.pp")
                        .expect(200, cb);
                },
                function (cb) {
                    request(app)
                        .get('/files/score')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\nmanifest/base.pp")
                        .expect(/^5$/)
                        .expect(200, cb);
                }
            ],
            done);
    });
});