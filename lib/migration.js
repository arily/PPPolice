

async function init(){

const suspectList = require('./suspectList');
// var l = new suspectList('policeStation');
var l = new suspectList('PPPolice-osu');


console.log(await l.getAll());


}

init();