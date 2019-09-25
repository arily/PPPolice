  maxHistory = 200;
  var pushed  = [];
  function storage(type,result){
    oldScore = pushed.findIndex(event => (event.result.beatmap.id == result.beatmap.id) && (event.result.account.id == result.account.id));
    if ( oldScore !== -1 ) pushed.splice(key,1);
    timestamp = toTimestamp(result.newScore.raw_date);
    pushed.unshift({
      type: type,
      result: result,
      timestamp: timestamp,
    });
    sortStorage('dateTimedesc');
    while (pushed.length > maxHistory){
      pushed.pop();
    }
    render();
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
  async function render(){
    document.getElementById('container').innerHTML = '';
    pushed.forEach(event => {
      data = event.result;
      player = data.account.name;
      mods = data.mods.filter(s => s !== 'FreeModAllowed' ).join(',');
      mods = (mods !== '') ? ' + ' + mods : '';
      bmstr = `${data.beatmap.artist} - ${data.beatmap.title} [${data.beatmap.version}] (${data.beatmap.creator})${mods}`;
      colh = hashCode(data.account.id + '-' + data.beatmap.id);
      
      switch (event.type){
        case 'farm' :
          accuracy = acc(data.newScore);
          pp = `${data.pp} pp`;
          break;
        case 'refarm' :
        case 'defarm' :
          ppChange = addPlus(data.ppChange);
          cmp = compareScore(data.oldScore,data.newScore);
          accuracy = `${cmp.now}<br>${cmp}`;
          pp = `${data.pp} pp (${ppChange} pp)`;
          break;
        default:
          return;
      }
      html = `<li id='${colh}'>
      <img class="score" src="https://s.ppy.sh/images/${data.newScore.rank}.png" />
      <img src="https://b.ppy.sh/thumb/${data.beatmap.beatmapSetId}l.jpg" />
      <h3>${pp}</h3>
      <p class='beatmap'>${bmstr}</p>
      <p>${accuracy}</p>
      <h4>${player}, ${data.newScore.raw_date} UTC</h4>
      </li>`;
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
        return `<b>${Math.round(this.acc * 10000)/100}%</b>  ${this[300]} × 300, ${this[100]} × 100, ${this[50]} × 50, ${this.miss} × miss, `;
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
        return `<b>${addPlus(Math.round((this.now.acc - this.old.acc) * 10000)/100)}%</b>  ${addPlus(this[300])} × 300, ${addPlus(this[100])} × 100, ${addPlus(this[50])} × 50, ${addPlus(this.miss)} × miss, `;
      }
    }
  }