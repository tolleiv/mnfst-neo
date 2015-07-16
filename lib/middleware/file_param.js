var Promise = require("bluebird");


var parser = function(req, res) {
    var deferred = Promise.pending();
    var files = Array.isArray(req.body) ? req.body : req.body.split('\n');
    req.params.files = files.filter(function(n){return n; });
    deferred.fulfill(req.params.files);
    return deferred.promise;
};

var middleware = function(req, res, next) {
    parser(req, res).then(function() { next() }).done();
};

module.exports = {
    middleware: middleware,
    parser: parser
};