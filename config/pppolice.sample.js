const api = {
  	key: 'api key',
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
