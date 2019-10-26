var express = require('express');
var router = express.Router();
const request = require('request');
/* KHMC. */
router.get('/v1/*', function(req, res, next) {
	req = `https://www.mothership.top${req.originalUrl}`;
	console.log(req);
	request(req, (err, resb, body) => {
		if (err) { return console.log(err); }
		else res.send(body);
	});
});

module.exports = router;
