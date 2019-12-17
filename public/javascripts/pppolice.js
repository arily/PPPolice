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

// function listenImgLoad() {
//     console.log('wait for preview loading');
//     let images = document.getElementsByClassName('beatmapImg');
//     let loadFinish = false;
//     totalimg = images.length
//     for (var i = 0; i < images.length; i++) {
//         let image = images[i];
//         image.onload = _ => { loadedimg += 1 };
//     }
// }

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

    loadInterval = setInterval(_ => {
        let images = document.getElementsByClassName('beatmapImg');
        images = Array.from(images);
        let loaded = images.reduce((acc, cur) => acc + cur.complete | 0);
        let all = images.length
        console.log(`loaded ${loaded}/${all}`);
        if (images.every(image => image.complete)) {
            document.getElementById('notify').innerHTML = `<p id='finish' hidden></p>`;
            console.log('load pic finish');
            clearInterval(loadInterval);
        }

    }, 100);

}

function newToServer(clean = false) {
    if (!clean) document.getElementById('notify').innerHTML = `<p> account has no record on server. Fetching from bancho... </p>`;
    else document.getElementById('notify').innerHTML = ``;
}
async function rebindProto() {
    const Result = (await import("./Objects/Result.js")).default;
    const Score = (await import("./Objects/Score.js")).default;
    const User = (await import("./Objects/User.js")).default;
    const Beatmap = (await import("./Objects/Beatmap.js")).default;
    pushed.map((score) => {
        score.result.__proto__ = Result.prototype;
        score.result.newScore.__proto__ = Score.prototype;
        score.result.beatmap.__proto__ = Beatmap.prototype;
    })
}

async function storage(type, result, doRender = true, sort = 'ppdesc') {
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
async function recalculate(method = null) {
    if (method == null) {
        return
    }
    switch (method) {
        case 'sotrash':
            method = await import("./recalculator/sotrash.js");
            break;
        default:
            method = null
    }
    if (method !== null) {
        await method.default(pushed);
    }
}

async function sortStorage(sort = 'ppDesc') {
    let sortFunction;
    switch (sort) {
        case 'dateTimeIncr':
            sortFunction = await import("./sorting/dateTimeIncr.js");
            break;
        case 'dateTimeDesc':
            sortFunction = await import("./sorting/dateTimeDesc.js");
            break;
        case 'sotrash':
            sortFunction = await import("./sorting/sotrash.js");
            break;
        case 'ppDesc':
        default:
            sortFunction = await import("./sorting/ppDesc.js");
            break;
    }
    await sortFunction.default(pushed);
}
async function userInfo(user, date = undefined, farmLimit = 100, buff = -8, api_base = 'https://www.mothership.top/api/v1') {
    let cabbage = await cabbageGetAccount(user, date);
    if (typeof cabbage !== 'undefined' && cabbage.code === 0) {
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
      <div class='down'>
      <div class='left-img avatar-container'>
      <img class="avatar shadow" src="https://a.ppy.sh/${user.id}" />
      </div>
      <div>
      <span class="username"><h1>${user.name}</h1><span class="pp">#${user.rank}</span></span>
      <p class="pp">${user.pp} pp</p>
      <p class="pp">${Math.round(pptoday * 1000) / 1000} pp Listed <span class='pp small-font'>(3bp: ${Math.round(bp3 * 1000) / 1000}, 5bp: ${Math.round(bp5 * 1000) / 1000})</span></p>
      <p class="pp">${Math.round(farmtoday * 1000) / 1000} FARM <span class='pp small-font'>(3bp: ${Math.round(farm3 * 1000) / 1000}, 5bp: ${Math.round(farm5 * 1000) / 1000})</span></p>
      </div>
      </div>
      </li>
      </ul>
      `
    } else {
        let bp = pushed.map(event => { return { pp: event.result.pp } });
        user.bp = bp;
        let pptoday = calculateBP(user, 100);
        let bp3 = calculateBP(user, 3);
        let bp5 = calculateBP(user, 5);
        document.getElementById('userInfo').innerHTML = `
      <ul class="container">
      <li class='score-card shadow'>
      <div class='down'>
      <div class='left-img avatar-container'>
      <img class="avatar shadow" src="https://a.ppy.sh/${user.id}" />
      </div>
      <div>
      <span class="username"><h1>${user.name}</h1><span class="pp">#unkown</span></span>
      <p>白菜出了点问题。。。</p>
      <p class="pp">${Math.round(pptoday * 1000) / 1000} pp Listed <span class='pp small-font'>(3bp: ${Math.round(bp3 * 1000) / 1000}, 5bp: ${Math.round(bp5 * 1000) / 1000})</span></p>
      </div>
      </div>
      </li>
      </ul>
      `
    }
}
async function cabbageGetAccount(user, date, api_base = 'https://www.mothership.top/api/v1') {
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


    let timeoutPromise = (timeout) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(undefined);
            }, timeout);
        });
    }
    let requestPromise = (url) => {
        return fetch(url);
    };



    // 作者：_杨瀚博
    // 链接：https://juejin.im/post/5cdd1c19e51d453b7f0a0d8c
    // 来源：掘金
    // 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
    return await Promise.race([timeoutPromise(8000), requestPromise(query)])
        .then(res => res.json())
        .catch(error => {
            console.log(error);
        });
}

async function render(sort = 'ppDesc', showUserId = true) {
    await sortStorage(sort);
    document.getElementById('container').innerHTML = '';

    let content = '';
    pushed.forEach(event => {
        const data = event.result;
        const player = data.account.name;
        let mods = data.newScore.shortMods();
        mods = mods.join(' ');

        // mods = (mods !== '') ? ` + ${mods}` : '';
        const bmstr = data.beatmap;
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
                    var ppChange = addPlus(data.pp - data.oldScore.pp);
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
        <p class='beatmapstr'>${bmstr}</p>
        <div class="down">
      <div class='left-img'>
      <img class="rank shadow" src="https://osu.ppy.sh/images/badges/score-ranks-v2019/GradeSmall-${rank}.svg?3" />
      <img class="beatmapImg shadow" src="https://b.ppy.sh/thumb/${data.beatmap.beatmapSetId}l.jpg" />
      </div>
      <div class="lr">
      <div>
      <h3 class="pp">${pp}</h3>
      <p>${accuracy}</p>
      <h4>${showplayer}${moment.tz(data.newScore.raw_date,'europe/london').tz("Asia/Shanghai").format("YYYY-MM-DD k:mm:ss")}</h4>
      </div>
      <div class="mods">
      <p>${mods}</p>
      </div>
      </div>
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
    ppChange = +(Math.round(ppChange + "e+2")  + "e-2");
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
            let strCount = Object.entries({ 100: this[100], 50: this[50], miss: this.miss }).filter(count => count[1] != 0).map((count) => `${addPlus(count[1])} x ${count[0]}`).join(', ');
            let strAcc = (this.now.acc == this.old.acc) ?'':`${addPlus(Math.round((this.now.acc - this.old.acc) * 10000)/100)}%`;

            return `<b>${strAcc}</b> <span class='small-font'>${strCount}</span>`;
        }
    }
}