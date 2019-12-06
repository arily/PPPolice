function match({ teams, mappool, rules }) {

    this.log = function() {}
    this.pickRandomProperty = function(obj) {

        var keys = Object.keys(obj)
        return keys[keys.length * Math.random() << 0];
    }

    this.randomMap = function(ban = false) {
        let mod = this.pickRandomProperty(maps);

        let modmaprange = maps[mod];
        let mapsleft = (Object.values(maps).reduce((acc, modmaps) => {
            if (modmaps.length > 0)
                return acc + modmaps.reduce((acc, map) => acc + 1);
            else return acc;
        }) <= 0);
        if (mapsleft) {
            this.log('no maps left');
            throw new Error('no maps left');
        }
        if (modmaprange.length <= 0) {
            return this.randomMap(ban);
        } else if (ban) {
            if (banLeft[mod] >= 1) {
                banLeft[mod] -= 1
                let map = modmaprange.splice(Math.floor(Math.random() * modmaprange.length), 1);
                return `${mod}${map}`;
            } else {
                return this.randomMap(ban);
            }
        } else {
            let map = modmaprange.splice(Math.floor(Math.random() * modmaprange.length), 1);
            return `${mod}${map}`;
        }
    }


    this.randomResult = function() {
        return Math.floor(Math.random() * 1060000)
    }

    this.randomPlayer = function(team, count) {
        let copy = players[team].slice();
        let ret = [];
        for (let i = 0; i < count; i++) {
            ret[ret.length] = copy.splice(Math.floor(Math.random() * copy.length), 1);
        }
        return ret
    }

    this.rowResult = function() {
        result[result.length] = {
            red: [this.randomResult(), this.randomResult()],
            blue: [this.randomResult(), this.randomResult()],
            players: {
                red: this.randomPlayer('red', 2),
                blue: this.randomPlayer('blue', 2),
            }
        }
    }

    this.last_win = function() {
        let c = result[result.length - 1].red.reduce((a, b) => a + b, 0);
        let h = result[result.length - 1].blue.reduce((a, b) => a + b, 0);

        return (c > h ? 'red' : 'blue');
    }

    this.pickPlay = function(picker, vol = 1) {
        let events = [];
        for (let i = 0; i < vol; i++) {
            if (team.red == 5 && team.blue == 5) {
                this.log("TB");
            } else {
                let pick1 = this.randomMap();

                this.log(`${this.name(picker)} pick ${pick1}`);
                events[events.length] = {
                    type: 'pick',
                    result: {
                        team: this.name(picker),
                        pick: pick1,
                    }
                }
            }

            this.rowResult();
            let res = result[result.length - 1];
            let players = res.players;
            let str = Object.keys(players).map(team => `${this.name(team)}: `.concat(players[team].map((player, index) => `${player}: ${res[team][index]}`).join(" "))).join(', ')
            teamresults = Object.keys(players).map(team => {
                return {
                    team: this.name(team),
                    scores: players[team].map((player, index) => {
                        return {
                            player: player[0],
                            score: res[team][index],
                        }
                    })
                }
            });
            events[events.length] = {
                type: 'play',
                result: teamresults
            }

            this.log("result:", str);
            lastwin = this.last_win();
            team[lastwin] += 1;
            this.log(`${this.name('red')} ${team.red}:${team.blue} ${this.name('blue')}`);
            events[events.length] = {
                type: 'judge',
                result: {
                    winner: lastwin,
                    scores: team,
                }
            }
        }
        return events;
    }

    this.ban = function(picker1, vol = 1) {
        let events = []
        for (let i = 0; i < vol; i++) {
            let banned = this.randomMap(true);
            this.log(`${this.name(picker1)} ban ${banned}`);
            events[events.length] = {
                type: 'ban',
                result: {
                    team: this.name(picker1),
                    map: banned,
                }
            }
        };
        return events;
    }

    this.name = function(team) {
        return teamName[team];
    }

    this.roll = function() {
        cfirstroll = Math.floor(Math.random() * 100);
        hfirstroll = Math.floor(Math.random() * 100);

        this.log(`${this.name('red')} rolls ${cfirstroll}, ${this.name('blue')} rolls ${hfirstroll}`);

        if (cfirstroll == hfirstroll) {
            this.log('Again. ');
            return this.roll();
        }
        let picker1 = (cfirstroll > hfirstroll ? 'red' : 'blue');
        let picker2 = (cfirstroll <= hfirstroll ? 'red' : 'blue');

        return [picker1, picker2, cfirstroll, hfirstroll];
    }
    this.loop = function(func, picker1, picker2, ...params) {
        let events = [];
        let fuck = 1;
        let win = (rules.bo + 1) / 2
        while (team.red < win && team.blue < win) {
            let which = fuck % 2;
            fuck += 1;
            if (which = 1)
                events[events.length] = this[func](picker1, ...params);
            else
                events[events.length] = this[func](picker2, ...params);
        }
        return events;
    }
    this.matchInstruction = function(out = true) {
        if (out) {
            this.log = console.log
        }
        let picker1 = 'red',
            picker2 = 'blue';
        let events = [];
        rules.instruction.forEach(instruction => {
            let instruct = instruction.shift();
            if (instruct == 'roll') {
                [picker1, picker2, p1raw, p2raw] = this.roll();
                events[events.length] = {
                    type: 'roll',
                    result: {
                        team: this.name(picker1),
                        roll: p1raw,
                    }
                };
                events[events.length] = {
                    type: 'roll',
                    result: {
                        team: this.name(picker2),
                        roll: p2raw,
                    }
                }
            } else if (instruct == 'loop') {
                e = this.loop(instruction.shift(), picker1, picker2, ...instruction);
                events = events.concat(...e);
            } else {
                events = events.concat(this[instruct](picker1, ...instruction));
                events = events.concat(this[instruct](picker2, ...instruction));
            }
        });
        return events;
    }
    this.step = function*() {

        let steps = this.matchInstruction(false);
        yield* steps.map(step => step);
        return {
            type: 'finish'
        }
    }
    // match = function(bo) {

    //     let [picker1, picker2] = this.roll();

    //     [picker1, picker2].forEach(picker => ban(picker));

    //     [picker1, picker2].forEach(picker => pickPlay(picker));

    //     ban(picker1, picker2);

    //     pickPlay(picker1, 2);
    //     pickPlay(picker2, 2);

    //     let fuck = 1;
    //     let win = (bo + 1) / 2
    //     while (team.red < win && team.blue < win) {
    //         let which = fuck % 2;
    //         fuck += 1;
    //         if (which = 1)
    //             pickPlay(picker1);
    //         else
    //             pickPlay(picker2);
    //     }
    // }
    result = [];
    team = {
        red: 0,
        blue: 0,
    }

    teamName = {
        red: teams.red.name,
        blue: teams.blue.name,
    }
    players = {
        red: ['t1', 't2', 't3', 'picker'],
        blue: ['t1', 't2', 't3', 'picker']
    }

    maps = mappool;

    banLeft = rules.ban
    rules = rules;

}


let final = {
    teams: {
        red: {
            name: '法国',
            players: ['t1', 't2', 't3', 't4'],
        },
        blue: {
            name: '美国',
            players: ['t1', 't2', 't3', 't4'],
        }
    },

    mappool: {
        nm: [1, 2, 3, 4, 5],
        hd: [1, 2],
        hr: [1, 2, ],
        dt: [1, 2, 3],
        fm: [1, 2]
    },

    rules: {
        bo: 9,
        ban: {
            nm: 4,
            hd: 1,
            hr: 1,
            dt: 2,
            fm: 1
        },
        instruction: [
            ['roll'],
            ['ban', 1],
            // ['pickPlay', 1],
            // ['ban', 2],
            ['loop', 'pickPlay']
        ]
    }
}

let m = new match(final);
m.matchInstruction();
// let steps = m.step();
// let event = steps.next();
// console.log(event);
// while (event.done == false){
//     event = steps.next();
//     console.log(event);
// }