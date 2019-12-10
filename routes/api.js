var express = require('express');
// var path = require('path');
var router = express.Router();
var khmcApi = require('./apis/khmc/khmc');
var pppoliceApi = require('./apis/pppolice/pppolice');
router.use('/ms/', khmcApi);
router.use('/pppolice/', pppoliceApi);


router.all('*', function(req, res) {
  res.json({errorMsg:"undefined api endpoint"})
});
module.exports = router;
