var express = require('express');
var async = require('async');
var router = express.Router();
var serverGraph = require('../lib/server.js');
var file_param = require('../lib/middleware/file_param').middleware;

function ok() {
    this.send('OK')
}
function err(e) {
    this.status(500).send(err)
}

router.get('/:fqdn', function (req, res, next) {
    res.sendStatus(200)
});

router.put('/:fqdn', file_param, function (req, res, next) {
    async.eachSeries(req.params.files, function iterator(item, callback) {
        var p = {fqdn: req.params.fqdn, path: item.file, resource: item.resource || null};
        serverGraph.linkServerToFile(p).then(callback.bind(null,null)).catch(callback)
    }, function (err) {
        res.status(err == null ? 200 : 500).send(err || 'OK')
    });
});

router.post('/:fqdn/rates/changes', function (req, res, next) {
    var resources = req.body.split('\n');
    var p = {fqdn: req.params.fqdn, changes: resources};
    serverGraph.updateServerResourceRate(p)
        .then(ok.bind(res))
        .catch(err.bind(res))
});

router.post('/:fqdn/rates', function (req, res, next) {
    var p = {
        fqdn: req.params.fqdn,
        changes: req.body.changes || [],
        failures: req.body.failures || []
    };
    serverGraph.updateServerResourceRate(p)
        .then(ok.bind(res))
        .catch(err.bind(res))
});

router.post('/:fqdn', function (req, res, next) {
    var p = {fqdn: req.params.fqdn, weight: req.body.weight}
    serverGraph.updateServerProperties(p)
        .then(ok.bind(res))
        .catch(err.bind(res))
});

router.delete('/:fqdn/files', function (req, res, next) {
    serverGraph.unlinkServerFromFiles({fqdn: req.params.fqdn})
        .then(ok.bind(res))
        .catch(err.bind(res))
});

router.delete('/:fqdn', function (req, res, next) {
    serverGraph.deleteServer({fqdn: req.params.fqdn})
        .then(ok.bind(res))
        .catch(err.bind(res))
});

router.get('/', function (req, res, next) {
    serverGraph.list().then(function (results) {
        res.json(results)
    }).catch(err.bind(res));
});

module.exports = router;
