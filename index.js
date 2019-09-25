informationCenter = require('./lib/informationCenter.js');
policeStation = require('./lib/policeStation.js');
app = require('./app.js');

policeStation.accession('chive');

policeStation.open();

policeStation.on('report.defarm',async event => {
	//console.log(event.toString());
	informationCenter.emit('report.defarm',event);
	
})
policeStation.on('report.refarm',async event =>{
	//console.log(event.toString());
	informationCenter.emit('report.refarm',event);
	
});
policeStation.on('report.farm',async event =>{
	//console.log(event.toString());
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

});

