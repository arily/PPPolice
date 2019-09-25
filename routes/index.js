var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.sendFile(path.resolve(__dirname + '/../public/info.html'));
  res.render('pppolice-broadcast');
});

module.exports = router;
