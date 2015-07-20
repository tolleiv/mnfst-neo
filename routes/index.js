var express = require('express');
var router = express.Router();
var async = require('async');
var statsGraph = require('../lib/stats');
var fileGraph = require('../lib/file');
var serverGraph = require('../lib/server');
var resourceGraph = require('../lib/resource');

var colors = ['#00bbde', '#8a8ad6', '#eeb058', '#fe6672', '#ff855c', '#00cfbb', '#5a9eed', '#73d483', '#c879bb', '#0099b6', '#d74d58', '#cb9141', '#6b6bb6', '#d86945', '#00aa99', '#4281c9', '#57b566', '#ac5c9e', '#27cceb', '#ff818b', '#f6bf71', '#9b9be1', '#ff9b79', '#26dfcd', '#73aff4', '#87e096', '#d88bcb']

router.get('/', function (req, res, next) {
    res.redirect('/ui/dashboards/files');
});
router.get('/ui/dashboards/files', function (req, res, next) {
    async.series([
        function (cb) {
            fileGraph.scoreByFile(function (err, results) {
                if (err) {
                    throw err;
                }
                var data = [];
                for (var i = 0; i < Math.min(15, results.length); i++) {
                    data.push({name: results[i][0], count: results[i][1], score: results[i][2]})
                }
                cb(err, data);
            })
        }
    ], function (err, results) {
        res.render('dashboard-file', {title: 'Mnfst - Files dashboard', influencialFiles: results[0]});
    });
});
router.get('/ui/dashboards/resources', function (req, res, next) {
    async.series([
        function (cb) {
            resourceGraph.scoreForResources(function (err, results) {
                if (err) {
                    throw err;
                }
                var data = [];
                for (var i = 0; i < Math.min(10, results.length); i++) {
                    data.push({name: results[i][0], score: Math.round(results[i][2] * 1000) / 1000})
                }
                cb(err, data);
            })
        }
    ], function (err, results) {
        res.render('dashboard-resource', {title: 'Mnfst - Resource dashboard', activeResources: results[0]});
    });
});
router.get('/ui/dashboards/servers', function (req, res, next) {
    async.series([
        function (cb) {
            serverGraph.list(function (err, results) {
                if (err) {
                    throw err;
                }
                var data = [];
                for (var i = 0; i < results.data.length; i++) {
                    data.push({
                        fqdn: results.data[i][0].data.fqdn,
                        weight: results.data[i][0].data.weight || 1,
                        files: results.data[i][1],
                        resources: results.data[i][2],
                        rate: Math.round(results.data[i][3] * 1000) / 1000,
                        max_rate: Math.round(results.data[i][4] * 1000) / 1000
                    });
                }
                cb(err, data);
            });
        }
    ], function (err, results) {
        res.render('dashboard-server', {title: 'Mnfst - Servers dashboard', servers: results[0]});
    });
});

router.get('/data/node-types.json', function (req, res) {
    statsGraph.nodeCounts(function (err, results) {
        if (err) {
            throw err;
        }
        var data = [];
        for (var i = 0; i < results.length; i++) {
            data.push({label: results[i][1].join(), value: results[i][0], color: colors[i]})
        }
        res.json(data)
    })
});

module.exports = router;
