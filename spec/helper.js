var query = require('../lib/neo4j').query;
var assert = require('assert');
var request = require('supertest');
var async = require('async');
var debug = require('debug')('mnfst:test:helper');

exports.purgeAll = function (cb) {
    var cypher = 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r';
    query(cypher).run().then(cb.bind(null, null))
};

exports.importServerFileFixtures = function (app, fqdn, files) {
    return function (cb) {
        request(app)
            .put('/server/' + fqdn)
            .set('Content-Type', 'text/plain')
            .send(files.join('\n'))
            .expect(200, cb);
    }
};
exports.importServerResourceFixtures = function (app, fqdn, files) {
    return function (cb) {
        request(app)
            .put('/server/' + fqdn)
            .set('Content-Type', 'text/csv')
            .send(files.join('\n'))
            .expect(200, cb);
    }
};

exports.assertNodeCount = function (type, count) {
    return function (cb) {
        var cypher = 'MATCH (n:' + type + ') RETURN n';
        query(cypher).run()
            .then(function (result) {
                assert.equal(result.data.length, count);
                cb(null, result.data);
            })
            .catch(cb);
    };
};

exports.assertServerProperty = function (fqdn, field, value) {
    return function (cb) {
        var cypher = 'MATCH (s:Server) WHERE s.fqdn = {fqdn} RETURN s';
        query(cypher).run({fqdn: fqdn})
            .then(function (result) {
                assert.equal(result.data[0][0].data[field], value);
                cb(null);
            })
            .catch(cb);
    }
};

exports.assertServerScore = function (fqdn, score) {
    return function (cb) {
        var cypher = 'MATCH (s:Server)-[r:USES]-() WHERE s.fqdn = {fqdn} RETURN COUNT(r) ';
        query(cypher).run({fqdn: fqdn})
            .then(function (result) {
                assert.equal(result.data[0][0], score);
                cb(null);
            })
            .catch(cb);
    }
};

exports.assertRelationProperty = function (fqdn, resource, field, value) {

    var arg = arguments;
    return function (cb) {
        debug('%s: %s : %s : %s : %s', 'assertRelationProperty', fqdn, resource, field, value);
        var cypher = 'MATCH (s:Server)<-[r:CHANGES]-(rr:Resource) WHERE s.fqdn = {fqdn} AND rr.name = {resource} RETURN r';
        query(cypher).run({fqdn: fqdn, resource: resource})
            .then(function (result) {
                var fieldValue = result.data[0][0].data[field];
                if (typeof value == 'function') {
                    assert(value(fieldValue), JSON.stringify(arg) + '=' + fieldValue)
                } else {
                    debug('equal? %s == %s (%s)', fieldValue, value, fieldValue == value);
                    assert.equal(fieldValue, value, JSON.stringify(arg) + '<not equal>' + fieldValue);
                }
                cb(null);
            })
            .catch(cb);
    }
};

exports.triggerServerResourcePing = function (app, fqdn, data, cnt) {
    return function (cb) {
        async.times(cnt || 1, function (n, next) {
            request(app)
                .post('/server/' + fqdn + '/rates')
                .set('Content-Type', 'application/json')
                .send(data)
                .expect(200, next);
        }, cb)

    };
};
exports.triggerServerResourceChangePing = function (app, fqdn, data, cnt) {
    return function (cb) {
        async.times(cnt || 1, function (n, next) {
            request(app)
                .post('/server/' + fqdn + '/rates/changes')
                .set('Content-Type', 'text/csv')
                .send(data)
                .expect(200, next);
        }, cb)

    };
};

exports.between = function (a, c) {
    return function (b) {
        debug('between? %d < _%d_ < %d >> %s', a, b, c, (b > a && b < c))
        return b > a && b < c
    }
}