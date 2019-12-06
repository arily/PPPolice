async function init() {


    const database = require('../lib/database.js');
    // var l = new suspectList('policeStation');
    var l = new database();
    var fs = require('fs');

    fs.writeFile('./json/export.json', JSON.stringify(await l.all()), function(err) {
        if (err) throw err;
        console.log('Saved!');
    });

}

init();