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
        res.status(err == null ? 200 : 500).send(err || 'OK')
    });
});

router.post('/:fqdn/rates/changes', function (req, res, next) {
    var resources = req.body.split('\n');
    serverGraph.updateServerResourceRate({fqdn: req.params.fqdn, changes: resources}, function (err) {
        res.status(err == null ? 200 : 500).send(err || 'OK')
    });
});

router.post('/:fqdn/rates', function (req, res, next) {
    serverGraph.updateServerResourceRate({fqdn: req.params.fqdn, changes: req.body.changes}, function (err) {
        res.status(err == null ? 200 : 500).send(err || 'OK')
    });
});

router.post('/:fqdn', function (req, res, next) {
    serverGraph.updateServerProperties(
        {fqdn: req.params.fqdn, weight: req.body.weight},
        function (err) {
            res.status(err == null ? 200 : 500).send(err || 'OK')
        });
});

router.delete('/:fqdn/files', function (req, res, next) {
    serverGraph.unlinkServerFromFiles({fqdn: req.params.fqdn}, function (err) {
        res.status(err == null ? 200 : 500).send(err || 'OK')
    });
});

router.delete('/:fqdn', function (req, res, next) {
    serverGraph.deleteServer({fqdn: req.params.fqdn}, function (err) {
        res.status(err == null ? 200 : 500).send(err || 'OK')
    });
});

router.get('/', function (req, res, next) {
    serverGraph.list(function (err, results) {
        res.json(results)
    });

});

module.exports = router;
