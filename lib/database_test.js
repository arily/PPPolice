async function test() {
    const db = new require('./database')();

    // db.updateAllUser();
    // let result = await db.find({}, { fields: db.fields.handle });
    // console.log(result);
    //getById
    // let user = await db.getUserById(1123054);
    // let user = await db.all();
    // console.log(result);
    //getByName
    // let user = await db.getUserByName('arily');
    //findBeatmapId
    //    let userApi = await db.getUserApi(1123053);
    //    // // console.log(userApi);
    //    let userLocal = await db.getUserById(1123053);
    //    let result = await db.insertOrUpdateUser(userApi)
    //    console.log(userApi);
    //    console.log(result);
    // console.log(await db.getUserById(1123053));
    newerScores = await db.searchDateGreaterThan('2019-12-08',{fields: db.fields.handle})
    topPlays = await db.searchPPGreaterThan(500,{fields: db.fields.handle})

    newerScores.map(user => {
        user.bp.map(bp => console.log(`recent: \t${user.name}: new score: ${bp.raw_date}`))
    })
    console.log('--------');
    topPlays.map(user => {
        user.bp.map(bp => console.log(`highpp: \t${user.name}: pp: ${bp.pp}`))
    })
}

test();