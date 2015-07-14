var neo4j = require('../lib/neo4j').neo4j;
var assert = require('assert');
var request = require('supertest');

exports.importServerFixture = function (app, fqdn, files) {
    return function (cb) {
        request(app)
            .put('/server/' + fqdn)
            .set('Content-Type', 'text/plain')
            .send(files.join('\n'))
            .expect(200, cb);
    }
};

exports.purgeAll = function (cb) {
    var cypher = 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r';
    neo4j.query(cypher).then(cb.bind(null, null))
};

exports.assertNodeCount = function (type, count, callback) {
    var cypher = 'MATCH (n:' + type + ') RETURN n';
    neo4j.query(cypher)
        .then(function (result) {
            assert.equal(result.data.length, count);
            callback(null, result.data);
        })
        .catch(callback);
};

exports.assertServerProperty = function (fqdn, field, value, callback) {
    var cypher = 'MATCH (s:Server) WHERE s.fqdn = {fqdn} RETURN s';
    neo4j.query(cypher, {fqdn: fqdn})
        .then(function (result) {
            assert.equal(result.data[0][0].data[field], value);
            callback(null);
        })
        .catch(callback);
};

exports.assertServerScore = function (fqdn, score, callback) {
    var cypher = 'MATCH (s:Server)-[r:USES]-() WHERE s.fqdn = {fqdn} RETURN COUNT(r) ';
    neo4j.query(cypher, {fqdn: fqdn})
        .then(function (result) {
            assert.equal(result.data[0][0], score);
            callback(null);
        })
        .catch(callback);
};