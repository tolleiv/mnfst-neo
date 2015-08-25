var express = require('express');
var router = express.Router();
var fileGraph = require('../lib/file.js');
var file_param = require('../lib/middleware/file_param').middleware;

router.get('/score', file_param, function (req, res) {
    fileGraph.scoreForFiles(req.params.files).then(function (result) {
        res.send(result.toString());
    });
});

router.get('/servers', file_param, function (req, res) {
    fileGraph.affectedServers(req.params.files).then(function (result) {

        switch (req.get('Content-Type')) {
            case 'text/plain':
            case 'text/csv':
                var list = result.map(function (o) {
                    return o.fqdn
                });
                res.send(list.join('\n'));
                break;
            default:
            case 'application/json':
                res.json(result);
                break;
        }
    });
});

router.get('/', function (req, res) {
    fileGraph.scoreByFile().then(function (result) {
        res.json(result)
    })
});

router.delete('/', file_param, function (req, res) {

    if (req.params.files.length == 0) {
        fileGraph.cleanupFiles().then(function () {
            res.send('OK')
        });
    } else {
        fileGraph.deleteFiles(req.params.files).then(function () {
            res.send('OK')
        });
    }

});

module.exports = router;
