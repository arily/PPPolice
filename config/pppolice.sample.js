const api = {
    key: 'api key',
}

const db = {
    url: 'mongodb://wtf',
    dbName: 'pppolice'
}


const intervals = {
    update: 300,
    sinceLastLogin: 360,
    bpCount: 100,
}
const port = process.env.PORT || 13333
const mode = process.env.PPPOLICE_MODE || 0

module.exports = {
    api,
    db,
    intervals,
    mode,
    port
};