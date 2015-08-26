var query = require('./neo4j').query;
var debug = require('debug')('mnfst:lib_file');

var _showData = function(result) {
    return result.data[0][0]
};

var _showFile =[
    'START n=node({id}) MATCH (n:File)',
    'OPTIONAL MATCH (s:Server)-[r:USES]-(n:File)--(rr:Resource)-[:CHANGES]-(s)',
    'RETURN  {file:n, resources:collect(DISTINCT rr), servers: collect(DISTINCT s)}'
];

//TODO: adjust query and processing to pass along object
var _scoreByFile = [
    'MATCH (f:File)-[r:USES]-(s:Server)',
    'RETURN id(f), f.name, COUNT(r), SUM(COALESCE(s.weight, 1)) AS weight',
    'ORDER BY weight DESC'
];

var _mapFiles = function (params) {
    var files = params.map(function (n) {
        return n.file
    });
    debug(files);
    return { files: files };
};

var _affectedServers = [
    'MATCH (f:File)-[r:USES]-(s:Server)',
    'WHERE f.name IN {files}',
    'RETURN DISTINCT s'
];

var _scoreForFiles = [
    'MATCH (f:File)-[r:USES]-(s:Server)',
    'WHERE f.name IN {files}',
    'RETURN SUM(COALESCE(s.weight, 1))'];

var _deleteFiles = [
    'MATCH (f:File) WHERE f.name IN {files}',
    'OPTIONAL MATCH (f)-[r]-()',
    'DELETE f,r'
];

var _cleanupFiles = [
    'MATCH ff=(f:File)',
    'WHERE NOT (f)<-[:USES]-(:Server)',
    'FOREACH(n IN nodes(ff) | DELETE n )'
];

module.exports = {
    showFile: query(_showFile).post(_showData).run,
    affectedServers: query(_affectedServers)
        .pre(_mapFiles)
        .post(function (result) {

            var data=[];
            for(var i=0;i<result.data.length;i++) {
                data.push(result.data[i][0].data)
            }
            return data;
        }).run,
    scoreByFile: query(_scoreByFile)
        .post(function (result) {
            return result.data
        }).run,
    scoreForFiles: query(_scoreForFiles)
        .pre(_mapFiles)
        .post(function (result) {
            debug('Query result %s', JSON.stringify(result.data[0][0]))
            return result.data[0][0];
        }).run,
    deleteFiles: query(_deleteFiles).pre(_mapFiles).run,
    cleanupFiles: query(_cleanupFiles).run
};