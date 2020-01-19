const express = require('express');
const router = express.Router({ mergeParams: true });
const request = require('request');
const verboseLevel = (process.env.NODE_ENV == 'production') ? 0 : 10;
const config = require("config/pppolice");
const tools = require('lib/tools');
const db = new require('lib/database')(tools.getCollectionNameByGameId(config.mode));
/* GET users listing. */
router.get('/', async function(req, res, next) {
    res.render('pppolice-banned', {
        rev: Math.random().toString(36).substring(7),
        title: `all players on pppolice got banned`,
        bannedUsers: await db.find({ status: { $eq: 'banned' } }),
    })
})
router.get('/:id', async function(req, res, next) {
    let user = req.params.id;
    let account = [...await db.find({ id: user, status: { $eq: 'banned' } }), ...await db.find({ name: user, status: { $eq: 'banned' } })];
    if (account.length == 0) return res.send('account don\'t exist or not banned');
    else account = account[0]
    if (account !== undefined) {
        res.render('pppolice-today', {
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
    let account = [...await db.find({ id: user, status: { $eq: 'banned' } }), ...await db.find({ name: user, status: { $eq: 'banned' } })];
    if (account.length == 0) return res.send('account don\'t exist or not banned');
    else account = account[0]
    if (account !== undefined) {
        res.render('pppolice-today', {
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
    let account = [...await db.find({ id: user, status: { $eq: 'banned' } }), ...await db.find({ name: user, status: { $eq: 'banned' } })];
    if (account.length == 0) return res.send('account don\'t exist or not banned');
    else account = account[0]
    if (account !== undefined) {
        res.render('pppolice-today', {
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