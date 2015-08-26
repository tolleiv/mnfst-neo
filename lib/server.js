var query = require('./neo4j').query;
var debug = require('debug')('mnfst:lib:server');

var clone = function (a) {
    return JSON.parse(JSON.stringify(a));
}

var _showServer = function (data) {
    return data.data[0][0];
};
var _showFullServer = function (data) {
    var r = {
        fqdn: data[0].data.fqdn,
        weight: data[0].data.weight || 1,
        files: data[1],
        resources: data[2],
        rate: Math.round(data[3] * 1000) / 1000,
        max_rate: Math.round(data[4] * 1000) / 1000,
        failed: Math.round(data[5] * 1000) / 1000,
        max_failed: Math.round(data[6] * 1000) / 1000
    };
    return r;
};
var _showAllServers = function (results) {
    var data = [];
    for (var i = 0; i < results.data.length; i++) {
        data.push(_showFullServer(results.data[i]));
    }
    return data;
};
var _showSingleServers = function (results) {
    return _showFullServer(results.data[0]);
};

var _list = [
    '<replace_me>',
    'OPTIONAL MATCH (s)<-[rr:CHANGES]-(r)',
    'WITH s, COALESCE(AVG(rr.rate10),0) AS rate, COALESCE(MAX(rr.rate10),0) AS max_rate,',
    'COALESCE(AVG(rr.failed10),0) AS failed, COALESCE(MAX(rr.failed10),0) AS max_failed, COUNT(r) AS resource_count',
    'OPTIONAL MATCH (f:File)<-[:USES]-(s)',
    'RETURN s, COUNT(f) AS file_count, resource_count, rate, max_rate, failed, max_failed, max_failed+max_rate AS ratescore',
    'ORDER BY ratescore DESC, file_count DESC'
];

var _show = clone(_list);
_show[0] = 'MATCH (s:Server {fqdn: {fqdn}})';

var _listAll = clone(_list);
_listAll[0] = 'MATCH (s:Server)';

var _findServer = [
    'MATCH (s:Server)',
    'WHERE s.fqdn = {fqdn}',
    'RETURN s'
];

var _updateServerProperties = [
    'MERGE (s:Server {fqdn: {fqdn} })',
    'SET s.weight = {weight}',
    'RETURN s'
];

var _updateServerResourceRate = function (params) {

    var query = ['MATCH (s:Server {fqdn: {fqdn}})<-[rr:CHANGES]-(r:Resource)'];

    if (params.changes.length == 0) {
        query.push('SET rr.rate10 = rr.rate10*0.9')
    } else {
        query.push('SET rr.rate10 = CASE');
        query.push('WHEN r.name IN {changes} THEN rr.rate10*0.9 + 0.1');
        query.push('ELSE rr.rate10*0.9');
        query.push('END');
    }
    if (params.failures.length == 0) {
        query.push('SET rr.failed10 = rr.failed10*0.9')
    } else {
        query.push('SET rr.failed10 = CASE');
        query.push('WHEN r.name IN {failures} THEN rr.failed10*0.9 + 0.1');
        query.push('ELSE rr.failed10*0.9');
        query.push('END');
    }
    return query;
};

var _linkServerToFile = function (params) {
    var query = [];
    query.push('MERGE (s:Server {fqdn: {fqdn} })');
    query.push('MERGE (f:File {name: {path} })');
    if (params.resource) {
        query.push('MERGE (r:Resource {name: {resource} })');
        query.push('WITH s,f,r');
        query.push('OPTIONAL MATCH (r)-[c:CHANGES]->(s)');
        query.push('CREATE UNIQUE (s)-[:USES]->(f)-[:PROVIDES]->(r)-[:CHANGES {rate10: COALESCE(c.rate10,0), failed10: COALESCE(c.failed10,0)}]->(s)');
    } else {
        query.push('CREATE UNIQUE (s)-[:USES]->(f)');
    }
    query.push('RETURN s');

    return query;
};

var _unlinkServerFromFiles = [
    'MATCH (s:Server)-[r:USES]-() WHERE s.fqdn = {fqdn}',
    'DELETE r'
];
var _deleteServer = [
    'MATCH (s:Server) WHERE s.fqdn = {fqdn}',
    'OPTIONAL MATCH (s)-[r]-()',
    'DELETE s,r'
];

module.exports = {
    show: query(_show).post(_showSingleServers).run,
    list: query(_listAll).post(_showAllServers).run,
    getServer: query(_findServer).run,
    linkServerToFile: query(_linkServerToFile).post(_showServer).run,
    unlinkServerFromFiles: query(_unlinkServerFromFiles).run,
    updateServerProperties: query(_updateServerProperties).post(_showServer).run,
    updateServerResourceRate: query(_updateServerResourceRate).run,
    deleteServer: query(_deleteServer).run
};