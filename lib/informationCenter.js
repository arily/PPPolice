

const events = require('events'); 


let informationCenter = new events.EventEmitter();
informationCenter.clients = [];
informationCenter.listenAt = {};
informationCenter.broadcastList = [];
informationCenter.recorded = [];
let autoSave = true;

informationCenter.record = async event =>{
	informationCenter.recorded[informationCenter.recorded.length] = event;
}
informationCenter.replay = _ => {
	return informationCenter.recorded;
}
informationCenter.broadcastTo = async listener => {
	informationCenter.broadcastList[informationCenter.broadcastList.length] = listener;
}
informationCenter.broadcast = async event => {
	informationCenter.broadcastList.forEach(async listener =>{
		event.content.str = event.content.toString();
		listener.emit(event.type,event.content);
	})
}

	// if (Array.isArray(informationCenter.listenAt[id])){
	// 	informationCenter.listenAt[id].forEach( async listener => {
	// 		listener.send(report);
	// 	})
	// } else {
	// 	informationCenter.listenAt[id] = [];
	// }

module.exports = informationCenter;