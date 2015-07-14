module.exports = function(req, res, next) {
    var files = Array.isArray(req.body) ? req.body : req.body.split('\n');
    req.params.files = files.filter(function(n){return n; });
    next();
};