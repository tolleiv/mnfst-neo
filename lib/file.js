var neo4j = require('./neo4j').neo4j;

var _scoreForFiles = function(files, callback) {
    var cypher_params = {
        files: files
    };
    var query = [
        'MATCH (f:File)-[r:USES]-(s:Server)',
        'WHERE f.name IN {files}',
        'RETURN SUM(COALESCE(s.weight, 1))'].join(' ');

    neo4j.query(query, cypher_params)
        .then(function(result) {
            callback(null, result.data[0][0]);
        })
        .catch(callback)
};

module.exports = {
    scoreForFiles: _scoreForFiles
};