let tools = {};
tools.isIterable = function(obj) {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}
tools.getCollectionNameByGameId = function(code = 0) {
    return ['osu', 'taiko', 'ctb', 'mania'][code] || 'osu'
}



module.exports = tools