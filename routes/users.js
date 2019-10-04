var express = require('express');
var router = express.Router();
const osu = require('node-osu');
/* GET users listing. */
router.get('/:id', async function(req, res, next) {
	let user = req.params.id;
	let api = new osu.Api('27caa4993a4430b2e63762bdd5e6b9643ddf7679');
	let account = await api.getUser({u: user}).catch( reject => {
		res.send('account don\'t exist');
	});
	if (account !== undefined){
		res.render('pppolice-today',{
			bpDate: `today`,
			emitEventName: 'today',
			account: account
		});
	} else {
		
	}
});
router.get('/:id/:date', async function(req, res, next) {
	let user = req.params.id;
	let api = new osu.Api('27caa4993a4430b2e63762bdd5e6b9643ddf7679');
	let account = await api.getUser({u: user}).catch( reject => {
		res.send('account don\'t exist');
	});
	if (account !== undefined){
		res.render('pppolice-today',{
			bpDate: `at ${req.params.date}`,
			emitEventName: 'BPDate',
			account: account,
			dateTime: `,'${req.params.date}'`
		});
	} else {
		
	}
});

module.exports = router;
