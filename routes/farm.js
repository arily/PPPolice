var express = require('express');
var router = express.Router();
const request = require('request');

router.get('/:from/:to', async function(req, res, next) {
    res.render('pppolice-farm', {
        rev: Math.random().toString(36).substring(7),
        emitEventName: 'FARMOnline',
        dateTime: `'${req.params.from}','${req.params.to}'`
    });
});

module.exports = router;