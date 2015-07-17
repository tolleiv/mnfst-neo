var neo4j = require('./neo4j').neo4j;

var _showServer = function (callback, data) {
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

var _updateServerProperties = function (params, callback) {
    var cypher_params = {
        fqdn: params.fqdn,
        weight: params.weight
    };
    var query = [
        'MERGE (s:Server {fqdn: {fqdn} })',
        'SET s.weight = {weight}',
        'RETURN s'
    ].join(' ');

    neo4j.query(query, cypher_params)
        .then(_showServer.bind(null, callback))
        .catch(callback)
};

var _linkServerToFile = function (params, callback) {
    var query;
    console.log(params)
    if (params.resource) {
        query = [
            'MERGE (s:Server {fqdn: {fqdn} })',
            'MERGE (f:File {name: {path} })',
            'MERGE (r:Resource {name: {resource} })',
            'CREATE UNIQUE (s)-[:USES]->(f)-[:PROVIDES]->(r)-[:CHANGES {rate10: 1, rate100: 1}]->(s)',
            'RETURN s'
        ]
    } else {
        query = [
            'MERGE (s:Server {fqdn: {fqdn} })',
            'MERGE (f:File {name: {path} })',
            'CREATE UNIQUE (s)-[:USES]->(f)',
            'RETURN s'
        ];
    }

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
    ].join(' ');

    neo4j.query(query, cypher_params)
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
    ].join(' ');

    neo4j.query(query, cypher_params)
        .then(callback.bind(null, null))
        .catch(callback)
};

module.exports = {
    getServer: _findServer,
    linkServerToFile: _linkServerToFile,
    unlinkServerFromFiles: _unlinkServerFromFiles,
    updateServerProperties: _updateServerProperties,
    deleteServer: _deleteServer
};