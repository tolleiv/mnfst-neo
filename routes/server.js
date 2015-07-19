var express = require('express');
var router = express.Router();
var async = require('async');
var serverGraph = require('../lib/server.js');
var file_param = require('../lib/middleware/file_param').middleware;

router.get('/:fqdn', function (req, res, next) {
    res.sendStatus(200)
});

router.put('/:fqdn', file_param, function (req, res, next) {
    async.eachSeries(req.params.files, function iterator(item, callback) {
        var p = {fqdn: req.params.fqdn, path: item.file, resource: item.resource || null};
        serverGraph.linkServerToFile(p, callback);
    }, function (err) {
        res.sendStatus(err == null ? 200 : 500)
    });
});

router.post('/:fqdn/rates', function (req, res, next) {
    serverGraph.updateServerResourceRate({fqdn: req.params.fqdn, changes: req.body.changes}, function (err) {
        res.sendStatus(err == null ? 200 : 500)
    });
});

router.post('/:fqdn', function (req, res, next) {
    serverGraph.updateServerProperties(
        {fqdn: req.params.fqdn, weight: req.body.weight},
        function (err) {
            res.sendStatus(err == null ? 200 : 500)
        });
});

router.delete('/:fqdn/files', function (req, res, next) {
    serverGraph.unlinkServerFromFiles({fqdn: req.params.fqdn}, function (err) {
        res.sendStatus(err == null ? 200 : 500)
    });
});

router.delete('/:fqdn', function (req, res, next) {
    serverGraph.deleteServer({fqdn: req.params.fqdn}, function (err) {
        res.sendStatus(err == null ? 200 : 500)
    });
});

router.get('/', function (req, res, next) {
    serverGraph.list(function (err, results) {
        console.log(results)
        res.json(results)
    });

});

module.exports = router;
