var neo4j = require('./neo4j').neo4j;

var _counts = function(callback) {
    var query = [
        'MATCH n',
        'RETURN DISTINCT count(labels(n)), labels(n);'
    ].join(' ');
    neo4j.query(query)
        .then(function (result) {
            callback(null, result.data);
        })
        .catch(callback)
};

module.exports = {
    nodeCounts: _counts
};