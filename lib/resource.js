var query = require('./neo4j').query;

var _showData = function(result) {
    return result.data[0][0]
};

var _showList = function (result) {
    var data = result.data;
    var chartData = [];
    for (var i = 0; i < data.length; i++) {
        changeRate = Math.round(data[i][3] * 1000) / 1000;
        failureRate = Math.round(data[i][4] * 1000) / 1000;

        if (changeRate > 0 || failureRate > 0) {
            var t = data[i][1].split('[')[1] || 'Unknown';
            chartData.push({
                id: data[i][0],
                Name: data[i][1],
                Amount: data[i][2],
                Rate: changeRate,
                Failures: failureRate,
                Type: t
            })
        }
    }
    return chartData
};


var _showResource =[
    'START n=node({id}) MATCH (n:Resource)',
    'OPTIONAL MATCH (s:Server)--(f:File)--(n)-[r:CHANGES]-(s)',
    'RETURN  {resource:n, files:collect(DISTINCT f), servers: collect([s,r])}'
];


var _scoreForResources = [
    'MATCH (s:Server)--(f:File)--(n:Resource)-[r:CHANGES]-(s)',
    'RETURN  id(n), n.name, COUNT(r) AS cnt, AVG(r.rate10) AS rate, AVG(r.failed10) AS fail_rate',
    'ORDER BY fail_rate DESC, rate DESC, cnt DESC'
];

module.exports = {
    showResource: query(_showResource).post(_showData).run,
    scoreForResources: query(_scoreForResources).post(_showList).run
};