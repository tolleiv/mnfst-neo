var neo4j = require('../lib/neo4j').neo4j;

exports.purgeAll = function (cb) {
    var cypher = 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r';
    neo4j.query(cypher).then(cb.bind(null, null))
};

exports.assertNodeCount = function (type, count, callback) {
    var cypher = 'MATCH (n:' + type + ') RETURN n';
    neo4j.query(cypher)
        .then(function (result) {
            var r = result.data.length;
            if (r != count) {
                throw new Error('Expected ' + count + ' nodes of type ' + type + ': but got ' + r)
            } else {
                callback(null, result.data);
            }
        })
        .catch(callback);
};
exports.assertServerScore = function (fqdn, score, callback) {
    var cypher = 'MATCH (s:Server)-[r:USES]-() WHERE s.fqdn = {fqdn} RETURN COUNT(r) ';
    neo4j.query(cypher, {fqdn: fqdn})
        .then(function (result) {
            var r = result.data[0][0];
            if (r != score) {
                throw new Error('Expected score ' + score + ' for server node ' + fqdn + ': but got ' + r)
            } else {
                callback(null);
            }
        })
        .catch(callback);
};