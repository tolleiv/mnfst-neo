var query = require('./neo4j').query;

var _showServer = function (data) {
    return data.data[0][0];
};

var _listAll = [
    'MATCH (s:Server)',
    'OPTIONAL MATCH (s)<-[rr:CHANGES]-(r)',
    'WITH s, AVG(rr.rate10) AS rate, MAX(rr.rate10) AS max_rate, COUNT(r) AS resource_count',
    'OPTIONAL MATCH (f:File)<-[:USES]-(s)',
    'RETURN s, COUNT(f) AS file_count, resource_count, rate, max_rate',
    'ORDER BY max_rate DESC, rate DESC, file_count DESC'
];

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

var _updateServerResourceRate = [
    'MATCH (s:Server {fqdn: {fqdn}})<-[rr:CHANGES]-(r:Resource)',
    'SET rr.rate10 = CASE',
    'WHEN r.name IN {changes} THEN rr.rate10*0.9 + 0.1',
    'ELSE rr.rate10*0.9',
    'END'
];

var _linkServerToFile = function (params) {
    var query = [];
    query.push('MERGE (s:Server {fqdn: {fqdn} })');
    query.push('MERGE (f:File {name: {path} })');
    if (params.resource) {
        query.push('MERGE (r:Resource {name: {resource} })');
        query.push('WITH s,f,r');
        query.push('OPTIONAL MATCH (r)-[c:CHANGES]->(s)');
        query.push('CREATE UNIQUE (s)-[:USES]->(f)-[:PROVIDES]->(r)-[:CHANGES {rate10: COALESCE(c.rate10,0), rate100: COALESCE(c.rate100,0)}]->(s)');
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
    'OPTIONAL MATCH (n)-[r]-()',
    'DELETE n,r'
];

module.exports = {
    list: query(_listAll).run,
    getServer: query(_findServer).run,
    linkServerToFile: query(_linkServerToFile).post( _showServer).run,
    unlinkServerFromFiles: query(_unlinkServerFromFiles).run,
    updateServerProperties: query(_updateServerProperties).post(_showServer).run,
    updateServerResourceRate: query(_updateServerResourceRate).run,
    deleteServer: query(_deleteServer).run
};