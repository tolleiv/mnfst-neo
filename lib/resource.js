var query = require('./neo4j').query;

var _showData = function (result) {
    return result.data;
};

var _scoreForResources = [
    'MATCH (n:Resource)-[r:CHANGES]-()',
    'RETURN  n.name, COUNT(r) AS cnt, AVG(r.rate10) AS rate',
    'ORDER BY rate DESC, cnt DESC'
];

module.exports = {
    scoreForResources: query(_scoreForResources).post(_showData).run
};