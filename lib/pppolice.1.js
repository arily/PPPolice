function pppolice(){
	let config;
	const osu = require('node-osu');
	let suspects = {};
	let patroling = false;
	let report = undefined;
	let verboseLevel = 0;
	function wakeUp(conf){
		config = conf;

	}
	function reportTo(reportEndpoint){
		report = reportEndpoint;
	}
	function policeId(){
		if ( config.api.key !== undefined ){
			return config.api.key;
		}
	}
	function watchingList(){
		return suspects;
	}
	function toTimestamp(strDate){
    	strDate = strDate.split('-').join('/');
    	let d = Date.parse(strDate);
    	return d;
	}
	function modeCode(mode){
		let modeCode = undefined;
		if (Number.isInteger(mode)){
			if ( 0 <= modeCode <= 3){
				modeCode = mode;
			}
		} else {
			switch ( mode ) {
				case 'std':
				case 'osu':
				case 'osu!':
				case 'standard':
				case '0':
					modeCode = 0;
					break;
				case 'taiko':
				case '2':
					modeCode = 1;
					break;
				case 'ctb':
				case 'catch the beat':
				case '3':
					modeCode = 2;
					break;
				case 'mania':
				case '4':
					modeCode = 3;
					break;
				default:
					modeCode = 0;
			}
		}
		
		return modeCode;
	}
	function slimAccount(account){
		let slimAccount = Object.assign({}, account);
		delete slimAccount.bp;
		return slimAccount;
	}
	async function readBeatmap(beatmap){
		let monitor = new osu.Api(policeId());
		return Promise.resolve(monitor.getBeatmaps(beatmap));
	}
	async function newSuspect(suspect){
		let id = suspect.id;
		if (suspects[id] === undefined){
			suspects[id] = suspect;
			return true;
		} else {
			throw new Error('I am watching at it already.');
			return false;
		}
	}
	async function grabSuspectsList(list){
		if ( suspects.length > 0 ){
			throw new Error('give me the list before adding new one instead.');
			return false;
		} else {
			suspects = list;
			return true;
		}
	}
	async function findIdentity(uid,mode = 0){
		let monitor = new osu.Api(policeId());
		return Promise.resolve(monitor.getUser({u:uid,m:modeCode(mode)}));
	}
	async function readBP(suspect){
		if (verboseLevel >= 5) report.emit('report.verbose',`Attempt to read bp of ${suspect.id}`);
		let monitor = new osu.Api(policeId());
		return monitor.getUserBest({ 
			u: suspect.id, 
			limit:100 
		});
	}
	async function checkBPppChange(account,newbp){
		if ( account.bp === [] || account.bp === undefined ){
			
		} else {
			await Promise.all(account.bp.map( async score => {
				let newScore = newbp.find(newScore => score.beatmapId == newScore.beatmapId );
				if (newScore !== undefined ){
					let slim = slimAccount(account);
					let farm = parseFloat(newScore.pp) - parseFloat(score.pp);
					if (farm != 0 ){
						let beatmapSet = await readBeatmap({b: score.beatmapId});
						let thismap = beatmapSet[0];
						farm = Math.round(farm * 100)/100;
						if ( farm > 0 ){
							report.emit('report.refarm',{
								beatmap: thismap,
								beatmapSet: beatmapSet,
								pp: parseFloat(newScore.pp),
								ppChange: parseFloat(farm),
								account: slim,
								oldScore: score,
								newScore: newScore,
								mods: newScore.mods,
								toString: function(){
									return `🌸 ${this.account.name} refarmed and gained ${this.ppChange} pp on ${this.beatmap.artist} - ${this.beatmap.title} [${this.beatmap.version}] (${this.beatmap.creator})`;
								}
							});
						} else if ( farm < 0 ){
							report.emit('report.defarm',{
								beatmap: thismap,
								pp: parseFloat(newScore.pp),
								ppChange: farm,
								account: slim,
								oldScore: score,
								newScore: newScore,
								mods: newScore.mods,
								toString: function(){
									return `👮 reverse farming by ${this.account.name} found. ${this.ppChange} pp defarmed on ${this.beatmap.artist} - ${this.beatmap.title} [${this.beatmap.version}] (${this.beatmap.creator})`;
								}
							});
						}
					}
				
				}
			}));
		}
	}
	async function checkNewBP(account,newbp){
		await Promise.all(newbp.map( async score => {
			if ( undefined == account.bp.find( lastbp => lastbp.beatmapId == score.beatmapId )) {
				//new score
				let beatmapSet = await readBeatmap({b: score.beatmapId});
				let thismap = beatmapSet[0];
				//old score(out from bp)
				let oldScore = account.bp[account.bp.length - 1];
				report.emit('report.farm',{
					beatmap: thismap,
					beatmapSet: beatmapSet,
					pp: parseFloat(score.pp),
					beatmapId: score.beatmapId,
					account: slimAccount(account),
					oldScore: oldScore,
					score: score,
					newScore: score,
					mods: score.mods,
					toString: function(){
						return `🌸 New bp by ${this.account.name}. ${this.score.pp} pp farmed on ${this.beatmap.artist} - ${this.beatmap.title} [${this.beatmap.version}] (${this.beatmap.creator})`;
					}
				});
			} else {

			}
		}));
	}
	async function BPToday(account){
			let player = suspects[account.id];
			let today = new Date();
			let slim = slimAccount(player);
			today = today.toLocaleString("en-US", {timeZone: "Asia/Shanghai"});
			today = new Date(today);
			today.setHours(0,0,0,0);
			today = today.getTime();
			let ret = [];
			await Promise.all(player.bp.map( async p => {
				let scoreDate = ( toTimestamp(p.raw_date) + 60 * 60 * 7 * 1000);
				if ( scoreDate >= today ){
					let beatmapSet = await readBeatmap({b: p.beatmapId});
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
			}));
			return ret;
	}
	async function BPDate(account,timestamp){
			let player = suspects[account.id];
			let today = new Date(timestamp);
			let slim = slimAccount(player);
			today.setHours(0,0,0,0);
			today = today.toLocaleString("en-US", {timeZone: "Asia/Shanghai"});
			today = new Date(today).getTime();
			let nextDay = today + 60 * 60 * 24 * 1000;
			let ret = [];
			await Promise.all(player.bp.map( async p => {
				let scoreDate = ( toTimestamp(p.raw_date) + 60 * 60 * 7 * 1000);
				if ( nextDay >= scoreDate && scoreDate >= today ){
					let beatmapSet = await readBeatmap({b: p.beatmapId});
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
			}));
			return ret;
	}
	async function saveBP(account,newbp){
		// if (verboseLevel >= 5) report.emit('report.verbose',`saving bp to ${this.account.id}`);
		//suspects[account.id].bp = newbp;
		if (account.bp === undefined ){
			account.bp = [];
		}
		await Promise.all(newbp.map( async score => {
			let oldScoreIndex = account.bp.findIndex( lastbp => lastbp.beatmapId == score.beatmapId );
			if ( -1 == oldScoreIndex ) {
				if (verboseLevel >= 10 ) console.log('save new score', score.raw_date);
				account.bp[account.bp.length] = score;
			} else {
				let oldScore = account.bp[oldScoreIndex];
				let farm = parseFloat(score.pp) - parseFloat(oldScore.pp);
				if ( farm !== 0 ){
					if (verboseLevel >= 10 ) console.log('update score', score.raw_date);
					account.bp[oldScoreIndex] = score;
				}
			}
		}));
	}
	async function manualProcessPlayerScore({u,b,m = 0},save = true){
		let id = u.id;
		let beatmapId = b.beatmapId;
		let monitor = new osu.Api(policeId(),{
			completeScores: false,
		});
		let scoreSet = await monitor.getScores({u: id, b: beatmapId});
		scoreSet[0].beatmapId = beatmapId;
		if ( scoreSet !== [] && scoreSet !== undefined ) {

			await Promise.all([checkNewBP(u,scoreSet),checkBPppChange(u,scoreSet)]);
			if (save){
				saveBP(u,scoreSet);
			}
		}

	}
	async function updatePlayer(account){
		let bp = await readBP(account);
		if ( account.bp === [] || account.bp === undefined ){
			saveBP(account,bp);
		} else {
			await Promise.all([checkNewBP(account,bp),checkBPppChange(account,bp)]);
			saveBP(account,bp);
		}
	}
	async function patrol(){
		if (verboseLevel >= 3 ) report.emit('report.verbose','patroling...');
		Promise.all(Object.keys(suspects).map( async account => {
			//account here is the key of suspects array.

			updatePlayer(suspects[account]);
		}));
	}
	return {
		wakeUp: wakeUp,
		policeId: policeId,
		newSuspect: newSuspect,
		watchingList: watchingList,
		grabSuspectsList: grabSuspectsList,
		patrol: patrol,
		reportTo: reportTo,
		findIdentity: findIdentity,
		readBeatmap: readBeatmap,
		manualProcessPlayerScore: manualProcessPlayerScore,
		updatePlayer: updatePlayer,
		BPToday: BPToday,
		BPDate: BPDate,
	};
}


module.exports = pppolice;