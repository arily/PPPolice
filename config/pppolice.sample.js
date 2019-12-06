const api = {
  	key: 'api key',
}

const db = {
	url: 'mongodb://wtf',
	dbName: 'pppolice'
}


const intervals = {
	update: 60,
	sinceLastLogin: 360,
	bpCount: 100,
}

mode = process.env.PPPOLICE_MODE || 0

module.exports = {
    api,
    db,
    intervals,
    mode
};
