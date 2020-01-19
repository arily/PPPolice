var express = require('express');
var router = express.Router();
const osu = require('node-osu');
const db = new require('lib/database')();
/* GET users listing. */
router.get('/:id', async function(req, res, next) {
	let user = req.params.id;
	console.log(db);
	let account = await db.getUserApi(user).catch( reject => {
		res.send('account don\'t exist');
	});
	if (account !== undefined){
		res.render('pppolice-today',{
			rev: Math.random().toString(36).substring(7),
			title: `${account.name}'s bp`,
			bpDate: `today`,
			emitEventName: 'today',
			account: account
		});
	} else {
		
	}
});
router.get('/:id/:date', async function(req, res, next) {
	let user = req.params.id;
	let account = await db.getUserApi(user).catch( reject => {
		res.send('account don\'t exist');
	});
	if (account !== undefined){
		res.render('pppolice-today',{
			rev: Math.random().toString(36).substring(7),
			title: `${account.name}'s bp`,
			bpDate: `at ${req.params.date}`,
			emitEventName: 'BPDate',
			account: account,
			dateTime: `,'${req.params.date}'`
		});
	} else {
		
	}
});
router.get('/:id/:from/:to', async function(req, res, next) {
	let user = req.params.id;
	let account = await db.getUserApi(user).catch( reject => {
		res.send('account don\'t exist');
	});
	if (account !== undefined){
		res.render('pppolice-today',{
			rev: Math.random().toString(36).substring(7),
			title: `${account.name}'s bp`,
			bpDate: `from ${req.params.from} to ${req.params.to}`,
			emitEventName: 'BPRange',
			account: account,
			dateTime: `,'${req.params.from}','${req.params.to}'`
		});
	} else {
		
	}
});

module.exports = router;
