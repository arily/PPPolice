function pppolice(name, mode = 0) {
    let config;
    const osu = require('node-osu');
    const _ = require('lodash');
    let suspects = {};
    let patroling = false;
    let report = undefined;
    let verboseLevel = 0;
    // let mode = mode;
    function wakeUp(conf) {
        config = conf;

    }

    function reportTo(reportEndpoint) {
        report = reportEndpoint;
    }

    function policeId() {
        if (config.api.key !== undefined) {
            return config.api.key;
        }
    }

    function watchingList() {
        return suspects;
    }

    function copyList() {
        return _.cloneDeep(suspects);
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
        	name:account.name
        };
    }
    async function readBeatmap(beatmap) {
        let monitor = new osu.Api(policeId());
        return Promise.resolve(monitor.getBeatmaps(beatmap));
    }
    async function newSuspect(suspect) {
        let id = suspect.id;
        if (suspects[id] === undefined) {
            suspects[id] = suspect;
            return true;
        } else {
            throw new Error('I am watching at it already.');
            return false;
        }
    }
    async function grabSuspectsList(list) {
        if (suspects.length > 0) {
            throw new Error('give me the list before adding new one instead.');
            return false;
        } else {
            suspects = list;
            return true;
        }
    }
    async function findIdentity(uid) {
        let monitor = new osu.Api(policeId());
        let suspect = await monitor.getUser({ u: uid, m: modeCode(mode) });
        suspect.mode = mode;
        return suspect;
    }
    async function readBP(suspect) {
        if (verboseLevel >= 5) report.emit('report.verbose', `Attempt to read bp of ${suspect.id}`);
        let monitor = new osu.Api(policeId());
        return monitor.getUserBest({
            u: suspect.id,
            limit: 100,
            m: (suspect.mode !== undefined) ? modeCode(suspect.mode) : mode,
        });
    }
    async function checkBPppChange(account, newbp) {
        if (account.bp === [] || account.bp === undefined) {

        } else {
            await Promise.all(account.bp.map(async score => {
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
                                ppChange: parseFloat(farm),
                                account: slim,
                                oldScore: score,
                                newScore: newScore,
                                mods: newScore.mods,
                                toString: function() {
                                    return `🌸 ${this.account.name} refarmed and gained ${this.ppChange} pp on ${this.beatmap.artist} - ${this.beatmap.title} [${this.beatmap.version}] (${this.beatmap.creator})`;
                                }
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
                                toString: function() {
                                    return `👮 reverse farming by ${this.account.name} found. ${this.ppChange} pp defarmed on ${this.beatmap.artist} - ${this.beatmap.title} [${this.beatmap.version}] (${this.beatmap.creator})`;
                                }
                            });
                        }
                    }

                }
            }));
        }
    }
    async function checkNewBP(account, newbp) {
        await Promise.all(newbp.map(async score => {
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
                    toString: function() {
                        return `🌸 New bp by ${this.account.name}. ${this.score.pp} pp farmed on ${this.beatmap.artist} - ${this.beatmap.title} [${this.beatmap.version}] (${this.beatmap.creator})`;
                    }
                });
            } else {

            }
        }));
    }
    // async function BPToday(account){
    // 		let player = suspects[account.id];
    // 		let today = new Date();
    // 		let slim = slimAccount(player);
    // 		today.setHours(0,0,0,0);
    // 		today = today.toLocaleString("en-US", {timeZone: "Asia/Shanghai"});
    // 		today = new Date(today).getTime();
    // 		let ret = [];
    // 		await Promise.all(player.bp.map( async p => {
    // 			let scoreDate = ( toTimestamp(p.raw_date) + 60 * 60 * 7 * 1000);
    // 			if ( scoreDate >= today ){
    // 				let beatmapSet = await readBeatmap({b: p.beatmapId});
    // 				let thismap = beatmapSet[0];
    // 				ret[ret.length] = {
    // 					beatmap: thismap,
    // 					beatmapSet: beatmapSet,
    // 					pp: parseFloat(p.pp),
    // 					account: slim,
    // 					newScore: p,
    // 					mods: p.mods,
    // 				};
    // 			}
    // 		}));
    // 		return ret;
    // }
    // async function BPDate(account,timestamp){
    // 		let player = suspects[account.id];
    // 		let today = new Date(timestamp);
    // 		let slim = slimAccount(player);
    // 		today.setHours(0,0,0,0);
    // 		today = today.toLocaleString("en-US", {timeZone: "Asia/Shanghai"});
    // 		today = new Date(today).getTime();
    // 		let nextDay = today + 60 * 60 * 24 * 1000;
    // 		let ret = [];
    // 		await Promise.all(player.bp.map( async p => {
    // 			let scoreDate = ( toTimestamp(p.raw_date) + 60 * 60 * 7 * 1000);
    // 			if ( nextDay >= scoreDate && scoreDate >= today ){
    // 				let beatmapSet = await readBeatmap({b: p.beatmapId});
    // 				let thismap = beatmapSet[0];
    // 				ret[ret.length] = {
    // 					beatmap: thismap,
    // 					beatmapSet: beatmapSet,
    // 					pp: parseFloat(p.pp),
    // 					account: slim,
    // 					newScore: p,
    // 					mods: p.mods,
    // 				};
    // 			}
    // 		}));
    // 		return ret;
    // }
    async function BPRange(account, from, to = undefined) {
    	console.log('bprange',account.name,from,to);
        let player = suspects[account.id];
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
        for(let p of player.bp){
            let scoreDate = (toTimestamp(p.raw_date) + 60 * 60 * 7 * 1000);
            if (nextDay >= scoreDate && scoreDate >= from) {
                let beatmapSet = await readBeatmap({ b: p.beatmapId });
                let thismap = beatmapSet[0];
                ret[ret.length] = {
                    beatmap: thismap,
                    beatmapSet: beatmapSet,
                    pp: parseFloat(p.pp),
                    account: slim,
                    newScore: p,
                    mods: p.mods,
                };
            }
        };
        return ret;
    }
    async function BPFilter(filter) {

        let { u, from, to } = filter;

        let searchList = [];
        let filterApplyTo = [];

        if (u !== undefined) {
            //TODO: define how user filter should work
            if (util.isArray(u)) {

                u.forEach(_ => {
                    //a set of Users in array
                    if (_ instanceof osu.User) {
                        searchList[searchList.length] = _;

                    } else if (parseInt(_) !== NaN) { //or string / int osu id 

                        _ = parseInt(_);
                        if (suspects[_] !== undefined) searchList[searchList.length] = suspects[_];

                    } else {
                        //Maybe Comes with osu username but we deal with that later.
                    }
                });

            } else if (u instanceof osu.User) {
                searchList = [u];

            } else {
                //something went wrong.
            }

            filterApplyTo = searchList.map(user => suspects[user.id]);

        } else {
            filterApplyTo = suspects;
        }
        let ret = {};
        await Promise.all(Object.keys(filterApplyTo).map(async user => {
        	user = filterApplyTo[user];
        	user = slimAccount(user);
            user.bp = await BPRange(user, from, to);

            if (user.bp.length > 0 )ret[user.id] = user;
        }));
        return ret;
    }
    async function saveBP(account, newbp) {
        // if (verboseLevel >= 5) report.emit('report.verbose',`saving bp to ${this.account.id}`);
        //suspects[account.id].bp = newbp;
        if (account.bp === undefined) {
            account.bp = [];
        }
        await Promise.all(newbp.map(async score => {
            let oldScoreIndex = account.bp.findIndex(lastbp => lastbp.beatmapId == score.beatmapId);
            if (-1 == oldScoreIndex) {
                if (verboseLevel >= 10) console.log('save new score', score.raw_date);
                account.bp[account.bp.length] = score;
            } else {
                let oldScore = account.bp[oldScoreIndex];
                let farm = parseFloat(score.pp) - parseFloat(oldScore.pp);
                if (farm !== 0) {
                    if (verboseLevel >= 10) console.log('update score', score.raw_date);
                    account.bp[oldScoreIndex] = score;
                }
            }
        }));
    }
    async function manualProcessPlayerScore({ u, b, m = 0 }, save = true) {
        let id = u.id;
        let beatmapId = b.beatmapId;
        let monitor = new osu.Api(policeId(), {
            completeScores: false,
        });
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
        let bp = await readBP(account);
        if (account.bp === [] || account.bp === undefined) {
            saveBP(account, bp);
        } else {
            await Promise.all([checkNewBP(account, bp), checkBPppChange(account, bp)]);
            saveBP(account, bp);
        }
        account.lastUpdate = new Date().getTime();
    }
    async function patrol() {
        if (verboseLevel >= 3) report.emit('report.verbose', 'patroling...');
        Promise.all(Object.keys(suspects).map(async account => {
            //account here is the key of suspects array.
            if (account.lastUpdate !== undefined) {
                if (new Date.getTime() - account.lastUpdate > 5 * 60 * 1000) updatePlayer(suspects[account]);
            } else {
                updatePlayer(suspects[account]);
            }

        }));
    }
    return {
        wakeUp: wakeUp,
        policeId: policeId,
        newSuspect: newSuspect,
        watchingList: watchingList,
        copyList: copyList,
        grabSuspectsList: grabSuspectsList,
        patrol: patrol,
        reportTo: reportTo,
        findIdentity: findIdentity,
        readBeatmap: readBeatmap,
        manualProcessPlayerScore: manualProcessPlayerScore,
        updatePlayer: updatePlayer,
        BPRange: BPRange,
        BPFilter: BPFilter,
    };
}


module.exports = pppolice;