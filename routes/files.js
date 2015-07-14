var express = require('express');
var router = express.Router();
var fileGraph = require('../lib/file.js');
var file_param = require('../lib/middleware/file_param');

router.get('/score', file_param, function (req, res, next) {
    fileGraph.scoreForFiles(req.params.files, function (err, result) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(200).send(result.toString())
        }
    });
});

router.delete('/', file_param, function (req, res, next) {
    fileGraph.deleteFiles(req.params.files, function (err, result) {
        res.sendStatus(err == null ? 200 : 500)
    });
});

module.exports = router;
