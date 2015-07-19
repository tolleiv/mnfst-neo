var app = require('../../app');
var request = require('supertest');
var async = require('async');
var helper = require('../helper');
var between = require('../helper').between;

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
                        .send(['module/apache/manifest/apache.pp', 'manifest/system1.pp'])
                        .expect(200, cb);
                },
                helper.assertNodeCount('Server', 1),
                helper.assertNodeCount('File', 2)
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
                helper.importServerFileFixtures(app, 'system2.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/system2a.pp']),
                helper.importServerFileFixtures(app, 'system2.localdom',
                    ['module/apache/manifest/apache.pp', 'manifest/system2b.pp']),
                helper.assertNodeCount('Server', 1),
                helper.assertNodeCount('File', 3),
                helper.assertServerScore('system2.localdom', 3)
            ],
            done);
    });

    it('can purge files <> server relations', function (done) {
        async.series([
                helper.importServerFileFixtures(app, 'system3.localdom',
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

    it('can purge servers', function (done) {
        async.series([
                helper.importServerFileFixtures(app, 'system3.localdom',
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

    it('can associate files and resources for a server', function (done) {
        async.series([
                function (cb) {
                    request(app)
                        .put('/server/system8.localdom')
                        .set('Content-Type', 'text/csv')
                        .send("module/apache/manifest/apache.pp\tService[apache2]\nmanifest/system1.pp\tExec[do]")
                        .expect(200, cb);
                },
                helper.assertNodeCount('Server', 1),
                helper.assertNodeCount('File', 2),
                helper.assertNodeCount('Resource', 2)
            ],
            done);
    });

    describe('rate updates after agent runs', function () {
        it('can adjust rate values', function (done) {
            var s = 'system10.localdom';
            async.series([
                    helper.importServerResourceFixtures(app, s,
                        ["apache.pp\tService[apache2]", "system3.pp\tExec[do]"]),
                    helper.assertRelationProperty(s, 'Exec[do]', 'rate10', 0),
                    helper.assertRelationProperty(s, 'Service[apache2]', 'rate10', 0),
                    helper.triggerServerResourcePing(app, s, {changes: ['Exec[do]']}, 50),
                    helper.assertRelationProperty(s, 'Exec[do]', 'rate10', between(0.9, 1)),
                    helper.assertRelationProperty(s, 'Service[apache2]', 'rate10', 0)
                ],
                done
            )
            ;
        });
        it('unchanged resources will adjust all values to zero automatically', function (done) {
            var s = 'system10.localdom';
            async.series([
                    helper.importServerResourceFixtures(app, s,
                        ["apache.pp\tService[apache2]", "system3.pp\tExec[do]"]),
                    helper.assertRelationProperty(s, 'Exec[do]', 'rate10', 0),
                    helper.assertRelationProperty(s, 'Service[apache2]', 'rate10', 0),
                    helper.triggerServerResourcePing(app, s, {changes: ['Exec[do]']}, 5),
                    helper.triggerServerResourcePing(app, s, {changes: ['Service[apache2]']}),
                    helper.triggerServerResourcePing(app, s, {changes: []}),
                    helper.assertRelationProperty(s, 'Exec[do]', 'rate10', between(0.3, 0.4)),
                    helper.assertRelationProperty(s, 'Service[apache2]', 'rate10', between(0.09, 0.1))
                ],
                done
            )
            ;
        });
        it('change rates are not shared between servers', function (done) {
            var s1 = 'system11.localdom';
            var s2 = 'system12.localdom';
            async.series([
                    helper.importServerResourceFixtures(app, s1,
                        ["apache.pp\tService[apache2]", "system1.pp\tExec[do]"]),
                    helper.importServerResourceFixtures(app, s2,
                        ["apache.pp\tService[apache2]", "system2.pp\tExec[do]"]),
                    helper.assertRelationProperty(s1, 'Exec[do]', 'rate10', 0),
                    helper.assertRelationProperty(s1, 'Service[apache2]', 'rate10', 0),
                    helper.assertRelationProperty(s2, 'Exec[do]', 'rate10', 0),
                    helper.assertRelationProperty(s2, 'Service[apache2]', 'rate10', 0),
                    helper.triggerServerResourcePing(app, s1, {changes: ['Service[apache2]', 'Exec[do]']}, 50),
                    helper.assertRelationProperty(s2, 'Exec[do]', 'rate10', 0),
                    helper.assertRelationProperty(s2, 'Service[apache2]', 'rate10', 0),
                    helper.assertRelationProperty(s1, 'Exec[do]', 'rate10', between(0.9, 1)),
                    helper.assertRelationProperty(s1, 'Service[apache2]', 'rate10', between(0.9, 1))
                ],
                done
            )
            ;
        });

        it('can adjust change rate values seperately', function (done) {
            var s = 'system13.localdom';
            async.series([
                    helper.importServerResourceFixtures(app, s,
                        ["apache.pp\tService[apache2]", "system13.pp\tExec[do]", "system13.pp\tExec[foo]"]),
                    helper.assertRelationProperty(s, 'Exec[do]', 'rate10', 0),
                    helper.assertRelationProperty(s, 'Service[apache2]', 'rate10', 0),
                    helper.triggerServerResourceChangePing(app, s, "Exec[do]\nExec[foo]", 50),
                    helper.assertRelationProperty(s, 'Exec[do]', 'rate10', between(0.9, 1)),
                    helper.assertRelationProperty(s, 'Exec[foo]', 'rate10', between(0.9, 1)),
                    helper.assertRelationProperty(s, 'Service[apache2]', 'rate10', 0)
                ],
                done
            )
            ;
        });
    });

})
;