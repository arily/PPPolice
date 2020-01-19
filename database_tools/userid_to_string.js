const fs = require('fs');

async function init() {
    let data = fs.readFileSync('./json/export.json')
    data = JSON.parse(data);
    // console.log(db);

    data = data.map(user => {
        user.id = user.id.toString();
        return user;
    })

    fs.writeFile('./json/export.convert.json', JSON.stringify(data), function(err) {
        if (err) throw err;
        console.log('Saved!');
    });

}

init();