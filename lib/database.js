function database(name = "pppolice-osu", mode = 0) {
    const tools = require('./tools');
    const memoize = require("memoizee");
    const config = require("../config/pppolice");
    const MongoClient = require('mongodb').MongoClient;
    const assert = require('assert');

    // Connection URL
    const url = config.db.url;

    // Database Name
    const dbName = config.db.dbName;

    // Create a new MongoClient
    const client = new MongoClient(url, { useUnifiedTopology: true });
    let connection = false;
    const fields = {
        id: ['id'],
        handle: ['id', 'name'],
        slim: ['id', 'name', 'pp', 'country', 'level', 'accuracy', 'lastUpdate'],
        reduced: ['id', 'name', 'counts', 'scorces', 'pp', 'country', 'level', 'accuracy', 'lastUpdate'],
        exceptBP: ['id', 'name', 'counts', 'scorces', 'pp', 'country', 'level', 'accuracy', 'lastUpdate', 'events'],
        exceptEvents: ['id', 'name', 'counts', 'scorces', 'pp', 'country', 'level', 'accuracy', 'lastUpdate', 'bp'],
        all: ['id', 'name', 'counts', 'scorces', 'pp', 'country', 'level', 'accuracy', 'lastUpdate', 'bp', 'events'],
    }

    const osu = require('node-osu');
    const _ = require('lodash');
    let suspects = {};
    let patroling = false;
    let report = undefined;
    let verboseLevel = 0;
    // let mode = mode;
    async function getDb(mode = 'osu') {
        if (connection == false) {
            await client.connect({ useNewUrlParser: true });
            connection = true;
        }

        return {
            db: client.db(dbName),
            client: client
        };
    }

    function toTimestamp(strDate) {
        if (typeof strDate === 'string' || strDate instanceof String) {
            strDate = strDate.split('-').join('/');
            let d = Date.parse(strDate);
            return d;
        }
        return 0;
    }

    function rebindProto(account) {
        if (account == null) return null;
        //if (account.mode == undefined) account.mode = mode;
        if (typeof account.events !== 'undefined')
            account.events.forEach(e => {
                e.__proto__ = osu.Event.prototype;
            });
        if (typeof account.bp !== 'undefined')
            account.bp.forEach(e => {
                e.__proto__ = osu.Score.prototype;
            })

        account.__proto__ = osu.User.prototype;
    }

    function rebindProtoEach(accounts) {
        accounts.forEach(account => rebindProto(account));
    }

    function slimAccount(account) {
        return {
            id: account.id,
            name: account.name
        };
    }

    function createFields(fieldToReturn, showid = 0) {

        let fields = { _id: showid }
        if (Array.isArray(fieldToReturn)) fieldToReturn.forEach(field => {
            fields[field] = 1;
        });
        return fields;
    }
    async function insertOrUpdateUser(user) {
        let { client, db } = await getDb();
        let result = await db.collection('osu').updateOne({ id: user.id }, { $set: user }, {
            upsert: true,
        });
        // console.log(await getUserById(user.id), user);
        return result;
    }
    async function localUserExists(suspect) {
        let local = await getUserById(suspect.id, { fields: fields.id });
        let result = (local !== null);
        return result;
    }
    async function getUserApi(u, field = undefined) {
        try {
            let monitor = new osu.Api(config.api.key);
            let account = await monitor.getUser({ u });
            let ret = {};
            if (field !== undefined) {
                let { fields } = field;
                for (let col in account) {
                    if (fields.includes(col)) {

                    } else {
                        delete account[col];
                    }
                }
            }
            return account;
        } catch (Error) {
            return { id: -1 }
        }
    }

    async function getUser(selector, params) {
        let result = await findOne(selector, params);
        rebindProto(result);
        return result;
    }

    async function getUserById(id, params) {
        return getUser({ id: id }, params);
    }

    async function getUserByName(name, params) {
        return getUser({ name }, params);
    }

    function all() {
        return find();
    }

    // async function fetch(selector) {
    //     let [doc, header] = await db.collection('osu').fetchAsync(selector);
    //     rebindProto(doc);
    //     return doc;
    // }
    async function findOne(selector, params) {
        let { client, db } = await getDb();

        if (params !== undefined) {
            if (typeof params.fields !== 'undefined ')
                params.fields = createFields(params.fields);
        } else {
            params = {
                fields: undefined
            }
        }

        let result = await db.collection('osu').findOne(selector, params);

        return result;
    }
    async function find(selector, params) {
        let { client, db } = await getDb();
        if (params !== undefined) {
            if (typeof params.fields !== 'undefined ')
                params.fields = createFields(params.fields);
        } else {
            params = {
                fields: undefined
            }
        }
        let result = await db.collection('osu').find(selector, params).toArray();

        return result;
    }

    async function updateAllUser() {
        let { client, db } = await getDb();
        console.log(client, db);
        let users = await db.collection('osu').find({}, ).toArray();;

        // await Promise.all(Object.keys(users), handle => {
        //     console.log(handle);
        //     handle = users[handle];

        // })
        for (let user of users) {
            let apiResult = await getUserApi(user.id);
            apiResult.lastUpdate = new Date().getTime();
            insertOrUpdateUser(apiResult);
            // console.log(`${apiResult.id} updates (@${apiResult.lastUpdate})`);
        }
    }

    async function readBeatmapFresh(beatmap) {
        let monitor = new osu.Api(config.api.key);
        return Promise.resolve(monitor.getBeatmaps(beatmap));
    }
    readBeatmap = memoize(readBeatmapFresh, { primitive: true, promise: true });
    async function BPRange(account, from, to = undefined) {
        console.log(account, from, to);
        let { client, db } = await getDb();
        // console.log('bprange',account.name,from,to);
        let player = (Array.isArray(account.bp)) ? account : await getUserById(account.id);
        let slim = slimAccount(player);
        from = new Date(from);
        from.setHours(0, 0, 0, 0);
        from = from.toLocaleString("en-US", { timeZone: "Asia/Shanghai" });
        from = new Date(from).getTime();
        if (to !== undefined) {
            to = new Date(to);
            to.setHours(0, 0, 0, 0);
            to = to.toLocaleString("en-US", { timeZone: "Asia/Shanghai" });
            to = new Date(to).getTime();
        } else {
            to = from;
        }

        let nextDay = to + 60 * 60 * 24 * 1000;
        let ret = [];

        if (tools.isIterable(player.bp)) {
            await Promise.all(player.bp.map(async p => {
                let scoreDate = (toTimestamp(p.raw_date) + 60 * 60 * 7 * 1000);
                if (nextDay >= scoreDate && scoreDate >= from) {
                    let beatmapSet = await readBeatmap({ b: p.beatmapId });
                    let thismap = beatmapSet[0];
                    ret.push({
                        beatmap: thismap,
                        beatmapSet: beatmapSet,
                        pp: parseFloat(p.pp),
                        account: slim,
                        newScore: p,
                        mods: p.mods,
                    });
                }
            }));
        }
        return ret;
    }
    async function BPFilter(filter) {
        let { client, db } = await getDb();

        let { u, from, to } = filter;

        let searchList = [];
        let filterApplyTo = [];

        if (u !== undefined) {
            //TODO: define how user filter should work
            if (Array.isArray(u)) {

                await Promise.all(u.map(async _ => {
                    //a set of Users in array
                    if (_ instanceof osu.User) {
                        searchList[searchList.length] = _;

                    } else if (Number.isInteger(parseInt(_))) { //or string / int osu id 

                        _ = parseInt(_);
                        let localUserExist = await localUserExists({ id: _ });
                        if (localUserExist) searchList.push({ id: _ });

                    } else {
                        //Maybe Comes with osu username but we deal with that later.
                    }
                }));

            } else if (u instanceof osu.User) {
                searchList = [u];

            } else {
                //something went wrong.
            }
            // console.log('serachList',searchList.map(list => list.id));
            filterApplyTo = await Promise.all(searchList.map(async user => getUserById(user.id)));

        } else {
            filterApplyTo = db.all();
        }
        let ret = {};
        await Promise.all(Object.keys(filterApplyTo).map(async user => {
            user = filterApplyTo[user];
            user.bp = await BPRange(user, from, to);

            if (user.bp.length > 0) ret[user.id] = user;
        }));
        return ret;
    }
    return {
        fields,
        localUserExists,
        getUser,
        getUserById,
        getUserByName,
        getUserApi,
        BPRange,
        BPFilter,
        all,
        // fetch,
        find,
        findOne,

        insertOrUpdateUser,

        updateAllUser,

    };
}


module.exports = database;