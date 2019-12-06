const events = require('events'); 
const _ = require('lodash');
const util = require('util');
const pppolice = require('./pppolice_db.js');
const config = require('../config/pppolice.js');



let office = new events.EventEmitter();

let officers = {};
office.officers = officers;
office.accession = function (name = 'chive',modeCode = 0) {
	officers[name] = new pppolice(name,modeCode);
	officers[name].wakeUp(config);
	officers[name].reportTo(office);
}
office.newSuspect = async function(suspect){
	return _.sample(officers).newSuspect(suspect);
}
office.open = async function(){
	Object.keys(officers).forEach( name => {
		let officer = officers[name];		  
		setInterval(_ => {officer.patrol()}, config.intervals.update * 1000);
		officer.patrol();
	});
}
module.exports = office;

