class UserGotBanned extends Error {
    constructor(suspect) {
        super(`User ${suspect.id}: ${suspect.name} got banned. Hope you had fun.`); // (1)
        this.user = suspect;
        this.name = "UserBanned"; // (2)
    }
}

function pppolice(name, mode = 0) {
    const config = require("../config/pppolice");
    const osu = require('node-osu');
    const _ = require('lodash');
    const tools = require('./tools');
    const db = new require('./database')(tools.getCollectionNameByGameId(config.mode));

    let suspects = {};
    let patroling = false;
    let report = undefined;
    let verboseLevel = (process.env.NODE_ENV == 'production') ? 0 : 10;
    // let mode = mode;
    function wakeUp(conf) {
        return 'no';
    }

    function reportTo(reportEndpoint) {
        report = reportEndpoint;
    }

    function policeId() {
        if (config.api.key !== undefined) {
            return config.api.key;
        }
    }

    async function watchingList() {
        return await db.all();
    }

    async function copyList() {
        return _.cloneDeep(await db.all());
    }

    function toTimestamp(strDate) {
        strDate = strDate.split('-').join('/');
        let d = Date.parse(strDate);
        return d;
    }

    function modeCode(mode) {
        let modeCode = undefined;
        if (Number.isInteger(mode)) {
            if (0 <= modeCode <= 3) {
                modeCode = mode;
            }
        } else {
            switch (mode) {
                case 'std':
                case 'osu':
                case 'osu!':
                case 'standard':
                case '0':
                    modeCode = 0;
                    break;
                case 'taiko':
                case '1':
                    modeCode = 1;
                    break;
                case 'ctb':
                case 'catch the beat':
                case '2':
                    modeCode = 2;
                    break;
                case 'mania':
                case '3':
                    modeCode = 3;
                    break;
                default:
                    modeCode = 0;
            }
        }

        return modeCode;
    }



    function slimAccount(account) {
        return {
            id: account.id,
            name: account.name
        };
    }
    async function localUserExists(suspect) {
        return (await db.getUserById(suspect.id) !== null);
    }
    async function readBeatmap(beatmap) {
        console.log({beatmap,policeId:policeId()});
        let monitor = new osu.Api(policeId(), { parseNumeric: true });
        return monitor.getBeatmaps(beatmap);
    }
    async function newSuspect(suspect) {
        let id = suspect.id;
        if (!(await localUserExists(suspect))) {
            return await db.insertOrUpdateUser(suspect);
        } else {
            throw new Error('I am watching at it already.');
            return false;
        }
    }
    async function findIdentity(uid) {
        let suspect = await db.getUserApi(uid);
        suspect.mode = mode;
        return suspect;
    }
    async function readBP(suspect) {
        if (verboseLevel >= 5) report.emit('report.verbose', `Attempt to read bp of ${suspect.id}`);
        try {
            let monitor = new osu.Api(policeId(), { parseNumeric: true });
            return await monitor.getUserBest({
                u: suspect.id,
                limit: 100,
                m: (suspect.mode !== undefined) ? modeCode(suspect.mode) : config.mode,
            });
        } catch (Error) {
            if (Error.message == 'Not found' && suspect.status != 'banned') {
                try {
                    await db.getUserApi(suspect.id);
                    return [];
                } catch (Error) {
                    console.log(Error);
                    if (Error.message == 'Not found' && suspect.status != 'banned');
                    await markPlayerBanned(suspect);
                } 

            } else return [];
        }

    }
    async function markPlayerBanned(suspect) {
        suspect.status = 'banned';
        suspect.lastUpdate = new Date().getTime();
        db.insertOrUpdateUser(suspect);
        throw new UserGotBanned(suspect)
    }
    async function checkBPppChange(account, newbp) {
        if (account.bp === [] || account.bp === undefined) {
            return true;
        } else {
            let result = await Promise.all(account.bp.map(async score => {
                let newScore = newbp.find(newScore => score.beatmapId == newScore.beatmapId);
                if (newScore !== undefined) {
                    let slim = slimAccount(account);
                    let farm = parseFloat(newScore.pp) - parseFloat(score.pp);
                    if (farm != 0) {
                        let beatmapSet = await readBeatmap({ b: score.beatmapId });
                        let thismap = beatmapSet[0];
                        farm = Math.round(farm * 100) / 100;
                        if (farm > 0) {
                            report.emit('report.refarm', {
                                beatmap: thismap,
                                //beatmapSet: beatmapSet,
                                pp: parseFloat(newScore.pp),
                                ppChange: farm,
                                account: slim,
                                oldScore: score,
                                newScore: newScore,
                                mods: newScore.mods,
                                string: `🌸 ${account.name} refarmed and gained ${farm} pp on ${thismap.artist} - ${thismap.title} [${thismap.version}] (${thismap.creator})`,

                            });
                        } else if (farm < 0) {
                            report.emit('report.defarm', {
                                beatmap: thismap,
                                pp: parseFloat(newScore.pp),
                                ppChange: farm,
                                account: slim,
                                oldScore: score,
                                newScore: newScore,
                                mods: newScore.mods,
                                string: `👮 reverse farming by ${account.name} found. ${farm} pp defarmed on ${thismap.artist} - ${thismap.title} [${thismap.version}] (${thismap.creator})`

                            });
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            }));
            let needUpdate = result.some(result => result == true);
            return needUpdate;
        }
    }
    async function checkNewBP(account, newbp) {
        let result = await Promise.all(newbp.map(async score => {
            if (undefined == account.bp.find(lastbp => lastbp.beatmapId == score.beatmapId)) {
                //new score
                let beatmapSet = await readBeatmap({ b: score.beatmapId });
                let thismap = beatmapSet[0];
                //old score(out from bp)
                let oldScore = account.bp[account.bp.length - 1];
                report.emit('report.farm', {
                    beatmap: thismap,
                    //beatmapSet: beatmapSet,
                    pp: parseFloat(score.pp),
                    beatmapId: score.beatmapId,
                    account: slimAccount(account),
                    oldScore: oldScore,
                    score: score,
                    newScore: score,
                    mods: score.mods,
                    string: `🌸 New bp by ${account.name}. ${score.pp} pp farmed on ${thismap.artist} - ${thismap.title} [${thismap.version}] (${thismap.creator})`

                });
                return true;
            } else {
                return false;
            }
        }));
        let needUpdate = result.some(result => result == true);
        return needUpdate;
    }
    async function saveBP(account, newbp) {
        if (verboseLevel >= 5) report.emit('report.verbose', `saving bp to ${account.id}`);

        if (account.bp === undefined) {
            account.bp = [];
        }
        let before = Object.assign({}, account);
        let needSave = false;
        let debugOutput;
        if (verboseLevel >= 10) debugOutput = {
            new: [],
            update: {
                old: [],
                new: []
            }
        };
        await Promise.all(newbp.map(async score => {
            let oldScoreIndex = account.bp.findIndex(lastbp => lastbp.beatmapId == score.beatmapId);
            if (-1 == oldScoreIndex) {
                needSave = true;
                account.bp[account.bp.length] = score;
                if (verboseLevel >= 10) {
                    console.log('save new score', score.raw_date);
                    debugOutput.new.push(score)
                }


            } else {
                let oldScore = account.bp[oldScoreIndex];
                let farm = parseFloat(score.pp) - parseFloat(oldScore.pp);
                if (farm !== 0) {
                    needSave = true;
                    if (verboseLevel >= 10) {
                        console.log('update score', score.raw_date);
                        debugOutput.update.new.push(score);
                        debugOutput.update.old.push(oldScore);
                    }
                    account.bp[oldScoreIndex] = score;
                }
            }
        }));
        if (verboseLevel >= 10) console.log('need update database?', needSave);
        if (needSave) {
            if (verboseLevel >= 10) console.log('update:', debugOutput);
            await db.insertOrUpdateUser(account);
        }

    }
    async function manualProcessPlayerScore({ u, b, m = 0 }, save = true) {
        let id = u.id;
        let beatmapId = b.beatmapId;
        let monitor = new osu.Api(policeId(), { parseNumeric: true });
        let scoreSet = await monitor.getScores({
            u: id,
            b: beatmapId,
            m: (suspect.mode !== undefined) ? modeCode(suspect.mode) : mode,
        });
        scoreSet[0].beatmapId = beatmapId;
        if (scoreSet !== [] && scoreSet !== undefined) {

            await Promise.all([checkNewBP(u, scoreSet), checkBPppChange(u, scoreSet)]);
            if (save) {
                saveBP(u, scoreSet);
            }
        }

    }
    async function updatePlayer(account) {

        try {
            account = await db.getUserById(account.id);
            if (verboseLevel >= 10) console.log('updateplayer', account.name);
            let bp = await readBP(account);
            if (bp == undefined) return;
            else if (account.status == 'banned') {
                account.status = 'ok';
            }

            if (account.bp === [] || account.bp === undefined) {
                saveBP(account, bp);
            } else {
                await Promise.all([checkNewBP(account, bp), checkBPppChange(account, bp)]);
                account.lastUpdate = new Date().getTime();
                await saveBP(account, bp);
            }
            return true;
        } catch (Error) {
            console.log(Error, account.id, account.name);
        }

    }
    async function patrol() {
        if (verboseLevel >= 3) report.emit('report.verbose', 'patroling...');
        Promise.all((await db.all({ fields: db.fields.handleStatus })).map(async account => {
            // update banned players every day in case he/she got unbanned
            if (account.status == 'banned') {
                if (new Date().getTime() - account.lastUpdate > 1000 * 60 * 60 * 24) setTimeout(_ => { updatePlayer(account) }, account.id % config.intervals.update * 1000);
            }
            //account here is the key of suspects array.
            else if (account.lastUpdate !== undefined) {
                if (new Date().getTime() - account.lastUpdate > config.intervals.update * 2 * 1000) setTimeout(_ => { updatePlayer(account) }, account.id % config.intervals.update * 1000);
            } else {
                setTimeout(_ => { updatePlayer(account) }, account.id % config.intervals.update * 1000)
            }

        }));
    }
    //get all players not banned 
    //db.find({ status: { $not: {$eq : 'banned'} } }, { fields: db.fields.handle }))
    return {
        db,
        localUserExists,
        wakeUp,
        policeId,
        newSuspect,
        watchingList,
        copyList,
        patrol,
        reportTo,
        findIdentity,
        readBeatmap,
        manualProcessPlayerScore,
        updatePlayer,
    };
}


module.exports = pppolice;