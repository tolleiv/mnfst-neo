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
                helper.assertNodeCount('Server', 1),
                helper.assertNodeCount('File', 2)
            ],
            done);
    });

    it('can associate files for a server with json', function (done) {
        async.series([
                function (cb) {
                    request(app)
                        .put('/server/system5.localdom')
                        .set('Content-Type', 'application/json')
                        .send(['module/apache/manifest/apache.pp','manifest/system1.pp'])
                        .expect(200, cb);
                },
                helper.assertNodeCount('Server', 1),
                helper.assertNodeCount('File', 2)
            ],
            done);
    });
    it('will skip files with empty name', function (done) {
        async.series([
                function (cb) {
                    request(app)
                        .put('/server/system6.localdom')
                        .set('Content-Type', 'application/json')
                        .send(['module/apache/manifest/apache.pp',''])
                        .expect(200, cb);
                },
                function (cb) {
                    request(app)
                        .put('/server/system6.localdom')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\n")
                        .expect(200, cb);
                },
                helper.assertNodeCount('Server', 1),
                helper.assertNodeCount('File', 1)
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
                helper.assertServerProperty('system1.localdom', 'weight', 5)
            ],
            done);
    });

    it('reuses existing objects for server and files', function (done) {
        async.series([
                helper.importServerFixture(app, 'system2.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/system2a.pp']),
                helper.importServerFixture(app, 'system2.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/system2b.pp']),
                helper.assertNodeCount('Server', 1),
                helper.assertNodeCount('File', 3),
                helper.assertServerScore('system2.localdom', 3)
            ],
            done);
    });

    it('can purge files <> server relations', function (done) {
        async.series([
                helper.importServerFixture(app, 'system3.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/system3.pp']),
                helper.assertServerScore('system3.localdom', 2),
                function (cb) {
                    request(app)
                        .delete('/server/system3.localdom/files')
                        .expect(200, cb);
                },
                helper.assertNodeCount('Server', 1),
                helper.assertNodeCount('File', 2),
                helper.assertServerScore('system3.localdom', 0)
            ],
            done);
    });

    it('can purge servers', function(done) {
        async.series([
                helper.importServerFixture(app, 'system3.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/system3.pp']),
                helper.assertNodeCount('Server', 1),
                function (cb) {
                    request(app)
                        .delete('/server/system3.localdom')
                        .expect(200, cb);
                },
                helper.assertNodeCount('Server', 0)
            ],
            done);
    });

    xit('can associate files and resources for a server', function (done) {
        async.series([
                function (cb) {
                    request(app)
                        .put('/server/system8.localdom')
                        .set('Content-Type', 'text/plain')
                        .send("module/apache/manifest/apache.pp\tService[apache2]\nmanifest/system1.pp\tExec[do]")
                        .expect(200, cb);
                },
                helper.assertNodeCount('Server', 1),
                helper.assertNodeCount('File', 2),
                helper.assertNodeCount('Resource', 2)
            ],
            done);
    });

});