informationCenter = require('./lib/informationCenter.js');
policeStation = require('./lib/policeStation.js');
pmx = require('@pm2/io');
Storage = require('node-storage');
app = require('./app.js');

let _ = require('lodash');

var redis = require("redis"),
    client = redis.createClient();
const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);
const hgetallAsync = promisify(client.hgetall).bind(client);

policeStation.accession('chive');

policeStation.open();

policeStation.on('report.defarm',async event => {
	console.log(event.toString());
	informationCenter.emit('report.defarm',event);
	
})
policeStation.on('report.refarm',async event =>{
	console.log(event.toString());
	informationCenter.emit('report.refarm',event);
	
});
policeStation.on('report.farm',async event =>{
	console.log(event.toString());
	informationCenter.emit('report.farm',event);
	
});
policeStation.on('report.verbose',async event => {
	console.log(event);
});

informationCenter.on('report.defarm', event => { receive( 'report.defarm', event ) });
informationCenter.on('report.refarm', event => { receive( 'report.refarm', event ) });
informationCenter.on('report.farm', event => { receive( 'report.farm', event ) });

async function receive(type, event){
	event = {
		type: type,
		content: event,
		time : new Date(),
	};
	informationCenter.broadcast(event);
	informationCenter.record(event);
}
//broadcast
app.io.sockets.on('connection',socket =>{
	informationCenter.broadcastTo(socket);
	socket.on('history', _ =>{
		let push = informationCenter.replay();
		push.forEach(p => {
			socket.emit(p.type,p.content);
		});
	});
	socket.on('today',async player =>{
		let id = player.id;
		let account = undefined;
		if (policeStation.officers.chive.watchingList()[id] !== undefined){
			account = policeStation.officers.chive.watchingList()[id];
		} else {
			socket.emit('player.newToServer');
			account = await policeStation.officers.chive.findIdentity(id);
			await policeStation.officers.chive.newSuspect(account);
		}
		await policeStation.officers.chive.updatePlayer(account);
		bps = await policeStation.officers.chive.BPToday(player);
		if (bps.length == 0){
			socket.emit('player.noBPToday');
			return;
		} else bps.forEach(p => {
			socket.emit('report.farm',p);
		});
		socket.emit('report.pushedAll');
	});
	socket.on('BPDate',async (player,date) =>{
		let parse = Date.parse(date);
		if ((new Date(parse)).getTime() > 0){
			let id = player.id;
			let timestamp = parse;
			let account = undefined;
			if (policeStation.officers.chive.watchingList()[id] !== undefined){
				account = policeStation.officers.chive.watchingList()[id];
			} else {
				socket.emit('player.newToServer');
				account = await policeStation.officers.chive.findIdentity(id);
				await policeStation.officers.chive.newSuspect(account);
			}
			await policeStation.officers.chive.updatePlayer(account);
			bps = await policeStation.officers.chive.BPDate(player,timestamp);
			if (bps.length == 0){
				socket.emit('player.noBPToday');
				return;
			} else bps.forEach(p => {
				socket.emit('report.farm',p);
			});
			socket.emit('report.pushedAll');
		}
		
	});
});
saveList = function (officer,name,onExit = false ){
	let path = '';
	if (onExit){
		path = `./storage/policeStation.onExit.${new Date().getTime()}`;
	} else {
		path = `./storage/policeStation`;
	}
	const store = new Storage(path);
	const list = officer.copyList();
	const cloned = _.cloneDeep(list);
	store.put(`police.${name}`,cloned);
}
readList = function (path = './storage/policeStation'){
	const store = new Storage(path);
	const officers = store.get('police');
	Object.keys(officers).forEach(function(key) {
  		var val = officers[key];
  		for (let i in val ){
  			rebindProto(val[i]);
  		}
  		if (policeStation.officers[key] != undefined){
  			console.log('load',key);
  			policeStation.officers[key].grabSuspectsList(val);
  		}
	});
}
saveListNew = function (officer,name,onExit = false ){

	const list = officer.copyList();
	client.hset('policeStation',name,JSON.stringify(list));
}
readListNew = function (path = './storage/policeStation'){

	client.hgetall('policeStation',function(err,officers){
	console.log(officers);
	Object.keys(officers).forEach(function(key) {
  		var val = officers[key];
  		val = JSON.parse(val);
  		for (let i in val ){
  			rebindProto(val[i]);
  		}
  		if (policeStation.officers[key] != undefined){
  			console.log('load',key);
  			policeStation.officers[key].grabSuspectsList(val);
  		}
	});
	});
}
rebindProto = function(account){
	const osu = require('node-osu');
	account.__proto__ = osu.User.prototype;
	account.events.forEach(e => {
		e.__proto__ = osu.Event.prototype;
	});
	account.bp.forEach(e => {
		e.__proto__ = osu.Score.prototype;
	})
}
process.on( 'SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  // some other closing procedures go here
  saveList(policeStation.officers.chive,'chive',true);
  process.exit( );
})

pmx.action('save', function(reply) {
	saveList(policeStation.officers.chive,'chive');
  	reply({ answer : 'save' });
});
pmx.action('savenew', function(reply) {
	saveListNew(policeStation.officers.chive,'chive');
  	reply({ answer : 'save' });
});
pmx.action('load', function(param,reply) {
	readList(param);
  	reply({ 
  		param : param,	
  		answer : 'read'
  		 });
});
pmx.action('loadnew', function(param,reply) {
	readListNew(param);
  	reply({ 
  		param : param,	
  		answer : 'read'
  		 });
});