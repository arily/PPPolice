require('app-module-path/cwd');
informationCenter = require('./lib/informationCenter.js');
policeStation = require('./lib/policeStation.js');
pmx = require('@pm2/io');
app = require('./app.js');

let _ = require('lodash');

const { mode } = require('./config/pppolice.js');
policeStation.accession('chive', mode);

policeStation.open();

policeStation.on('report.defarm', async event => {
    console.log(event.string);
    informationCenter.emit('report.defarm', event);

})
policeStation.on('report.refarm', async event => {
    console.log(event.string);
    informationCenter.emit('report.refarm', event);

});
policeStation.on('report.farm', async event => {
    console.log(event.string);
    informationCenter.emit('report.farm', event);

});
policeStation.on('report.verbose', async event => {
    console.log(event);
});

informationCenter.on('report.defarm', event => { receive('report.defarm', event) });
informationCenter.on('report.refarm', event => { receive('report.refarm', event) });
informationCenter.on('report.farm', event => { receive('report.farm', event) });

async function receive(type, event) {
    event = {
        type: type,
        content: event,
        time: new Date(),
    };
    informationCenter.broadcast(event);
    informationCenter.record(event);
    informationCenter.save(event);
}


let FARMOnline = async (from, to, socket, filter = undefined) => {
    from = Date.parse(from);
    to = Date.parse(to);
    if ((new Date(from)).getTime() > 0 && (new Date(to)).getTime() > 0) {
        // console.log('start fetching BPrange results');
        let bps = await informationCenter.database.BPFilter({ from, to, u: filter });
        // console.log('fetched BPrange results');
        await Promise.all(Object.keys(bps).map(async user => {
            user = bps[user];
            user.bp.forEach(bp => {
                if (bp.beatmapSet !== undefined) {
                    delete bp.beatmapSet;
                }
            });
        }));
        // console.log('cleaned results');
        socket.emit('scores.result', bps);
        // console.log('pushed results');
        socket.emit('report.pushedAll');
    }
};

let ppToday = async (player, socket) => {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    today = today.toLocaleString("en-US", { timeZone: "Asia/Shanghai" });
    today = new Date(today).getTime() + 60 * 60 * 24 * 1000;
    let id = player.id;
    let account = undefined;
    if (await policeStation.officers.chive.localUserExists(player)) {
        account = await informationCenter.database.getUserById(id);
    } else {
        socket.emit('player.newToServer');
        account = await policeStation.officers.chive.findIdentity(id);
        await policeStation.officers.chive.newSuspect(account);
    }
    await policeStation.officers.chive.updatePlayer(account);
    bps = await informationCenter.database.BPRange(player, today);
    if (bps.length == 0) {
        socket.emit('player.noBPToday');
        return;
    } else bps.forEach(p => {
        socket.emit('report.farm', p);
    });
    socket.emit('report.pushedAll');
};

let bpDate = async (player, date, socket) => {
    let parse = Date.parse(date);
    if ((new Date(parse)).getTime() > 0) {
        let id = player.id;
        let timestamp = parse;
        let account = undefined;
        if (await policeStation.officers.chive.localUserExists(player)) {
            account = await informationCenter.database.getUserById(id);
        } else {
            socket.emit('player.newToServer');
            account = await policeStation.officers.chive.findIdentity(id);
            await policeStation.officers.chive.newSuspect(account);
        }
        await policeStation.officers.chive.updatePlayer(account);
        bps = await informationCenter.database.BPRange(player, timestamp);
        if (bps.length == 0) {
            socket.emit('player.noBPToday');
            return;
        } else bps.forEach(p => {
            socket.emit('report.farm', p);
        });
        socket.emit('report.pushedAll');
    }
};

let bpRange = async (player, from, to, socket) => {
    from = Date.parse(from);
    to = Date.parse(to);
    if ((new Date(from)).getTime() > 0 && (new Date(to)).getTime() > 0) {
        let id = player.id;
        let account = undefined;
        if (await policeStation.officers.chive.localUserExists(player)) {
            account = await informationCenter.database.getUserById(id);
        } else {
            socket.emit('player.newToServer');
            account = await policeStation.officers.chive.findIdentity(id);
            await policeStation.officers.chive.newSuspect(account);
        }
        await policeStation.officers.chive.updatePlayer(account);
        bps = await informationCenter.database.BPRange(player, from, to);

        if (bps.length == 0) {
            socket.emit('player.noBPToday');
            return;
        } else bps.forEach(p => {
            socket.emit('report.farm', p);
        });
        socket.emit('report.pushedAll');
    }

}

//app access to informationCenter and policeStation
app.app.set('policeStation',policeStation);
app.app.set('informationCenter',informationCenter);

//broadcast
app.io.sockets.on('connection', socket => {
    socket.on('history', _ => {
        let push = informationCenter.replay();
        push.forEach(p => {
            socket.emit(p.type, p.content);
        });
        let position = informationCenter.broadcastTo(socket);
        socket.on('disconnect', function() {
            delete informationCenter.broadcastList[position];

        });
    });
    socket.on('today', async player => {
        await ppToday(player, socket);
        socket.disconnect(true)
    });
    socket.on('BPDate', async (player, date) => {
        await bpDate(player, date, socket);
        socket.disconnect(true)
    });
    socket.on('BPRange', async (player, from, to) => {
        await bpRange(player, from, to, socket);
        socket.disconnect(true)
    });
    socket.on('FARMOnline', async (from, to) => {
        await FARMOnline(from, to, socket);
        socket.disconnect(true)
    });
    socket.on('Final', async (from, to) => {
        await FARMOnline(from, to, socket, [377473,
            10859583,
            1646397,
            3668072,
            1123053,
            3917377,
            2539253,
            9527178,
            4858747,
            10279095,
            2069974,
            6433183,
            10458474,
            8825017,
            10472558,
            5964035,
            13875116,
            1123761,
            2447066,
            4911870,
            9314367,
            13233916,
            15201417,
            3801720
        ]);
        socket.disconnect(true)
    });

});

