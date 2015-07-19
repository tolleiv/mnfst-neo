var neo4j = require('./neo4j').neo4j;

var _showServer = function (callback, data) {
    callback(null, data.data[0][0]);
};

var _listAll = function(callback) {
    var query = [
        'MATCH (s:Server)',
        'OPTIONAL MATCH (s)<-[rr:CHANGES]-(r)',
        'WITH s, AVG(rr.rate10) AS rate, COUNT(r) AS resource_count',
        'OPTIONAL MATCH (f:File)<-[:USES]-(s)',
        'RETURN s, COUNT(f) AS file_count, resource_count, rate',
        'ORDER BY rate DESC, file_count DESC'
    ];

    neo4j.query(query.join(' '))
        .then(callback.bind(null, null))
        .catch(callback)
};

var _findServer = function (params, callback) {
    var cypher_params = {
        fqdn: params.fqdn
    };
    var query = [
        'MATCH (s:Server)',
        'WHERE s.fqdn = {fqdn}',
        'RETURN s'
    ];

    neo4j.query(query.join(' '), cypher_params)
        .then(callback.bind(null, null))
        .catch(callback)
};

var _updateServerProperties = function (params, callback) {
    var cypher_params = {
        fqdn: params.fqdn,
        weight: params.weight
    };
    var query = [
        'MERGE (s:Server {fqdn: {fqdn} })',
        'SET s.weight = {weight}',
        'RETURN s'
    ];

    neo4j.query(query.join(' '), cypher_params)
        .then(_showServer.bind(null, callback))
        .catch(callback)
};

var _updateServerResourceRate = function(params, callback) {
    var query = [
        'MATCH (s:Server {fqdn: {fqdn}})<-[rr:CHANGES]-(r:Resource)',
        'SET rr.rate10 = CASE',
        'WHEN r.name IN {changes} THEN rr.rate10*0.9 + 0.1',
        'ELSE rr.rate10*0.9',
        'END'
    ];

    neo4j.query(query.join(' '), params)
        .then(callback.bind(null, null))
        .catch(callback)
}

var _linkServerToFile = function (params, callback) {
    var query = [];
    query.push('MERGE (s:Server {fqdn: {fqdn} })');
    query.push('MERGE (f:File {name: {path} })');
    if (params.resource) {
        query.push('MERGE (r:Resource {name: {resource} })');
        query.push('WITH s,f,r');
        query.push('OPTIONAL MATCH (r)-[c:CHANGES]->(s)');
        query.push('CREATE UNIQUE (s)-[:USES]->(f)-[:PROVIDES]->(r)-[:CHANGES {rate10: COALESCE(c.rate10,0), rate100: COALESCE(c.rate100,0)}]->(s)');
    } else {
        query.push('CREATE UNIQUE (s)-[:USES]->(f)');
    }
    query.push('RETURN s');

    neo4j.query(query.join(' '), params)
        .then(_showServer.bind(null, callback))
        .catch(callback)
};

var _unlinkServerFromFiles = function (params, callback) {
    var cypher_params = {
        fqdn: params.fqdn
    };
    var query = [
        'MATCH (s:Server)-[r:USES]-() WHERE s.fqdn = {fqdn}',
        'DELETE r'
    ];

    neo4j.query(query.join(' '), cypher_params)
        .then(callback.bind(null, null))
        .catch(callback)
};
var _deleteServer = function (params, callback) {
    var cypher_params = {
        fqdn: params.fqdn
    };
    var query = [
        'MATCH (s:Server) WHERE s.fqdn = {fqdn}',
        'OPTIONAL MATCH (n)-[r]-()',
        'DELETE n,r'
    ];

    neo4j.query(query.join(' '), cypher_params)
        .then(callback.bind(null, null))
        .catch(callback)
};

module.exports = {
    list: _listAll,
    getServer: _findServer,
    linkServerToFile: _linkServerToFile,
    unlinkServerFromFiles: _unlinkServerFromFiles,
    updateServerProperties: _updateServerProperties,
    updateServerResourceRate: _updateServerResourceRate,
    deleteServer: _deleteServer
};