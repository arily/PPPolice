const api = {
  	key: '27caa4993a4430b2e63762bdd5e6b9643ddf7679',
}


const intervals = {
	update: 60,
	sinceLastLogin: 360,
	bpCount: 100,
}

mode = process.env.PPPOLICE_MODE || 0

module.exports = {
    api: api,
    intervals: intervals,
    mode: mode
};
