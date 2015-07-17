var app = require('../../app');
var request = require('supertest');
var async = require('async');
var helper = require('../helper');

describe('the file API', function () {

    beforeEach(helper.purgeAll);

    it('can calculate a basic score for a single file', function (done) {
        async.series([
                helper.importServerFileFixtures(app, 'system1.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/system1.pp']),
                helper.importServerFileFixtures(app, 'system2.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/system2.pp']),
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
                helper.importServerFileFixtures(app, 'system3.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/system3.pp']),
                helper.importServerFileFixtures(app, 'system4.localdom',
                    ['manifest/system4.pp', 'module/apache/manifest/apache.pp', 'manifest/base.pp']),
                helper.importServerFileFixtures(app, 'system5.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/base.pp']),
                function (cb) {
                    request(app)
                        .get('/files/score')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\nmanifest/base.pp")
                        .expect(/^5$/)
                        .expect(200, cb);
                },
                function (cb) {
                    request(app)
                        .get('/files/score')
                        .set('Content-Type', 'application/json')
                        .send(['module/apache/manifest/apache.pp', 'manifest/system3.pp'])
                        .expect(/^4$/)
                        .expect(200, cb);
                }
            ],
            done);
    });
    it('can calculate a weighted score for multiple files (text or json)', function (done) {
        async.series([
                helper.importServerFileFixtures(app, 'system3.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/system3.pp']),
                helper.importServerFileFixtures(app, 'system4.localdom',
                    ['manifest/system4.pp', 'module/apache/manifest/apache.pp', 'manifest/base.pp']),
                helper.importServerFileFixtures(app, 'system5.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/base.pp']),
                function (cb) {
                    request(app)
                        .post('/server/system4.localdom')
                        .set('Content-Type', 'application/json')
                        .send({weight: 10})
                        .expect(200, cb);
                },
                function (cb) {
                    request(app)
                        .get('/files/score')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\nmanifest/base.pp")
                        .expect(/^23$/)
                        .expect(200, cb);
                }
            ],
            done);
    });

    it('can purge files', function(done) {
        async.series([
                helper.importServerFileFixtures(app, 'some.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/some.pp']),
                helper.assertNodeCount('File', 2),
                function (cb) {
                    request(app)
                        .delete('/files')
                        .set('Content-Type', 'application/json')
                        .send(['manifest/some.pp'])
                        .expect(200, cb);
                },
                helper.assertNodeCount('File', 1)
            ],
            done);
    });
});