var express = require('express');
var router = express.Router();
var async = require('async');
var fileGraph = require('../lib/file.js');

router.get('/score', function (req, res, next) {
    var files = Array.isArray(req.body) ? req.body : req.body.split('\n');

    fileGraph.scoreForFiles(files, function (err, result) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(200).send(result.toString())
        }
    });
});

module.exports = router;
