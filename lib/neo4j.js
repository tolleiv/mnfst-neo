var neo4j = require('neo4j-io')(process.env.NEO4J_URL || 'http://localhost:7474');
var debug = require('debug')('mnfst:neo4j');

var i = 0;

var query = function (query) {
    var preProc = function (params) {
        return params;
    };
    var postProc = function (result) {
        return result;
    };

    var api = {
        pre: function (fn) {
            preProc = fn;
            return api;
        },
        run: function (params) {
            var qry = (typeof query == 'function') ? query(params) : query;
            qry = Array.isArray(qry) ? qry.join(' ') : qry;

            params = preProc(params);
            i++;
            debug('Neo4j query (%d) %s', i, qry);
            if (typeof params != 'undefined') debug('Query params (%d) %s',i, JSON.stringify(params));
            return neo4j.query(qry, params)
                .then(postProc)
                .catch(function (err) {
                    debug('Failed query (%d) %s', i, qry);
                    debug(err.message)
                    throw err;
                })
        },
        post: function (fn) {
            postProc = fn;
            return api;
        }
    };
    return api;
};

module.exports = {
    neo4j: neo4j,
    query: query
};