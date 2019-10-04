informationCenter = require('./lib/informationCenter.js');
policeStation = require('./lib/policeStation.js');
app = require('./app.js');

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
		if (policeStation.officers.chive.watchingList()[id] !== undefined){

		} else {
			socket.emit('player.newToServer');
			let account = await policeStation.officers.chive.findIdentity(id);
			await policeStation.officers.chive.newSuspect(account);
			await policeStation.officers.chive.updatePlayer(account);
		}
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
			if (policeStation.officers.chive.watchingList()[id] !== undefined){

			} else {
				socket.emit('player.newToServer');
				let account = await policeStation.officers.chive.findIdentity(id);
				await policeStation.officers.chive.newSuspect(account);
				await policeStation.officers.chive.updatePlayer(account);
			}
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


