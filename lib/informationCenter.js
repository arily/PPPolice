const events = require('events');
const tools = require('./tools');
const config = require("../config/pppolice");
const database = require('./database');

let informationCenter = new events.EventEmitter();
informationCenter.clients = [];
informationCenter.listenAt = {};
informationCenter.broadcastList = [];
informationCenter.recorded = [];
let autoSave = true;

informationCenter.record = async event => {
    informationCenter.recorded[informationCenter.recorded.length] = event;
    //只留下最多200条
    if (informationCenter.recorded.length > 200) {
        while (informationCenter.recorded.length >= 200) {
            informationCenter.recorded.shift();
        }
    }
    //只留下最近24小时之内的
    informationCenter.recorded.forEach((record, index) => {
        if (new Date().getTime() - record.time.getTime() > 24 * 60 * 60 * 1000) {
            informationCenter.recorded.splice(index, 1);
        }
    });
};
informationCenter.save = function({type,content,time}) {
    this.database.saveOne(type,content)
}
informationCenter.replay = _ => informationCenter.recorded;
informationCenter.broadcastTo = async listener => {
    return informationCenter.broadcastList.push(listener) - 1;
}
informationCenter.broadcast = async event => {
    informationCenter.broadcastList.forEach(async listener => {
        listener.emit(event.type, event.content);
    })
}
informationCenter.database = require('./database')(tools.getCollectionNameByGameId(config.mode));
// if (Array.isArray(informationCenter.listenAt[id])){
// 	informationCenter.listenAt[id].forEach( async listener => {
// 		listener.send(report);
// 	})
// } else {
// 	informationCenter.listenAt[id] = [];
// }

module.exports = informationCenter;