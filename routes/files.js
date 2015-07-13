var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var async = require('async');
var fileGraph = require('../lib/file.js');

router.get('/score', bodyParser.text(), function (req, res, next) {
    var files = req.body.split('\n');
    async.reduce(files, 0, function (total, item, callback) {
        fileGraph.scoreForFile({path: item}, function (err, result) {
            callback(err, total + result)
        });
    }, function (err, result) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(200).send(result.toString())
        }
    });
});

module.exports = router;
