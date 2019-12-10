async function test() {
    const db = new require('./database')();

    // db.updateAllUser();
    let result = await db.find({}, { fields: db.fields.handle });
    // console.log(result);
    //getById
    // let user = await db.getUserById(1123054);
    // let user = await db.all();
    console.log(result);
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
}

test();