var express = require('express');
var router = express.Router();
const request = require('request');

router.get('/', async function(req, res, next) {
    res.render('pppolice-farm', {
        rev: Math.random().toString(36).substring(7),
        emitEventName: 'Final',
        dateTime: `'2019-11-09','2019-11-17'`
    });
});

module.exports = router;