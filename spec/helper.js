var neo4j = require('../lib/neo4j').neo4j;
var assert = require('assert');
var request = require('supertest');

exports.purgeAll = function (cb) {
    var cypher = 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r';
    neo4j.query(cypher).then(cb.bind(null, null))
};

exports.importServerFixture = function (app, fqdn, files) {
    return function (cb) {
        request(app)
            .put('/server/' + fqdn)
            .set('Content-Type', 'text/plain')
            .send(files.join('\n'))
            .expect(200, cb);
    }
};

exports.assertNodeCount = function (type, count) {
    return function (cb) {
        var cypher = 'MATCH (n:' + type + ') RETURN n';
        neo4j.query(cypher)
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
        neo4j.query(cypher, {fqdn: fqdn})
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
        neo4j.query(cypher, {fqdn: fqdn})
            .then(function (result) {
                assert.equal(result.data[0][0], score);
                cb(null);
            })
            .catch(cb);
    }
};