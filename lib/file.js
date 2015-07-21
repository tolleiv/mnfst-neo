var query = require('./neo4j').query;
var debug = require('debug')('mnfst:lib_file');

var _scoreByFile = [
    'MATCH (f:File)-[r:USES]-(s:Server)',
    'RETURN f.name, COUNT(r), SUM(COALESCE(s.weight, 1)) AS weight',
    'ORDER BY weight DESC'
];

var _mapFiles = function (params) {
    var files = params.map(function (n) {
        return n.file
    });
    debug(files)
    return { files: files };
};

var _scoreForFiles = [
    'MATCH (f:File)-[r:USES]-(s:Server)',
    'WHERE f.name IN {files}',
    'RETURN SUM(COALESCE(s.weight, 1))'];

var _deleteFiles = [
    'MATCH (f:File) WHERE f.name IN {files}',
    'OPTIONAL MATCH (f)-[r]-()',
    'DELETE f,r'
];

module.exports = {
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
    deleteFiles: query(_deleteFiles).pre(_mapFiles).run

};