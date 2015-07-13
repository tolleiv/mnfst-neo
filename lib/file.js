var neo4j = require('./neo4j').neo4j;

var _scoreForSingleFile = function (params, callback) {
    var cypher_params = {
        path: params.path
    };
    var query = 'MATCH (f:File {name: {path} })-[r:USES]-() RETURN COUNT(r)';

    neo4j.query(query, cypher_params)
        .then(function(result) {
            callback(null, result.data[0][0]);
        })
        .catch(callback)
};

module.exports = {
    scoreForFile: _scoreForSingleFile
};