function pppolice(){
	let config;
	const osu = require('node-osu');
	let suspects = [];
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
	async function readBeatmap(beatmap){
		monitor = new osu.Api(policeId());
		return monitor.getBeatmaps(beatmap);
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
		if ( suspects !== [] ){
			throw new Error('give me the list before adding new one instead.');
			return false;
		} else {
			suspects = list;
			return true;
		}
	}
	async function findIdentity(uid){
		monitor = new osu.Api(policeId());
		return Promise.resolve(monitor.getUser({u:uid}));
	}
	async function readBP(suspect){
		if (verboseLevel >= 5) report.emit('report.verbose',`Attempt to read bp of ${this.suspect.id}`);
		monitor = new osu.Api(policeId({
    		// baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
    		notFoundAsError: true, // Reject on not found instead of returning nothing. (default: true)
    		completeScores: false // When fetching scores also return the beatmap (default: false)
		}));
		return monitor.getUserBest({ 
			u: suspect.id, 
			limit:100 
		});
	}
	async function checkBPppChange(account,newbp){
		if ( account.bp === [] || account.bp === undefined ){
			
		} else {
			await Promise.all(account.bp.map( async score => {
				newScore = newbp.find(newScore => score.beatmapId == newScore.beatmapId );
				if (newScore !== undefined ){
					farm = parseFloat(newScore.pp) - parseFloat(score.pp);
					if (farm != 0 ){
						beatmapSet = await readBeatmap({b: score.beatmapId});
						thismap = beatmapSet[0];
						if ( farm > 0 ){
							report.emit('report.refarm',{
								beatmap: thismap,
								beatmapSet: beatmapSet,
								pp: newScore.pp,
								ppChange: farm,
								account: account,
								oldScore: score,
								newScore: newScore,
								toString: function(){
									return `🌸 ${this.account.name} refarmed and gained ${this.ppChange} pp on ${this.beatmap.artist} - ${this.beatmap.title} [${this.beatmap.version}] (${this.beatmap.creator})`;
								}
							});
						} else if ( farm < 0 ){
							report.emit('report.defarm',{
								beatmap: thismap,
								pp: newScore.pp,
								ppChange: farm,
								account: account,
								oldScore: score,
								newScore: newScore,
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
				beatmapSet = await readBeatmap({b: score.beatmapId});
				thismap = beatmapSet[0];
				//old score(out from bp)
				oldScore = account.bp[account.bp.length - 1];
				report.emit('report.farm',{
					beatmap: thismap,
					beatmapSet: beatmapSet,
					pp: score.pp,
					beatmapId: score.beatmapId,
					account: account,
					oldScore: oldScore,
					score: score,
					newScore: score,
					toString: function(){
						return `🌸 New bp by ${this.account.name}. ${this.score.pp} pp farmed on ${this.beatmap.artist} - ${this.beatmap.title} [${this.beatmap.version}] (${this.beatmap.creator})`;
					}
				});
			} else {

			}
		}));
	}
	async function saveBP(account,newbp){
		if (verboseLevel >= 5) report.emit('report.verbose',`saving bp to ${this.account.id}`);
		suspects[account.id].bp = newbp;
	}
	async function patrol(){
		if (verboseLevel >= 3 ) report.emit('report.verbose','patroling...');

		await Promise.all(suspects.map( async account => {
			bp = await readBP(account);
			if ( account.bp === [] || account.bp === undefined ){
				
			} else {
				await checkNewBP(account,bp);
				await checkBPppChange(account,bp);
			}
			saveBP(account,bp);
		}));
	}
	async function asyncForEach(array, callback) {
  		for (let index = 0; index < array.length; index++) {
    		await callback(array[index], index, array);
  		}
	}
	return {
		wakeUp: wakeUp,
		policeId: policeId,
		newSuspect: newSuspect,
		watchingList: watchingList,
		patrol: patrol,
		reportTo: reportTo,
		findIdentity: findIdentity,
		readBeatmap: readBeatmap,
	};
}


module.exports = pppolice;