var neo4j = require('./neo4j').neo4j;

var _counts = function(callback) {
    var query = [
        'MATCH n',
        'RETURN DISTINCT count(labels(n)) AS c, labels(n) AS l',
        'ORDER BY str(l),c'
    ].join(' ');
    neo4j.query(query)
        .then(function (result) {
            callback(null, result.data);
        })
        .catch(callback)
};

// TODO: Most 'active' Resources
// TODO: Most (in)stable servers

module.exports = {
    nodeCounts: _counts
};