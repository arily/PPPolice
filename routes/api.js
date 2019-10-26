var express = require('express');
// var path = require('path');
var router = express.Router();
const request = require('request');
const url = require('url');
/* GET home page. */
router.get('/v1/*', function(req, res, next) {
	req = `https://www.mothership.top${req.originalUrl}`;
	console.log(req);
	request(req, (err, resb, body) => {
		if (err) { return console.log(err); }
		else res.send(body);
	});
  // res.sendFile(path.resolve(__dirname + '/../public/info.html'));
  // res.render('pppolice-broadcast');
});

module.exports = router;
