var neo4j = require('./neo4j').neo4j;
var query = require('./neo4j').query;

var _showData = function (result) {
    return result.data;
};
var _counts = [
        'MATCH n',
        'RETURN DISTINCT count(labels(n)) AS c, labels(n) AS l',
        'ORDER BY str(l),c'
    ]

// TODO: Most 'active' Resources
// TODO: Most (in)stable servers

module.exports = {
    nodeCounts: query(_counts).post(_showData).run
};