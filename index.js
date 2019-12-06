informationCenter = require('./lib/informationCenter.js');
policeStation = require('./lib/policeStation.js');
pmx = require('@pm2/io');
app = require('./app.js');

let _ = require('lodash');

const redis = require("redis")
const { promisify } = require('util');

const { mode } = require('./config/pppolice.js');
policeStation.accession('chive', mode);

policeStation.open();

policeStation.on('report.defarm', async event => {
    console.log(event.toString());
    informationCenter.emit('report.defarm', event);

})
policeStation.on('report.refarm', async event => {
    console.log(event.toString());
    informationCenter.emit('report.refarm', event);

});
policeStation.on('report.farm', async event => {
    console.log(event.toString());
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

//broadcast
app.io.sockets.on('connection', socket => {
    socket.on('history', _ => {
        let push = informationCenter.replay();
        push.forEach(p => {
            socket.emit(p.type, p.content);
        });
        informationCenter.broadcastTo(socket);
    });
    socket.on('today', async player => {
        ppToday(player, socket);
    });
    socket.on('BPDate', async (player, date) => {
        bpDate(player, date, socket);
    });
    socket.on('BPRange', async (player, from, to) => {
        bpRange(player, from, to, socket);
    });
    socket.on('FARMOnline', async (from, to) => {
        FARMOnline(from, to, socket);
    });
    socket.on('Final', async (from, to) => {
        FARMOnline(from, to, socket, [377473,
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
    });

});





// saveListOld = function (officer,name,onExit = false ){
//  let path = '';
//  if (onExit){
//      path = `./storage/policeStation.onExit.${new Date().getTime()}`;
//  } else {
//      path = `./storage/policeStation`;
//  }
//  const store = new Storage(path);
//  const list = officer.copyList();
//  const cloned = _.cloneDeep(list);
//  store.put(`police.${name}`,cloned);
// }
// readListOld = function (path = './storage/policeStation'){
//  const store = new Storage(path);
//  const officers = store.get('police');
//  Object.keys(officers).forEach(function(key) {
//          var val = officers[key];
//          for (let i in val ){
//              rebindProto(val[i]);
//          }
//          if (policeStation.officers[key] != undefined){
//              console.log('load',key);
//              policeStation.officers[key].grabSuspectsList(val);
//          }
//  });
// }
// saveListOld = function(officer, name, onExit = false) {
//     client = redis.createClient();
//     const getAsync = promisify(client.get).bind(client);
//     const hgetallAsync = promisify(client.hgetall).bind(client);
//     const list = officer.copyList();
//     if (onExit) {
//         client.hset('policeStation', `${name}_onExit`, JSON.stringify(list));
//     } else {
//         client.hset('policeStation', name, JSON.stringify(list));
//     }

// }
// readListOld = function() {
//     client = redis.createClient();
//     const getAsync = promisify(client.get).bind(client);
//     const hgetallAsync = promisify(client.hgetall).bind(client);
//     client.hgetall('policeStation', function(err, officers) {
//         Object.keys(officers).forEach(function(key) {
//             var val = officers[key];
//             val = JSON.parse(val);
//             for (let i in val) {
//                 rebindProto(val[i]);
//             }
//             if (policeStation.officers[key] != undefined) {
//                 console.log('load', key);
//                 policeStation.officers[key].grabSuspectsList(val);
//             }
//         });
//     });
// }
// saveList = async function(officer, name, onExit = false) {
//     const suspectList = require('./lib/suspectList');
//     var s = new suspectList('PPPolice-osu');
//     const list = officer.copyList();
//     Object.keys(list).forEach(function(key) {
//         var val = list[key];
//         s.set(val);
//     });
// }
// readList = async function() {
//     const suspectList = require('./lib/suspectList');
//     var s = new suspectList('PPPolice-osu');
//     let list = await s.getAll();
//     policeStation.officers.chive.grabSuspectsList(list);
// }
// rebindProto = function(account) {
//     const osu = require('node-osu');
//     account.__proto__ = osu.User.prototype;
//     if (account.mode == undefined) account.mode = mode;
//     account.events.forEach(e => {
//         e.__proto__ = osu.Event.prototype;
//     });
//     account.bp.forEach(e => {
//         e.__proto__ = osu.Score.prototype;
//     })
// }
// process.on('SIGINT', function() {
//     console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
//     // some other closing procedures go here
//     saveList(policeStation.officers.chive, 'chive', true);
//     process.exit();
// })

// pmx.action('save', function(reply) {
//     saveList(policeStation.officers.chive, 'chive');
//     reply({ answer: 'save' });
// });

// pmx.action('saveold', function(reply) {
//     saveListOld(policeStation.officers.chive, 'chive');
//     reply({ answer: 'save' });
// });
// pmx.action('load', function(param, reply) {
//     readList(param);
//     reply({
//         param: param,
//         answer: 'read'
//     });
// });

// pmx.action('loadold', function(param, reply) {
//     readListOld(param);
//     reply({
//         param: param,
//         answer: 'read'
//     });
// });
// pmx.action('savenew', function(reply) {
//  saveListNew(policeStation.officers.chive,'chive');
//      reply({ answer : 'save' });
// });
// pmx.action('loadnew', function(param,reply) {
//  readListNew(param);
//      reply({ 
//          param : param,  
//          answer : 'read'
//           });
// });