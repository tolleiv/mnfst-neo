var express = require('express');
var router = express.Router();
var async = require('async');
var serverGraph = require('../lib/server.js');

router.get('/:fqdn', function (req, res, next) {
    res.sendStatus(200)
});

router.put('/:fqdn', function (req, res, next) {
    var files = req.body.split('\n');
    async.eachSeries(files, function iterator(item, callback) {
        serverGraph.linkServerToFile({fqdn: req.params.fqdn, path: item}, function (err) {
            callback(err);
        });
    }, function (err) {
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

module.exports = router;
