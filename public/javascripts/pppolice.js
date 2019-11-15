var maxHistory = 200;
var pushed = [];
var renderTimer = undefined;
var totalimg = 0;
var loadedimg = 0;
var loadInterval;
var opentime = new Date().getTime();

//theme changer
setInterval(_ => {
    const hours = new Date().getHours()
    const isDayTime = hours > 6 && hours < 20;
    var root = document.documentElement;
    if (isDayTime) {
        root.setAttribute('class', 'day');
    } else {
        root.setAttribute('class', 'night');
    }
}, 1000);
//theme changer end
calculateBP = function(account, limit = 5) {
    let totalpp = 0;
    account.bp.sort((a, b) => (a.pp < b.pp) ? 1 : -1);
    let bp = account.bp.slice(0, limit);
    bp.forEach((bp, index) => {

        let weight = Math.pow(0.95, index);
        let weightedpp = bp.pp * weight;
        totalpp += weightedpp

    });
    return totalpp;
}

function calcFarm(player, highbuff = 10, lowbuff = 10, limit = 5) {
    const multi = Math.pow(11, highbuff / 10) * Math.pow(11, lowbuff / 10);
    let pptoday = calculateBP(player, limit);
    let farm = Math.pow((pptoday / ((Math.pow(parseFloat(player.pp), 0.5) * highbuff) + (lowbuff * parseFloat(player.pp)) / 80)), 1.3) * multi;
    return farm;
}

function listenImgLoad() {
    console.log('wait for preview loading');
    let images = document.getElementsByClassName('beatmapImg');
    let loadFinish = false;
    totalimg = images.length
    for (var i = 0; i < images.length; i++) {
        let image = images[i];
        image.onload = _ => { loadedimg += 1 };
    }
}

function yyMMdd(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('');
}

function noBP(nobp = true) {

    if (nobp) {
        let shit = ['why not afk?', '你气不气📢', 'play more', '这么悲伤的事情，不忍心说啊。', '📢⬆️⬇️', '📢⬇️⬆️'];
        let fuck = shit[Math.floor(Math.random() * shit.length)];
        document.getElementById('container').innerHTML = `<div id='nobp' class='nobp shadow'>
      <div style="width:100%">
      <img class="full shadow" src="/images/nobp.0.png" />
      </div>
      <h3 style="margin:auto">${fuck}</h3>
      </div>`;
    }
    listenImgLoad();
    loadInterval = setInterval(_ => {
        console.log('loaded', loadedimg, 'total', totalimg);
        if (loadedimg >= totalimg || new Date().getTime() - opentime >= 10 * 1000) {
            document.getElementById('notify').innerHTML = `<p id='finish' hidden></p>`;
            clearInterval(loadInterval);
        }
    }, 100);

}

function newToServer(clean = false) {
    if (!clean) document.getElementById('notify').innerHTML = `<p> account has no record on server. Fetching from bancho... </p>`;
    else document.getElementById('notify').innerHTML = ``;
}

function storage(type, result, doRender = true, sort = 'ppdesc') {
    let timestamp = toTimestamp(result.newScore.raw_date);
    let oldScoreIndex = pushed.findIndex(event => (event.result.beatmap.id == result.beatmap.id) && (event.result.account.id == result.account.id));
    console.log('storage', 'old score found', oldScoreIndex != -1);
    if (oldScoreIndex != -1) {
        oldScore = pushed[oldScoreIndex];
        console.log('old score timestamp:', oldScore.timestamp, 'new score timestamp:', timestamp);

        if (oldScore.timestamp < timestamp) {
            console.log('considering removing index:', oldScoreIndex, oldScore);
            pushed.splice(oldScoreIndex, 1);
            pushed.unshift({
                type: type,
                result: result,
                timestamp: timestamp,
            });
        } else {
            console.log('time of the newer score was earlier than score stored here. * fix the chaos *');
        }

    } else {
        pushed.unshift({
            type: type,
            result: result,
            timestamp: timestamp,
        });
    }

    // sortStorage('dateTimedesc');
    // while (pushed.length > maxHistory){
    //   pushed.pop();
    // }
    if (doRender) {
        if (renderTimer == undefined) {
            console.log('set render timer');
        } else {
            console.log('reset timer');
            clearTimeout(renderTimer);
        }
        renderTimer = setTimeout(_ => { render(sort) }, 100);
    }

}

function toTimestamp(strDate) {
    strDate = strDate.split('-').join('/');
    let d = Date.parse(strDate);
    return d;
}

function sortStorage(sort = 'ppdesc') {
    switch (sort) {
        case 'dateTimeincr':
            pushed.sort((a, b) => pushed.sort((a, b) => (a.timestamp > b.timestamp) ? 1 : -1));
            break;
        case 'dateTimedesc':
            pushed.sort((a, b) => pushed.sort((a, b) => (a.timestamp < b.timestamp) ? 1 : -1));
            break;
        case 'ppdesc':
        default:
            pushed.sort((a, b) => (a.result.pp < b.result.pp) ? 1 : -1);
            break;
    }

}
async function userInfo(user, date = undefined, farmLimit = 100, buff = -8, api_base = 'https://p.ri.mk/api/v1') {
    let cabbage = await cabbageGetAccount(user, date);
    if (cabbage.code === 0) {
        let cabbageUser = cabbage.data[0];
        let bp = pushed.map(event => { return { pp: event.result.pp } });
        user.pp = cabbageUser.ppRaw;
        user.bp = bp;
        user.rank = cabbageUser.ppRank;
        let pptoday = calculateBP(user, 100);
        let bp3 = calculateBP(user, 3);
        let bp5 = calculateBP(user, 5);
        let farmtoday = calcFarm(user, 10 + buff, 10 - buff, farmLimit);
        let farm3 = calcFarm(user, 10 + buff, 10 - buff, 3);
        let farm5 = calcFarm(user, 10 + buff, 10 - buff, 5);
        document.getElementById('userInfo').innerHTML = `
      <ul class="container">
      <li class='score-card shadow'>
      <div class='left-img avatar-container'>
      <img class="avatar shadow" src="https://a.ppy.sh/${user.id}" />
      </div>
      <div>
      <span class="username"><h1>${user.name}</h1><span class="pp">#${user.rank}</span></span>
      <p class="pp">${user.pp} pp</p>
      <p class="pp">${Math.round(pptoday * 1000) / 1000} pp Listed <span class='pp small-font'>(3bp: ${Math.round(bp3 * 1000) / 1000}, 5bp: ${Math.round(bp5 * 1000) / 1000})</span></p>
      <p class="pp">${Math.round(farmtoday * 1000) / 1000} FARM <span class='pp small-font'>(3bp: ${Math.round(farm3 * 1000) / 1000}, 5bp: ${Math.round(farm5 * 1000) / 1000})</span></p>
      </div>
      </li>
      </ul>
      `
    }
}
async function cabbageGetAccount(user, date, api_base = 'https://p.ri.mk/api/v1') {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    today = today.getTime();
    if (date === undefined) {
        date = today - 60 * 60 * 24 * 1000;
    } else {
        date = Date.parse(date);
        date = date - 60 * 60 * 24 * 1000;

    }
    if (date - 4 * 60 * 60 * 1000 <= today) {
        date = date - 60 * 60 * 24 * 1000;
    }
    let path = `/userinfo/${user.id}`;
    let url = api_base.concat(path);
    let query = url.concat(`?start=${yyMMdd(date)}&limit=1`);
    return await fetch(query).then(res => res.json());
}

function render(sort = 'ppdesc', showUserId = true) {
    console.log('start rendering');
    sortStorage(sort);
    document.getElementById('container').innerHTML = '';
    let shortMods = {
        Easy: "EZ",
        NoFail: "NF",
        HalfTime: "HT",
        HardRock: "HR",
        SuddenDeath: "SD",
        DoubleTime: "DT",
        Nightcore: "NC",
        Hidden: "HD",
        Flashlight: "FL",
        SpawnOut: "SO",
    }
    let content = '';
    pushed.forEach(event => {
        const data = event.result;
        const player = data.account.name;
        let mods = data.mods.filter(s => s !== 'FreeModAllowed');
        //remove DT when NC is set
        if (mods.some(s => s === 'Nightcore')) {
            mods = data.mods.filter(s => s !== 'DoubuleTime');
        }

        mods = mods.map(mod => shortMods[mod]).join(',');

        mods = (mods !== '') ? ` + ${mods}` : '';
        const bmstr = `${data.beatmap.artist} - ${data.beatmap.title} [${data.beatmap.version}] (${data.beatmap.creator})${mods}`;
        const colh = hashCode(data.account.id + '-' + data.beatmap.id);
        switch (event.type) {
            case 'farm':
                {
                    var accuracy = acc(data.newScore);
                    var pp = `${data.pp} pp`;
                    break;
                }
            case 'refarm':
            case 'defarm':
                {
                    var ppChange = addPlus(data.ppChange);
                    var cmp = compareScore(data.oldScore, data.newScore);
                    var accuracy = `${cmp.now}<br>${cmp}`;
                    var pp = `${data.pp} pp (${ppChange} pp)`;
                    break;
                }
        }
        let showplayer = (showUserId) ? `${player} - ` : ``;
        let rank = undefined;
        switch (data.newScore.rank) {
            case 'XH':
                rank = 'SS-Silver';
                break;
            case 'X':
                rank = 'SS';
                break;
            case 'SH':
                rank = 'S-Silver';
                break;
            default:
                rank = data.newScore.rank;
        }
        let html = `<a class="score-card" rel="noopener noreferrer" target="_blank" href="https://osu.ppy.sh/beatmapsets/${data.beatmap.beatmapSetId}#osu/${data.beatmap.id}"><li id='${colh}' class='shadow'>
      <div class='left-img'>
      <img class="rank shadow" src="https://osu.ppy.sh/images/badges/score-ranks-v2019/GradeSmall-${rank}.svg?3" />
      <img class="beatmapImg shadow" src="https://b.ppy.sh/thumb/${data.beatmap.beatmapSetId}l.jpg" />
      </div>
      <div>
      <h3 class="pp">${pp}</h3>
      <p class='beatmapstr'>${bmstr}</p>
      <p>${accuracy}</p>
      <h4>${showplayer}${data.newScore.raw_date} UTC</h4>
      </div>
      </li>
      </a>`;
        content += html;
    });
    document.getElementById('container').innerHTML = content;
}

function hashCode(s) {
    return s;
}

function addPlus(ppChange) {
    return ppChange >= 0 ? `+${ppChange}` : ppChange;
}

function acc(score) {
    count300 = parseInt(score.counts[300]);
    count100 = parseInt(score.counts[100]);
    count50 = parseInt(score.counts[50]);
    countmiss = parseInt(score.counts.miss);
    accuracy = (count300 * 300 + count100 * 100 + count50 * 50 + countmiss * 0) / ((count300 + count100 + count50 + countmiss) * 300);
    return {
        acc: accuracy,
        300: count300,
        100: count100,
        50: count50,
        miss: countmiss,
        toString: function() {
            strCount = Object.entries({ 100: this[100], 50: this[50], miss: this.miss }).filter(count => count[1] > 0).map((count) => `${count[1]} x ${count[0]}`).join(', ');
            return `<b>${Math.round(this.acc * 10000)/100}%</b> <span class='small-font'>${strCount}</span>`;
        }
    }
}

function compareScore(old, now) {
    old = acc(old);
    now = acc(now);
    return {
        old: old,
        now: now,
        300: now[300] - old[300],
        100: now[100] - old[100],
        50: now[50] - old[50],
        miss: now.miss - old.miss,
        toString: function() {
            strCount = Object.entries({ 100: this[100], 50: this[50], miss: this.miss }).filter(count => count[1] != 0).map((count) => `${addPlus(count[1])} x ${count[0]}`).join(', ');
            return `<b>${addPlus(Math.round((this.now.acc - this.old.acc) * 10000)/100)}%</b> <span class='small-font'>${strCount}</span>`;
        }
    }
}