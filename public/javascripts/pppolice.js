  var maxHistory = 200;
  var pushed  = [];
  var renderTimer = undefined;
  var totalimg = 0;
  var loadedimg = 0;
  var loadInterval;
  var opentime = new Date().getTime();
  function listenImgLoad(){
    console.log('wait for preview loading');
    let images = document.getElementsByClassName('beatmapImg');
    let loadFinish = false;
    totalimg = images.length
    for (var i = 0; i < images.length; i++) {
      let image = images[i];
      image.onload = _ => {loadedimg += 1};
    }
  }
  function noBP(nobp = true){
    if (nobp) document.getElementById('container').innerHTML = `<div id='nobp' class='nobp shadow'>
      <div style="width:100%">
      <img class="full shadow" src="/images/nobp.0.png" />
      </div>
      <h3 style="margin:auto">why not AFK?</h3>
      </div>`;

      listenImgLoad();
      loadInterval = setInterval(_ => {
        console.log('loaded',loadedimg,'total',totalimg);
        if (loadedimg >= totalimg ||  new Date().getTime() - opentime >= 10 * 1000 ){
          document.getElementById('notify').innerHTML =  `<p id='finish' hidden></p>`;
          clearInterval(loadInterval);
        }
      },100);
      
  }
  function newToServer(clean = false){
    if (!clean) document.getElementById('notify').innerHTML = `<p> account has no record on server. Fetching from bancho... </p>`;
    else document.getElementById('notify').innerHTML = ``;
  }
  function storage(type,result,doRender = true,sort = 'ppdesc'){
    let timestamp = toTimestamp(result.newScore.raw_date);
    let oldScoreIndex = pushed.findIndex(event => (event.result.beatmap.id == result.beatmap.id) && (event.result.account.id == result.account.id) );
    console.log('storage','old score found',oldScoreIndex != -1);
    if ( oldScoreIndex != -1 ) {
      oldScore = pushed[oldScoreIndex];
      console.log('old score timestamp:',oldScore.timestamp,'new score timestamp:',timestamp);
      
      if ( oldScore.timestamp < timestamp ){
        console.log('considering removing index:',oldScoreIndex,oldScore);
        pushed.splice(oldScoreIndex,1);
        pushed.unshift({
          type: type,
          result: result,
          timestamp: timestamp,
        });
      } else {
        console.log('newer score was before score stored here. * fix the chaos *');
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
    if (doRender){
      if (renderTimer == undefined ){
        console.log('set render timer');
      } else {
        console.log('reset timer');
        clearTimeout(renderTimer);
      }
      renderTimer = setTimeout(_=>{render(sort)}, 100);
    }
    
  }
  function toTimestamp(strDate){
    strDate = strDate.split('-').join('/');
    let d = Date.parse(strDate);
    return d;
  }
  function sortStorage(sort = 'ppdesc'){
    switch(sort){
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
  function render(sort = 'ppdesc',showUserId = true ){
    console.log('start rendering');
    sortStorage(sort);
    document.getElementById('container').innerHTML = '';
    pushed.forEach(event => {
      const data = event.result;
      const player = data.account.name;
      let mods = data.mods.filter(s => s !== 'FreeModAllowed' ).join(',');
      mods = (mods !== '') ? ' + ' + mods : '';
      const bmstr = `${data.beatmap.artist} - ${data.beatmap.title} [${data.beatmap.version}] (${data.beatmap.creator})${mods}`;
      const colh = hashCode(data.account.id + '-' + data.beatmap.id);
      switch (event.type){
        case 'farm' : {
          var accuracy = acc(data.newScore);
          var pp = `${data.pp} pp`;
          break;
        }
        case 'refarm' :
        case 'defarm' : {
          var ppChange = addPlus(data.ppChange);
          var cmp = compareScore(data.oldScore,data.newScore);
          var accuracy = `${cmp.now}<br>${cmp}`;
          var pp = `${data.pp} pp (${ppChange} pp)`;
          break;
        }
      }
      let showplayer = (showUserId) ? `${player} - ` : ``;
      let rank = undefined;
      switch(data.newScore.rank){
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
      <div>
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
      document.getElementById('container').innerHTML += html;
    });
  }
  function hashCode(s){
    return s;
  }
  function addPlus(ppChange){
    return ppChange >= 0 ? `+${ppChange}` : ppChange;
  }
  function acc(score){
    count300 = parseInt(score.counts[300]);
    count100 = parseInt(score.counts[100]);
    count50  = parseInt(score.counts[50]);
    countmiss= parseInt(score.counts.miss);
    accuracy =  ( count300 * 300 + count100 * 100  + count50 * 50 + countmiss * 0 ) / (( count300 + count100 + count50 + countmiss ) * 300 );
    return {
      acc: accuracy,
      300: count300,
      100: count100,
      50: count50,
      miss: countmiss,
      toString: function(){
        return `<b>${Math.round(this.acc * 10000)/100}%</b> ${this[300]} × 300, ${this[100]} × 100, ${this[50]} × 50, ${this.miss} × miss, `;
      }
    }
  }
  function compareScore(old,now){
    old = acc(old);
    now = acc(now);
    return {
      old: old,
      now: now,
      300: now[300] - old[300],
      100: now[100] - old[100],
      50: now[50] - old[50],
      miss: now.miss - old.miss,
      toString: function(){
        return `<b>${addPlus(Math.round((this.now.acc - this.old.acc) * 10000)/100)}%</b> ${addPlus(this[300])} × 300, ${addPlus(this[100])} × 100, ${addPlus(this[50])} × 50, ${addPlus(this.miss)} × miss, `;
      }
    }
  }