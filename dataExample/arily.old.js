function toTimestamp(strDate){
	let datum = Date.parse(strDate);
	return datum/1000;
}

let arily = require('./arily');

arily.bp = arily.bp.filter(score => toTimestamp(score.raw_date) < toTimestamp('2019-09-19'));

module.exports = arily;