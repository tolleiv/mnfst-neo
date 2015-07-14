var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var async = require('async');
var fileGraph = require('../lib/file.js');

router.get('/score', bodyParser.text(), function (req, res, next) {
    var files = req.body.split('\n');
    fileGraph.scoreForFiles(files, function (err, result) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(200).send(result.toString())
        }
    });
});

module.exports = router;
