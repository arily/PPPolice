const express = require('express');
const router = express.Router({ mergeParams: true });
const request = require('request');
const verboseLevel = (process.env.NODE_ENV == 'production') ? 0 : 10;
const config = require("config/pppolice");
const tools = require('lib/tools');
const db = new require('lib/database')(tools.getCollectionNameByGameId(config.mode));
/* KHMC. */
router.get('/all', async (req, res, next) => {
    res.json(await db.all())
});

function prepareQueryObject(query) {
    let ret = {};
    //int
    // ["id"].forEach(col => {
    //     if (typeof query[col] !== 'undefined') {
    //         if (Array.isArray(query[col])) {
    //             ret[col] = query[col].map(e => +e);
    //         } else {
    //             ret[col] = +query[col];
    //         }

    //     }
    // });
    ret = JSON.parse(JSON.stringify(Object.assign(query, ret)));
    delete ret.fields;
    return ret;
}

function options(query) {
    return {
        fields: query.fields || undefined,
    }
}

function paramsArray(req) {
    let query = Object.assign(req.params, req.query);
    let rtn = [prepareQueryObject(query), options(query)];
    // console.log(rtn);
    return rtn
}
async function mergeReqForApiSearch(req) {
    return Object.assign(req, { params: await db.getUserApi(req.params.handle, { fields: db.fields.id }) });
}

router.get('/localUserExists', async (req, res, next) => {
    res.json(await db.localUserExists(...paramsArray(req)));
});
router.get('/localUserExists/:handle', async (req, res, next) => {
    res.json(await db.localUserExists(...paramsArray(await mergeReqForApiSearch(req))));
});
router.post('/localUserExists', async (req, res, next) => {
    res.json(await db.localUserExists(JSON.parse(req.body)));
});


router.get('/getUser', async (req, res, next) => {
    res.json(await db.getUser(...paramsArray(req)));
});
router.get('/getUser/:handle', async (req, res, next) => {
    try {
        res.json(await db.getUser(...paramsArray(await mergeReqForApiSearch(req))));
    } catch (e) {
        if (e.message == 'Not found') res.json({ message: 'User Not Found on bancho.' })
    }
});
router.post('/getUser', async (req, res, next) => {
    res.json(await db.getUser(req.body));
});


router.get('/find', async (req, res, next) => {
    res.json(await db.find(...paramsArray(req)));
});
router.get('/find/:handle', async (req, res, next) => {
    try {
        res.json(await db.find(...paramsArray(await mergeReqForApiSearch(req))));
    } catch (e) {
        if (e.message == 'Not found') res.json({ message: 'User Not Found on bancho.' })
    }

});
router.post('/find', async (req, res, next) => {
    res.json(await db.find(req.body));
});


router.get('/findOne', async (req, res, next) => {
    res.json(await db.findOne(...paramsArray(req)));
});
router.get('/findOne/:handle', async (req, res, next) => {
    try {
        res.json(await db.findOne(...paramsArray(await mergeReqForApiSearch(req))));
    } catch (e) {
        if (e.message == 'Not found') res.json({ message: 'User Not Found on bancho.' })
    }
});
router.post('/findOne', async (req, res, next) => {
    res.json(await db.findOne(req.body));
});


// router.get('/BPRange', async (req, res, next) => {
//     res.json(await db.BPRange(await db.getUser({id: req.rquery.id || undefined , name: req.query.name || undefined }),req.query.start,req,query.end));
// });
router.get('/BPRange/:handle', async (req, res, next) => {
    res.json(await db.BPRange(await db.getUserApi(req.params.handle, { fields: db.fields.id }), req.query.start, req.query.end));
});
router.get('/BPRange/:handle/:date', async (req, res, next) => {
    res.json(await db.BPRange(prepareQueryObject(await db.getUserApi(req.params.handle, { fields: db.fields.id })), req.params.date));
});
router.get('/BPRange/:handle/:start/:end', async (req, res, next) => {
    console.log(req.params);
    res.json(await db.BPRange(prepareQueryObject(await db.getUserApi(req.params.handle, { fields: db.fields.id })), req.params.start, req.params.end));
});
router.post('/BPRange', async (req, res, next) => {
    res.json(await db.BPRange(req.body));
});


router.get('/count', async (req, res, next) => {
    res.json(await db.count());
});

router.get('/register/:handle', async (req, res, next) => {
    try {
        res.json(await db.getUserApi(req.params.handle));
    } catch (e) {
        if (e.message == 'Not found') res.json({ message: 'User Not Found on bancho.' })
    }
});

router.get('/forceUpdate/:handle', async (req, res, next) => {
    try {
        const user = await db.getUserApi(req.params.handle)
        const policeStation = req.app.get('policeStation');
        console.log(policeStation)
        res.json(await policeStation.officers.chive.updatePlayer(user));
    } catch (e) {
        if (e.message == 'Not found') res.json({ message: 'User Not Found on bancho.' })
        console.log(e)
    }
});


module.exports = router;