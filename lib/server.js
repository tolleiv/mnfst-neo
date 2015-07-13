var neo4j = require('./neo4j').neo4j;

var _showServer = function(callback, data) {
    callback(null, data.data[0][0]);
};

var _findServer = function (params, callback) {
    var cypher_params = {
        fqdn: params.fqdn
    };
    var query = [
        'MATCH (s:Server)',
        'WHERE s.fqdn = {fqdn}',
        'RETURN s'
    ].join(' ');

    neo4j.query(query, cypher_params)
        .then(callback)
        .catch(callback)
};

var _linkServerToFile = function (params, callback) {
    var cypher_params = {
        fqdn: params.fqdn,
        path: params.path
    };
    var query = [
        'MERGE (s:Server {fqdn: {fqdn} })',
        'MERGE (f:File {name: {path} })',
        'CREATE UNIQUE (s)-[:USES]->(f)',
        'RETURN s'
    ].join(' ');

    neo4j.query(query, cypher_params)
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
    ].join(' ');

    neo4j.query(query, cypher_params)
        .then(callback.bind(null, null))
        .catch(callback)
};

module.exports = {
    getServer: _findServer,
    linkServerToFile: _linkServerToFile,
    unlinkServerFromFiles: _unlinkServerFromFiles
};