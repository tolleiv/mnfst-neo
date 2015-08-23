var express = require('express');
var router = express.Router();
var fileGraph = require('../lib/file.js');
var file_param = require('../lib/middleware/file_param').middleware;

router.get('/score', file_param, function (req, res) {
    fileGraph.scoreForFiles(req.params.files).then(function (result) {
        res.send(result.toString());
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
