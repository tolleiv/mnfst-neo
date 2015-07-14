var neo4j = require('./neo4j').neo4j;

var _scoreForFiles = function (files, callback) {
    var cypher_params = {
        files: files
    };
    var query = [
        'MATCH (f:File)-[r:USES]-(s:Server)',
        'WHERE f.name IN {files}',
        'RETURN SUM(COALESCE(s.weight, 1))'].join(' ');

    neo4j.query(query, cypher_params)
        .then(function (result) {
            callback(null, result.data[0][0]);
        })
        .catch(callback)
};
var _deleteFiles = function (files, callback) {
    var cypher_params = {
        files: files
    };
    var query = [
        'MATCH (f:File) WHERE f.name IN {files}',
        'OPTIONAL MATCH (f)-[r]-()',
        'DELETE f,r'
    ].join(' ');

    neo4j.query(query, cypher_params)
        .then(callback.bind(null, null))
        .catch(callback)
};

module.exports = {
    scoreForFiles: _scoreForFiles,
    deleteFiles: _deleteFiles
};