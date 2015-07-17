var Promise = require("bluebird");

var parser = function (req, res) {
    var deferred = Promise.pending();
    var files = Array.isArray(req.body) ? req.body : req.body.split('\n');
    files = files.filter(function (n) {
        return n;
    });
    var mapper;

    switch (req.get('Content-Type')) {
        case 'text/csv':
            mapper = function (line) {
                var parts = line.split(req.query.delimiter || "\t");
                return {file: parts[0], resource: parts[1]}
            };
            break;
        default:
        case 'application/json':
            mapper = function (line) {
                return line.file ? line : {file: line}
            };
            break;
        case 'text/plain':
            mapper = function (line) {
                return {file: line}
            };
            break;
    }
    req.params.files = files.map(mapper);
    deferred.fulfill(req.params.files);
    return deferred.promise;
};

var middleware = function (req, res, next) {
    parser(req, res).then(function () {
        next()
    }).done();
};

module.exports = {
    middleware: middleware,
    parser: parser
};