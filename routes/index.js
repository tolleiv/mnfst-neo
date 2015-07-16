var express = require('express');
var router = express.Router();
var statsGraph = require('../lib/stats');

router.get('/', function (req, res, next) {
    statsGraph.nodeCounts(function (err, results) {
        res.render('index', {title: 'Mnfst', stats: results});
    });
});

module.exports = router;
