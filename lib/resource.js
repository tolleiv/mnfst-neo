var query = require('./neo4j').query;

var _showData = function (result) {
    var data = result.data
    var chartData = [];
    for (var i = 0; i < data.length; i++) {
        changeRate = Math.round(data[i][2] * 1000) / 1000;
        failureRate = Math.round(data[i][3] * 1000) / 1000;

        if (changeRate > 0 || failureRate > 0) {
            var t = data[i][0].split('[')[0] || 'Unknown';
            chartData.push({
                Name: data[i][0],
                Amount: data[i][1],
                Rate: changeRate,
                Failures: failureRate,
                Type: t
            })
        }
    }
    return chartData
};



var _scoreForResources = [
    'MATCH (s:Server)--(f:File)--(n:Resource)-[r:CHANGES]-(s)',
    'RETURN  n.name, COUNT(r) AS cnt, AVG(r.rate10) AS rate, AVG(r.failed10) AS fail_rate',
    'ORDER BY fail_rate DESC, rate DESC, cnt DESC'
];

module.exports = {
    scoreForResources: query(_scoreForResources).post(_showData).run
};