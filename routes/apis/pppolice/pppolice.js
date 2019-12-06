const express = require('express');
const router = express.Router();
const request = require('request');
const v1 = require('./v1/pppolice')

router.use('/v1', v1);

module.exports = router;
