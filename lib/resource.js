var neo4j = require('./neo4j').neo4j;

var _scoreForResources = function (callback) {
    var query = [
        'MATCH (n:Resource)-[r:CHANGES]-()',
        'RETURN  n.name, COUNT(r) AS count, AVG(r.rate10) AS rate',
        'ORDER BY rate DESC'
    ];

    neo4j.query(query.join(' '))
        .then(function (result) {
            callback(null, result.data);
        })
        .catch(callback)
};

module.exports = {
    scoreForResources: _scoreForResources
};