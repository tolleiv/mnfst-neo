var express = require('express');
var router = express.Router();
var resourceGraph = require('../lib/resource');

router.get('/', function (req, res, next) {
    resourceGraph.scoreForResources().then(function (result) {
        res.json(result)
    })
});
module.exports = router;
